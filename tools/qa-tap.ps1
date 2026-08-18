param(
  [string]$Action = "dump",
  [string]$Text = "",
  [string]$Serial = "emulator-5554"
)

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

function Get-UiXml {
  & $adb -s $Serial shell uiautomator dump /sdcard/ui.xml | Out-Null
  return (& $adb -s $Serial shell cat /sdcard/ui.xml)
}

function Get-Texts([string]$xml) {
  $matches = [regex]::Matches($xml, 'text="([^"]*)"')
  $list = @()
  foreach ($m in $matches) {
    $v = $m.Groups[1].Value
    if ($v -and $v -ne '&#10;') { $list += $v }
  }
  return $list | Select-Object -Unique
}

function Find-Bounds([string]$xml, [string]$label) {
  $pattern = 'text="' + [regex]::Escape($label) + '"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"'
  $m = [regex]::Match($xml, $pattern)
  if (-not $m.Success) {
    # sometimes bounds come before text
    $pattern2 = 'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"[^>]*text="' + [regex]::Escape($label) + '"'
    $m = [regex]::Match($xml, $pattern2)
  }
  if (-not $m.Success) { return $null }
  return @{
    x = [int](([int]$m.Groups[1].Value + [int]$m.Groups[3].Value) / 2)
    y = [int](([int]$m.Groups[2].Value + [int]$m.Groups[4].Value) / 2)
  }
}

if ($Action -eq "dump") {
  $xml = Get-UiXml
  Get-Texts $xml
  exit 0
}

if ($Action -eq "tap") {
  $xml = Get-UiXml
  $b = Find-Bounds $xml $Text
  if ($null -eq $b) {
    Write-Host "NOT_FOUND:$Text"
    Get-Texts $xml | ForEach-Object { Write-Host "TEXT:$_" }
    exit 1
  }
  & $adb -s $Serial shell input tap $b.x $b.y
  Write-Host "TAPPED:$Text@$($b.x),$($b.y)"
  exit 0
}

if ($Action -eq "tapxy") {
  $parts = $Text.Split(",")
  & $adb -s $Serial shell input tap $parts[0] $parts[1]
  Write-Host "TAPPED_XY:$Text"
  exit 0
}

if ($Action -eq "text") {
  & $adb -s $Serial shell input text $Text
  Write-Host "TYPED:$Text"
  exit 0
}
