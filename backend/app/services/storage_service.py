import os
import json
import logging
import time
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime
from pymongo import MongoClient
from app.core.config import settings

try:
    from filelock import FileLock
    _HAS_FILELOCK = True
except ImportError:
    _HAS_FILELOCK = False

logger = logging.getLogger(__name__)

class JSONFallbackClient:
    """Zero-infrastructure fallback database storing collections in local JSON files."""
    def __init__(self, data_dir: str = "data/json_db"):
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        # Thread-level lock for in-process safety; filelock adds cross-process safety
        self._thread_lock = threading.Lock()

    def _get_filepath(self, collection_name: str) -> str:
        return os.path.join(self.data_dir, f"{collection_name}.json")

    def _get_lockpath(self, collection_name: str) -> str:
        return os.path.join(self.data_dir, f"{collection_name}.lock")

    def _lock_context(self, collection_name: str):
        if _HAS_FILELOCK:
            return FileLock(self._get_lockpath(collection_name))
        return self._thread_lock

    def _load_data(self, collection_name: str) -> List[Dict[str, Any]]:
        path = self._get_filepath(collection_name)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_data(self, collection_name: str, data: List[Dict[str, Any]]):
        path = self._get_filepath(collection_name)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def insert_one(self, collection_name: str, document: Dict[str, Any]):
        with self._lock_context(collection_name):
            data = self._load_data(collection_name)
            doc = document.copy()
            if "created_at" not in doc:
                doc["created_at"] = datetime.utcnow().isoformat()
            data.append(doc)
            self._save_data(collection_name, data)

    def find(self, collection_name: str, query: Dict[str, Any], limit: int = 100) -> List[Dict[str, Any]]:
        with self._lock_context(collection_name):
            data = self._load_data(collection_name)
            results = []
            for doc in data:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    results.append(doc)
                if len(results) >= limit:
                    break
            return results

    def delete_many(self, collection_name: str, query: Dict[str, Any]) -> int:
        with self._lock_context(collection_name):
            data = self._load_data(collection_name)
            new_data = []
            removed = 0
            for doc in data:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    removed += 1
                else:
                    new_data.append(doc)
            self._save_data(collection_name, new_data)
            return removed


class StorageService:
    def __init__(self):
        self.uri = settings.MONGODB_URI
        self.db_name = settings.MONGODB_DB or "job_agent"
        self.collection_name = getattr(settings, "MONGODB_COLLECTION", "chat_history") or "chat_history"
        self.client = None
        self.db = None
        self.fallback = JSONFallbackClient()
        self.use_fallback = True
        
        self._connect()

    def _connect(self):
        if not self.uri:
            logger.info("No MONGODB_URI provided. Initializing StorageService in local JSON Fallback mode.")
            self.use_fallback = True
            return

        try:
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=4000)
            # Force server info check
            self.client.server_info()
            self.db = self.client[self.db_name]
            self.use_fallback = False
            logger.info(f"Successfully connected to MongoDB Atlas database: {self.db_name}")
        except Exception as e:
            logger.warning(f"Failed to connect to MongoDB Atlas. Falling back to local JSON DB. Error: {e}")
            self.use_fallback = True

    def get_mongo_status(self) -> Dict[str, Any]:
        """Returns MongoDB Atlas connectivity and storage statistics."""
        if not self.use_fallback and self.db is not None:
            try:
                start_t = time.time()
                self.client.admin.command('ping')
                latency_ms = round((time.time() - start_t) * 1000, 2)
                
                chat_count = self.db["chats"].count_documents({})
                logs_count = self.db["query_logs"].count_documents({})
                
                # Extract cluster host name from URI if possible
                cluster_host = "MongoDB Atlas Cluster"
                if "@" in self.uri:
                    cluster_host = self.uri.split("@")[1].split("/")[0]

                return {
                    "connected": True,
                    "mode": "MongoDB Atlas",
                    "db_name": self.db_name,
                    "collection_name": "chats / query_logs",
                    "cluster_host": cluster_host,
                    "ping_latency_ms": latency_ms,
                    "total_chats": chat_count,
                    "total_query_logs": logs_count,
                    "use_fallback": False
                }
            except Exception as e:
                logger.error(f"MongoDB ping failed: {e}")

        # Fallback stats
        chats = self.fallback._load_data("chats")
        logs = self.fallback._load_data("query_logs")
        return {
            "connected": False,
            "mode": "Local JSON Storage (Fallback)",
            "db_name": self.db_name,
            "collection_name": "chats.json",
            "cluster_host": "Local Filesystem",
            "ping_latency_ms": 0,
            "total_chats": len(chats),
            "total_query_logs": len(logs),
            "use_fallback": True
        }

    def save_chat_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict] = None):
        """Persists a chat history message to MongoDB Atlas."""
        payload = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if self.use_fallback:
            self.fallback.insert_one("chats", payload)
        else:
            try:
                self.db["chats"].insert_one(payload)
            except Exception as e:
                logger.error(f"MongoDB write failed, writing to fallback JSON: {e}")
                self.fallback.insert_one("chats", payload)

    def get_chat_history(self, session_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieves history logs for a specific session."""
        query = {"session_id": session_id}
        
        if self.use_fallback:
            return self.fallback.find("chats", query, limit=limit)
        else:
            try:
                cursor = self.db["chats"].find(query).sort("timestamp", 1).limit(limit)
                history = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    history.append(doc)
                return history
            except Exception as e:
                logger.error(f"Failed to fetch chat history from MongoDB: {e}. Checking local fallback.")
                return self.fallback.find("chats", query, limit=limit)

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Retrieves distinct session IDs and summary metadata from MongoDB Atlas."""
        if self.use_fallback:
            chats = self.fallback._load_data("chats")
            sessions: Dict[str, Dict[str, Any]] = {}
            for msg in chats:
                sid = msg.get("session_id", "default")
                if sid not in sessions:
                    sessions[sid] = {"session_id": sid, "message_count": 0, "last_message": "", "timestamp": msg.get("timestamp")}
                sessions[sid]["message_count"] += 1
                if msg.get("role") == "user":
                    sessions[sid]["last_message"] = msg.get("content", "")
                sessions[sid]["timestamp"] = msg.get("timestamp")
            return list(sessions.values())
        else:
            try:
                pipeline = [
                    {"$sort": {"timestamp": 1}},
                    {"$group": {
                        "_id": "$session_id",
                        "session_id": {"$first": "$session_id"},
                        "message_count": {"$sum": 1},
                        "last_message": {"$last": "$content"},
                        "timestamp": {"$last": "$timestamp"}
                    }},
                    {"$sort": {"timestamp": -1}}
                ]
                results = list(self.db["chats"].aggregate(pipeline))
                for r in results:
                    r["_id"] = str(r["_id"])
                return results
            except Exception as e:
                logger.error(f"Failed to fetch sessions from MongoDB Atlas: {e}")
                return []

    def delete_session(self, session_id: str) -> bool:
        """Deletes all messages for a specific session ID."""
        if self.use_fallback:
            self.fallback.delete_many("chats", {"session_id": session_id})
            return True
        else:
            try:
                self.db["chats"].delete_many({"session_id": session_id})
                return True
            except Exception as e:
                logger.error(f"Failed to delete session {session_id} from MongoDB Atlas: {e}")
                return False

    def clear_all_history(self) -> bool:
        """Clears all chat history records."""
        if self.use_fallback:
            self.fallback._save_data("chats", [])
            return True
        else:
            try:
                self.db["chats"].delete_many({})
                return True
            except Exception as e:
                logger.error(f"Failed to clear history from MongoDB Atlas: {e}")
                return False

    def save_query_log(self, query: str, intent: str, latency_ms: float, response: str, cache_hit: bool, details: Optional[Dict] = None):
        """Audits user query execution profiles."""
        payload = {
            "query": query,
            "intent": intent,
            "latency_ms": latency_ms,
            "response": response,
            "cache_hit": cache_hit,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if self.use_fallback:
            self.fallback.insert_one("query_logs", payload)
        else:
            try:
                self.db["query_logs"].insert_one(payload)
            except Exception as e:
                logger.error(f"MongoDB log failed, writing to fallback JSON: {e}")
                self.fallback.insert_one("query_logs", payload)

    def get_query_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves recent audit logs."""
        if self.use_fallback:
            return self.fallback.find("query_logs", {}, limit=limit)
        else:
            try:
                cursor = self.db["query_logs"].find().sort("timestamp", -1).limit(limit)
                logs = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    logs.append(doc)
                return logs
            except Exception as e:
                logger.error(f"Failed to fetch logs from MongoDB: {e}")
                return self.fallback.find("query_logs", {}, limit=limit)
