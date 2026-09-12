@echo off
title Launch QRAG Full Stack
echo ====================================================
echo Launching Quantum GraphRAG Full Stack (Backend + Frontend)
echo ====================================================
start "" cmd /k "d:\Projects\QRAG\start_backend.bat"
timeout /t 3 /nobreak >nul
start "" cmd /k "d:\Projects\QRAG\start_frontend.bat"
echo Both Backend (http://localhost:8000) and Frontend (http://localhost:3000 / http://localhost:3001) have been launched in separate windows!
