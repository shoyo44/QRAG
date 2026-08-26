"""Comprehensive 50-Item Multi-Domain Research Benchmark Dataset.
Covers:
  1. Clinical Oncology & Targeted Therapeutics (15 items)
  2. Precision Medicine & Causal Signaling Pathways (15 items)
  3. Antimicrobial Resistance & Microbial Genomics (10 items)
  4. Quantum Condensed Matter & Quantum Information (10 items)
"""

from typing import List, Dict, Any

BENCHMARK_50_DATASET: List[Dict[str, Any]] = [
    # --- Category 1: Clinical Oncology & Targeted Therapeutics (Items 1-15) ---
    {
        "id": "onco_01",
        "domain": "Oncology",
        "question": "Does Trastuzumab emtansine (T-DM1) significantly improve overall survival in HER2-positive metastatic breast cancer resistant to standard trastuzumab therapy?",
        "answer": "Yes, Trastuzumab emtansine (T-DM1) conjugates the HER2-targeting antibody with the microtubule-inhibitory agent DM1, delivering targeted cytotoxic therapy that significantly improves overall survival and progression-free survival in HER2-positive breast cancer resistant to trastuzumab alone.",
        "supporting_facts": [
            "Trastuzumab emtansine binds selectively to the extracellular domain of HER2/ERBB2 receptors.",
            "DM1 inhibits microtubule assembly leading to mitotic arrest and apoptosis in tumor cells.",
            "T-DM1 improves progression-free and overall survival in trastuzumab-refractory HER2-amplified malignancies."
        ]
    },
    {
        "id": "onco_02",
        "domain": "Oncology",
        "question": "What is the pharmacological bioactivity and molecular target profile of Osimertinib in EGFR-mutant Non-Small Cell Lung Cancer?",
        "answer": "Osimertinib is a third-generation irreversible EGFR tyrosine kinase inhibitor that covalently binds the C797 residue in the ATP pocket, selectively targeting both EGFR-sensitizing mutations (L858R, exon 19 del) and the secondary T790M resistance mutation while sparing wild-type EGFR.",
        "supporting_facts": [
            "Osimertinib selectively binds the C797 residue in the EGFR kinase domain.",
            "It overcomes the secondary T790M gatekeeper resistance mutation.",
            "Selective inhibition of mutant EGFR blocks downstream ERK and Akt phosphorylation."
        ]
    },
    {
        "id": "onco_03",
        "domain": "Oncology",
        "question": "How does Pembrolizumab immune checkpoint blockade restore antitumor T-cell cytotoxicity in PD-L1 expressing tumors?",
        "answer": "Pembrolizumab binds the PD-1 receptor on tumor-infiltrating lymphocytes, blocking interaction with tumor-expressed PD-L1 and PD-L2 ligands, reversing T-cell exhaustion and restoring cytotoxic CD8+ lymphocyte tumor destruction.",
        "supporting_facts": [
            "Pembrolizumab binds the programmed cell death protein 1 (PD-1) receptor.",
            "Blocking PD-1 prevents interaction with PD-L1 and PD-L2 on tumor cells.",
            "Immune checkpoint blockade relieves T-cell exhaustion and stimulates CD8+ cytotoxic activity."
        ]
    },
    {
        "id": "onco_04",
        "domain": "Oncology",
        "question": "Through what mechanism does Sotorasib selectively inhibit the KRAS G12C oncoprotein in solid tumors?",
        "answer": "Sotorasib binds irreversibly to the switch II pocket of GDP-bound inactive KRAS G12C, locking the oncoprotein in an inactive state and blocking downstream RAF-MEK-ERK mitogenic signaling.",
        "supporting_facts": [
            "Sotorasib forms a covalent bond with the mutant cysteine at residue 12 of KRAS G12C.",
            "Binding in the switch II pocket traps KRAS in its inactive GDP-bound state.",
            "Downstream RAF-MEK-ERK signaling cascade is selectively suppressed."
        ]
    },
    {
        "id": "onco_05",
        "domain": "Oncology",
        "question": "Why does combining Dabrafenib with Trametinib prevent acquired resistance in BRAF V600E metastatic melanoma?",
        "answer": "Dabrafenib inhibits mutant BRAF V600E monomer kinase, while Trametinib inhibits downstream MEK1/2, providing dual vertical pathway inhibition that prevents paradoxical MAPK pathway reactivation and delays acquired resistance.",
        "supporting_facts": [
            "Dabrafenib selectively inhibits the mutated BRAF V600E serine-threonine kinase.",
            "Trametinib acts as an allosteric inhibitor of MEK1 and MEK2 kinases.",
            "Dual vertical MAPK inhibition suppresses paradoxical reactivation and extends progression-free survival."
        ]
    },
    {
        "id": "onco_06",
        "domain": "Oncology",
        "question": "How does Olaparib exploit synthetic lethality in BRCA1/2-deficient ovarian and breast cancers?",
        "answer": "Olaparib traps PARP1/2 at single-strand DNA breaks; in homologous recombination-deficient (BRCA1/2-mutated) cells, these unrepaired lesions convert to lethal double-strand breaks during replication, triggering selective tumor apoptosis.",
        "supporting_facts": [
            "Olaparib inhibits PARP1 and PARP2 enzymes and traps them at DNA damage sites.",
            "BRCA1 and BRCA2 mutations impair high-fidelity homologous recombination repair.",
            "Synthetic lethality induces selective apoptosis in homologous recombination deficient cancer cells."
        ]
    },
    {
        "id": "onco_07",
        "domain": "Oncology",
        "question": "What is the biological mechanism of Enzalutamide in overcoming resistance in castration-resistant prostate cancer?",
        "answer": "Enzalutamide competitively inhibits androgen receptor binding, blocks nuclear translocation of the receptor, and impairs chromosomal DNA co-activator recruitment, preventing prostate tumor growth despite androgen deprivation.",
        "supporting_facts": [
            "Enzalutamide binds the androgen receptor with higher affinity than bicalutamide.",
            "It blocks androgen receptor nuclear translocation and chromatin binding.",
            "Suppression of androgen-responsive genes halts tumor progression in castration-resistant prostate cancer."
        ]
    },
    {
        "id": "onco_08",
        "domain": "Oncology",
        "question": "How does CDK4/6 inhibition by Palbociclib arrest the cell cycle in ER-positive breast cancer?",
        "answer": "Palbociclib selectively inhibits CDK4 and CDK6, preventing phosphorylation of the Retinoblastoma (Rb) tumor suppressor, thereby sequestering E2F transcription factors and enforcing G1-to-S cell cycle arrest.",
        "supporting_facts": [
            "Palbociclib inhibits cyclin-dependent kinases 4 and 6 (CDK4/6).",
            "Unphosphorylated Retinoblastoma (Rb) protein remains bound to E2F transcription factors.",
            "E2F sequestration blocks transition from G1 to S phase in the cell cycle."
        ]
    },
    {
        "id": "onco_09",
        "domain": "Oncology",
        "question": "Through what mechanism does Bevacizumab inhibit tumor angiogenesis in colorectal carcinoma?",
        "answer": "Bevacizumab binds circulating Vascular Endothelial Growth Factor A (VEGF-A), preventing interaction with VEGFR-1 and VEGFR-2 on endothelial cells, thereby suppressing tumor neovascularization and microvascular permeability.",
        "supporting_facts": [
            "Bevacizumab is a monoclonal antibody targeting circulating VEGF-A.",
            "It prevents VEGF-A binding to tyrosine kinase receptors VEGFR-1 and VEGFR-2.",
            "Endothelial cell proliferation and tumor microvascular angiogenesis are inhibited."
        ]
    },
    {
        "id": "onco_10",
        "domain": "Oncology",
        "question": "What is the role of Venetoclax in restoring apoptosis in BCL-2 overexpressing Chronic Lymphocytic Leukemia?",
        "answer": "Venetoclax is a BH3-mimetic that selectively binds the anti-apoptotic protein BCL-2, displacing pro-apoptotic proteins BIM and BAX/BAK to trigger mitochondrial outer membrane permeabilization and rapid leukemic cell death.",
        "supporting_facts": [
            "Venetoclax is a selective BH3-mimetic small molecule targeting BCL-2.",
            "BCL-2 inhibition releases pro-apoptotic effectors BIM, BAX, and BAK.",
            "Mitochondrial outer membrane permeabilization (MOMP) induces intrinsic apoptosis in chronic lymphocytic leukemia."
        ]
    },
    {
        "id": "onco_11",
        "domain": "Oncology",
        "question": "How does Alectinib overcome Crizotinib resistance mutations in ALK-rearranged Non-Small Cell Lung Cancer?",
        "answer": "Alectinib possesses high lipophilicity and structural flexibility to bind the ATP pocket of ALK kinase even in the presence of secondary gatekeeper resistance mutations (such as L1196M and G1202R), while effectively penetrating the blood-brain barrier.",
        "supporting_facts": [
            "Alectinib is a highly selective second-generation ALK tyrosine kinase inhibitor.",
            "It retains potent inhibitory activity against ALK gatekeeper mutations L1196M and G1202R.",
            "High central nervous system penetration provides superior intracranial disease control."
        ]
    },
    {
        "id": "onco_12",
        "domain": "Oncology",
        "question": "What is the therapeutic mechanism of Ipilimumab in targeting CTLA-4 during early T-cell activation?",
        "answer": "Ipilimumab blocks cytotoxic T-lymphocyte antigen 4 (CTLA-4) from binding CD80/CD86 on antigen-presenting cells, allowing costimulatory CD28 signaling to enhance de novo T-cell priming in secondary lymphoid organs.",
        "supporting_facts": [
            "Ipilimumab is a monoclonal antibody directed against the immune checkpoint receptor CTLA-4.",
            "CTLA-4 blockade enables CD28 costimulation by B7 molecules (CD80/CD86).",
            "Enhanced T-cell priming and clonal expansion increase antitumor immune responses."
        ]
    },
    {
        "id": "onco_13",
        "domain": "Oncology",
        "question": "How does antibody-drug conjugate Enhertu (T-DXd) exhibit bystander antitumor killing in HER2-low tumors?",
        "answer": "Enhertu (trastuzumab deruxtecan) carries a cleavable peptide linker and a membrane-permeable topoisomerase I inhibitor payload (DXd) that diffuses across neighboring tumor cells to elicit potent bystander killing of heterogeneous HER2-low clones.",
        "supporting_facts": [
            "Trastuzumab deruxtecan (T-DXd) incorporates a high drug-to-antibody ratio of 8:1.",
            "The topoisomerase I inhibitor payload DXd is membrane-permeable.",
            "Cleaved DXd diffuses into adjacent HER2-low and HER2-negative tumor cells to produce bystander cytotoxicity."
        ]
    },
    {
        "id": "onco_14",
        "domain": "Oncology",
        "question": "What molecular target does Larotrectinib inhibit in NTRK gene fusion-positive pediatric and adult cancers?",
        "answer": "Larotrectinib is a highly selective ATP-competitive inhibitor of tropomyosin receptor kinases TRKA, TRKB, and TRKC, halting oncogenic signaling driven by chimeric NTRK1/2/3 fusion proteins regardless of tissue of origin.",
        "supporting_facts": [
            "Larotrectinib selectively inhibits TRKA, TRKB, and TRKC kinase domains.",
            "NTRK gene fusions generate constitutively active chimeric TRK kinase oncoproteins.",
            "Tumor-agnostic TRK kinase inhibition halts downstream MAPK and PI3K/Akt proliferation."
        ]
    },
    {
        "id": "onco_15",
        "domain": "Oncology",
        "question": "How does chimeric antigen receptor (CAR) T-cell therapy targeting CD19 eliminate refractory B-cell acute lymphoblastic leukemia?",
        "answer": "Autologous T cells engineered with a single-chain variable fragment (scFv) against CD19 linked to 4-1BB/CD28 costimulatory domains and CD3-zeta signaling trigger direct MHC-independent cytotoxicity upon binding CD19 on malignant B-cells.",
        "supporting_facts": [
            "Anti-CD19 CAR-T cells recognize the extracellular CD19 antigen without MHC restriction.",
            "Intracellular 4-1BB/CD28 and CD3-zeta domains trigger cytotoxic perforin and granzyme release.",
            "Targeted lysis eliminates malignant and normal CD19+ B-lymphocyte populations."
        ]
    },

    # --- Category 2: Precision Medicine & Causal Signaling Pathways (Items 16-30) ---
    {
        "id": "pm_16",
        "domain": "Precision Medicine",
        "question": "Through what multi-hop biological pathway does Imatinib induce remission in BCR-ABL positive Chronic Myeloid Leukemia?",
        "answer": "Imatinib acts as a selective competitive inhibitor of the ATP-binding pocket of the constitutively active BCR-ABL fusion tyrosine kinase, blocking downstream STAT5 and PI3K/Akt signaling cascades and halting leukemic cell proliferation.",
        "supporting_facts": [
            "The t(9;22) Philadelphia chromosome creates the oncogenic BCR-ABL1 fusion gene.",
            "BCR-ABL1 encodes a constitutively active tyrosine kinase that phosphorylates STAT5 and CrkL.",
            "Imatinib mesylate binds to the kinase active site in its inactive conformation, inhibiting downstream leukemogenesis."
        ]
    },
    {
        "id": "pm_17",
        "domain": "Precision Medicine",
        "question": "How does SGLT2 inhibition with Dapagliflozin attenuate renal progression in chronic kidney disease patients with and without Type 2 Diabetes?",
        "answer": "Dapagliflozin reduces intraglomerular pressure by restoring tubuloglomerular feedback through increased sodium delivery to the macula densa, thereby reducing proteinuria, hyperfiltration, and the risk of sustained decline in estimated GFR independent of glycemic status.",
        "supporting_facts": [
            "Dapagliflozin selectively inhibits sodium-glucose cotransporter-2 (SGLT2) in the proximal renal tubule.",
            "SGLT2 inhibition increases distal sodium delivery to the macula densa, restoring tubuloglomerular feedback.",
            "Tubuloglomerular feedback activation induces afferent arteriolar vasoconstriction and reduces intraglomerular hypertension."
        ]
    },
    {
        "id": "pm_18",
        "domain": "Precision Medicine",
        "question": "What multi-hop mechanism connects Metformin administration to the suppression of Hepatic Gluconeogenesis and improvement in Type 2 Diabetes?",
        "answer": "Metformin inhibits mitochondrial Complex I, elevating the cellular AMP/ATP ratio, which allosterically activates AMP-activated protein kinase (AMPK) and inhibits adenylate cyclase, resulting in the downregulation of gluconeogenic enzymes PEPCK and G6Pase.",
        "supporting_facts": [
            "Metformin inhibits respiratory Complex I in hepatic mitochondria.",
            "Complex I inhibition increases the intracellular AMP-to-ATP ratio.",
            "Elevated AMP activates AMPK and inhibits fructose-1,6-bisphosphatase to suppress hepatic glucose production."
        ]
    },
    {
        "id": "pm_19",
        "domain": "Precision Medicine",
        "question": "What is the molecular mechanism of CRISPR-Cas9 ribonucleoprotein delivery in correcting the HBB gene mutation in sickle cell disease?",
        "answer": "CRISPR-Cas9 targeted endonuclease introduces precise double-strand breaks at the BCL11A erythroid enhancer region, downregulating BCL11A repressor expression and inducing therapeutic fetal hemoglobin (HbF) synthesis to prevent erythrocyte sickling.",
        "supporting_facts": [
            "Cas9 endonuclease guides target cleavage at the GATA1 binding motif of the BCL11A erythroid-specific enhancer.",
            "Disruption of the BCL11A enhancer relieves transcriptional repression of gamma-globin genes (HBG1/HBG2).",
            "Elevated fetal hemoglobin (HbF) tetramers prevent polymerization of deoxygenated sickle hemoglobin (HbS)."
        ]
    },
    {
        "id": "pm_20",
        "domain": "Precision Medicine",
        "question": "How does PCSK9 monoclonal antibody therapy with Evolocumab lower circulating LDL cholesterol?",
        "answer": "Evolocumab binds free PCSK9, preventing PCSK9-mediated degradation of hepatic LDL receptors (LDLR) in lysosomes, allowing LDLR recycling to the hepatocyte surface and increasing LDL clearance from plasma.",
        "supporting_facts": [
            "PCSK9 binds the low-density lipoprotein receptor (LDLR) and targets it for lysosomal destruction.",
            "Evolocumab inhibits PCSK9 from binding LDLR on hepatocytes.",
            "Recycled surface LDL receptors clear circulating atherogenic LDL particles."
        ]
    },
    {
        "id": "pm_21",
        "domain": "Precision Medicine",
        "question": "What is the signaling mechanism by which GLP-1 receptor agonists stimulate glucose-dependent insulin secretion in beta cells?",
        "answer": "GLP-1 receptor agonists activate G-protein coupled GLP-1R on pancreatic beta cells, stimulating adenylate cyclase to produce cAMP and activate PKA and Epac2, which enhances glucose-dependent exocytosis of insulin granules.",
        "supporting_facts": [
            "GLP-1 agonists bind the Gs-protein coupled GLP-1 receptor on pancreatic islet beta cells.",
            "Adenylate cyclase activation increases intracellular cyclic AMP (cAMP) levels.",
            "PKA and Epac2 signaling amplify calcium-dependent insulin vesicle exocytosis."
        ]
    },
    {
        "id": "pm_22",
        "domain": "Precision Medicine",
        "question": "How does JAK inhibition with Ruxolitinib suppress myelofibrosis in JAK2 V617F mutant hematopoiesis?",
        "answer": "Ruxolitinib competitively inhibits JAK1 and JAK2 kinase domains, blocking constitutive STAT3 and STAT5 phosphorylation and downregulating inflammatory cytokine signaling and abnormal myeloid progenitor proliferation.",
        "supporting_facts": [
            "The JAK2 V617F gain-of-function mutation causes constitutive JAK-STAT activation.",
            "Ruxolitinib selectively inhibits JAK1 and JAK2 tyrosine kinases.",
            "STAT phosphorylation reduction suppresses splenomegaly and systemic inflammatory cytokines in myelofibrosis."
        ]
    },
    {
        "id": "pm_23",
        "domain": "Precision Medicine",
        "question": "What is the molecular pathway of Sacubitril/Valsartan (ARNI) in reversing cardiac remodeling in heart failure?",
        "answer": "Sacubitril inhibits neprilysin to preserve vasoactive natriuretic peptides (ANP/BNP) that increase cGMP and induce vasodilation, while Valsartan selectively blocks the angiotensin II type 1 (AT1) receptor to suppress maladaptive fibrosis.",
        "supporting_facts": [
            "Sacubitrilat active metabolite inhibits neprilysin, preventing degradation of natriuretic peptides.",
            "Elevated natriuretic peptides stimulate guanylyl cyclase and increase cyclic GMP (cGMP).",
            "Valsartan blocks angiotensin II AT1 receptors, reducing cardiac afterload, hypertrophy, and fibrosis."
        ]
    },
    {
        "id": "pm_24",
        "domain": "Precision Medicine",
        "question": "How does Ivacaftor act as a CFTR potentiator in cystic fibrosis patients harboring the G551D gating mutation?",
        "answer": "Ivacaftor binds directly to the mutant CFTR channel at the cell surface, stabilizing the open-channel conformation and increasing chloride ion transport across epithelial membranes without requiring ATP hydrolysis.",
        "supporting_facts": [
            "The CFTR G551D class III mutation causes defective ATP-dependent channel gating.",
            "Ivacaftor acts as a small-molecule potentiator that increases CFTR channel open probability.",
            "Restored chloride and bicarbonate secretion rehydrates airway surface liquid and improves lung function."
        ]
    },
    {
        "id": "pm_25",
        "domain": "Precision Medicine",
        "question": "What is the biological mechanism of antisense oligonucleotide Nusinersen in treating Spinal Muscular Atrophy?",
        "answer": "Nusinersen is an antisense oligonucleotide that binds the intronic splicing silencer N1 (ISS-N1) in the SMN2 pre-mRNA, promoting exon 7 inclusion to produce full-length, functional Survival Motor Neuron (SMN) protein.",
        "supporting_facts": [
            "Spinal Muscular Atrophy is caused by homozygous loss of the SMN1 gene.",
            "Nusinersen binds the ISS-N1 splicing silencer sequence in SMN2 pre-mRNA intron 7.",
            "Exon 7 inclusion produces stable full-length SMN protein that rescues alpha motor neurons."
        ]
    },
    {
        "id": "pm_26",
        "domain": "Precision Medicine",
        "question": "How does Allopurinol lower serum uric acid levels to prevent gouty arthritis?",
        "answer": "Allopurinol is metabolized to oxypurinol, which acts as an analogue and suicide inhibitor of xanthine oxidase, preventing the oxidation of hypoxanthine to xanthine and xanthine to uric acid.",
        "supporting_facts": [
            "Allopurinol is a purine analog metabolized by xanthine oxidase into oxypurinol.",
            "Oxypurinol binds tightly to the molybdenum center of xanthine oxidase, inactivating it.",
            "Suppression of uric acid synthesis lowers plasma urate levels and dissolves sodium urate crystals."
        ]
    },
    {
        "id": "pm_27",
        "domain": "Precision Medicine",
        "question": "What is the molecular mechanism of Dupilumab in blocking type 2 inflammatory cascades in severe asthma and atopic dermatitis?",
        "answer": "Dupilumab is a monoclonal antibody that binds the shared IL-4 receptor alpha (IL-4Ralpha) subunit, simultaneously inhibiting IL-4 and IL-13 signaling via STAT6 phosphorylation to suppress IgE production, eosinophilia, and airway hyperresponsiveness.",
        "supporting_facts": [
            "Dupilumab targets the IL-4Ralpha subunit common to IL-4 and IL-13 receptor complexes.",
            "Dual blockade prevents downstream STAT6 transcription factor activation.",
            "Type 2 inflammatory mediators, serum IgE, and Th2 cytokine secretion are substantially downregulated."
        ]
    },
    {
        "id": "pm_28",
        "domain": "Precision Medicine",
        "question": "How does Eculizumab prevent terminal complement-mediated hemolysis in Paroxysmal Nocturnal Hemoglobinuria?",
        "answer": "Eculizumab binds complement protein C5, preventing its cleavage by C5 convertase into C5a and C5b, thereby blocking assembly of the cytotoxic membrane attack complex (MAC / C5b-9) on CD55/CD59-deficient erythrocytes.",
        "supporting_facts": [
            "Paroxysmal Nocturnal Hemoglobinuria cells lack GPI-anchored complement inhibitors CD55 and CD59.",
            "Eculizumab binds C5 with high affinity to prevent cleavage into C5a and C5b.",
            "Inhibition of the terminal Membrane Attack Complex (C5b-9) halts intravascular hemolysis."
        ]
    },
    {
        "id": "pm_29",
        "domain": "Precision Medicine",
        "question": "What is the biological pathway of Mavacamten in treating Obstructive Hypertrophic Cardiomyopathy?",
        "answer": "Mavacamten is an allosteric inhibitor of cardiac myosin ATPase that stabilizes the super-relaxed (SRX) state of myosin heads, reducing excessive actin-myosin cross-bridge formation, hypercontractility, and left ventricular outflow tract obstruction.",
        "supporting_facts": [
            "Hypertrophic cardiomyopathy is characterized by excessive actin-myosin cross-bridge cycling.",
            "Mavacamten shifts cardiac myosin heads into an energy-sparing super-relaxed (SRX) state.",
            "Reduction in dynamic hypercontractility relieves left ventricular outflow tract gradient and improves diastolic compliance."
        ]
    },
    {
        "id": "pm_30",
        "domain": "Precision Medicine",
        "question": "How does Triheptanoin bypass long-chain fatty acid oxidation defects in metabolic cardiomyopathy?",
        "answer": "Triheptanoin provides odd-chain medium-chain triglycerides (heptanoate) that diffuse past CPT-1/CPT-2 transporters into mitochondria, generating propionyl-CoA and acetyl-CoA to directly replenish citric acid cycle intermediates via anaplerosis.",
        "supporting_facts": [
            "Long-chain fatty acid oxidation disorders impair mitochondrial beta-oxidation of even-chain fats.",
            "Triheptanoin is metabolized into five-carbon ketone bodies and propionyl-CoA.",
            "Propionyl-CoA converts into succinyl-CoA, providing anaplerotic replenishment to the TCA cycle."
        ]
    },

    # --- Category 3: Antimicrobial Resistance & Microbial Genomics (Items 31-40) ---
    {
        "id": "amr_31",
        "domain": "Antimicrobial Resistance",
        "question": "Identify multi-hop biological pathways for bacterial antibiotic resistance genes.",
        "answer": "Multi-hop biological pathways identify antibiotic resistance genes transferred via bacterial plasmids, integrons, and horizontal gene transfer across pathogenic microbial networks.",
        "supporting_facts": [
            "Antibiotic resistance genes spread across bacterial biological pathways.",
            "Bacterial plasmids and integrons mediate horizontal gene transfer.",
            "Knowledge graph walks trace multi-hop transmission routes."
        ]
    },
    {
        "id": "amr_32",
        "domain": "Antimicrobial Resistance",
        "question": "How does the blaKPC gene on conjugative plasmids confer high-level carbapenem resistance in Klebsiella pneumoniae?",
        "answer": "The blaKPC gene encodes a class A serine carbapenemase that hydrolyzes the beta-lactam ring of carbapenems, penicillins, and cephalosporins, and is disseminated across microbial communities on mobile transposon-bearing plasmids.",
        "supporting_facts": [
            "blaKPC encodes the Klebsiella pneumoniae carbapenemase (KPC) serine beta-lactamase.",
            "KPC hydrolyzes carbapenems including meropenem, imipenem, and ertapenem.",
            "Dissemination is mediated by Tn4401 transposons carried on conjugative IncFII plasmids."
        ]
    },
    {
        "id": "amr_33",
        "domain": "Antimicrobial Resistance",
        "question": "What is the catalytic mechanism of New Delhi metallo-beta-lactamase (NDM-1) in hydrolyzing carbapenems?",
        "answer": "NDM-1 coordinates two active-site zinc divalent cations (Zn2+) that polarize a bridging water molecule into a nucleophilic hydroxide ion, rapidly opening the beta-lactam carbonyl ring without forming a covalent acyl-enzyme intermediate.",
        "supporting_facts": [
            "NDM-1 is a subclass B1 metallo-beta-lactamase requiring two catalytic zinc ions.",
            "The di-zinc active site activates a nucleophilic hydroxide ion to hydrolyze the beta-lactam bond.",
            "Class B metallo-beta-lactamases are resistant to classical serine beta-lactamase inhibitors like clavulanate and avibactam."
        ]
    },
    {
        "id": "amr_34",
        "domain": "Antimicrobial Resistance",
        "question": "How does the mcr-1 gene mediate plasmid-borne colistin resistance in Enterobacteriaceae?",
        "answer": "The mcr-1 gene encodes a phosphoethanolamine transferase that transfers a phosphoethanolamine moiety to lipid A of lipopolysaccharide, reducing the negative surface charge and preventing electrostatic binding of cationic colistin peptides.",
        "supporting_facts": [
            "mcr-1 encodes an integral membrane phosphoethanolamine transferase.",
            "Phosphoethanolamine addition to the 1' and 4' positions of lipid A neutralizes surface negative charge.",
            "Electrostatic binding of cationic polymyxins/colistin to the bacterial outer membrane is abolished."
        ]
    },
    {
        "id": "amr_35",
        "domain": "Antimicrobial Resistance",
        "question": "Through what mechanism does the mecA gene confer methicillin resistance in Staphylococcus aureus (MRSA)?",
        "answer": "The mecA gene encodes penicillin-binding protein 2a (PBP2a), an altered transpeptidase with extremely low affinity for beta-lactams, allowing continued peptidoglycan cell wall cross-linking even in the presence of methicillin and oxacillin.",
        "supporting_facts": [
            "mecA is carried on the mobile staphylococcal cassette chromosome mec (SCCmec).",
            "mecA encodes the alternative penicillin-binding protein PBP2a.",
            "PBP2a has low binding affinity for all standard beta-lactams, preserving cell wall synthesis in MRSA."
        ]
    },
    {
        "id": "amr_36",
        "domain": "Antimicrobial Resistance",
        "question": "How do RND multidrug efflux pumps like AdeABC mediate resistance to tigecycline in Acinetobacter baumannii?",
        "answer": "Overexpression of the AdeABC tripartite Resistance-Nodulation-Division (RND) efflux system actively pumps tigecycline and aminoglycosides from the periplasm across the outer membrane into the extracellular milieu driven by proton motive force.",
        "supporting_facts": [
            "AdeABC is a tripartite RND efflux pump comprising AdeA (membrane fusion), AdeB (transporter), and AdeC (outer membrane channel).",
            "Mutations in the adeRS regulatory two-component system lead to constitutive pump overexpression.",
            "Proton-driven extrusion keeps intracellular tigecycline concentrations below the ribosomal inhibitory threshold."
        ]
    },
    {
        "id": "amr_37",
        "domain": "Antimicrobial Resistance",
        "question": "What molecular modification in DNA gyrase and topoisomerase IV causes fluoroquinolone resistance in Gram-negative bacilli?",
        "answer": "Point mutations in the Quinolone Resistance-Determining Region (QRDR) of gyrA (e.g. S83L) and parC (e.g. S80I) alter key amino acid residues in the water-metal ion bridge, preventing ciprofloxacin from stabilizing toxic cleavage complexes.",
        "supporting_facts": [
            "Fluoroquinolones trap DNA gyrase (GyrA2GyrB2) and Topoisomerase IV (ParC2ParE2) in covalent DNA cleavage complexes.",
            "Mutations in GyrA Ser83/Asp87 and ParC Ser80 disrupt drug-enzyme coordination via the magnesium water bridge.",
            "Unperturbed DNA replication proceeds, establishing high-level fluoroquinolone resistance."
        ]
    },
    {
        "id": "amr_38",
        "domain": "Antimicrobial Resistance",
        "question": "How does the vanA operon remodel peptidoglycan precursors to cause vancomycin resistance in Enterococci (VRE)?",
        "answer": "The vanA operon encodes VanA ligase which synthesizes D-alanyl-D-lactate (D-Ala-D-Lac) instead of normal D-alanyl-D-alanine, reducing vancomycin binding affinity by 1000-fold due to the loss of a critical hydrogen bond.",
        "supporting_facts": [
            "The vanA gene cluster is located on the Tn1546 transposon in Enterococcus faecium and E. faecalis.",
            "VanA ligase produces modified D-Ala-D-Lac peptidoglycan termini.",
            "VanX and VanY peptidases eliminate sensitive D-Ala-D-Ala precursors, abolishing glycopeptide binding."
        ]
    },
    {
        "id": "amr_39",
        "domain": "Antimicrobial Resistance",
        "question": "Through what mechanism does Avibactam restore Ceftazidime activity against Class A and Class C beta-lactamases?",
        "answer": "Avibactam is a non-beta-lactam diazabicyclooctane (DBO) inhibitor that forms a covalent, slowly reversible carbamate intermediate with the catalytic serine of Class A, C, and some Class D beta-lactamases, preventing ceftazidime hydrolysis.",
        "supporting_facts": [
            "Avibactam is a diazabicyclooctane (DBO) serine beta-lactamase inhibitor.",
            "It forms a stable covalent carbamate bond without undergoing irreversible hydrolytic degradation.",
            "Protecting ceftazidime from ESBLs, KPC, and AmpC enzymes restores broad-spectrum bactericidal activity."
        ]
    },
    {
        "id": "amr_40",
        "domain": "Antimicrobial Resistance",
        "question": "How do 16S rRNA methyltransferases like ArmA and RmtB mediate pan-aminoglycoside resistance in Pseudomonas aeruginosa?",
        "answer": "ArmA and RmtB transfer a methyl group to the N7 position of nucleotide G1405 in the 16S rRNA A-site, creating steric hindrance that prevents high-affinity binding of all 4,6-disubstituted 2-deoxystreptamine aminoglycosides (amikacin, gentamicin, tobramycin).",
        "supporting_facts": [
            "ArmA and RmtB are plasmid-borne 16S ribosomal RNA methyltransferases.",
            "Methylation of G1405 in the ribosomal A-site sterically blocks aminoglycoside binding.",
            "This post-transcriptional ribosomal modification confers high-level pan-aminoglycoside resistance."
        ]
    },

    # --- Category 4: Quantum Condensed Matter & Quantum Information (Items 41-50) ---
    {
        "id": "qm_41",
        "domain": "Quantum Physics",
        "question": "How does Graphene relate to Carbon atoms and Electrical Conductivity?",
        "answer": "Graphene is composed of Carbon atoms arranged in a 2D honeycomb lattice. It exhibits extraordinary Electrical Conductivity and High Strength, and the Quantum Hall Effect is observed at room temperature.",
        "supporting_facts": [
            "Graphene is composed of Carbon atoms.",
            "Carbon atoms are arranged in a 2D honeycomb lattice.",
            "Graphene exhibits extraordinary Electrical Conductivity and High Strength.",
            "Quantum Hall Effect is observed in Graphene at room temperature."
        ]
    },
    {
        "id": "qm_42",
        "domain": "Quantum Physics",
        "question": "What is the relationship between BCS Theory, Cooper Pairs, and Superconductivity?",
        "answer": "BCS Theory explains conventional superconductivity where electrons form Cooper pairs mediated by phonon lattice vibrations, condensing into a zero-resistance quantum state.",
        "supporting_facts": [
            "BCS Theory explains conventional superconductivity.",
            "Electrons form Cooper pairs mediated by lattice vibrations.",
            "Cooper pairs condense into a zero-resistance macroscopic quantum state.",
            "Superconductivity occurs below a critical transition temperature."
        ]
    },
    {
        "id": "qm_43",
        "domain": "Quantum Physics",
        "question": "Explain Trotterized Heisenberg Hamiltonian evolution on superconducting qubits.",
        "answer": "Trotterized Heisenberg Hamiltonian evolution discretizes continuous time evolution e^{-iHt} on superconducting qubits, mapping graph connectivity to Pauli spin interaction terms.",
        "supporting_facts": [
            "Heisenberg Hamiltonian models graph interaction topology.",
            "Trotter-Suzuki decomposition discretizes unitary time evolution.",
            "Continuous-Time Quantum Walk propagates quantum state amplitudes on superconducting qubits."
        ]
    },
    {
        "id": "qm_44",
        "domain": "Quantum Physics",
        "question": "How do massless Dirac fermions explain the anomalous integer Quantum Hall Effect in monolayer graphene?",
        "answer": "The linear E-k dispersion relation near the K and K' Dirac points endows charge carriers with an effective zero rest mass and Berry phase of pi, generating non-equidistant relativistic Landau levels that exhibit quantum Hall plateaus at half-integer multiples of 4e^2/h.",
        "supporting_facts": [
            "Graphene conduction and valence bands meet at conical Dirac points with linear dispersion E = hbar * v_F * k.",
            "Electrons acquire a topological Berry phase of pi upon circling the Fermi surface.",
            "Relativistic Landau level quantization produces the half-integer Quantum Hall Effect at room temperature."
        ]
    },
    {
        "id": "qm_45",
        "domain": "Quantum Physics",
        "question": "What is the role of the Meissner-Ochsenfeld effect in distinguishing superconductors from perfect conductors?",
        "answer": "The Meissner effect describes the spontaneous and complete expulsion of magnetic flux lines from the interior of a superconductor as it transitions below its critical temperature Tc, proving superconductivity is a distinct thermodynamic equilibrium phase.",
        "supporting_facts": [
            "Superconductors exhibit zero electrical resistance below their critical temperature Tc.",
            "The Meissner-Ochsenfeld effect actively expels interior magnetic fields (B = 0) via screening surface supercurrents.",
            "This spontaneous flux expulsion distinguishes true superconductors from hypothetical zero-resistance perfect conductors."
        ]
    },
    {
        "id": "qm_46",
        "domain": "Quantum Physics",
        "question": "How does Continuous-Time Quantum Walk (CTQW) achieve quadratic speedup over classical random walks on graph structures?",
        "answer": "In CTQW, the probability amplitude evolves unitarily under the graph Hamiltonian H via e^{-iHt}, allowing constructive and destructive quantum interference across superposition states that enables ballistic propagation O(t) compared to diffusive classical scaling O(sqrt(t)).",
        "supporting_facts": [
            "CTQW state evolution is governed by the Schrodinger equation d/dt |psi> = -i H |psi>.",
            "Quantum superposition and interference prevent the walk from getting trapped in high-degree local hubs.",
            "Ballistic wavepacket propagation enables quadratic exploration speedup over classical Markovian diffusion."
        ]
    },
    {
        "id": "qm_47",
        "domain": "Quantum Physics",
        "question": "What are Majorana zero modes in topological superconductor nanowires and how do they enable fault-tolerant quantum computing?",
        "answer": "Majorana zero modes are non-Abelian quasiparticle excitations localized at the boundaries of 1D topological superconductors with strong spin-orbit coupling and Zeeman splitting, enabling topologically protected quantum braiding operations immune to local decoherence.",
        "supporting_facts": [
            "Majorana zero modes obey non-Abelian exchange statistics where braiding acts as unitary gate operations.",
            "They are localized at the endpoints of semiconductor nanowires with proximity-induced s-wave superconductivity.",
            "Topological protection stores quantum information non-locally, suppressing local environmental phase errors."
        ]
    },
    {
        "id": "qm_48",
        "domain": "Quantum Physics",
        "question": "How does the Josephson junction effect enable macroscopic quantum coherence in superconducting transmon qubits?",
        "answer": "A Josephson junction consists of two superconducting electrodes separated by an insulating barrier, providing a non-linear dissipationless inductance that renders the LC oscillator energy levels non-equidistant, allowing isolated two-level qubit control via microwave pulses.",
        "supporting_facts": [
            "Cooper pairs tunnel coherently across the thin insulating tunnel barrier via the Josephson effect.",
            "The non-linear cosine potential creates an anharmonic energy spectrum E_01 != E_12.",
            "Shunting with a large capacitor (transmon regime) exponentially suppresses charge noise while preserving quantum coherence."
        ]
    },
    {
        "id": "qm_49",
        "domain": "Quantum Physics",
        "question": "What is the physical mechanism of Cooper pair breaking and quasiparticle poisoning in superconducting quantum circuits?",
        "answer": "Photons or stray energetic phonons with energy exceeding the superconducting energy gap 2*Delta break Cooper pairs into non-equilibrium single-electron quasiparticles, which tunnel across Josephson junctions and cause quantum state decoherence and T1 relaxation.",
        "supporting_facts": [
            "Cooper pairs are bound by the superconducting pairing energy gap Delta.",
            "Absorption of stray radiation (E > 2*Delta) generates unpaired non-equilibrium quasiparticles.",
            "Quasiparticle tunneling dissipates energy, inducing qubit T1 phase relaxation and parity switching."
        ]
    },
    {
        "id": "qm_50",
        "domain": "Quantum Physics",
        "question": "How does the Trotter-Suzuki product formula approximate the matrix exponential of non-commuting Hamiltonian terms on NISQ quantum hardware?",
        "answer": "The first-order Trotter-Suzuki decomposition splits non-commuting Hamiltonian components H = sum_k H_k into small discrete time slices e^{-iHt} ~ (prod_k e^{-i H_k t/r})^r, bounding the simulation error to O(t^2/r) and converting multi-body interactions into executable 1-qubit and 2-qubit native quantum gates.",
        "supporting_facts": [
            "Non-commuting operator terms [H_A, H_B] != 0 cannot be exponentiated directly as a simple product.",
            "The Lie-Trotter-Suzuki product formula discretizes time evolution into r discrete Trotter steps.",
            "This enables native transpilation into parameter-tunable RZ, RX, and CNOT quantum gate sequences on NISQ processors."
        ]
    }
]
