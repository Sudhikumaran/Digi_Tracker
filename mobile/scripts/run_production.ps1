# Run on a physical device against the production Railway API (debug mode).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

flutter pub get
flutter run --dart-define=API_BASE_URL=https://digitracker-production.up.railway.app/api/v1
