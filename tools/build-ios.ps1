# Lunera — build iOS (EAS cloud, desde Windows)
# Uso:
#   .\tools\build-ios.ps1              # primera vez (interactivo + credenciales Apple)
#   .\tools\build-ios.ps1 -Submit      # build + submit TestFlight
#   .\tools\build-ios.ps1 -Internal    # ad-hoc interno

param(
  [switch]$Submit,
  [switch]$Internal,
  [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$profile = if ($Internal) { "preview-internal" } else { "preview" }
$easArgs = @("build", "--platform", "ios", "--profile", $profile)

if ($NonInteractive -or $env:CI) {
  $easArgs += "--non-interactive"
}

Write-Host "==> Lunera iOS build (perfil: $profile)" -ForegroundColor Cyan
npx eas-cli @easArgs

if ($Submit) {
  Write-Host "==> Subiendo a App Store Connect / TestFlight..." -ForegroundColor Cyan
  npx eas-cli submit --platform ios --latest
  Write-Host "Actualiza TESTFLIGHT_URL en cristianoqa.github.io/descargar-lunera-ios.html" -ForegroundColor Yellow
}

Write-Host "Dashboard: https://expo.dev/accounts/proyectgastosapp/projects/lunera/builds" -ForegroundColor Green
