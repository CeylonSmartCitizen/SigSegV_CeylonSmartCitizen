#!/usr/bin/env powershell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "     Ceylon Smart Citizen Mobile App" -ForegroundColor Green
Write-Host "     React Native with Expo Setup" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to Mobile-App directory
Set-Location "F:\SigSegV_CeylonSmartCitizen\frontend\Mobile-App"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting React Native Mobile App with Expo..." -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  - Press 'w' to open in web browser" -ForegroundColor White
Write-Host "  - Press 'a' to open Android emulator" -ForegroundColor White
Write-Host "  - Press 'i' to open iOS simulator (Mac only)" -ForegroundColor White
Write-Host "  - Press 'r' to reload the app" -ForegroundColor White
Write-Host "  - Press 'q' to quit" -ForegroundColor White
Write-Host ""

# Start Expo development server
npx expo start

Write-Host ""
Write-Host "✅ App development server has been stopped." -ForegroundColor Green
Write-Host "Thank you for using Ceylon Smart Citizen Mobile App!" -ForegroundColor Cyan
