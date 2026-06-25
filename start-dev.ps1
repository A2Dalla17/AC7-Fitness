# AC7 Elite — Windows dev starter (use this instead of WSL while in OneDrive)
# Right-click → Run with PowerShell   OR:  powershell -ExecutionPolicy Bypass -File start-dev.ps1

$ErrorActionPreference = "SilentlyContinue"
Set-Location $PSScriptRoot

Write-Host "`n=== AC7 Elite Dev Server ===" -ForegroundColor Cyan

# Kill anything listening on 3000 (stale WSL/Windows Next processes)
$pids = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $pids) {
  Write-Host "Stopping PID $procId on port 3000..."
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

Write-Host "Clearing dev cache..."
node scripts/clean-dev.mjs

Write-Host "`nStarting http://localhost:3000" -ForegroundColor Green
Write-Host "Keep this window open. Do NOT also run 'npm run dev' in WSL.`n" -ForegroundColor Yellow
npm run dev
