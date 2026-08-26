import httpx
import asyncio
import json

async def test_all_queries():
    async with httpx.AsyncClient(timeout=120.0) as client:
        queries = [
            "How does Graphene relate to Carbon atoms and Electrical Conductivity?",
            "What is the relationship between BCS Theory, Cooper Pairs, and Superconductivity?",
            "Explain Trotterized Heisenberg Hamiltonian evolution on superconducting qubits.",
            "Identify multi-hop biological pathways for bacterial antibiotic resistance genes."
        ]
        for q in queries:
            print("\n" + "=" * 60)
            print(f"QUERY: {q}")
            print("=" * 60)
            r = await client.post('http://127.0.0.1:8000/api/v1/research/ablation', json={'query': q})
            data = r.json()
            for mode, res in data.items():
                p = res.get("retrieval_precision_at_k", 0)
                rec = res.get("retrieval_recall_at_k", 0)
                f1 = res.get("answer_f1", 0)
                ragas = res.get("ragas", {})
                faith = ragas.get("faithfulness", 0)
                ans_rel = ragas.get("answer_relevance", 0)
                overall = ragas.get("overall_ragas_score", 0)
                print(f"[{mode.upper():<16}] Precision@5: {p:.2f} | Recall@5: {rec:.2f} | AnsF1: {f1:.3f} | Faithfulness: {faith:.2f} | RAGAS: {overall:.2f}")
                print(f"  Snippet: {res.get('answer', '')[:90]}...")

if __name__ == "__main__":
    asyncio.run(test_all_queries())
