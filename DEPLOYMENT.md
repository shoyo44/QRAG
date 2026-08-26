# 🚀 Q-GraphRAG: Production Deployment Guide

This guide provides step-by-step instructions to deploy the complete **Q-GraphRAG** platform (FastAPI Quantum Backend + React/Vite Frontend + Qdrant Vector Engine + MongoDB Atlas + Firebase Auth) across various hosting environments.

---

## 🔑 1. Environment Variables Configuration

Ensure the following variables are configured in your production environment (`.env` or Cloud Provider Dashboard):

```env
# --- LLM & Embedding Inference ---
CF_ACCOUNT_ID=a270c3953e143f609842d1d27a92c898
CF_API_TOKEN=5JUBsKhOihXNV2ZupugXRt-FkOgNj6MWhg7mUjSe
NOMIC_API_KEY=nk-O8Adag2DrD6eJip9dfHXzSR-MSI-FnJq3WeZB9bTlzs

# --- Storage & Database ---
MONGODB_URI=mongodb+srv://dhanushdon113_db_user:Dhanush44@cluster0.bf8dnsu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=qrag_db
MONGODB_COLLECTION=chat_history

# --- Firebase Authentication (Frontend) ---
VITE_FIREBASE_API_KEY=AIzaSyDnz0JzlR9x_DLvf_Fl0RbetgF_vu_Z_hk
VITE_FIREBASE_AUTH_DOMAIN=docsai-50fff.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=docsai-50fff
VITE_FIREBASE_STORAGE_BUCKET=docsai-50fff.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=41054130344
VITE_FIREBASE_APP_ID=1:41054130344:web:acbff6426c4bd19415729d
```

---

## 🐳 2. Option A: Full Stack Docker Compose (Recommended)

Deploy everything on a single Linux/Cloud VPS (DigitalOcean, AWS EC2, GCP Compute Engine, Hetzner) using Docker:

### Step 1: Clone Repository & Create `.env`
```bash
git clone https://github.com/your-username/QRAG.git
cd QRAG
cp .env.example .env  # or populate with your credentials
```

### Step 2: Build & Start All Containers
```bash
docker-compose up -d --build
```

### Step 3: Access Services
* **Frontend Web Application**: `http://<your-server-ip>:3000`
* **FastAPI Backend Swagger Docs**: `http://<your-server-ip>:8000/docs`
* **Qdrant Vector Dashboard**: `http://<your-server-ip>:6333/dashboard`

---

## ☁️ 3. Option B: Cloud Split Deployment (Serverless / PaaS)

### A. Deploy Backend on Render / Railway / Fly.io
1. Connect your GitHub repository to **[Render](https://render.com/)** or **[Railway](https://railway.app/)**.
2. Set Root Directory to `backend`.
3. Set Build Command:
   ```bash
   pip install -r requirements.txt
   ```
4. Set Start Command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Add the backend environment variables (`CF_ACCOUNT_ID`, `CF_API_TOKEN`, `NOMIC_API_KEY`, `MONGODB_URI`).

---

### B. Deploy Frontend on Vercel / Cloudflare Pages / Firebase Hosting
1. Connect the `frontend` folder to **[Vercel](https://vercel.com/)** or **[Cloudflare Pages](https://pages.cloudflare.com/)**.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Add the `VITE_FIREBASE_*` environment variables in the dashboard.
6. Set the API proxy rewrite in `vercel.json` (if needed):
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://your-backend-url.onrender.com/api/$1" },
       { "source": "/health", "destination": "https://your-backend-url.onrender.com/health" }
     ]
   }
   ```

---

## 🔥 4. Firebase Authentication Setup

Your Firebase project (`docsai-50fff`) is already pre-configured. To ensure all login methods work in production:

1. Navigate to **[Firebase Console](https://console.firebase.google.com/)** $\rightarrow$ **Authentication** $\rightarrow$ **Sign-in method**.
2. Enable:
   * ✅ **Email/Password**
   * ✅ **Google** (Add your production domain to Authorized Domains)
   * ✅ **Anonymous / Guest** (For demo researcher access)
3. Under **Authorized Domains**, add your deployed production URL (e.g. `qrag.vercel.app` or `yourdomain.com`).

---

## 🧪 5. Post-Deployment Verification Checklist

1. **Health Check**: Visit `https://your-backend/health` $\rightarrow$ should return `{"status": "online"}`.
2. **Firebase Login**: Open frontend, click **Sign In**, and test:
   * Google Sign In popup
   * Email/Password Sign Up
   * Instant Demo / Guest access
3. **Run 3-Way Ablation**: Navigate to **Research Benchmarks** $\rightarrow$ select a biomedical preset $\rightarrow$ verify all 3 engines output answers and RAGAS scores.
4. **3D Knowledge Graph**: Navigate to **Knowledge Graph** $\rightarrow$ verify 3D WebGL graph rendering and camera rotation.
