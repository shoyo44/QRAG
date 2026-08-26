import pytest
import asyncio
from app.evaluation.data_loader import load_benchmark_dataset
from app.evaluation.benchmark_engine import calculate_retrieval_metrics, calculate_token_f1, calculate_exact_match
from app.evaluation.scalability_bench import profile_qubit_scaling

def test_data_loader():
    dataset = load_benchmark_dataset()
    assert len(dataset) > 0
    assert "question" in dataset[0]
    assert "answer" in dataset[0]

def test_benchmark_metrics():
    em = calculate_exact_match("Graphene is carbon", "graphene is carbon")
    assert em == 1.0

    p, r, f1 = calculate_token_f1("Graphene is carbon", "Graphene is composed of carbon")
    assert p > 0 and r > 0 and f1 > 0

    ret_m = calculate_retrieval_metrics(["Graphene carbon", "2D lattice"], ["Graphene is carbon", "2D honeycomb lattice"], k=5)
    assert ret_m["precision_at_k"] > 0
    assert ret_m["recall_at_k"] > 0

def test_qubit_scalability_profiler():
    res = profile_qubit_scaling(max_n=6)
    assert len(res) == 3
    assert res[0]["num_qubits"] == 2
    assert res[0]["hilbert_space_dim"] == 4
