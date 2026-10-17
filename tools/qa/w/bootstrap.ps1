# F4E103W: one-time Windows installation and persistent QA updater.
# Reads owner's GitHub branch. Does not modify original game or upload reports.
param(
  [switch]$Run,
  [ValidateSet('check','run','self-test')][string]$Mode='check'
)
$ErrorActionPreference='Stop'
$Base='https://raw.githubusercontent.com/ryomashibaba/browser-ink-tps/dev/t21-f4e103w-qa-infra/tools/qa/w'
$Root=Join-Path $env:LOCALAPPDATA 'InkTPS-QA'
$System=Join-Path $Root 'system'
$Runner=Join-Path $System 'qa-runner.mjs'
$HashFile=Join-Path $System 'runner-sha256.txt'
$Updater=Join-Path $Root 'update.ps1'
$Launcher=Join-Path $Root 'RUN_INKTPS_QA.cmd'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'HOLD_NODEJS_NOT_INSTALLED'
}
New-Item -ItemType Directory -Force -Path $System | Out-Null
if (-not $Run) {
  Copy-Item -LiteralPath $PSCommandPath -Destination $Updater -Force
  $commands=@'
@echo off
setlocal EnableExtensions
set "MODE=check"
if /I "%~1"=="run" set "MODE=run"
if /I "%~1"=="self-test" set "MODE=self-test"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update.ps1" -Run -Mode "%MODE%"
if errorlevel 1 echo HOLD: Check F4E103W_LAST_REPORT.json in this folder.
endlocal
'@
  $commands=$commands.Replace([string][char]10,([string][char]13)+([string][char]10))
  [System.IO.File]::WriteAllText($Launcher,$commands,[Text.ASCIIEncoding]::new())
}
$updated=$false
try {
  $Manifest=Invoke-RestMethod -Uri "$Base/manifest.json" -TimeoutSec 15
  if ($Manifest.schema -ne 't21-f4e103w-qa-launcher/v1') { throw 'HOLD_MANIFEST_SCHEMA' }
  if ($Manifest.version -ne 'F4E103W.1') { throw 'HOLD_UNAPPROVED_REMOTE_QA_VERSION' }
  $Expected=[string]$Manifest.files.'qa-runner.mjs'.sha256
  if ($Expected -notmatch '^[a-f0-9]{64}$') { throw 'HOLD_INVALID_REMOTE_HASH' }
  $Current=if(Test-Path -LiteralPath $Runner){(Get-FileHash -Algorithm SHA256 -LiteralPath $Runner).Hash.ToLowerInvariant()}else{''}
  if ($Current -ne $Expected) {
    $Tmp="$Runner.tmp.$PID"
    try {
      Invoke-WebRequest -UseBasicParsing -Uri "$Base/qa-runner.mjs" -TimeoutSec 25 -OutFile $Tmp
      $Actual=(Get-FileHash -Algorithm SHA256 -LiteralPath $Tmp).Hash.ToLowerInvariant()
      if($Actual -ne $Expected){throw 'HOLD_DOWNLOADED_CODE_HASH_MISMATCH'}
      Move-Item -LiteralPath $Tmp -Destination $Runner -Force
      $updated=$true
    } finally {
      if(Test-Path -LiteralPath $Tmp){Remove-Item -LiteralPath $Tmp -Force}
    }
  }
  [System.IO.File]::WriteAllText($HashFile,$Expected,[Text.ASCIIEncoding]::new())
} catch {
  if(-not (Test-Path -LiteralPath $Runner) -or -not (Test-Path -LiteralPath $HashFile)) {
    throw "HOLD_OFFLINE_WITHOUT_VERIFIED_CACHE: $_"
  }
  $Saved=[System.IO.File]::ReadAllText($HashFile).Trim().ToLowerInvariant()
  $Actual=(Get-FileHash -Algorithm SHA256 -LiteralPath $Runner).Hash.ToLowerInvariant()
  if($Saved -notmatch '^[a-f0-9]{64}$' -or $Actual -ne $Saved){
    throw 'HOLD_OFFLINE_CACHE_HASH_MISMATCH'
  }
  Write-Warning "No GitHub update; verified cached engine retained: $_"
}
Write-Output "Ink TPS W engine updated: $updated"
& node $Runner --mode $Mode --root $Root
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
if(-not $Run){
  Write-Output "Installed: $Launcher"
  Write-Output 'Next time: double-click RUN_INKTPS_QA.cmd'
  Write-Output 'Real Chrome measurement is separately opted-in via RUN_INKTPS_QA.cmd run'
}
