import json
import httpx
from typing import List, Dict, Optional, AsyncGenerator
from app.services.llm.base import AbstractLLMService
from app.core.config import settings

class OllamaLLMService(AbstractLLMService):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_LLM_MODEL
        self.embed_model = settings.OLLAMA_EMBED_MODEL

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": 0.1}
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self.base_url}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"].strip()

    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None) -> AsyncGenerator[str, None]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": 0.1}
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        content = chunk.get("message", {}).get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue

    async def embed(self, text: str) -> List[float]:
        payload = {
            "model": self.embed_model,
            "prompt": text
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{self.base_url}/api/embeddings", json=payload)
            response.raise_for_status()
            data = response.json()
            return data["embedding"]

    async def extract_triplets(self, text: str) -> List[Dict[str, str]]:
        system_prompt = (
            "You are an expert knowledge graph triplet extractor. "
            "Your task is to analyze the input text and extract all significant entity-relation-entity triplets. "
            "Respond ONLY with a valid JSON list of objects, where each object has keys: 'subject', 'predicate', 'object'. "
            "Do not output any markdown wrappers (like ```json), introduction, or explanation. "
            "If no triplets are found, return an empty list []."
        )
        prompt = f"Text to extract triplets from:\n\n{text}"
        
        try:
            raw_response = await self.generate(prompt, system_prompt=system_prompt)
            # Basic cleanup in case model wraps output in markdown code blocks
            clean_res = raw_response.strip()
            if clean_res.startswith("```"):
                # strip opening ```json or ```
                lines = clean_res.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].strip() == "```":
                    lines = lines[:-1]
                clean_res = "\n".join(lines).strip()
            
            triplets = json.loads(clean_res)
            if isinstance(triplets, list):
                # Validate structures
                validated = []
                for item in triplets:
                    if isinstance(item, dict) and "subject" in item and "predicate" in item and "object" in item:
                        validated.append({
                            "subject": str(item["subject"]).strip(),
                            "predicate": str(item["predicate"]).strip(),
                            "object": str(item["object"]).strip()
                        })
                return validated
            return []
        except Exception as e:
            # Fallback on parse failure
            return []
