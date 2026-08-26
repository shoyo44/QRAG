# backend/app/services/llm/__init__.py
from app.core.config import settings
from app.services.llm.base import AbstractLLMService
from app.services.llm.ollama import OllamaLLMService
from app.services.llm.cloudflare import CloudflareLLMService
from app.services.llm.nomic import NomicEmbeddingService


def get_llm_service() -> AbstractLLMService:
    """Returns the configured LLM provider for generation and triplet extraction."""
    provider = settings.LLM_PROVIDER.lower().strip()
    if provider == "cloudflare":
        return CloudflareLLMService()
    elif provider == "ollama":
        return OllamaLLMService()
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: '{settings.LLM_PROVIDER}'. Use 'cloudflare' or 'ollama'.")


def get_embedding_service() -> AbstractLLMService:
    """Returns the configured embedding provider.
    
    If EMBED_PROVIDER=nomic, uses Nomic Atlas API (768-dim, best quality).
    Otherwise falls back to the active LLM provider's built-in embed() method.
    """
    embed_provider = settings.EMBED_PROVIDER.lower().strip()

    if embed_provider == "nomic":
        if not settings.NOMIC_API_KEY:
            raise ValueError("NOMIC_API_KEY must be set when EMBED_PROVIDER=nomic.")
        # Use the generation LLM as a fallback for non-embedding tasks
        fallback_llm = get_llm_service()
        return NomicEmbeddingService(
            api_key=settings.NOMIC_API_KEY,
            model=settings.NOMIC_EMBED_MODEL,
            fallback_llm=fallback_llm
        )
    elif embed_provider == "cloudflare":
        return CloudflareLLMService()
    elif embed_provider == "ollama":
        return OllamaLLMService()
    else:
        # Default: use the same provider as LLM_PROVIDER
        return get_llm_service()
