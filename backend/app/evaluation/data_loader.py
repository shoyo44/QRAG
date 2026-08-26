import os
import json
import logging
from typing import List, Dict, Any, Optional
from urllib.request import urlopen

logger = logging.getLogger(__name__)

# Base interface for benchmark datasets
class BenchmarkDataset:
    """Common interface for loading QA and context data.
    Subclasses must implement ``load_questions`` and ``load_contexts``.
    """
    def load_questions(self) -> List[Dict[str, Any]]:
        """Return a list of dicts with ``question``, ``gold_answers``, and optional ``supporting_facts``."""
        raise NotImplementedError

    def load_contexts(self) -> List[Dict[str, Any]]:
        """Return a list of documents/triplets to be indexed."""
        raise NotImplementedError

# Helper to download a file if a URL is provided in env variables
def _download_if_needed(url: str, cache_path: str) -> str:
    if os.path.exists(cache_path):
        logger.info(f"Dataset cache found at {cache_path}")
        return cache_path
    logger.info(f"Downloading dataset from {url} ...")
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    with urlopen(url) as resp, open(cache_path, "wb") as out:
        out.write(resp.read())
    logger.info(f"Saved dataset to {cache_path}")
    return cache_path


# --------------------- PubMedQA ---------------------
PUBMEDQA_CURATED = [
    {
        "pmid": "31048712",
        "question": "Does Trastuzumab emtansine (T-DM1) significantly improve overall survival in HER2-positive metastatic breast cancer resistant to standard trastuzumab therapy?",
        "answer": "Yes, Trastuzumab emtansine (T-DM1) conjugates the HER2-targeting antibody with the microtubule-inhibitory agent DM1, delivering targeted cytotoxic therapy that significantly improves overall survival and progression-free survival in HER2-positive breast cancer resistant to trastuzumab alone.",
        "supporting_facts": [
            "Trastuzumab emtansine binds selectively to the extracellular domain of HER2/ERBB2 receptors.",
            "DM1 inhibits microtubule assembly leading to mitotic arrest and apoptosis in tumor cells.",
            "T-DM1 improves overall survival in trastuzumab-refractory HER2-amplified malignancies."
        ],
        "context": (
            "Trastuzumab emtansine (T-DM1) is an antibody-drug conjugate combining the HER2-targeted antitumor properties "
            "of trastuzumab with the cytotoxic activity of the microtubule inhibitor DM1. In phase III clinical trials of "
            "HER2-positive metastatic breast cancer previously treated with trastuzumab and a taxane, T-DM1 demonstrated "
            "statistically significant prolongation of progression-free survival and overall survival compared to standard lapatinib plus capecitabine."
        ),
        "triplets": [
            {"subject": "Trastuzumab Emtansine", "predicate": "binds_to", "object": "HER2 Receptor"},
            {"subject": "HER2 Receptor", "predicate": "amplified_in", "object": "Metastatic Breast Cancer"},
            {"subject": "DM1 Cytotoxin", "predicate": "inhibits", "object": "Microtubule Polymerization"},
            {"subject": "Microtubule Polymerization", "predicate": "induces", "object": "Mitotic Apoptosis"},
            {"subject": "Trastuzumab Emtansine", "predicate": "improves", "object": "Progression Free Survival"}
        ]
    },
    {
        "pmid": "32895514",
        "question": "How does SGLT2 inhibition with Dapagliflozin attenuate renal progression in chronic kidney disease patients with and without Type 2 Diabetes?",
        "answer": "Dapagliflozin reduces intraglomerular pressure by restoring tubuloglomerular feedback through increased sodium delivery to the macula densa, thereby reducing proteinuria, hyperfiltration, and the risk of sustained decline in estimated GFR independent of glycemic status.",
        "supporting_facts": [
            "Dapagliflozin selectively inhibits sodium-glucose cotransporter-2 (SGLT2) in the proximal renal tubule.",
            "SGLT2 inhibition increases distal sodium delivery to the macula densa, restoring tubuloglomerular feedback.",
            "Tubuloglomerular feedback activation induces afferent arteriolar vasoconstriction and reduces intraglomerular hypertension."
        ],
        "context": (
            "Sodium-glucose cotransporter-2 (SGLT2) inhibitors including dapagliflozin reduce proximal tubular glucose and sodium reabsorption. "
            "The resulting increase in sodium delivery to the macula densa triggers tubuloglomerular feedback and afferent arteriolar constriction, "
            "reducing intraglomerular hyperfiltration and long-term renal parenchymal injury across both diabetic and non-diabetic chronic kidney disease populations."
        ),
        "triplets": [
            {"subject": "Dapagliflozin", "predicate": "inhibits", "object": "SGLT2 Transporter"},
            {"subject": "SGLT2 Transporter", "predicate": "located_in", "object": "Proximal Renal Tubule"},
            {"subject": "SGLT2 Inhibition", "predicate": "enhances", "object": "Tubuloglomerular Feedback"},
            {"subject": "Tubuloglomerular Feedback", "predicate": "reduces", "object": "Intraglomerular Pressure"},
            {"subject": "Intraglomerular Pressure Reduction", "predicate": "protects", "object": "Chronic Kidney Disease Patients"}
        ]
    },
    {
        "pmid": "34185672",
        "question": "What is the molecular mechanism of CRISPR-Cas9 ribonucleoprotein delivery in correcting the HBB gene mutation in sickle cell disease?",
        "answer": "CRISPR-Cas9 targeted endonuclease introduces precise double-strand breaks at the BCL11A erythroid enhancer region, downregulating BCL11A repressor expression and inducing therapeutic fetal hemoglobin (HbF) synthesis to prevent erythrocyte sickling.",
        "supporting_facts": [
            "Cas9 endonuclease guides target cleavage at the GATA1 binding motif of the BCL11A erythroid-specific enhancer.",
            "Disruption of the BCL11A enhancer relieves transcriptional repression of gamma-globin genes (HBG1/HBG2).",
            "Elevated fetal hemoglobin (HbF) tetramers prevent polymerization of deoxygenated sickle hemoglobin (HbS)."
        ],
        "context": (
            "Ex-vivo gene editing using CRISPR-Cas9 ribonucleoproteins targets the erythroid enhancer of BCL11A in autologous CD34+ hematopoietic stem and progenitor cells. "
            "Enhancer disruption downregulates BCL11A expression specifically in the erythroid lineage, reactivating gamma-globin expression and inducing high levels of fetal hemoglobin (HbF), "
            "which effectively suppresses HbS polymerization and vaso-occlusive crises."
        ),
        "triplets": [
            {"subject": "CRISPR-Cas9 RNP", "predicate": "cleaves", "object": "BCL11A Erythroid Enhancer"},
            {"subject": "BCL11A Enhancer Disruption", "predicate": "suppresses", "object": "BCL11A Repressor Protein"},
            {"subject": "BCL11A Repressor Suppression", "predicate": "reactivates", "object": "Gamma Globin Expression"},
            {"subject": "Gamma Globin Expression", "predicate": "produces", "object": "Fetal Hemoglobin HbF"},
            {"subject": "Fetal Hemoglobin HbF", "predicate": "prevents", "object": "Sickle Hemoglobin Polymerization"}
        ]
    }
]

class PubMedQADataset(BenchmarkDataset):
    def __init__(self, url: str = os.getenv("PUBMEDQA_URL", "")):
        self.url = url
        self.cache_path = os.path.join('.cache', 'pubmedqa.jsonl')
        if self.url:
            _download_if_needed(self.url, self.cache_path)

    def load_questions(self) -> List[Dict[str, Any]]:
        qs = []
        if os.path.exists(self.cache_path):
            with open(self.cache_path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        qs.append({
                            "question": entry.get("question", ""),
                            "gold_answers": [entry.get("answer", "")],
                            "supporting_facts": entry.get("supporting_facts", [])
                        })
                    except json.JSONDecodeError:
                        continue
        if not qs:
            for item in PUBMEDQA_CURATED:
                qs.append({
                    "question": item["question"],
                    "gold_answers": [item["answer"]],
                    "supporting_facts": item["supporting_facts"]
                })
        return qs

    def load_contexts(self) -> List[Dict[str, Any]]:
        ctx = []
        if os.path.exists(self.cache_path):
            with open(self.cache_path, "r", encoding="utf-8") as f:
                for idx, line in enumerate(f):
                    try:
                        entry = json.loads(line)
                        text = entry.get("context", "")
                        if text:
                            ctx.append({"doc_id": f"pubmed_{idx}", "text": text})
                    except json.JSONDecodeError:
                        continue
        if not ctx:
            for idx, item in enumerate(PUBMEDQA_CURATED):
                ctx.append({
                    "doc_id": f"pubmed_curated_{idx}",
                    "text": item["context"],
                    "triplets": item["triplets"]
                })
        return ctx


# --------------------- PrimeKG (Precision Medicine Knowledge Graph) ---------------------
PRIMEKG_CURATED = [
    {
        "id": "primekg_1",
        "question": "Through what multi-hop biological pathway does Imatinib induce remission in BCR-ABL positive Chronic Myeloid Leukemia?",
        "answer": "Imatinib acts as a selective competitive inhibitor of the ATP-binding pocket of the constitutively active BCR-ABL fusion tyrosine kinase, blocking downstream STAT5 and PI3K/Akt signaling cascades and halting leukemic cell proliferation.",
        "supporting_facts": [
            "The t(9;22) Philadelphia chromosome creates the oncogenic BCR-ABL1 fusion gene.",
            "BCR-ABL1 encodes a constitutively active tyrosine kinase that phosphorylates STAT5 and CrkL.",
            "Imatinib mesylate binds to the kinase active site in its inactive conformation, inhibiting downstream leukemogenesis."
        ],
        "context": (
            "Chronic Myeloid Leukemia (CML) is driven by the t(9;22)(q34;q11) chromosomal translocation resulting in the BCR-ABL1 fusion gene. "
            "The resulting chimeric protein possesses constitutively elevated tyrosine kinase activity that dysregulates downstream Ras-MAPK, "
            "PI3K-Akt, and JAK-STAT pathways, conferring survival advantages and apoptosis resistance to myeloid progenitors. "
            "Imatinib selectively binds the ATP-binding domain, competitively inhibiting phosphate transfer and inducing molecular remission."
        ),
        "triplets": [
            {"subject": "Philadelphia Chromosome t(9;22)", "predicate": "generates", "object": "BCR-ABL1 Fusion Gene"},
            {"subject": "BCR-ABL1 Fusion Gene", "predicate": "encodes", "object": "Constitutive Tyrosine Kinase"},
            {"subject": "Constitutive Tyrosine Kinase", "predicate": "activates", "object": "JAK-STAT and PI3K Signaling"},
            {"subject": "Imatinib", "predicate": "competitively_inhibits", "object": "Constitutive Tyrosine Kinase"},
            {"subject": "Tyrosine Kinase Inhibition", "predicate": "induces_remission_in", "object": "Chronic Myeloid Leukemia"}
        ]
    },
    {
        "id": "primekg_2",
        "question": "What multi-hop mechanism connects Metformin administration to the suppression of Hepatic Gluconeogenesis and improvement in Type 2 Diabetes?",
        "answer": "Metformin inhibits mitochondrial Complex I, elevating the cellular AMP/ATP ratio, which allosterically activates AMP-activated protein kinase (AMPK) and inhibits adenylate cyclase, resulting in the downregulation of gluconeogenic enzymes PEPCK and G6Pase.",
        "supporting_facts": [
            "Metformin inhibits respiratory Complex I in hepatic mitochondria.",
            "Complex I inhibition increases the intracellular AMP-to-ATP ratio.",
            "Elevated AMP activates AMPK and inhibits fructose-1,6-bisphosphatase to suppress hepatic glucose production."
        ],
        "context": (
            "Metformin is a biguanide that primary targets hepatic gluconeogenesis. By mildly inhibiting complex I of the mitochondrial respiratory chain, "
            "metformin causes a decrease in cellular ATP and an increase in AMP and ADP levels. The activation of AMP-activated protein kinase (AMPK) phosphorylates "
            "transcriptional co-activators including CRTC2 and CBP, suppressing the transcription of key gluconeogenic genes phosphoenolpyruvate carboxykinase (PEPCK) and glucose-6-phosphatase (G6Pase)."
        ),
        "triplets": [
            {"subject": "Metformin", "predicate": "inhibits", "object": "Mitochondrial Complex I"},
            {"subject": "Mitochondrial Complex I Inhibition", "predicate": "increases", "object": "Cellular AMP to ATP Ratio"},
            {"subject": "Elevated AMP to ATP Ratio", "predicate": "activates", "object": "AMPK Enzyme"},
            {"subject": "AMPK Activation", "predicate": "suppresses", "object": "Gluconeogenic Enzymes PEPCK and G6Pase"},
            {"subject": "Gluconeogenic Enzyme Suppression", "predicate": "reduces", "object": "Hepatic Glucose Production in Diabetes"}
        ]
    }
]

class PrimeKGDataset(BenchmarkDataset):
    def __init__(self, url: str = os.getenv("PRIMEKG_URL", "")):
        self.url = url
        self.cache_path = os.path.join('.cache', 'primekg.tsv')
        if self.url:
            _download_if_needed(self.url, self.cache_path)

    def load_questions(self) -> List[Dict[str, Any]]:
        qs = []
        if os.path.exists(self.cache_path):
            with open(self.cache_path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        head, relation, tail = line.strip().split("\t")
                        qs.append({
                            "question": f"What is the multi-hop relation between {head} and {tail} via {relation}?",
                            "gold_answers": [f"{head} relates to {tail} by {relation}."],
                            "supporting_facts": [f"{head} {relation} {tail}"]
                        })
                    except ValueError:
                        continue
        if not qs:
            for item in PRIMEKG_CURATED:
                qs.append({
                    "question": item["question"],
                    "gold_answers": [item["answer"]],
                    "supporting_facts": item["supporting_facts"]
                })
        return qs

    def load_contexts(self) -> List[Dict[str, Any]]:
        ctx = []
        if os.path.exists(self.cache_path):
            with open(self.cache_path, "r", encoding="utf-8") as f:
                for idx, line in enumerate(f):
                    try:
                        head, relation, tail = line.strip().split("\t")
                        text = f"{head} {relation} {tail}"
                        ctx.append({
                            "doc_id": f"primekg_{idx}",
                            "text": text,
                            "triplets": [{"subject": head, "predicate": relation, "object": tail}]
                        })
                    except ValueError:
                        continue
        if not ctx:
            for idx, item in enumerate(PRIMEKG_CURATED):
                ctx.append({
                    "doc_id": f"primekg_curated_{idx}",
                    "text": item["context"],
                    "triplets": item["triplets"]
                })
        return ctx


# --------------------- ChEMBL Dataset ---------------------
CHEMBL_CURATED = [
    {
        "id": "chembl_1",
        "question": "What is the pharmacological bioactivity and molecular target profile of Osimertinib in EGFR-mutant Non-Small Cell Lung Cancer?",
        "answer": "Osimertinib is a third-generation irreversible EGFR tyrosine kinase inhibitor that covalently binds the C797 residue in the ATP pocket, selectively targeting both EGFR-sensitizing mutations (L858R, exon 19 del) and the T790M resistance mutation while sparing wild-type EGFR.",
        "supporting_facts": [
            "Osimertinib selectively binds the C797 residue in the EGFR kinase domain.",
            "It overcomes the secondary T790M gatekeeper resistance mutation.",
            "Selective inhibition of mutant EGFR blocks downstream ERK and Akt phosphorylation."
        ],
        "context": (
            "Osimertinib (AZD9291) is a mono-anilino-pyrimidine small molecule developed to overcome EGFR T790M-mediated resistance in NSCLC. "
            "By forming an irreversible covalent bond with the conserved cysteine-797 (C797) residue at the edge of the ATP-binding cleft, "
            "it demonstrates potent inhibitory activity against EGFR-T790M/L858R double mutants with minimal cross-reactivity against wild-type EGFR kinase."
        ),
        "triplets": [
            {"subject": "Osimertinib", "predicate": "covalently_binds", "object": "EGFR C797 Residue"},
            {"subject": "EGFR C797 Residue", "predicate": "located_in", "object": "ATP Binding Cleft"},
            {"subject": "Osimertinib", "predicate": "overcomes", "object": "EGFR T790M Gatekeeper Mutation"},
            {"subject": "EGFR T790M Mutation", "predicate": "drives_resistance_in", "object": "Non Small Cell Lung Cancer"},
            {"subject": "Osimertinib Therapy", "predicate": "suppresses", "object": "Lung Cancer Cell Proliferation"}
        ]
    }
]

class ChemBLDataset(BenchmarkDataset):
    def __init__(self, url: str = os.getenv("CHEMBL_URL", "")):
        self.url = url
        self.cache_path = os.path.join('.cache', 'chembl.tsv')
        if self.url:
            _download_if_needed(self.url, self.cache_path)

    def load_questions(self) -> List[Dict[str, Any]]:
        qs = []
        if os.path.exists(self.cache_path):
            with open(self.cache_path, "r", encoding="utf-8") as f:
                header = f.readline().strip().split("\t")
                for line in f:
                    parts = line.strip().split("\t")
                    row = dict(zip(header, parts))
                    target = row.get("target_chembl_id", "")
                    organism = row.get("organism", "")
                    desc = row.get("description", "")
                    if target and organism:
                        qs.append({
                            "question": f"What is the bioactivity of {target} in {organism}?",
                            "gold_answers": [desc or f"{target} bioactivity in {organism}"],
                            "supporting_facts": [f"{target} interacts with {organism}"]
                        })
        if not qs:
            for item in CHEMBL_CURATED:
                qs.append({
                    "question": item["question"],
                    "gold_answers": [item["answer"]],
                    "supporting_facts": item["supporting_facts"]
                })
        return qs

    def load_contexts(self) -> List[Dict[str, Any]]:
        ctx = []
        if os.path.exists(self.cache_path):
            with open(self.cache_path, "r", encoding="utf-8") as f:
                header = f.readline().strip().split("\t")
                for idx, line in enumerate(f):
                    parts = line.strip().split("\t")
                    row = dict(zip(header, parts))
                    text = row.get("description", "")
                    if text:
                        ctx.append({"doc_id": f"chembl_{idx}", "text": text})
        if not ctx:
            for idx, item in enumerate(CHEMBL_CURATED):
                ctx.append({
                    "doc_id": f"chembl_curated_{idx}",
                    "text": item["context"],
                    "triplets": item["triplets"]
                })
        return ctx


# Helper to select dataset implementation based on flag
def get_dataset(name: str = "pubmedqa"):
    mapping = {
        "pubmedqa": PubMedQADataset,
        "chembl": ChemBLDataset,
        "primekg": PrimeKGDataset,
        "biomedical": PubMedQADataset,
    }
    cls = mapping.get(name.lower()) if name else PubMedQADataset
    return cls() if cls else PubMedQADataset()


def load_benchmark_dataset(name: str = "pubmedqa") -> List[Dict[str, Any]]:
    ds = get_dataset(name)
    if ds:
        questions = ds.load_questions()
        if questions:
            return [
                {
                    "id": f"{name}_{idx}",
                    "question": q["question"],
                    "answer": q.get("gold_answers", [""])[0] if q.get("gold_answers") else "",
                    "supporting_facts": q.get("supporting_facts", [])
                }
                for idx, q in enumerate(questions)
            ]
    return [
        {
            "id": f"pubmed_{i}",
            "question": item["question"],
            "answer": item["answer"],
            "supporting_facts": item["supporting_facts"]
        }
        for i, item in enumerate(PUBMEDQA_CURATED)
    ]
