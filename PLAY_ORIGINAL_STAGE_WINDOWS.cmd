@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Browser Ink TPS - Verified Original Stage Review (Research)
REM Explicit opt-in: original source stays locally generated only.
REM Display review, NOT a certification of original collision, score or 4v4.
set "T21_LOCAL_ORIGINAL_REVIEW=1"
call "%~dp0PLAY_SOURCE_WINDOWS.cmd"
exit /b %errorlevel%
