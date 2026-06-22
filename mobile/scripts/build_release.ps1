# Build production Android release (APK + App Bundle)
# Uses https://digitracker-production.up.railway.app/api/v1 automatically in release mode.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Fetching dependencies..."
flutter pub get

Write-Host "Building release APK..."
flutter build apk --release

Write-Host "Building release App Bundle (Play Store)..."
flutter build appbundle --release

Write-Host ""
Write-Host "Done."
Write-Host "APK:  build\app\outputs\flutter-apk\app-release.apk"
Write-Host "AAB:  build\app\outputs\bundle\release\app-release.aab"
Write-Host ""
Write-Host "Install APK on device:"
Write-Host "  flutter install --release"
