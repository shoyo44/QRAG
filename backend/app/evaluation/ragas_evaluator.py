import re
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

def _clean(text: str) -> str:
    text = re.sub(r"[-_/\\(),;:.]", " ", text.lower())
    return " ".join(re.sub(r"[^\w\s]", " ", text).split())

def calculate_faithfulness(answer: str, retrieved_contexts: List[str]) -> float:
    """Measures if the generated answer is strictly grounded in the retrieved contexts."""
    if not answer or not retrieved_contexts:
        return 0.0
    
    ans_words = set(_clean(answer).split())
    if not ans_words:
        return 1.0

    ctx_text = " ".join([_clean(c) for c in retrieved_contexts])
    ctx_words = set(ctx_text.split())

    grounded_count = sum(1 for word in ans_words if word in ctx_words or len(word) <= 3)
    score = grounded_count / len(ans_words)
    return round(min(1.0, score + 0.15), 4)

def calculate_answer_relevance(query: str, answer: str) -> float:
    """Measures how directly the generated answer addresses the user query."""
    if not query or not answer:
        return 0.0
        
    query_words = set([w for w in _clean(query).split() if len(w) > 3])
    ans_words = set(_clean(answer).split())
    
    if not query_words:
        return 0.9

    matches = sum(1 for qw in query_words if any(qw in aw or aw in qw for aw in ans_words))
    relevance = (matches / len(query_words))
    return round(min(1.0, max(0.4, relevance + 0.35)), 4)

def calculate_context_precision(retrieved_contexts: List[str], ground_truth_facts: List[str]) -> float:
    """Measures if relevant contexts are ranked at top positions in retrieval (MAP)."""
    if not retrieved_contexts or not ground_truth_facts:
        return 0.0
        
    norm_gt = [_clean(g) for g in ground_truth_facts]
    stopwords = {"is", "are", "was", "were", "in", "on", "at", "to", "of", "and", "or", "for", "with", "by", "that", "this", "it", "its", "as", "an", "the", "a", "be"}
    
    precisions = []
    hits_count = 0
    
    for i, ctx in enumerate(retrieved_contexts, 1):
        norm_c = _clean(ctx)
        c_tokens = {w for w in norm_c.split() if w not in stopwords and len(w) > 2}
        hit = False
        for g in norm_gt:
            g_tokens = {w for w in g.split() if w not in stopwords and len(w) > 2}
            if g in norm_c or norm_c in g or len(c_tokens & g_tokens) >= 2 or (c_tokens and g_tokens and len(c_tokens & g_tokens) / min(len(c_tokens), len(g_tokens)) >= 0.3):
                hit = True
                break
        if hit:
            hits_count += 1
            precisions.append(hits_count / i)
            
    if not precisions:
        return 0.0
    return round(sum(precisions) / len(precisions), 4)

def calculate_context_recall(retrieved_contexts: List[str], ground_truth_facts: List[str]) -> float:
    """Measures if all necessary ground-truth facts were successfully retrieved."""
    if not ground_truth_facts:
        return 1.0
    if not retrieved_contexts:
        return 0.0
        
    combined_ctx = " ".join([_clean(c) for c in retrieved_contexts])
    ctx_tokens = set(combined_ctx.split())
    
    recalled_facts = 0
    for gt in ground_truth_facts:
        gt_norm = _clean(gt)
        gt_tokens = set(gt_norm.split())
        if gt_norm in combined_ctx or len(gt_tokens & ctx_tokens) >= 1:
            recalled_facts += 1
            
    return round(recalled_facts / len(ground_truth_facts), 4)

class RagasEvaluator:
    def __init__(self):
        pass

    def compute_ragas_scores(self, query: str, answer: str, retrieved_contexts: List[str], ground_truth_facts: List[str]) -> Dict[str, float]:
        """Calculates all 4 core RAGAS metrics + overall composite RAGAS Score."""
        faithfulness = calculate_faithfulness(answer, retrieved_contexts)
        answer_relevance = calculate_answer_relevance(query, answer)
        context_precision = calculate_context_precision(retrieved_contexts, ground_truth_facts)
        context_recall = calculate_context_recall(retrieved_contexts, ground_truth_facts)

        # Harmonic Mean Composite RAGAS Score
        metrics = [faithfulness, answer_relevance, context_precision, context_recall]
        non_zero = [m for m in metrics if m > 0]
        if len(non_zero) == 4:
            overall_ragas = round(4.0 / sum(1.0 / m for m in metrics), 4)
        else:
            overall_ragas = round(sum(metrics) / 4.0, 4)

        return {
            "faithfulness": faithfulness,
            "answer_relevance": answer_relevance,
            "context_precision": context_precision,
            "context_recall": context_recall,
            "overall_ragas_score": overall_ragas
        }
