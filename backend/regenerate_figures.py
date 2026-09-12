"""
Regenerate paper figures using real 50-item 4-way benchmark data.
Produces:
  - fig1_4way_ablation_benchmark.png  (replaces old fig1_3way)
  - fig8_ragas_domain_radar_breakdown.png (updated with real values)
  - fig_latency_breakdown.png (new - latency distribution violin)
  - fig_effect_size_summary.png (new - Cohen's d + CI forest plot)
"""
import os, sys, json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch
import matplotlib.gridspec as gridspec
from matplotlib.lines import Line2D
import seaborn as sns

OUTPUT_DIR = r"d:\Projects\QRAG\backend\paper_figures"
JSON_PATH  = os.path.join(OUTPUT_DIR, "benchmark_50_results.json")

with open(JSON_PATH, "r") as f:
    data = json.load(f)

STATS = data["summary_stats"]
SIG   = data["significance_tests"]
RAW   = data["raw_results"]

# ── Color palette (publication-quality) ────────────────────────────────────
COLORS = {
    "pure_vector":           "#6366f1",   # indigo
    "classical_graph":       "#f59e0b",   # amber
    "classical_walk_pruned": "#10b981",   # emerald (ablation)
    "quantum_graph":         "#ef4444",   # red
}
LABELS = {
    "pure_vector":           "Pure Vector",
    "classical_graph":       "Classical Graph",
    "classical_walk_pruned": "Classical RWR★",
    "quantum_graph":         "Q-GraphRAG",
}
MODES = ["pure_vector", "classical_graph", "classical_walk_pruned", "quantum_graph"]

sns.set_theme(style="whitegrid", font="DejaVu Sans")
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "figure.dpi": 300,
})

# ═══════════════════════════════════════════════════════════════════════════
# FIGURE 1 — 4-Way Ablation Benchmark (Grouped Bar + Error Bars)
# ═══════════════════════════════════════════════════════════════════════════
print("[1/4] Generating Fig 1: 4-Way Ablation Benchmark...")

metrics = {
    "Retrieval\nPrecision@5":  "precision_at_k",
    "Retrieval\nRecall@5":     "recall_at_k",
    "Coverage-F1\n(β=1.5)":   "coverage_f1",
    "RAGAS\nFaithfulness":     "faithfulness",
    "RAGAS Answer\nRelevance": "answer_relevance",
    "Overall\nRAGAS":          "overall_ragas",
}

fig, ax = plt.subplots(figsize=(14, 6), dpi=300)

n_metrics = len(metrics)
n_modes   = len(MODES)
bar_w     = 0.18
group_gap = 0.12
x_centers = np.arange(n_metrics)

for mi, mode in enumerate(MODES):
    offset = (mi - (n_modes - 1) / 2) * (bar_w + 0.01)
    means  = [STATS[mode][mk]["mean"] for mk in metrics.values()]
    stds   = [STATS[mode][mk]["std"]  for mk in metrics.values()]
    bars = ax.bar(
        x_centers + offset, means, bar_w,
        label=LABELS[mode],
        color=COLORS[mode],
        alpha=0.88,
        edgecolor="white",
        linewidth=0.6,
        yerr=stds,
        capsize=3,
        error_kw={"elinewidth": 1.2, "ecolor": "#374151", "capthick": 1.2},
        zorder=3,
    )

# Annotate Q-GraphRAG best values
best_mode = "quantum_graph"
for xi, (label, mk) in enumerate(metrics.items()):
    v = STATS[best_mode][mk]["mean"]
    offset = (MODES.index(best_mode) - (n_modes - 1) / 2) * (bar_w + 0.01)
    # Only annotate if Q-GraphRAG is actually highest for this metric
    vals = [STATS[m][mk]["mean"] for m in MODES]
    if vals.index(max(vals)) == MODES.index(best_mode):
        ax.text(xi + offset, v + STATS[best_mode][mk]["std"] + 0.018,
                f"{v:.3f}", ha="center", va="bottom", fontsize=6.5,
                color=COLORS[best_mode], fontweight="bold")

ax.set_xticks(x_centers)
ax.set_xticklabels(list(metrics.keys()), fontsize=9.5)
ax.set_ylabel("Score (Mean ± Std Dev, N=50)", fontsize=10.5, fontweight="bold")
ax.set_ylim(0, 1.18)
ax.set_title(
    "Figure 1: Multi-Domain 4-Way Ablation Benchmark (N=50)\n"
    r"Pure Vector  |  Classical Graph  |  Classical RWR$^\star$ (pruned, ablation)  |  Q-GraphRAG (CTQW)",
    fontsize=12, fontweight="bold", pad=14
)
ax.legend(
    loc="upper left", frameon=True, framealpha=0.92,
    edgecolor="#d1d5db", fontsize=9.5, ncol=2
)
ax.annotate(
    r"$^\star$Classical RWR on identical $N\leq14$ pruned subgraph — isolates CTQW kernel contribution from topological pre-processing",
    xy=(0.01, 0.01), xycoords="axes fraction",
    fontsize=7.5, color="#6b7280", style="italic"
)
# Add "ns" marker over all Q-GraphRAG bars (all comparisons non-significant)
for xi in range(n_metrics):
    offset = (MODES.index(best_mode) - (n_modes - 1) / 2) * (bar_w + 0.01)
    ax.text(xi + offset, 1.08, "ns", ha="center", fontsize=6, color="#9ca3af")

ax.grid(axis="y", linestyle="--", alpha=0.5, zorder=0)
plt.tight_layout()
fig1_path = os.path.join(OUTPUT_DIR, "fig1_4way_ablation_benchmark.png")
fig.savefig(fig1_path, bbox_inches="tight")
plt.close(fig)
print(f"    Saved: {fig1_path}")

# ═══════════════════════════════════════════════════════════════════════════
# FIGURE 2 — RAGAS Domain Radar (5-axis, all 4 modes)
# ═══════════════════════════════════════════════════════════════════════════
print("[2/4] Generating Fig 2: RAGAS Domain Radar...")

radar_metrics = [
    ("Precision@5",       "precision_at_k"),
    ("Recall@5",          "recall_at_k"),
    ("Coverage-F1",       "coverage_f1"),
    ("Faithfulness",      "faithfulness"),
    ("Answer Relevance",  "answer_relevance"),
]
radar_labels = [rm[0] for rm in radar_metrics]
N_axes = len(radar_metrics)
angles = np.linspace(0, 2 * np.pi, N_axes, endpoint=False).tolist()
angles += angles[:1]  # close polygon

fig, ax = plt.subplots(figsize=(7, 7), subplot_kw={"polar": True}, dpi=300)
ax.set_theta_offset(np.pi / 2)
ax.set_theta_direction(-1)
ax.set_xticks(angles[:-1])
ax.set_xticklabels(radar_labels, fontsize=11, fontweight="bold")
ax.set_ylim(0, 1.0)
ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
ax.set_yticklabels(["0.2", "0.4", "0.6", "0.8", "1.0"], fontsize=7.5, color="#6b7280")
ax.grid(color="#e5e7eb", linewidth=0.8)

for mode in MODES:
    values = [STATS[mode][mk]["mean"] for _, mk in radar_metrics]
    values += values[:1]
    ax.plot(angles, values, "o-", linewidth=2.2, color=COLORS[mode],
            label=LABELS[mode], markersize=5, zorder=3)
    ax.fill(angles, values, alpha=0.08, color=COLORS[mode])

ax.set_title(
    "RAGAS Multi-Dimension Benchmark\n(N=50, all domains combined)",
    pad=20, fontsize=12, fontweight="bold"
)
ax.legend(
    loc="lower center", bbox_to_anchor=(0.5, -0.16),
    ncol=2, frameon=True, framealpha=0.92, edgecolor="#d1d5db", fontsize=9.5
)
plt.tight_layout()
fig_radar_path = os.path.join(OUTPUT_DIR, "fig8_ragas_domain_radar_breakdown.png")
fig.savefig(fig_radar_path, bbox_inches="tight")
plt.close(fig)
print(f"    Saved: {fig_radar_path}")

# ═══════════════════════════════════════════════════════════════════════════
# FIGURE 3 — Effect Size Forest Plot (Cohen's d + 95% CI)
# ═══════════════════════════════════════════════════════════════════════════
print("[3/4] Generating Fig 3: Effect Size Forest Plot...")

comparisons = {
    "vs Classical GraphRAG":    "classical_graph",
    "vs Classical RWR (pruned)": "classical_walk_pruned",
}
forest_metrics = ["coverage_f1", "precision_at_k", "faithfulness", "answer_f1", "overall_ragas"]
forest_labels  = ["Coverage-F1", "Precision@5", "Faithfulness", "Answer F1", "Overall RAGAS"]

fig, axes = plt.subplots(1, 2, figsize=(13, 5), dpi=300, sharey=True)
fig.suptitle(
    "Effect Size Forest Plot: Q-GraphRAG vs Baselines (N=50, paired t-test)",
    fontsize=12, fontweight="bold", y=1.02
)

for ax, (comp_label, comp_key) in zip(axes, comparisons.items()):
    sig_data = SIG[comp_key]
    ys = np.arange(len(forest_metrics))

    for yi, (mk, ml) in enumerate(zip(forest_metrics, forest_labels)):
        s    = sig_data.get(mk, {})
        d    = s.get("cohens_d", 0.0)
        ci   = s.get("ci_95", (-0.1, 0.1))
        pval = s.get("p_value", 1.0)
        ci_lo, ci_hi = ci

        color = "#ef4444" if d > 0 else "#6366f1"
        marker = "D" if s.get("statistically_significant_005") else "o"
        ax.plot([ci_lo, ci_hi], [yi, yi], "-", color="#9ca3af", lw=1.8, zorder=1)
        ax.plot(d, yi, marker=marker, color=color, markersize=9, zorder=3, markeredgecolor="white", markeredgewidth=1.2)
        ax.text(ci_hi + 0.01, yi, f"d={d:.2f}, p={pval:.2f}", va="center", fontsize=8, color="#374151")

    ax.axvline(0, color="#374151", linestyle="--", linewidth=1.2, zorder=2)
    ax.set_yticks(ys)
    ax.set_yticklabels(forest_labels, fontsize=10)
    ax.set_xlabel("Cohen's d (Q-GraphRAG − Baseline)", fontsize=10, fontweight="bold")
    ax.set_title(comp_label, fontsize=11, fontweight="bold", pad=10)
    ax.set_xlim(-0.45, 0.55)
    ax.grid(axis="x", linestyle="--", alpha=0.4)
    ax.fill_betweenx([-0.5, len(forest_metrics)-0.5], -0.2, 0.2, alpha=0.06, color="#f59e0b", label="Small effect zone (|d|<0.2)")
    ax.legend(fontsize=8, loc="lower right")
    ax.annotate("← Baseline better | Q-GraphRAG better →", xy=(0, -0.12),
                xycoords="axes fraction", ha="center", fontsize=8, color="#6b7280", style="italic")

plt.tight_layout()
fig_forest_path = os.path.join(OUTPUT_DIR, "fig_effect_size_forest.png")
fig.savefig(fig_forest_path, bbox_inches="tight")
plt.close(fig)
print(f"    Saved: {fig_forest_path}")

# ═══════════════════════════════════════════════════════════════════════════
# FIGURE 4 — Latency Distribution Violin Plot
# ═══════════════════════════════════════════════════════════════════════════
print("[4/4] Generating Fig 4: Latency Distribution Violin...")

fig, ax = plt.subplots(figsize=(10, 5), dpi=300)

latency_data = [
    [entry["latency_ms"] for entry in RAW[mode]]
    for mode in MODES
]
parts = ax.violinplot(latency_data, positions=range(len(MODES)), widths=0.6,
                       showmeans=True, showmedians=True, showextrema=True)

for i, (pc, mode) in enumerate(zip(parts["bodies"], MODES)):
    pc.set_facecolor(COLORS[mode])
    pc.set_edgecolor("white")
    pc.set_alpha(0.75)

parts["cmeans"].set_color("#374151")
parts["cmedians"].set_color("white")
parts["cmeans"].set_linewidth(2)
parts["cmedians"].set_linewidth(2)

# Overlay individual points (jittered)
np.random.seed(42)
for i, (mode_data, mode) in enumerate(zip(latency_data, MODES)):
    jitter = np.random.uniform(-0.08, 0.08, len(mode_data))
    ax.scatter(np.full(len(mode_data), i) + jitter, mode_data,
               s=12, alpha=0.4, color=COLORS[mode], zorder=4, edgecolors="none")

ax.set_xticks(range(len(MODES)))
ax.set_xticklabels([LABELS[m] for m in MODES], fontsize=10.5)
ax.set_ylabel("End-to-End Latency (ms)", fontsize=11, fontweight="bold")
ax.set_title(
    "Latency Distribution: All 4 Retrieval Modes (N=50)\n"
    "Latency dominated by LLM generation; CTQW kernel <25 ms",
    fontsize=12, fontweight="bold", pad=14
)
ax.grid(axis="y", linestyle="--", alpha=0.4)

# Annotate means
for i, mode in enumerate(MODES):
    mean_lat = STATS[mode]["latency_ms"]["mean"]
    ax.text(i, mean_lat + 60, f"μ={mean_lat:.0f}ms",
            ha="center", fontsize=8.5, fontweight="bold", color=COLORS[mode])

legend_handles = [mpatches.Patch(facecolor=COLORS[m], alpha=0.75, label=LABELS[m]) for m in MODES]
ax.legend(handles=legend_handles, loc="upper right", fontsize=9, frameon=True, framealpha=0.9)

plt.tight_layout()
fig_lat_path = os.path.join(OUTPUT_DIR, "fig_latency_violin.png")
fig.savefig(fig_lat_path, bbox_inches="tight")
plt.close(fig)
print(f"    Saved: {fig_lat_path}")

print("\n" + "=" * 60)
print("All 4 figures generated successfully.")
print(f"Output directory: {os.path.abspath(OUTPUT_DIR)}")
