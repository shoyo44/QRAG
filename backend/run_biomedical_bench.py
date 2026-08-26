import asyncio
import time
from app.evaluation.data_loader import load_benchmark_dataset
from app.evaluation.ablation_pipeline import AblationPipeline

async def run_biomedical_evaluation_suite():
    print("=" * 80)
    print("   Q-GRAPHRAG BIOMEDICAL & CLINICAL DATASET EVALUATION SUITE")
    print("   Datasets: PubMedQA (Clinical), PrimeKG (Precision Medicine), ChEMBL (Bioactivity)")
    print("=" * 80)

    pipeline = AblationPipeline()

    datasets_to_test = [
        ("PubMedQA Biomedical Literature QA", "pubmedqa"),
        ("PrimeKG Precision Medicine Knowledge Graph", "primekg"),
        ("ChEMBL Bioactivity & Target Pathways", "chembl"),
    ]

    for ds_label, ds_name in datasets_to_test:
        print(f"\n>> DATASET: {ds_label}")
        print("-" * 80)
        items = load_benchmark_dataset(ds_name)
        
        for idx, item in enumerate(items, 1):
            q = item["question"]
            print(f"\n[Case {idx}/{len(items)}] Question: {q}")
            
            ablation = await pipeline.run_comparative_ablation(
                query=q,
                reference_answer=item.get("answer"),
                ground_truth_facts=item.get("supporting_facts", [])
            )
            
            print(f"{'Engine':<28} | {'Latency':<9} | {'P@5':<6} | {'R@5':<6} | {'Ans F1':<8} | {'Faithful':<9} | {'RAGAS Score':<12}")
            print("-" * 88)
            
            for mode_key in ["pure_vector", "classical_graph", "quantum_graph"]:
                res = ablation[mode_key]
                ragas = res.get("ragas", {})
                p5 = res.get("retrieval_precision_at_k", 0.0)
                r5 = res.get("retrieval_recall_at_k", 0.0)
                f1 = res.get("answer_f1", 0.0)
                faith = ragas.get("faithfulness", 0.0)
                overall = ragas.get("overall_ragas_score", 0.0)
                
                print(f"{res['mode']:<28} | {res['latency_ms']:<7.1f}ms | {p5:<6.2f} | {r5:<6.2f} | {f1:<8.3f} | {faith:<9.2f} | {overall:<12.2f}")

    print("\n" + "=" * 80)
    print("   BIOMEDICAL EVALUATION COMPLETED SUCCESSFULLY")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_biomedical_evaluation_suite())
