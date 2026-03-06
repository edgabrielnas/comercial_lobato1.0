@echo off
echo.
echo  ============================================
echo   UroScore — Iniciando servidor de desenvolvimento
echo  ============================================
echo.
cd /d "%~dp0"
node node_modules\vite\bin\vite.js --port 5174 --open
