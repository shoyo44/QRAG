"""
Q-GraphRAG Benchmark Runner
Calls AblationPipeline directly (no FastAPI server required).
Output: paper_figures/table1_ablation_results.tex + benchmark_50_results.json
"""
import sys, os, asyncio
sys.path.insert(0, r'd:\Projects\QRAG\backend')
os.chdir(r'd:\Projects\QRAG\backend')

from app.evaluation.batch_benchmark_suite import run_batch_benchmark_50

if __name__ == "__main__":
    print("Starting Q-GraphRAG 50-item 4-way ablation benchmark...")
    asyncio.run(run_batch_benchmark_50(
        max_items=50,
        output_dir=r"d:\Projects\QRAG\backend\paper_figures"
    ))
    print("\nDone. Results in d:\\Projects\\QRAG\\backend\\paper_figures\\")
