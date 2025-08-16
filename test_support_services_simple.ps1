# Simple Test Script for Unified Support Services
Write-Host "===== Ceylon Smart Citizen - Support Services Test =====" -ForegroundColor Cyan

$baseUrl = "http://localhost:3005"

# Test 1: Health Check
Write-Host ""
Write-Host "Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "  Response: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health Check: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Document Service
Write-Host ""
Write-Host "Testing Document Service..." -ForegroundColor Yellow
try {
    $docs = Invoke-RestMethod -Uri "$baseUrl/documents" -Method GET
    Write-Host "✓ Document Service: SUCCESS" -ForegroundColor Green
    Write-Host "  Response: $($docs.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Document Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $docList = Invoke-RestMethod -Uri "$baseUrl/documents/list" -Method GET
    Write-Host "✓ Document List: SUCCESS" -ForegroundColor Green
    Write-Host "  Documents found: $($docList.count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Document List: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Notification Service
Write-Host ""
Write-Host "Testing Notification Service..." -ForegroundColor Yellow
try {
    $notifs = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET
    Write-Host "✓ Notification Service: SUCCESS" -ForegroundColor Green
    Write-Host "  Response: $($notifs.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Notification Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Create a test notification
try {
    $body = @{
        userId = "test-user-123"
        message = "Test notification"
        type = "info"
        title = "Test Title"
    } | ConvertTo-Json
    
    $notification = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Create Notification: SUCCESS" -ForegroundColor Green
    Write-Host "  Notification ID: $($notification.id)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Create Notification: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Queue Service
Write-Host ""
Write-Host "Testing Queue Service..." -ForegroundColor Yellow
try {
    $queues = Invoke-RestMethod -Uri "$baseUrl/queue" -Method GET
    Write-Host "✓ Queue Service: SUCCESS" -ForegroundColor Green
    Write-Host "  Response: $($queues.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Queue Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $allQueues = Invoke-RestMethod -Uri "$baseUrl/queue/queues" -Method GET
    Write-Host "✓ List Queues: SUCCESS" -ForegroundColor Green
    Write-Host "  Total queues: $($allQueues.totalQueues)" -ForegroundColor Gray
} catch {
    Write-Host "✗ List Queues: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Audit Service
Write-Host ""
Write-Host "Testing Audit Service..." -ForegroundColor Yellow
try {
    $audit = Invoke-RestMethod -Uri "$baseUrl/audit" -Method GET
    Write-Host "✓ Audit Service: SUCCESS" -ForegroundColor Green
    Write-Host "  Response: $($audit.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Audit Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $auditLogs = Invoke-RestMethod -Uri "$baseUrl/audit/audit-logs" -Method GET
    Write-Host "✓ Audit Logs: SUCCESS" -ForegroundColor Green
    Write-Host "  Total logs: $($auditLogs.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Audit Logs: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Officer Service
Write-Host ""
Write-Host "Testing Officer Service..." -ForegroundColor Yellow
try {
    $officers = Invoke-RestMethod -Uri "$baseUrl/officer" -Method GET
    Write-Host "✓ Officer Service: SUCCESS" -ForegroundColor Green
    Write-Host "  Response: $($officers.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Officer Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $officerList = Invoke-RestMethod -Uri "$baseUrl/officer/officers" -Method GET
    Write-Host "✓ Officer List: SUCCESS" -ForegroundColor Green
    Write-Host "  Total officers: $($officerList.totalOfficers)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Officer List: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== SERVICE ENDPOINTS ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor White
Write-Host "Available APIs:" -ForegroundColor Yellow
Write-Host "  • Documents: $baseUrl/documents" -ForegroundColor White
Write-Host "  • Notifications: $baseUrl/notifications" -ForegroundColor White
Write-Host "  • Queue: $baseUrl/queue" -ForegroundColor White
Write-Host "  • Audit: $baseUrl/audit" -ForegroundColor White
Write-Host "  • Officer: $baseUrl/officer" -ForegroundColor White
Write-Host "  • Health: $baseUrl/health" -ForegroundColor White

Write-Host "" 
Write-Host "===== Test Completed =====" -ForegroundColor Cyan
