import uuid
import logging
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        self.host = settings.QDRANT_HOST
        self.port = settings.QDRANT_PORT
        self.api_key = settings.QDRANT_API_KEY
        self.collection_name = "document_chunks"
        self._initialized_vector_size: Optional[int] = None  # set on first upsert
        self.client = self._connect()

    def _connect(self) -> Optional[QdrantClient]:
        try:
            # Connect to Qdrant server
            client = QdrantClient(
                host=self.host,
                port=self.port,
                api_key=self.api_key,
                timeout=3.0
            )
            # Verify server is actually reachable
            client.get_collections()
            logger.info(f"Connected to Qdrant server at {self.host}:{self.port}")
            return client
        except Exception as e:
            logger.warning(f"Could not connect to Qdrant server at {self.host}:{self.port} ({e}). Falling back to in-memory Qdrant instance.")
            try:
                client = QdrantClient(":memory:")
                logger.info("Successfully initialized in-memory Qdrant vector database.")
                return client
            except Exception as mem_err:
                logger.error(f"Failed to create in-memory Qdrant client: {mem_err}")
                return None

    def initialize_collection(self, vector_size: int):
        """Creates the Qdrant collection if it does not exist.
        
        The vector_size is derived from the actual embedding dimension at upsert
        time, so it correctly handles any provider (Nomic=768, Cloudflare BGE=1024,
        Ollama nomic-embed-text=768, etc.).
        """
        if not self.client:
            logger.error("Qdrant client not connected. Cannot initialize collection.")
            return

        try:
            exists = self.client.collection_exists(self.collection_name)
            if not exists:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=vector_size,
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f"Created Qdrant collection: {self.collection_name} (dim={vector_size})")
            self._initialized_vector_size = vector_size
        except Exception as e:
            logger.error(f"Error initializing Qdrant collection: {e}")

    async def upsert_chunks(self, ids: List[str], embeddings: List[List[float]], payloads: List[Dict[str, Any]]):
        """Inserts or updates vector embeddings and payloads in Qdrant."""
        if not self.client:
            logger.error("Qdrant client not connected. Upsert failed.")
            return

        if not ids or not embeddings or not payloads:
            return

        # Derive dimension from the actual embedding (provider-agnostic)
        vector_size = len(embeddings[0])
        self.initialize_collection(vector_size)

        try:
            points = [
                models.PointStruct(
                    # Qdrant requires unsigned int or UUID for point IDs
                    # Use UUID5 to make a deterministic UUID from the string chunk_id
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, idx)),
                    vector=vector,
                    payload={**payload, "chunk_str_id": idx}  # preserve original string id in payload
                )
                for idx, vector, payload in zip(ids, embeddings, payloads)
            ]
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            logger.info(f"Upserted {len(points)} chunks into Qdrant collection {self.collection_name}.")
        except Exception as e:
            logger.error(f"Failed to upsert chunks into Qdrant: {e}")

    async def search_chunks(self, query_embedding: List[float], limit: int = 5, doc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Performs semantic cosine similarity search in Qdrant."""
        if not self.client:
            logger.error("Qdrant client not connected. Search failed.")
            return []

        try:
            if not self.client.collection_exists(self.collection_name):
                return []

            query_filter = None
            if doc_id:
                query_filter = models.Filter(
                    must=[
                        models.FieldCondition(
                            key="doc_id",
                            match=models.MatchValue(value=doc_id)
                        )
                    ]
                )

            if hasattr(self.client, "query_points"):
                response = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_embedding,
                    query_filter=query_filter,
                    limit=limit
                )
                results = response.points
            else:
                results = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_embedding,
                    query_filter=query_filter,
                    limit=limit
                )

            hits = []
            for hit in results:
                hits.append({
                    "id": getattr(hit, "id", None),
                    "score": getattr(hit, "score", 0.0),
                    "payload": getattr(hit, "payload", {})
                })
            return hits
        except UnexpectedResponse as e:
            logger.error(f"Qdrant collection search failed (does collection exist?): {e}")
            return []
        except Exception as e:
            logger.error(f"Error during Qdrant search: {e}")
            return []

    def clear_collection(self):
        """Deletes the document chunks collection."""
        if self.client and self.client.collection_exists(self.collection_name):
            self.client.delete_collection(self.collection_name)
            logger.info(f"Deleted Qdrant collection: {self.collection_name}")
