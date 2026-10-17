@echo off
setlocal EnableExtensions DisableDelayedExpansion
REM Read-only F4E103F source handoff. NO upload, NO game changes, NO GitHub push.
REM Use this file only from an explicitly reviewed dev/t21-f4e103 checkout.
set "SOURCE=%USERPROFILE%\Downloads\T21_Undertow_F4E66_Real_Contact_AB_Gated_Handoff"
if not "%~1"=="" set "SOURCE=%~1"
set "BASELINE=%~dp0"
set "OUT=%USERPROFILE%\Downloads\T21_F4E103F_PRIVATE_SOURCE_REVIEW.zip"
if not exist "%SOURCE%\RUN_F4E103F.cmd" (
 echo BLOCKED: F4E103F launcher was not found in the expected game folder.
 echo You can supply the correct folder as the first argument.
 goto :FAIL
)
if not exist "%SOURCE%\RESTORE_F4E103E_FROM_F4E103F.cmd" (
 echo BLOCKED: F4E103E restoration launcher was not found.
 goto :FAIL
)
where node >nul 2>nul
if errorlevel 1 (
 echo BLOCKED: Node.js must be installed. No installation is performed.
 goto :FAIL
)
if exist "%OUT%" (
 echo BLOCKED: Existing ZIP will not be overwritten: %OUT%
 goto :FAIL
)
echo.
echo Creating local private source candidate ZIP...
echo Source: %SOURCE%
echo No original assets or code are automatically uploaded.
echo.
node "%BASELINE%scripts\t21-f4e103-local-bundle.mjs" --source "%SOURCE%" --baseline "%BASELINE%" --out "%OUT%"
if errorlevel 1 goto :FAIL
echo.
echo PRIVATE_REVIEW_ZIP_CREATED:
echo %OUT%
echo This is NOT approved for public sharing. Inspect it before uploading anywhere.
echo The running game and its restore point were not modified.
pause
exit /b 0
:FAIL
echo.
echo No automatic upload, remote execution, or game update occurred.
pause
exit /b 1
