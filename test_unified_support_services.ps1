# Comprehensive Test Script for Unified Support Services
# Tests all endpoints: Documents, Notifications, Queue, Audit, and Officer Management

Write-Host "===== Ceylon Smart Citizen - Unified Support Services Test =====" -ForegroundColor Cyan
Write-Host "Testing all service endpoints..." -ForegroundColor Yellow
Write-Host ""

$baseUrl = "http://localhost:3005"
$testResults = @()

# Function to make API calls and record results
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Description,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    Write-Host "Testing: $Description" -ForegroundColor White
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✓ SUCCESS" -ForegroundColor Green
        Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
        
        $testResults += @{
            Test = $Description
            Status = "PASS"
            Method = $Method
            Url = $Url
            Response = $response
        }
        
        return $response
    }
    catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{
            Test = $Description
            Status = "FAIL"
            Method = $Method
            Url = $Url
            Error = $_.Exception.Message
        }
        return $null
    }
    
    Write-Host ""
}

# Test 1: Service Health Check
Write-Host "`n=== 1. SERVICE HEALTH CHECKS ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/health" -Description "Service Health Check"
Test-Endpoint -Method "GET" -Url "$baseUrl/health/detailed" -Description "Detailed Health Check"

# Test 2: Document Service Endpoints
Write-Host "`n=== 2. DOCUMENT SERVICE TESTS ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/documents" -Description "Document Service Info"
Test-Endpoint -Method "GET" -Url "$baseUrl/documents/list" -Description "List Documents"
Test-Endpoint -Method "GET" -Url "$baseUrl/documents/doc123" -Description "Get Document by ID"
Test-Endpoint -Method "PUT" -Url "$baseUrl/documents/doc123/status" -Body @{verification_status="verified"; verified_by="test-officer"} -Description "Update Document Status"
Test-Endpoint -Method "PATCH" -Url "$baseUrl/documents/doc123/expire" -Description "Expire Document"
Test-Endpoint -Method "DELETE" -Url "$baseUrl/documents/doc123" -Description "Delete Document"

# Test 3: Notification Service Endpoints
Write-Host "`n=== 3. NOTIFICATION SERVICE TESTS ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/notifications" -Description "Notification Service Info"

$notificationResponse = Test-Endpoint -Method "POST" -Url "$baseUrl/notifications" -Body @{
    userId="test-user-123"
    message="Test notification message"
    type="info"
    title="Test Notification"
} -Description "Create Notification"

Test-Endpoint -Method "GET" -Url "$baseUrl/notifications/user/test-user-123" -Description "Get User Notifications"
Test-Endpoint -Method "GET" -Url "$baseUrl/notifications/all?limit=10" -Description "Get All Notifications"

if ($notificationResponse -and $notificationResponse.id) {
    Test-Endpoint -Method "PATCH" -Url "$baseUrl/notifications/$($notificationResponse.id)/read" -Description "Mark Notification as Read"
    Test-Endpoint -Method "DELETE" -Url "$baseUrl/notifications/$($notificationResponse.id)" -Description "Delete Notification"
}

Test-Endpoint -Method "PATCH" -Url "$baseUrl/notifications/user/test-user-123/read-all" -Description "Mark All User Notifications as Read"

# Test 4: Queue Service Endpoints
Write-Host "`n=== 4. QUEUE SERVICE TESTS ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/queue" -Description "Queue Service Info"
Test-Endpoint -Method "GET" -Url "$baseUrl/queue/queues" -Description "List All Queues"

# Create a new queue
$newQueueResponse = Test-Endpoint -Method "POST" -Url "$baseUrl/queue/queues" -Body @{
    id="test-queue"
    name="Test Queue"
    maxSize=50
} -Description "Create New Queue"

Test-Endpoint -Method "GET" -Url "$baseUrl/queue/queues/test-queue" -Description "Get Specific Queue"

# Add jobs to queue
$jobResponse = Test-Endpoint -Method "POST" -Url "$baseUrl/queue/queues/test-queue/jobs" -Body @{
    type="document-processing"
    data=@{documentId="doc123"; userId="user123"}
    priority=5
} -Description "Add Job to Queue"

Test-Endpoint -Method "GET" -Url "$baseUrl/queue/queues/test-queue/jobs" -Description "Get Queue Jobs"

if ($jobResponse -and $jobResponse.job.id) {
    Test-Endpoint -Method "PATCH" -Url "$baseUrl/queue/queues/test-queue/jobs/$($jobResponse.job.id)/status" -Body @{
        status="processing"
    } -Description "Update Job Status"
}

# Queue sessions
$sessionResponse = Test-Endpoint -Method "POST" -Url "$baseUrl/queue/sessions" -Body @{
    userId="test-user-123"
    queueId="test-queue"
} -Description "Create Queue Session"

Test-Endpoint -Method "GET" -Url "$baseUrl/queue/sessions" -Description "List All Sessions"

if ($sessionResponse -and $sessionResponse.session.id) {
    Test-Endpoint -Method "GET" -Url "$baseUrl/queue/sessions/$($sessionResponse.session.id)" -Description "Get Specific Session"
    Test-Endpoint -Method "DELETE" -Url "$baseUrl/queue/sessions/$($sessionResponse.session.id)" -Description "End Session"
}

# Test 5: Audit Service Endpoints
Write-Host "`n=== 5. AUDIT SERVICE TESTS ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/audit" -Description "Audit Service Info"
Test-Endpoint -Method "GET" -Url "$baseUrl/audit/audit-logs" -Description "Get All Audit Logs"
Test-Endpoint -Method "GET" -Url "$baseUrl/audit/audit-logs?userId=user1`&limit=5" -Description "Get Filtered Audit Logs"
Test-Endpoint -Method "GET" -Url "$baseUrl/audit/audit-logs/user/user1" -Description "Get User Audit Logs"
Test-Endpoint -Method "GET" -Url "$baseUrl/audit/audit-logs/1" -Description "Get Specific Audit Log"
Test-Endpoint -Method "GET" -Url "$baseUrl/audit/audit-logs/stats" -Description "Get Audit Statistics"

# Create new audit log
Test-Endpoint -Method "POST" -Url "$baseUrl/audit/audit-logs" -Body @{
    userId="test-user"
    action="TEST_ACTION"
    resource="test-resource"
    details="Test audit log entry"
    ipAddress="127.0.0.1"
} -Description "Create Audit Log"

# Test 6: Officer Management Endpoints
Write-Host "`n=== 6. OFFICER MANAGEMENT TESTS ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/officer" -Description "Officer Service Info"
Test-Endpoint -Method "GET" -Url "$baseUrl/officer/officers" -Description "List All Officers"
Test-Endpoint -Method "GET" -Url "$baseUrl/officer/officers/officer1" -Description "Get Specific Officer"

# Create new officer
$officerResponse = Test-Endpoint -Method "POST" -Url "$baseUrl/officer/officers" -Body @{
    id="test-officer"
    name="Test Officer"
    servicesHandled=@("documents", "verification")
} -Description "Create New Officer"

Test-Endpoint -Method "PATCH" -Url "$baseUrl/officer/officers/test-officer/status" -Body @{
    status="busy"
} -Description "Update Officer Status"

Test-Endpoint -Method "GET" -Url "$baseUrl/officer/sessions" -Description "List Officer Sessions"

# Test officer session management
if ($sessionResponse -and $sessionResponse.session.id) {
    Test-Endpoint -Method "PATCH" -Url "$baseUrl/officer/sessions/$($sessionResponse.session.id)/officer-status" -Body @{
        officerId="test-officer"
        status="serving"
        notes="Testing officer session"
    } -Description "Update Officer Session Status"
    
    Test-Endpoint -Method "GET" -Url "$baseUrl/officer/sessions/$($sessionResponse.session.id)" -Description "Get Officer Session Details"
}

# Test 7: Socket.IO Endpoints (HTTP API)
Write-Host "`n=== 7. SOCKET.IO HTTP API TESTS ===" -ForegroundColor Magenta
Test-Endpoint -Method "POST" -Url "$baseUrl/queue/test-queue/position" -Body @{
    position=5
    stats=@{waiting=10; serving=2}
} -Description "Update Queue Position via Socket.IO API"

Test-Endpoint -Method "POST" -Url "$baseUrl/queue/test-queue/now-serving" -Body @{
    userId="test-user-123"
} -Description "Send Now Serving Notification via Socket.IO API"

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passed / $total) * 100, 2))%" -ForegroundColor Yellow

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  ✗ $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`n=== SERVICE ENDPOINTS SUMMARY ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor White
Write-Host ""
Write-Host "Available Service APIs:" -ForegroundColor Yellow
Write-Host "  • Documents API: $baseUrl/documents" -ForegroundColor White
Write-Host "  • Notifications API: $baseUrl/notifications" -ForegroundColor White
Write-Host "  • Queue Management API: $baseUrl/queue" -ForegroundColor White
Write-Host "  • Audit Logs API: $baseUrl/audit" -ForegroundColor White
Write-Host "  • Officer Management API: $baseUrl/officer" -ForegroundColor White
Write-Host "  • Health Check: $baseUrl/health" -ForegroundColor White
Write-Host ""
Write-Host "Socket.IO available on: $baseUrl" -ForegroundColor Green
Write-Host ""

# Generate detailed report
$reportPath = "support-services-test-report.json"
$testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath
Write-Host "Detailed test report saved to: $reportPath" -ForegroundColor Cyan

Write-Host "`n===== Test Completed =====" -ForegroundColor Cyan
