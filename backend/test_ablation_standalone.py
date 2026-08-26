import asyncio
from app.evaluation.ablation_pipeline import AblationPipeline

async def test():
    pipeline = AblationPipeline()
    res = await pipeline.run_comparative_ablation("How does Graphene relate to Carbon atoms and Electrical Conductivity?")
    print("Ablation OK! Results:")
    for k, v in res.items():
        print(f"[{k}]")
        print(f"  Precision@5: {v.get('retrieval_precision_at_k')}")
        print(f"  Recall@5:    {v.get('retrieval_recall_at_k')}")
        print(f"  Answer F1:   {v.get('answer_f1')}")
        print(f"  Contexts:    {v.get('contexts_retrieved')}")
        print(f"  Answer:      {v.get('answer', '')[:80]}...")

if __name__ == "__main__":
    asyncio.run(test())
