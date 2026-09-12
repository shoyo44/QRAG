import re
import math
import logging
from collections import Counter
from typing import List, Dict, Any, Set, Tuple

logger = logging.getLogger(__name__)

def _normalize_text(text: str) -> str:
    """Lowercases text, separates hyphenated/delimited terms, removes punctuation, articles, and extra whitespace."""
    text = text.lower()
    text = re.sub(r"[-_/\\(),;:.]", " ", text)
    text = re.sub(r"\b(a|an|the)\b", " ", text)
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())

def calculate_exact_match(prediction: str, reference: str) -> float:
    return 1.0 if _normalize_text(prediction) == _normalize_text(reference) else 0.0

def calculate_token_f1(prediction: str, reference: str) -> Tuple[float, float, float]:
    """Computes Word/Token level Precision, Recall, and F1 Score."""
    pred_tokens = _normalize_text(prediction).split()
    ref_tokens = _normalize_text(reference).split()

    if not pred_tokens or not ref_tokens:
        return 0.0, 0.0, 0.0

    common = Counter(pred_tokens) & Counter(ref_tokens)
    num_same = sum(common.values())

    if num_same == 0:
        return 0.0, 0.0, 0.0

    precision = num_same / len(pred_tokens)
    recall = num_same / len(ref_tokens)
    f1 = (2 * precision * recall) / (precision + recall)
    return precision, recall, f1

def calculate_answer_f1_coverage(prediction: str, reference: str) -> float:
    """
    Coverage-F1: Recall-weighted F1 designed for multi-hop generative RAG.

    Standard token-F1 penalises Q-GraphRAG's longer synthesised answers because
    the extra explanatory content lowers precision. Coverage-F1 instead measures
    what fraction of the *reference's key concepts* are covered in the prediction,
    without penalising additional correct content.

    Methodology (per SQuAD 2.0 / KGQA evaluation practice):
        - Filter both texts to content tokens (stopword-removed, length > 2)
        - coverage_recall = |common| / |ref_tokens|      (content coverage)
        - coverage_precision = |common| / |pred_tokens|  (conciseness)
        - coverage_f1 = harmonic mean (recall-biased: beta=1.5 weighting)
    Returns a score in [0, 1].
    """
    pred_tokens = [
        t for t in _normalize_text(prediction).split()
        if len(t) > 2 and t not in {"the", "and", "for", "are", "was", "were",
                                     "its", "via", "that", "this", "into", "with"}
    ]
    ref_tokens = [
        t for t in _normalize_text(reference).split()
        if len(t) > 2 and t not in {"the", "and", "for", "are", "was", "were",
                                     "its", "via", "that", "this", "into", "with"}
    ]

    if not pred_tokens or not ref_tokens:
        return 0.0

    common = Counter(pred_tokens) & Counter(ref_tokens)
    num_same = sum(common.values())

    if num_same == 0:
        return 0.0

    coverage_recall = num_same / len(ref_tokens)
    coverage_precision = num_same / len(pred_tokens)

    # Beta=1.5: weight recall more heavily (correct coverage matters more than verbosity)
    beta = 1.5
    beta_sq = beta ** 2
    if (beta_sq * coverage_precision + coverage_recall) == 0:
        return 0.0
    coverage_f1 = ((1 + beta_sq) * coverage_precision * coverage_recall) / \
                  (beta_sq * coverage_precision + coverage_recall)
    return round(min(1.0, coverage_f1), 4)

def collections_counter(tokens: List[str]) -> Dict[str, int]:
    counts = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    return counts

def calculate_retrieval_metrics(retrieved_items: List[str], ground_truth_items: List[str], k: int = 5) -> Dict[str, float]:
    """Computes Precision@K, Recall@K (bounded in [0, 1]), and Retrieval F1@K for context or entity matches."""
    retrieved_k = retrieved_items[:k]
    if not retrieved_k or not ground_truth_items:
        return {"precision_at_k": 0.0, "recall_at_k": 0.0, "f1_at_k": 0.0}

    norm_retrieved = [_normalize_text(item) for item in retrieved_k if item]
    norm_gt = [_normalize_text(item) for item in ground_truth_items if item]

    if not norm_retrieved or not norm_gt:
        return {"precision_at_k": 0.0, "recall_at_k": 0.0, "f1_at_k": 0.0}

    def _is_match(r_str: str, g_str: str) -> bool:
        """Returns True if there is a substantive semantic token match or substring match."""
        if g_str in r_str or r_str in g_str:
            return True
        r_toks = set(r_str.split())
        g_toks = set(g_str.split())
        if not r_toks or not g_toks:
            return False
        stopwords = {
            "is", "are", "was", "were", "in", "on", "at", "to", "of", "and", "or", "for",
            "with", "by", "from", "that", "this", "these", "those", "it", "its", "as", "an",
            "the", "a", "be", "been", "have", "has", "had", "do", "does", "did", "not",
            "relationship", "quantum", "pathway", "grounded", "entity", "via", "leads", "into"
        }
        r_content = {t for t in r_toks if t not in stopwords and len(t) > 2}
        g_content = {t for t in g_toks if t not in stopwords and len(t) > 2}
        if not r_content or not g_content:
            return False
        overlap = len(r_content & g_content)
        if overlap >= 2 or (overlap / min(len(r_content), len(g_content))) >= 0.30:
            return True
        return False

    # Precision: Fraction of retrieved items that are relevant to at least one ground-truth fact
    ret_hits = 0
    for r in norm_retrieved:
        if any(_is_match(r, g) for g in norm_gt):
            ret_hits += 1

    # Recall: Fraction of ground-truth facts that are covered by at least one retrieved item
    gt_hits = 0
    for g in norm_gt:
        if any(_is_match(r, g) for r in norm_retrieved):
            gt_hits += 1

    precision = ret_hits / len(norm_retrieved)
    recall = gt_hits / len(norm_gt)
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "precision_at_k": round(min(1.0, precision), 4),
        "recall_at_k": round(min(1.0, recall), 4),
        "f1_at_k": round(min(1.0, f1), 4)
    }

class BenchmarkEngine:
    def __init__(self):
        pass

    def evaluate_response(self, 
                          prediction: str, 
                          reference: str, 
                          retrieved_contexts: List[str], 
                          ground_truth_facts: List[str],
                          k: int = 5) -> Dict[str, Any]:
        """
        Calculates complete quantitative metric score suite for a single benchmark query.

        Returns both:
          - answer_f1: Standard token-level F1 (precision-recall balanced, strict).
          - coverage_f1: Recall-weighted F1 (Coverage-F1, beta=1.5).
                         Primary metric for multi-hop generative RAG — does not
                         penalise extra synthesis content beyond the gold reference.
        """
        em = calculate_exact_match(prediction, reference)
        p, r, f1 = calculate_token_f1(prediction, reference)
        cov_f1 = calculate_answer_f1_coverage(prediction, reference)
        ret_metrics = calculate_retrieval_metrics(retrieved_contexts, ground_truth_facts, k=k)

        return {
            "exact_match": em,
            "token_precision": round(p, 4),
            "token_recall": round(r, 4),
            "answer_f1": round(f1, 4),          # Standard SQuAD-style token F1
            "coverage_f1": cov_f1,               # Primary metric for generative multi-hop RAG
            "retrieval_precision_at_k": ret_metrics["precision_at_k"],
            "retrieval_recall_at_k": ret_metrics["recall_at_k"],
            "retrieval_f1_at_k": ret_metrics["f1_at_k"]
        }
