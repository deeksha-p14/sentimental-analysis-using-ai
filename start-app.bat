@echo off
title Sentiment Analysis App
echo Starting Sentiment Analysis Server...
cd /d "%~dp0"
start http://localhost:3001
npx tsx server/index.ts
pause
