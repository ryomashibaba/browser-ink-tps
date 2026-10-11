@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo.
  echo [T21 Visual Review] npm was not found.
  echo Install Node.js, then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [T21 Visual Review] Installing dependencies...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo [T21 Visual Review] npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo [T21 Visual Review] Starting review-only viewer...
echo Production T20 is not replaced. Close this window to stop the local server.
echo.

call npm run dev -- --open "/?stageReview=undertow"
