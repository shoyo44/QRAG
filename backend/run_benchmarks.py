import json
import time
import asyncio
from app.evaluation.data_loader import load_benchmark_dataset
from app.evaluation.ablation_pipeline import AblationPipeline
from app.evaluation.scalability_bench import profile_qubit_scaling

async def run_full_research_suite():
    print("================================================================================")
    print(" Q-GRAPHRAG RESEARCH EVALUATION & BENCHMARKING SUITE")
    print("================================================================================")
    
    # 1. Qubit Scalability Profile
    print("\n--- 1. QUBIT SCALABILITY & HILBERT SPACE DIMENSION PROFILING ---")
    scalability_data = profile_qubit_scaling(max_n=14)
    print(f"{'Qubits (N)':<12} | {'Hilbert Dim':<14} | {'Memory (MB)':<12} | {'Time (ms)':<10} | {'Status':<30}")
    print("-" * 88)
    for row in scalability_data:
        print(f"{row['num_qubits']:<12} | {row['hilbert_space_dim']:<14} | {row['memory_mb']:<12.4f} | {row['simulation_time_ms']:<10.2f} | {row['status']:<30}")

    # 2. Dataset Benchmarking & 3-Way Comparative Ablation
    print("\n--- 2. EMPIRICAL MULTI-HOP QA & 3-WAY ABLATION STUDY ---")
    dataset = load_benchmark_dataset()
    pipeline = AblationPipeline()

    # Seed benchmark knowledge chunks into Qdrant & Knowledge Graph
    sample_text = (
        "Graphene is composed of Carbon atoms arranged in a 2D honeycomb lattice. "
        "Graphene exhibits extraordinary Electrical Conductivity and High Strength. "
        "Quantum Hall Effect is observed in Graphene at room temperature."
    )
    emb = await pipeline.embedder.embed(sample_text)
    await pipeline.vector_service.upsert_chunks(["bench_doc_1"], [emb], [{"doc_id": "bench_doc", "text": sample_text}])
    pipeline.graph_service.add_triplets([
        {"subject": "Graphene", "predicate": "composed_of", "object": "Carbon"},
        {"subject": "Carbon", "predicate": "arranged_in", "object": "Honeycomb Lattice"},
        {"subject": "Graphene", "predicate": "exhibits", "object": "Electrical Conductivity"},
        {"subject": "Graphene", "predicate": "exhibits", "object": "High Strength"},
        {"subject": "Quantum Hall Effect", "predicate": "observed_in", "object": "Graphene"}
    ])
    
    for i, item in enumerate(dataset, 1):
        print(f"\n[Benchmark Item {i}/{len(dataset)}] Question: {item['question']}")
        ablation = await pipeline.run_comparative_ablation(
            query=item["question"],
            reference_answer=item["answer"],
            ground_truth_facts=item.get("supporting_facts", [])
        )
        
        print(f"  {'Mode':<38} | {'Latency':<10} | {'Faithfulness':<12} | {'Ans Relevance':<14} | {'Ctx Precision':<14} | {'Ctx Recall':<12} | {'RAGAS Score':<12}")
        print("  " + "-" * 115)
        for key in ["pure_vector", "classical_graph", "quantum_graph"]:
            res = ablation[key]
            ragas = res.get("ragas", {})
            print(f"  {res['mode']:<38} | {res['latency_ms']:<10.2f} | {ragas.get('faithfulness', 0.0):<12.4f} | {ragas.get('answer_relevance', 0.0):<14.4f} | {ragas.get('context_precision', 0.0):<14.4f} | {ragas.get('context_recall', 0.0):<12.4f} | {ragas.get('overall_ragas_score', 0.0):<12.4f}")

    print("\n================================================================================")
    print(" RAGAS & ABLATION EVALUATION COMPLETED SUCCESSFULLY.")
    print("================================================================================")

if __name__ == "__main__":
    asyncio.run(run_full_research_suite())
