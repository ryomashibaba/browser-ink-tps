@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Browser Ink TPS - Private Original Phive F4 Read-Only Check
REM Opt-in: drag a privately owned, verified version 7.2.0 Turf .bphsh
REM onto this CMD. PhiveConverter.exe + fxconfig.json must be alongside
REM the private .bphsh (or explicitly supply T21_PHIVE_CONVERTER_EXE).
REM No original game asset is copied to the repo, uploaded, deployed,
REM imported into gameplay, or accepted as collision without provenance.
if "%~1"=="" goto :USAGE
if /I not "%~x1"==".bphsh" goto :USAGE
set "F4_PHIVE_INPUT=%~f1"
set "F4_PRIVATE_OUTPUT=%~dp1%~n1.F4_PRIVATE_SOURCE_ONLY.json"
if not defined T21_PHIVE_CONVERTER_EXE set "T21_PHIVE_CONVERTER_EXE=%~dp1PhiveConverter.exe"
if not exist "%F4_PHIVE_INPUT%" goto :MISSING
if not exist "%T21_PHIVE_CONVERTER_EXE%" goto :NO_CONVERTER
if exist "%F4_PRIVATE_OUTPUT%" goto :OUTPUT_EXISTS
where node.exe >nul 2>nul
if errorlevel 1 goto :NO_NODE
pushd "%~dp0"
if errorlevel 1 goto :FAIL
node scripts\t21-f4-original-phive-local-once.mjs --phive-bphsh "%F4_PHIVE_INPUT%" --converter-exe "%T21_PHIVE_CONVERTER_EXE%" --output "%F4_PRIVATE_OUTPUT%"
set "F4_EXIT=%errorlevel%"
popd
if not "%F4_EXIT%"=="0" goto :FAIL
echo.
echo F4 original collision candidate audit saved privately:
echo "%F4_PRIVATE_OUTPUT%"
echo This is only a collision-candidate report; F4 crossings remain HOLD.
exit /b 0
:USAGE
echo Drag your locally owned version-verified Turf .bphsh onto this CMD.
echo Requires a separate local PhiveConverter.exe plus fxconfig.json.
exit /b 2
:MISSING
echo Private source collision file is unavailable.
exit /b 3
:NO_CONVERTER
echo Private standalone PhiveConverter.exe not found.
echo Place it alongside the source .bphsh or set T21_PHIVE_CONVERTER_EXE.
exit /b 4
:OUTPUT_EXISTS
echo Refusing to overwrite an existing private F4 report.
exit /b 5
:NO_NODE
echo Node.js is not installed.
exit /b 6
:FAIL
echo F4 source collision remains HOLD. No game state was changed.
exit /b 1
