param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$port = 3000

function Stop-ListenerOnPort {
  param([int]$TargetPort)

  $pids = @()

  $listeners = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue
  if ($listeners) {
    $pids += $listeners | Select-Object -ExpandProperty OwningProcess -Unique
  }

  # Fallback for environments where Get-NetTCPConnection does not return listeners reliably.
  $netstatPids = netstat -ano |
    Select-String -Pattern "LISTENING\s+(\d+)\s*$" |
    ForEach-Object {
      $parts = $_.Line.Trim() -split '\s+'
      if ($parts.Length -lt 5) {
        return
      }

      $localAddress = $parts[1]
      $state = $parts[3]
      $owningProcess = $parts[4]
      if ($state -eq "LISTENING" -and $localAddress -like "*:$TargetPort" -and $owningProcess -match '^\d+$') {
        [int]$owningProcess
      }
    }

  if ($netstatPids) {
    $pids += $netstatPids
  }

  $pids = @($pids | Sort-Object -Unique)
  if (-not $pids -or $pids.Count -eq 0) {
    return
  }

  foreach ($processId in $pids) {
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Write-Host "Stopped stale process $processId on port $TargetPort"
    } catch {
      Write-Warning "Could not stop process $processId on port $TargetPort. Close it manually and retry."
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
