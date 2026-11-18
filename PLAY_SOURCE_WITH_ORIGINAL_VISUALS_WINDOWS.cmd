@echo off
setlocal EnableExtensions DisableDelayedExpansion
title Browser Ink TPS - SOURCE Play with Verified Original Visuals (Research)
REM Explicit opt-in: hashed source OBJ/UV textures are prepared locally.
REM This starts the genuine original-floor 180s SOURCE game, NOT the
REM separate static stage showroom. Original collision/nav/score remain
REM 25/17/26/0, no Pages or official battle results are changed.
set "T21_LOCAL_ORIGINAL_REVIEW=0"
set "T21_LOCAL_ORIGINAL_PLAY=1"
call "%~dp0PLAY_SOURCE_WINDOWS.cmd"
exit /b %errorlevel%
