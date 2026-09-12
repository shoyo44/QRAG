@echo off
title QRAG - FastAPI Backend Server
echo ====================================================
echo Starting Quantum GraphRAG (Q-GraphRAG) Backend
echo Activating conda environment 'qrag'...
echo URL: http://localhost:8000
echo Swagger Docs: http://localhost:8000/docs
echo ====================================================

cd /d "d:\Projects\QRAG\backend"

:: Try activating conda environment 'qrag'
call D:\anaconda3\Scripts\activate.bat qrag 2>nul
if errorlevel 1 (
    call conda activate qrag 2>nul
)

:: If python is in D:\conda\envs\qrag\python.exe
if exist "D:\conda\envs\qrag\python.exe" (
    "D:\conda\envs\qrag\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
)

pause
