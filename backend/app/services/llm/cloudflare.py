import json
import httpx
from typing import List, Dict, Optional, AsyncGenerator
from app.services.llm.base import AbstractLLMService
from app.core.config import settings

class CloudflareLLMService(AbstractLLMService):
    def __init__(self):
        self.account_id = settings.CF_ACCOUNT_ID
        self.api_token = settings.CF_API_TOKEN
        self.model = settings.CF_LLM_MODEL
        self.embed_model = settings.CF_EMBED_MODEL
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run"

    def _verify_credentials(self):
        if not self.account_id or not self.api_token:
            raise ValueError("Cloudflare CF_ACCOUNT_ID and CF_API_TOKEN must be configured.")

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        self._verify_credentials()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "messages": messages,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self.base_url}/{self.model}", json=payload, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return data["result"]["response"].strip()

    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None) -> AsyncGenerator[str, None]:
        self._verify_credentials()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "messages": messages,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{self.base_url}/{self.model}", json=payload, headers=self.headers) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    # Cloudflare streams SSE event chunks starting with "data: "
                    if line.startswith("data: "):
                        data_str = line[len("data: "):].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            content = chunk.get("response", "")
                            if content:
                                yield str(content)
                        except json.JSONDecodeError:
                            continue

    async def embed(self, text: str) -> List[float]:
        self._verify_credentials()
        payload = {
            "text": text
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{self.base_url}/{self.embed_model}", json=payload, headers=self.headers)
            response.raise_for_status()
            res_json = response.json()
            result = res_json.get("result", {})
            if "data" in result:
                data = result["data"]
                if data and isinstance(data[0], list):
                    return data[0]
                return data
            elif "embedding" in result:
                return result["embedding"]
            else:
                raise ValueError(f"Unexpected Cloudflare embedding response structure: {res_json}")

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
            clean_res = raw_response.strip()
            if clean_res.startswith("```"):
                lines = clean_res.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].strip() == "```":
                    lines = lines[:-1]
                clean_res = "\n".join(lines).strip()
            
            triplets = json.loads(clean_res)
            if isinstance(triplets, list):
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
        except Exception:
            return []
