import json
import logging
from typing import Dict, Any, List, Tuple
from app.services.llm import get_llm_service

logger = logging.getLogger(__name__)

class AgentRouter:
    def __init__(self):
        self.llm = get_llm_service()

    async def route_query(self, query: str) -> Tuple[str, List[str], str]:
        """Classifies the query complexity and extracts key entity nodes.
        Returns:
            intent (str): "simple" or "complex"
            entities (List[str]): Extracted target entity names.
            reason (str): Justification for classification.
        """
        system_prompt = (
            "You are an AI routing agent for a GraphRAG knowledge system. "
            "Your job is to analyze the user's query, determine its complexity, and extract key entities.\n\n"
            "Query Classes:\n"
            "1. 'simple': Direct factual lookup, keyword definition, or single entity lookup. "
            "Examples: 'What is Graphene?', 'Who wrote document X?'\n"
            "2. 'complex': Multi-hop structural queries, pathway tracing, obligation links, or comparative reasoning. "
            "Examples: 'How does Molecule A relate to Gene B?', 'Compare compliance standard X and Y.'\n\n"
            "Respond ONLY with a valid JSON object: "
            "{\n"
            "  \"intent\": \"simple\" or \"complex\",\n"
            "  \"entities\": [\"Entity A\", \"Entity B\"],\n"
            "  \"reason\": \"Brief explanation of routing decision\"\n"
            "}\n"
            "Do not output markdown code blocks (like ```json), introduction, or explanations outside the JSON."
        )

        try:
            response = await self.llm.generate(prompt=query, system_prompt=system_prompt)
            if isinstance(response, dict):
                data = response
            else:
                clean_res = str(response).strip()
                if clean_res.startswith("```"):
                    lines = clean_res.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].strip() == "```":
                        lines = lines[:-1]
                    clean_res = "\n".join(lines).strip()
                data = json.loads(clean_res)
            intent_val = data.get("intent", "simple")
            if isinstance(intent_val, dict):
                intent_val = intent_val.get("type", intent_val.get("name", "simple"))
            intent = str(intent_val).lower().strip()
            entities = data.get("entities", [])
            reason = str(data.get("reason", "Parsed classification."))
            
            if intent not in ["simple", "complex"]:
                intent = "simple"
                
            if not isinstance(entities, list):
                entities = [str(entities)]
            else:
                entities = [str(ent).strip() for ent in entities if ent]
                
            return intent, entities, reason
            
        except Exception as e:
            logger.error(f"AgentRouter classification failed: {e}. Defaulting to simple routing.")
            return "simple", [], f"Classification failed: {e}"
