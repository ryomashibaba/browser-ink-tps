@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Browser Ink TPS - Verified F3L same-pose local comparison
set "T21_PUSHED=0"
pushd "%~dp0"
if errorlevel 1 goto :FAIL
set "T21_PUSHED=1"
REM Explicit local-only comparison. Never upload source OBJ, MTL or
REM textures. Screenshots and the witness JSON stay in Documents.
if not exist "public\t21-f3g-source\f3l-original-textured.json" goto :NO_PACK
if not exist "package.json" goto :FAIL
if not exist "scripts\t21-b440-short-native-original-foot.mjs" goto :FAIL
where node.exe >nul 2>nul
if errorlevel 1 goto :FAIL
where npm.cmd >nul 2>nul
if errorlevel 1 goto :FAIL
node -e "const [m,n]=process.versions.node.split('.').map(Number);process.exit((m===20&&n>=19)||(m===22&&n>=12)||m>=24?0:1)"
if errorlevel 1 goto :FAIL
REM The real CDP uses global WebSocket; old Node 20 builds may lack it.
node -e "process.exit(typeof WebSocket==='function'?0:1)"
if errorlevel 1 goto :NO_WEBSOCKET
if not defined T21_CHROME_PATH (
 if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "T21_CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
)
if not defined T21_CHROME_PATH (
 if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "T21_CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
)
if not defined T21_CHROME_PATH goto :NO_CHROME
if not exist "%T21_CHROME_PATH%" goto :NO_CHROME
if not exist "node_modules\.bin\vite.cmd" (
 call npm.cmd install --no-audit --no-fund --no-package-lock
 if errorlevel 1 goto :FAIL
)
echo.
echo SOURCE registered 25/17/26/0: compiling current LOCAL checkout.
echo F3L original UV pack MUST remain local; no asset export.
call npm.cmd run build -- --base=/browser-ink-tps/
if errorlevel 1 goto :FAIL
if not exist "dist\t21-f3g-source\f3l-original-textured.json" goto :NO_PACK
set "T21_B440_OUT=%USERPROFILE%\Documents\BrowserInkTPS_F3L_%RANDOM%_%RANDOM%"
if exist "%T21_B440_OUT%" goto :FAIL
set "T21_B441_SOURCE_FRONTLINE=0"
set "T21_P0_NORMAL_HUMAN=1"
set "T21_P1_TRUE_RAMP_WALK_ONCE=1"
set "T21_K3_ONE_REAL_180S=0"
set "T21_B490_LOCAL_F3L_COMPARE_ONCE=1"
echo.
echo One real Chrome 7-CPU registered landing/ramp walk, then pause
echo and capture verified UV versus registered-only at SAME native pose.
echo No artificial floor, instant actor relocation or 180-second replay.
echo Local output directory: %T21_B440_OUT%
node scripts\t21-b440-short-native-original-foot.mjs
if errorlevel 1 goto :FAIL
echo.
echo Two local PNG files and the real-physics JSON were captured.
echo Optical alignment is NOT approved until images are reviewed.
echo %T21_B440_OUT%
popd
pause
exit /b 0
:NO_PACK
echo HOLD: Original F3L pack absent. Nothing was downloaded.
echo Optional local optical pack preparation remains separately gated
echo behind PLAY_ORIGINAL_STAGE_WINDOWS.cmd, only if chosen by you.
goto :FAIL
:NO_CHROME
echo HOLD: Google Chrome was not found in usual Windows locations.
goto :FAIL
:NO_WEBSOCKET
echo HOLD: This Node.js lacks the global WebSocket required for Chrome CDP.
echo Use a supported Node.js with WebSocket, usually 22.12+ or 24+.
goto :FAIL
:FAIL
echo.
echo HOLD: No GitHub, original data or stage geometry was modified.
if "%T21_PUSHED%"=="1" popd
pause
exit /b 1
