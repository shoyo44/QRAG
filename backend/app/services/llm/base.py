from abc import ABC, abstractmethod
from typing import List, Dict, Optional, AsyncGenerator

class AbstractLLMService(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Sends a query to the LLM and returns the completed text response."""
        pass

    @abstractmethod
    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None) -> AsyncGenerator[str, None]:
        """Sends a query to the LLM and yields tokens as they are generated."""
        pass

    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        """Generates a high-dimensional dense vector embedding of the input text."""
        pass

    @abstractmethod
    async def extract_triplets(self, text: str) -> List[Dict[str, str]]:
        """Parses a text chunk and extracts knowledge triplets as a list of dictionaries:
        [{'subject': '...', 'predicate': '...', 'object': '...'}]
        """
        pass
