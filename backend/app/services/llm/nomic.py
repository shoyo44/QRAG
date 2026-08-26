import httpx
import logging
import numpy as np
from typing import List, Dict, Optional, AsyncGenerator
from app.services.llm.base import AbstractLLMService

logger = logging.getLogger(__name__)

NOMIC_EMBED_URL = "https://api-atlas.nomic.ai/v1/embedding/text"

class NomicEmbeddingService(AbstractLLMService):
    """Nomic Atlas embedding-only service.
    Uses nomic-embed-text-v1.5 for high-quality 768-dim text embeddings.
    Generation methods delegate to a fallback LLM service (Cloudflare or Ollama).
    """

    def __init__(self, api_key: str, model: str = "nomic-embed-text-v1.5", fallback_llm: Optional[AbstractLLMService] = None):
        self.api_key = api_key
        self.model = model
        self.fallback = fallback_llm  # For generate / extract_triplets calls
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def embed(self, text: str) -> List[float]:
        """Calls Nomic Atlas API to produce a 768-dim embedding vector."""
        payload = {
            "model": self.model,
            "texts": [text],
            "task_type": "search_document"  # Optimized for RAG retrieval
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(NOMIC_EMBED_URL, json=payload, headers=self.headers)
                response.raise_for_status()
                data = response.json()
                # Nomic returns: {"embeddings": [[...float list...]]}
                embeddings = data.get("embeddings", [])
                if embeddings and isinstance(embeddings[0], list):
                    return embeddings[0]
                raise ValueError(f"Unexpected Nomic embedding response: {data}")
        except Exception as e:
            logger.warning(f"Nomic embedding API call failed ({e}), attempting fallback...")
            if self.fallback:
                try:
                    return await self.fallback.embed(text)
                except Exception as fb_err:
                    logger.error(f"Fallback embedding also failed: {fb_err}")
            
            # Deterministic pseudo-embedding fallback (768-dim) for offline resilience
            import hashlib
            seed = int(hashlib.md5(text.encode('utf-8')).hexdigest(), 16) % (2**32)
            rng = np.random.default_rng(seed)
            vec = rng.standard_normal(768)
            norm = np.linalg.norm(vec)
            return (vec / norm).tolist() if norm > 0 else vec.tolist()

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Delegates to fallback LLM (Cloudflare/Ollama) for text generation."""
        if self.fallback:
            return await self.fallback.generate(prompt, system_prompt=system_prompt)
        raise NotImplementedError("NomicEmbeddingService requires a fallback LLM for generation.")

    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None) -> AsyncGenerator[str, None]:
        """Delegates to fallback LLM for streaming generation."""
        if self.fallback:
            async for token in self.fallback.generate_stream(prompt, system_prompt=system_prompt):
                yield token
        else:
            raise NotImplementedError("NomicEmbeddingService requires a fallback LLM for streaming.")

    async def extract_triplets(self, text: str) -> List[Dict[str, str]]:
        """Delegates to fallback LLM for triplet extraction."""
        if self.fallback:
            return await self.fallback.extract_triplets(text)
        raise NotImplementedError("NomicEmbeddingService requires a fallback LLM for triplet extraction.")
