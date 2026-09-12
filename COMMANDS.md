# 🚀 QRAG — Complete Commands & Execution Guide

This document lists all the commands needed to run, test, and manage the **Quantum GraphRAG (Q-GraphRAG)** project on Windows.

---

## ⚡ 1. Quick One-Click Startup (Recommended)

Simply double-click:
- **`start_all.bat`** (Launches both Backend and Frontend in separate windows automatically using your `qrag` conda environment)

Or run individually:
- **`start_backend.bat`** (Starts FastAPI on `http://localhost:8000`)
- **`start_frontend.bat`** (Starts Vite React on `http://localhost:5173`)

---

## 🖥️ 2. Manual Local Startup with Conda

### Terminal 1: Backend (FastAPI Server)
```powershell
# 1. Navigate to backend
cd d:\Projects\QRAG\backend

# 2. Activate your 'qrag' conda environment
conda activate qrag

# 3. Start the Backend Server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend API:** `http://localhost:8000`
- **Swagger API Documentation:** `http://localhost:8000/docs`

---

### Terminal 2: Frontend (React 18 + Vite)
```powershell
# 1. Navigate to frontend
cd d:\Projects\QRAG\frontend

# 2. Start Vite Development Server
npm run dev
```
- **Frontend App:** `http://localhost:5173` (Open this in your web browser)

---

### Terminal 3 (Optional): Celery Quantum Worker
```powershell
cd d:\Projects\QRAG\backend
conda activate qrag
python -m celery -A app.tasks.workers worker --loglevel=info --pool=solo
```

---

## 🐳 3. Docker Compose Startup (When Docker Desktop is Running)

```powershell
cd d:\Projects\QRAG
docker-compose up -d --build
docker-compose down
```

---

## 🧪 4. Benchmarks & Testing Commands

```powershell
cd d:\Projects\QRAG\backend
conda activate qrag

# 1. Run the 50-Item Multi-Domain Research Benchmark
python run_benchmarks.py

# 2. Run Biomedical / Clinical Oncology Benchmark
python run_biomedical_bench.py

# 3. Run Live 3-Way Comparative Ablation Test
python test_live_ablation.py

# 4. Generate Publication Figures (PNG 300 DPI)
python -m app.evaluation.generate_publication_figures

# 5. Generate Visual Proofs PDF Compendium
python generate_visual_proofs_pdf.py
```

---

## 📊 5. Presentation Deck Generation

```powershell
cd d:\Projects\QRAG\backend
conda activate qrag
python create_presentation.py
```
- Output presentation: **`d:\Projects\QRAG\Quantum_GraphRAG_Project_Presentation.pptx`**
