import os
import zipfile
import shutil

def create_overleaf_package():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, ".."))
    
    manuscript_dir = os.path.join(base_dir, "paper_manuscript")
    figures_dir = os.path.join(base_dir, "paper_figures")
    
    zip_output_path = os.path.join(project_root, "Q_GraphRAG_Springer_Overleaf_Package.zip")
    
    print(f"Creating Overleaf package at: {zip_output_path}")
    
    figures_to_include = [
        "fig1_4way_ablation_benchmark.png",
        "fig1_3way_ablation_benchmark.png",
        "fig2_ctqw_quantum_walk_interference.png",
        "fig3_qubit_scaling_profile.png",
        "fig4_multi_hop_precision_medicine_pathway.png",
        "fig5_quantum_interference_time_evolution.png",
        "fig6_hamiltonian_energy_spectrum_dos.png",
        "fig7_multihop_accuracy_vs_graph_depth.png",
        "fig8_ragas_domain_radar_breakdown.png",
        "fig_ibm_quantum_circuit.png",
        "fig_qpu_measurement_distribution.png",
        "fig_effect_size_forest.png",
        "fig_latency_violin.png",
    ]
    
    with zipfile.ZipFile(zip_output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add main.tex (using main_springer.tex)
        main_springer_path = os.path.join(manuscript_dir, "main_springer.tex")
        if os.path.exists(main_springer_path):
            zf.write(main_springer_path, arcname="main.tex")
            print("  + Added main.tex (from main_springer.tex)")
            
        # Add references.bib
        bib_path = os.path.join(manuscript_dir, "references.bib")
        if os.path.exists(bib_path):
            zf.write(bib_path, arcname="references.bib")
            print("  + Added references.bib")

        # Add llncs.cls and splncs04.bst
        for extra_file in ["llncs.cls", "splncs04.bst"]:
            epath = os.path.join(manuscript_dir, extra_file)
            if os.path.exists(epath):
                zf.write(epath, arcname=extra_file)
                print(f"  + Added {extra_file}")
            
        # Add figures in paper_figures/ folder inside the zip
        for fig in figures_to_include:
            fig_path = os.path.join(figures_dir, fig)
            if os.path.exists(fig_path):
                arc_name = f"paper_figures/{fig}"
                zf.write(fig_path, arcname=arc_name)
                print(f"  + Added {arc_name}")
            else:
                print(f"  ! Warning: {fig} not found in {figures_dir}")
                
    file_size_mb = os.path.getsize(zip_output_path) / (1024 * 1024)
    print(f"\nSuccessfully created {zip_output_path} ({file_size_mb:.2f} MB)")

if __name__ == "__main__":
    create_overleaf_package()
