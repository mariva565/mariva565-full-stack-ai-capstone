param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$port = 3002

function Stop-ListenerOnPort {
  param([int]$TargetPort)

  $listeners = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue
  if (-not $listeners) {
    return
  }

  $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $pids) {
    try {
      Stop-Process -Id $pid -Force -ErrorAction Stop
      Write-Host "Stopped stale process $pid on port $TargetPort"
    } catch {
      Write-Warning "Could not stop process $pid on port $TargetPort. Close it manually and retry."
      throw
    }
  }
}

Write-Host "Preparing local production on port $port..."
Stop-ListenerOnPort -TargetPort $port

if (-not $SkipBuild) {
  Write-Host "Building web app..."
  npm.cmd run build:web
  if ($LASTEXITCODE -ne 0) {
    throw "build:web failed."
  }
} else {
  Write-Host "Skipping build step."
}

Write-Host "Starting local production server at http://localhost:$port ..."
npm.cmd run start:web
