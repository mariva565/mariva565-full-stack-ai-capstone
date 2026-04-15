param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-StagedFiles {
  $output = & git diff --cached --name-only --diff-filter=ACMR
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to read staged files via git diff --cached."
  }

  $lines = @()
  foreach ($line in ($output -split "`r?`n")) {
    if ($line -and $line.Trim() -ne "") {
      $lines += $line.Trim()
    }
  }

  return $lines
}

function Is-TextFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath
  )

  $ext = [System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()
  $base = [System.IO.Path]::GetFileName($FilePath)

  $textExtensions = @(
    ".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json",
    ".yml", ".yaml", ".css", ".scss", ".sass", ".less", ".html", ".xml", ".svg",
    ".sql", ".py", ".sh", ".ps1", ".toml", ".ini", ".env", ".example", ".conf",
    ".config"
  )

  $textFilenames = @(
    "AGENTS.md", "README.md", ".editorconfig", ".gitattributes",
    ".gitignore", ".env", ".env.example"
  )

  return ($textExtensions -contains $ext) -or ($textFilenames -contains $base)
}

function Get-AddedDiffLines {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath
  )

  $diffOutput = & git diff --cached --unified=0 -- $FilePath
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to read staged diff for '$FilePath'."
  }

  $lines = @()
  $currentNewLine = 0

  foreach ($rawLine in ($diffOutput -split "`n")) {
    $line = $rawLine.TrimEnd("`r")

    if ($line -match '^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@') {
      $currentNewLine = [int]$Matches[1] - 1
      continue
    }

    if ($line.StartsWith('+++')) {
      continue
    }

    if ($line.StartsWith('+')) {
      $currentNewLine += 1
      $lines += [PSCustomObject]@{
        LineNumber = $currentNewLine
        Content    = $line.Substring(1)
      }
      continue
    }

    if ($line.StartsWith('-') -and -not $line.StartsWith('---')) {
      continue
    }

    if ($line.StartsWith(' ')) {
      $currentNewLine += 1
    }
  }

  return $lines
}

function Get-StagedBlobSha {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath
  )

  $sha = & git rev-parse --verify ":$FilePath" 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $sha) {
    return $null
  }

  return $sha.Trim()
}

function Get-GitBlobBytes {
  param(
    [Parameter(Mandatory = $true)]
    [string]$BlobSha
  )

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "git"
  $psi.Arguments = "cat-file -p $BlobSha"
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $psi

  if (-not $process.Start()) {
    throw "Failed to start git process for blob read."
  }

  $memoryStream = New-Object System.IO.MemoryStream
  $process.StandardOutput.BaseStream.CopyTo($memoryStream)
  $stderr = $process.StandardError.ReadToEnd()
  $process.WaitForExit()

  if ($process.ExitCode -ne 0) {
    throw ("git cat-file failed for blob '{0}': {1}" -f $BlobSha, $stderr.Trim())
  }

  return $memoryStream.ToArray()
}

function Test-StagedFileHasUtf8Bom {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath
  )

  $sha = Get-StagedBlobSha -FilePath $FilePath
  if (-not $sha) {
    return $true
  }

  $bytes = Get-GitBlobBytes -BlobSha $sha
  if ($bytes.Length -lt 3) {
    return $false
  }

  return ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
}

function Format-LineSnippet {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Line
  )

  if ([string]::IsNullOrWhiteSpace($Line)) {
    return "(empty line)"
  }

  $trimmed = $Line.Trim()
  if ($trimmed.Length -le 140) {
    return $trimmed
  }

  return $trimmed.Substring(0, 137) + "..."
}

$patterns = @(
  [PSCustomObject]@{ Label = "CP1251/CP1252 pair artifact"; Regex = [regex]'[\u0420\u0421][\u00A0-\u00FF]' },
  [PSCustomObject]@{ Label = "CP1252 quote/dash mojibake"; Regex = [regex]'\u0432\u0402[\u201c\u201d\u045a\u045c\u2122\u02dc\u00a6]' },
  [PSCustomObject]@{ Label = "CP1252 arrow mojibake"; Regex = [regex]'\u0432\u2020[\u2019\u0452\u201d]' },
  [PSCustomObject]@{ Label = "CP1252 checkmark/sparkle mojibake"; Regex = [regex]'\u0432\u045a[\u201c\u201d\u2026\u0401]' },
  [PSCustomObject]@{ Label = "Double-encoded UTF-8 cascade"; Regex = [regex]'\u0420\u0406\u0420' },
  [PSCustomObject]@{ Label = "Unicode replacement character"; Regex = [regex]'\uFFFD' }
)

$stagedFiles = @(Get-StagedFiles)
if ($stagedFiles.Count -eq 0) {
  exit 0
}

$findings = @()
$bomViolations = @()

$devLogPath = "docs/dev-log.md"
if ($stagedFiles | Where-Object { $_ -ieq $devLogPath }) {
  if (-not (Test-StagedFileHasUtf8Bom -FilePath $devLogPath)) {
    $bomViolations += $devLogPath
  }
}

foreach ($file in $stagedFiles) {
  if (-not (Is-TextFile -FilePath $file)) {
    continue
  }

  $addedLines = @(Get-AddedDiffLines -FilePath $file)
  foreach ($entry in $addedLines) {
    foreach ($pattern in $patterns) {
      if ($pattern.Regex.IsMatch($entry.Content)) {
        $findings += [PSCustomObject]@{
          FilePath   = $file
          LineNumber = $entry.LineNumber
          Label      = $pattern.Label
          Snippet    = (Format-LineSnippet -Line $entry.Content)
        }
        break
      }
    }
  }
}

if ($findings.Count -eq 0 -and $bomViolations.Count -eq 0) {
  exit 0
}

if ($findings.Count -gt 0) {
  Write-Host ""
  Write-Host "[mojibake-check] Suspicious encoding artifacts found in staged changes:" -ForegroundColor Red
  Write-Host ""

  $maxToPrint = [Math]::Min(40, $findings.Count)
  for ($i = 0; $i -lt $maxToPrint; $i++) {
    $f = $findings[$i]
    Write-Host ("- {0}:{1} [{2}] {3}" -f $f.FilePath, $f.LineNumber, $f.Label, $f.Snippet)
  }

  if ($findings.Count -gt $maxToPrint) {
    Write-Host ""
    Write-Host ("...and {0} more findings." -f ($findings.Count - $maxToPrint))
  }
}

if ($bomViolations.Count -gt 0) {
  Write-Host ""
  Write-Host "[mojibake-check] UTF-8 BOM requirement failed:" -ForegroundColor Red
  foreach ($file in $bomViolations) {
    Write-Host ("- {0} must be UTF-8 with BOM." -f $file)
  }
}

Write-Host ""
Write-Host "Commit blocked. Convert the affected file(s) to UTF-8 (docs/dev-log.md => UTF-8 with BOM), then stage again." -ForegroundColor Yellow
Write-Host ""
exit 1
