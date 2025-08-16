# PowerShell script to manage Docker support services
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "restart", "test", "logs", "status")]
    [string]$Action = "start"
)

Write-Host "🐳 Ceylon Smart Citizen - Support Services Docker Manager" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ComposeFile = "docker-compose.support-services.yml"

function Start-Services {
    Write-Host "`nStarting Docker support services..." -ForegroundColor Green
    docker-compose -f $ComposeFile up -d --build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services started successfully!" -ForegroundColor Green
        Get-ServiceStatus
    } else {
        Write-Host "❌ Failed to start services" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "`nStopping Docker support services..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to stop services" -ForegroundColor Red
    }
}

function Restart-Services {
    Write-Host "`nRestarting Docker support services..." -ForegroundColor Yellow
    Stop-Services
    Start-Sleep -Seconds 5
    Start-Services
}

function Get-ServiceStatus {
    Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
    docker-compose -f $ComposeFile ps
    
    Write-Host "`n🌐 Service Endpoints:" -ForegroundColor Cyan
    Write-Host "  Document Service:    http://localhost:3010" -ForegroundColor White
    Write-Host "  Notification Service: http://localhost:3002" -ForegroundColor White
    Write-Host "  Queue Service:       http://localhost:3005" -ForegroundColor White
    Write-Host "  Audit Service:       http://localhost:3003" -ForegroundColor White
    Write-Host "  Database (PostgreSQL): localhost:5432" -ForegroundColor White
    Write-Host "  Redis:               localhost:6379" -ForegroundColor White
}

function Show-Logs {
    Write-Host "`n📝 Service Logs:" -ForegroundColor Cyan
    docker-compose -f $ComposeFile logs --tail=50 -f
}

function Run-Tests {
    Write-Host "`n🧪 Running comprehensive Docker tests..." -ForegroundColor Green
    node docker-test-runner.js
}

# Main execution
switch ($Action) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "test" {
        Run-Tests
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Get-ServiceStatus
    }
    default {
        Write-Host "Invalid action. Use: start, stop, restart, test, logs, or status" -ForegroundColor Red
    }
}

Write-Host "`n🚀 Commands:" -ForegroundColor Yellow
Write-Host "  .\docker-support-services.ps1 start   - Start all services" -ForegroundColor White
Write-Host "  .\docker-support-services.ps1 stop    - Stop all services" -ForegroundColor White
Write-Host "  .\docker-support-services.ps1 restart - Restart all services" -ForegroundColor White
Write-Host "  .\docker-support-services.ps1 test    - Run comprehensive tests" -ForegroundColor White
Write-Host "  .\docker-support-services.ps1 logs    - Show service logs" -ForegroundColor White
Write-Host "  .\docker-support-services.ps1 status  - Show service status" -ForegroundColor White
