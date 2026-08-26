from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Active LLM Provider (for generation + triplet extraction)
    LLM_PROVIDER: str = "cloudflare"  # "cloudflare" | "ollama"

    # Embedding Provider (independent of LLM_PROVIDER)
    # Set to "nomic" to use Nomic Atlas API, otherwise falls back to LLM_PROVIDER
    EMBED_PROVIDER: str = "nomic"  # "nomic" | "cloudflare" | "ollama"
    
    # Cloudflare Credentials & Models
    CF_ACCOUNT_ID: Optional[str] = None
    CF_API_TOKEN: Optional[str] = None
    CF_LLM_MODEL: str = "@cf/meta/llama-3.1-8b-instruct"
    CF_EMBED_MODEL: str = "@cf/baai/bge-large-en-v1.5"

    # Nomic Atlas Embedding API
    NOMIC_API_KEY: Optional[str] = None
    NOMIC_EMBED_MODEL: str = "nomic-embed-text-v1.5"

    # Ollama Host & Models
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_LLM_MODEL: str = "llama3"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    
    # Redis Broker & Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Qdrant Vector DB
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: Optional[str] = None
    
    # MongoDB Atlas Persistent Store
    MONGODB_URI: Optional[str] = None
    MONGODB_DB: str = "qrag_db"
    MONGODB_COLLECTION: str = "chat_history"
    
    # Graph Storage & Quantum Budget
    GRAPH_STORE_PATH: str = "graph_store.json"
    MAX_QUBITS: int = 14  # Max size of simulated graph nodes
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
