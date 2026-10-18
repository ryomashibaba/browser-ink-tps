@echo off
setlocal EnableExtensions DisableDelayedExpansion
REM T21/W10-B22 LOCAL ONLY. No GitHub push, user files upload, stage modification, or production deployment.
cd /d "%~dp0"
if not exist "src\app\UndertowF3OwnerGpuTrial.ts" (
 echo BLOCKED: W10-B22 source-only QA branch is required.
 goto :FAIL
)
where node >nul 2>&1
if errorlevel 1 (
 echo BLOCKED: Node.js not found. Install Node.js LTS and retry.
 goto :FAIL
)
where npm >nul 2>&1
if errorlevel 1 (
 echo BLOCKED: npm not found.
 goto :FAIL
)
if not exist "node_modules\vite\bin\vite.js" (
 echo [W10-B22] Installing PUBLIC npm dependencies locally, one time...
 call npm install --no-audit --no-fund --no-package-lock
 if errorlevel 1 goto :FAIL
)
echo.
echo [W10-B22] Launching source-only Undertow F3 preview on local port 5173.
echo [W10-B22] Real GPU comparison is OPT-IN. Click START LIVE GPU TRIAL,
echo then click the game view, play for 36 seconds and save the JSON.
echo This test is NOT an original 4v4 scored match.
echo Close this window to stop the local dev server.
echo.
call npm run dev -- --host 127.0.0.1 --port 5173 --strictPort --open "/?t21Play=preview"
if errorlevel 1 goto :FAIL
exit /b 0
:FAIL
echo.
echo W10-B22 local launch not completed. No original source modification was performed.
pause
exit /b 1
