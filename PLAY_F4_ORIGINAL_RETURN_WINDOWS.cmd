@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Browser Ink TPS - F4 Native Return Play (Local Research Only)
REM Local windowed F4 research. Requires the SAME SHA-pinned private
REM original-terrain JSON used by the existing Chrome F4 regression.
REM Drag the local JSON onto this CMD, or set T21_F4_LOCAL_TERRAIN first.
REM No original source asset, seed, log or user file is uploaded.
if not "%~2"=="" goto :USAGE
if not "%~1"=="" set "T21_F4_LOCAL_TERRAIN=%~f1"
if not defined T21_F4_LOCAL_TERRAIN goto :NO_SEED
if not exist "%T21_F4_LOCAL_TERRAIN%" goto :NO_SEED
pushd "%~dp0"
if errorlevel 1 goto :FAIL
if not exist "package.json" goto :FAIL_POP
if not exist "vite.config.ts" goto :FAIL_POP
where node.exe >nul 2>nul
if errorlevel 1 goto :NO_NODE
where npm.cmd >nul 2>nul
if errorlevel 1 goto :NO_NPM
node -e "const [m,n]=process.versions.node.split('.').map(Number);process.exit((m===20&&n>=19)||(m===22&&n>=12)||m>=24?0:1)"
if errorlevel 1 goto :BAD_NODE
REM Reuse Vite's pinned private-seed allowlist. Fail before starting a
REM browser if the supplied file is the wrong OBJ extraction/version.
node -e "try{const f=require('node:fs'),c=require('node:crypto'),p=process.env.T21_F4_LOCAL_TERRAIN,s=f.statSync(p);const hashes=new Set(['1be11fc133cabe79c65cf3ff21fd7b4a94ed6170665d930ecc1986e41c6d22bd','0dc7619966269fd7971684d3e41460bf589e6db084c12d7dc025379500a2cd51','f1abf5d891b6ba00320eef8f0e7bb8f0596450438023f2f9efeb30ace46268da','6cf07d15c26501a37dc2b1482e69ba0675c5c93d3bddee6a7c41a82e126046d5','6ec414cf162fe4a2b5aafeca6c1625e129dadc8bb18b47c55fddf68ff6cb6fa3']);process.exit(s.isFile()&&s.size<=49152&&hashes.has(c.createHash('sha256').update(f.readFileSync(p)).digest('hex'))?0:2)}catch{process.exit(2)}"
if errorlevel 1 goto :BAD_SEED
if not exist "node_modules\.bin\vite.cmd" goto :NO_DEPS
call npm.cmd ls --depth=0 --offline >nul 2>nul
if errorlevel 1 goto :NO_DEPS
REM This original F4 local research launcher explicitly opts into pinned
REM high-detail F3L visuals. Reuse the existing SHA256-checked restore.
REM First launch may download the 43MB original upstream OBJ and textures.
REM No private F4 terrain JSON, screenshots, or originals are uploaded.
echo Preparing verified original F3L optical pack for F4 research...
node scripts\t21-f3gl-restore.mjs
if errorlevel 1 goto :BAD_VISUAL_SOURCE
if not exist "public\t21-f3g-source\f3l-original-textured.json" goto :BAD_VISUAL_SOURCE
REM Open a NORMAL window, never headless. Vite's existing same-origin
REM loopback-only middleware serves the JSON; no preview/Pages deployment.
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
echo.
echo F4 native RETURN research - physical Windows browser trial
echo One LOCAL original-terrain seed, existing Rapier and Recast world.
echo SOURCE 25/17/26/0 is frozen. No official Turf scoring or winner.
echo Browser input must be REAL manual WASD and mouse.
echo This launcher does not certify either return route.
echo Only 127.0.0.1:4176; close this window to stop the server.
echo.
call npm.cmd run dev -- --host 127.0.0.1 --port 4176 --strictPort --open "/?t21Play=preview&t21QaDrive=source&t21W10B183=firstDropPlay&t21W10B192=humanCombat&t21W10B203=fullRound&t21W10B441=sourceFrontline&t21W10B448=realA3Front&t21F4Central=research&t21F4Terrain=original"
if errorlevel 1 goto :FAIL_POP
popd
exit /b 0

:USAGE
echo Drag ONE existing private F4 terrain JSON onto this file.
exit /b 2
:NO_SEED
echo.
echo F4 HOLD: private verified terrain JSON not selected.
echo Drag the existing local F4 terrain JSON onto this CMD.
echo Or set T21_F4_LOCAL_TERRAIN to its full local path first.
exit /b 3
:NO_NODE
echo Node.js is not installed.
goto :FAIL_POP
:NO_NPM
echo npm.cmd is missing.
goto :FAIL_POP
:BAD_NODE
echo Unsupported Node.js version for Vite 7.
goto :FAIL_POP
:BAD_SEED
echo F4 HOLD: local JSON failed the existing SHA-256/size allowlist.
echo Do not substitute or upload an unverified source file.
goto :FAIL_POP
:NO_DEPS
echo F4 HOLD: existing offline npm dependencies are unavailable.
echo No package installation or download was attempted.
goto :FAIL_POP
:BAD_VISUAL_SOURCE
echo F4 HOLD: pinned source UV pack missing or hash validation failed.
echo Existing game physics and private source files remain unchanged.
goto :FAIL_POP
:FAIL_POP
popd
:FAIL
echo.
echo F4 research launch failed. SOURCE, GitHub and private assets unchanged.
pause
exit /b 1
