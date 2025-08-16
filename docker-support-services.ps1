# PowerShell script to manage Docker support services testing
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "test", "restart", "logs", "status")]
    [string]$Action = "test",
    
    [Parameter(Mandatory=$false)]
    [string]$Service = ""
)

$ErrorActionPreference = "Continue"

function Write-Header {
    param([string]$Text)
    Write-Host "`n$('=' * 60)" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "$('=' * 60)" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ $Text" -ForegroundColor Blue
}

function Start-Services {
    Write-Header "🐳 Starting Docker Support Services"
    
    # Check if Docker is running
    try {
        docker version | Out-Null
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop first."
        exit 1
    }

    # Start the services
    Write-Info "Starting support services..."
    docker-compose up -d postgres redis notification-service queue-service document-service audit-service
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker services started successfully"
        Write-Info "Waiting 30 seconds for services to initialize..."
        Start-Sleep -Seconds 30
        Get-ServiceStatus
    } else {
        Write-Error "Failed to start Docker services"
        exit 1
    }
}

function Stop-Services {
    Write-Header "🛑 Stopping Docker Support Services"
    
    Write-Info "Stopping services..."
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker services stopped successfully"
    } else {
        Write-Warning "Some services may not have stopped cleanly"
    }
}

function Restart-Services {
    Write-Header "🔄 Restarting Docker Support Services"
    Stop-Services
    Start-Sleep -Seconds 5
    Start-Services
}

function Get-ServiceStatus {
    Write-Header "📊 Docker Service Status"
    
    $services = @(
        @{ Name = "ceylon-postgres"; Port = 5432 },
        @{ Name = "ceylon-redis"; Port = 6379 },
        @{ Name = "ceylon-notification-service"; Port = 3002 },
        @{ Name = "ceylon-queue-service"; Port = 3005 },
        @{ Name = "ceylon-document-service"; Port = 3003 },
        @{ Name = "ceylon-audit-service"; Port = 3004 }
    )
    
    foreach ($service in $services) {
        $containerStatus = docker ps --filter "name=$($service.Name)" --format "table {{.Status}}" | Select-Object -Skip 1
        
        if ($containerStatus) {
            Write-Success "$($service.Name): Running ($containerStatus)"
            
            # Test port connectivity
            try {
                $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue -InformationLevel Quiet
                if ($connection.TcpTestSucceeded) {
                    Write-Info "  Port $($service.Port): Accessible"
                } else {
                    Write-Warning "  Port $($service.Port): Not accessible"
                }
            }
            catch {
                Write-Warning "  Port $($service.Port): Could not test connectivity"
            }
        } else {
            Write-Error "$($service.Name): Not running"
        }
    }
}

function Show-Logs {
    param([string]$ServiceName = "")
    
    if ($ServiceName) {
        Write-Header "📋 Logs for $ServiceName"
        docker-compose logs -f --tail=50 $ServiceName
    } else {
        Write-Header "📋 Logs for All Support Services"
        docker-compose logs --tail=20 notification-service queue-service document-service audit-service
    }
}

function Run-Tests {
    Write-Header "🧪 Running Docker Support Services Tests"
    
    # Check if services are running
    $runningServices = docker ps --filter "name=ceylon-" --format "{{.Names}}" | Measure-Object
    
    if ($runningServices.Count -lt 4) {
        Write-Warning "Not all services appear to be running. Starting services first..."
        Start-Services
    }
    
    # Install axios if needed
    if (!(Test-Path "node_modules")) {
        Write-Info "Installing test dependencies..."
        npm install axios
    }
    
    # Run the test suite
    Write-Info "Running comprehensive test suite..."
    node docker-test-suite.js
    
    $testExitCode = $LASTEXITCODE
    
    if ($testExitCode -eq 0) {
        Write-Success "`nAll tests completed successfully!"
    } else {
        Write-Error "`nSome tests failed. Check the output above for details."
    }
    
    return $testExitCode
}

# Main execution logic
switch ($Action.ToLower()) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "status" {
        Get-ServiceStatus
    }
    "logs" {
        Show-Logs -ServiceName $Service
    }
    "test" {
        $exitCode = Run-Tests
        exit $exitCode
    }
    default {
        Write-Host "Usage: .\docker-support-services.ps1 [-Action start|stop|test|restart|logs|status] [-Service servicename]"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\docker-support-services.ps1 -Action start     # Start all services"
        Write-Host "  .\docker-support-services.ps1 -Action test      # Run tests (default)"
        Write-Host "  .\docker-support-services.ps1 -Action status    # Show service status"
        Write-Host "  .\docker-support-services.ps1 -Action logs      # Show logs"
        Write-Host "  .\docker-support-services.ps1 -Action stop      # Stop all services"
    }
}
