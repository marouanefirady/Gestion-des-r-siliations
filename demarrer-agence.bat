@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Serveur agence - La Ville Verte

where node >nul 2>nul
if errorlevel 1 (
  echo Installez Node.js : https://nodejs.org/
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installation des fichiers...
  call npm install
)

if not exist dist\index.html (
  echo Preparation du site...
  call npm run build
)

echo.
echo Demarrage du serveur...
echo Ne fermez pas cette fenetre.
echo.
node server.js
pause
