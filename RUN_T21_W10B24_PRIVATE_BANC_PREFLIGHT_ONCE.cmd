@echo off
setlocal EnableExtensions DisableDelayedExpansion
REM W10-B24 PRIVATE source metadata search. NEVER upload or edit the local game.
cd /d "%~dp0"
set "SOURCE=%USERPROFILE%\Downloads\T21_Undertow_F4E66_Real_Contact_AB_Gated_Handoff"
if defined T21_B24_BANC_DIR set "SOURCE=%T21_B24_BANC_DIR%"
if not "%~1"=="" set "SOURCE=%~1"
set "OUT=%USERPROFILE%\Downloads\T21_W10B24_PRIVATE_BANC_METADATA.json"
if defined T21_B24_BANC_OUT set "OUT=%T21_B24_BANC_OUT%"
if not exist "%~dp0scripts\t21-w10b24-private-banc-preflight.mjs" (
 echo BLOCKED: reviewed B24 preflight script missing from local QA checkout.
 goto :FAIL
)
if not exist "%SOURCE%\" (
 echo.
 echo BLOCKED: Candidate private source directory does not exist.
 echo Pass its decoded Banc folder as the first argument or set T21_B24_BANC_DIR.
 goto :FAIL
)
if exist "%OUT%" (
 echo BLOCKED: Refusing to overwrite an existing metadata report.
 goto :FAIL
)
where node >nul 2>&1
if errorlevel 1 (
 echo BLOCKED: Node.js must already be installed; nothing changed.
 goto :FAIL
)
echo.
echo [W10-B24] Scanning local Temple01-named decoded JSON/BYML candidates.
echo No source archive extraction, no network upload, no coordinates exported.
node "%~dp0scripts\t21-w10b24-private-banc-preflight.mjs" --source "%SOURCE%" --out "%OUT%"
if errorlevel 1 goto :FAIL
echo.
echo [W10-B24] PRIVATE METADATA REPORT:
echo %OUT%
echo Decoded schema validity is NOT original source authentication or stage authority.
echo Do not publish original game files or actor transforms to public GitHub.
if not defined T21_B24_NONINTERACTIVE pause
exit /b 0
:FAIL
echo.
echo W10-B24 preflight stopped safely. Game and GitHub were not modified.
if not defined T21_B24_NONINTERACTIVE pause
exit /b 1
