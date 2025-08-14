# Test Ceylon Auth Service
Write-Host "Testing Ceylon Auth Service..." -ForegroundColor Green

# Test health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
    Write-Host "✅ Health Check Passed" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test registration endpoint
Write-Host "`nTesting user registration..." -ForegroundColor Yellow

$registerData = @{
    email = "test@example.com"
    password = "TestPassword123!"
    confirmPassword = "TestPassword123!"
    firstName = "John"
    lastName = "Doe"
    nicNumber = "123456789V"
    phoneNumber = "+94771234567"
    preferredLanguage = "en"
    address = "123 Test Street, Colombo"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration Passed" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.data.user.id)"
    Write-Host "Access Token: $($registerResponse.data.tokens.accessToken.Substring(0,50))..."
} catch {
    $errorDetails = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorDetails)
    $responseBody = $reader.ReadToEnd()
    Write-Host "❌ Registration Failed" -ForegroundColor Red
    Write-Host $responseBody -ForegroundColor Red
}

# Test login endpoint  
Write-Host "`nTesting user login..." -ForegroundColor Yellow

$loginData = @{
    email = "test@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login Passed" -ForegroundColor Green
    Write-Host "Welcome: $($loginResponse.data.user.firstName) $($loginResponse.data.user.lastName)"
    
    # Test protected endpoint
    Write-Host "`nTesting protected profile endpoint..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $($loginResponse.data.tokens.accessToken)"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" -Method GET -Headers $headers
    Write-Host "✅ Profile Access Passed" -ForegroundColor Green
    Write-Host "NIC: $($profileResponse.data.user.nicNumber)"
    Write-Host "Age: $($profileResponse.data.user.nicDetails.age)"
    Write-Host "Gender: $($profileResponse.data.user.nicDetails.gender)"
    
} catch {
    $errorDetails = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorDetails)
    $responseBody = $reader.ReadToEnd()
    Write-Host "❌ Login Failed" -ForegroundColor Red
    Write-Host $responseBody -ForegroundColor Red
}

Write-Host "`nTesting complete!" -ForegroundColor Green
