@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Browser Ink TPS - Source Play (Research)
set "T21_PUSHED=0"
pushd "%~dp0"
if errorlevel 1 goto :FAIL
set "T21_PUSHED=1"

REM This is SOURCE research play only. Never deploy Pages or mutate T20.
REM Uses this checkout, the existing 3-mode portal, and loopback only.
if not exist "package.json" goto :FAIL
if not exist "vite.config.ts" goto :FAIL
if not exist "play-source.html" goto :FAIL
if not exist "src\source-play-main.ts" goto :FAIL

where node.exe >nul 2>nul
if errorlevel 1 goto :NO_NODE
where npm.cmd >nul 2>nul
if errorlevel 1 goto :NO_NPM
REM Vite 7 requires supported Node 20.19+, 22.12+, or 24+.
node -e "const [m,n]=process.versions.node.split('.').map(Number);process.exit((m===20&&n>=19)||(m===22&&n>=12)||m>=24?0:1)"
if errorlevel 1 goto :NODE_VERSION

echo.
echo [1/3] SOURCE research dependencies
if not exist "node_modules\.bin\vite.cmd" (
  echo First launch: installing the repository's existing npm dependencies.
  call npm.cmd install --no-audit --no-fund --no-package-lock
  if errorlevel 1 goto :FAIL
) else (
  echo Existing local dependencies found.
)

echo.
echo [2/3] Building genuine SOURCE gameplay and 3-mode portal
call npm.cmd run build -- --base=/browser-ink-tps/
if errorlevel 1 goto :FAIL
if not exist "dist\index.html" goto :FAIL
if not exist "dist\play-source.html" goto :FAIL

echo.
echo [3/3] Opening 127.0.0.1 SOURCE PLAY
echo Research only: 25 original solids, 17 paint surfaces, 26 nav links.
echo Official scoreable=0, winner=NONE; cross-team route NOT certified.
echo No GitHub push, no Pages deploy, no paid API, no actor teleport.
echo Browser will open automatically. Close this window to stop server.
echo.
call npm.cmd run preview -- --host 127.0.0.1 --port 4173 --strictPort --base=/browser-ink-tps/ --open=/browser-ink-tps/play-source.html
if errorlevel 1 goto :FAIL
popd
exit /b 0

:NO_NODE
echo.
echo BLOCKED: Node.js is not installed or not on PATH.
goto :FAIL
:NO_NPM
echo.
echo BLOCKED: npm.cmd is missing from PATH.
goto :FAIL
:NODE_VERSION
echo.
echo BLOCKED: Vite 7 needs Node.js 20.19+, 22.12+, or 24+.
goto :FAIL
:FAIL
echo.
echo SOURCE PLAY NOT STARTED. The original game and GitHub are unchanged.
echo If port 4173 is in use, close the other local preview first.
echo No network service was made public.
if "%T21_PUSHED%"=="1" popd
pause
exit /b 1
