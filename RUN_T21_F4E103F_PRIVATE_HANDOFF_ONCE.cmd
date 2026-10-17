@echo off
setlocal EnableExtensions DisableDelayedExpansion
REM T21/F4E103F one-time PRIVATE source review. Never uploads, updates the game or installs code.
REM Run only from the pinned GitHub Actions handoff artifact you explicitly downloaded.
set "SOURCE=%USERPROFILE%\Downloads\T21_Undertow_F4E66_Real_Contact_AB_Gated_Handoff"
if defined T21_HANDOFF_SOURCE set "SOURCE=%T21_HANDOFF_SOURCE%"
if not "%~1"=="" set "SOURCE=%~1"
set "OUT=%USERPROFILE%\Downloads\T21_F4E103F_PRIVATE_SOURCE_REVIEW.zip"
if defined T21_HANDOFF_OUT set "OUT=%T21_HANDOFF_OUT%"
set "BASELINE=%~dp0"
if exist "%~dp0t21-f4e103-baseline.json" set "BASELINE=%~dp0t21-f4e103-baseline.json"
if not exist "%~dp0scripts\t21-f4e103-local-bundle.mjs" (
 echo BLOCKED: Handoff kit is incomplete.
 goto :FAIL
)
if not exist "%SOURCE%\RUN_F4E103F.cmd" (
 echo BLOCKED: No F4E103F launcher found in the selected local game folder.
 goto :FAIL
)
if not exist "%SOURCE%\RESTORE_F4E103E_FROM_F4E103F.cmd" (
 echo BLOCKED: No F4E103E restoration launcher was found.
 goto :FAIL
)
where node >nul 2>nul
if errorlevel 1 (
 echo BLOCKED: Node.js must be already installed.
 goto :FAIL
)
if exist "%OUT%" (
 echo BLOCKED: Existing review ZIP will not be overwritten: %OUT%
 goto :FAIL
)
echo.
echo Preparing PRIVATE offline source review ZIP. No automatic upload.
node "%~dp0scripts\t21-f4e103-local-bundle.mjs" --source "%SOURCE%" --baseline "%BASELINE%" --out "%OUT%"
if errorlevel 1 goto :FAIL
echo.
echo PRIVATE_REVIEW_ZIP_CREATED:
echo %OUT%
echo Review candidate sources and rights before sharing. The original game remains unchanged.
if not defined T21_HANDOFF_NONINTERACTIVE pause
exit /b 0
:FAIL
echo.
echo BLOCKED: No automatic upload, game update, or remote execution occurred.
if not defined T21_HANDOFF_NONINTERACTIVE pause
exit /b 1
