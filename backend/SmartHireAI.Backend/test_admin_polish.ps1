# Test Admin Panel Polish Endpoints

$baseUrl = "http://localhost:5173/api/admin"
# We need a way to get a token. For now, assuming we might need to login as admin first or hardcode if test user exists.
# Since we are automating, let's try to login as admin first.

$adminEmail = "admin@hirelens.ai"
$adminPassword = "admin123" # Default from Seeder

Write-Host "1. Logging in as Admin..."
$loginUrl = "http://localhost:5173/api/auth/login"
$body = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType "application/json"
    $token = $response.token
    Write-Host "   Login successful. Token received."
}
catch {
    Write-Error "   Login failed. Ensure backend is running and seeded."
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Get Users to find a target
Write-Host "`n2. Fetching Users..."
$users = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $headers
$targetUser = $users | Where-Object { $_.role -ne "Admin" } | Select-Object -First 1

if ($null -eq $targetUser) {
    Write-Error "   No non-admin user found to test toggle."
}
else {
    Write-Host "   Target User: $($targetUser.fullName) ($($targetUser.email)) - Active: $($targetUser.isActive)"
    $userId = $targetUser.userId

    # 3. Toggle User Status
    Write-Host "`n3. Toggling User Status..."
    $toggleUrl = "$baseUrl/users/$userId/toggle"
    $response = Invoke-RestMethod -Uri $toggleUrl -Method Patch -Headers $headers
    Write-Host "   Toggle 1 Result: $($response.message) (Active: $($response.isActive))"

    # Toggle back
    $response = Invoke-RestMethod -Uri $toggleUrl -Method Patch -Headers $headers
    Write-Host "   Toggle 2 Result: $($response.message) (Active: $($response.isActive))"
}

# 4. Get Jobs to find a target
Write-Host "`n4. Fetching Jobs..."
$jobs = Invoke-RestMethod -Uri "$baseUrl/jobs" -Method Get -Headers $headers
$targetJob = $jobs | Select-Object -First 1

if ($null -eq $targetJob) {
    Write-Error "   No jobs found to test toggle."
}
else {
    Write-Host "   Target Job: $($targetJob.title) - Status: $($targetJob.status)"
    $jobId = $targetJob.jobId

    # 5. Toggle Job Status
    Write-Host "`n5. Toggling Job Status..."
    $jobToggleUrl = "$baseUrl/jobs/$jobId/toggle"
    $response = Invoke-RestMethod -Uri $jobToggleUrl -Method Patch -Headers $headers
    Write-Host "   Toggle 1 Result: $($response.message) (Status: $($response.status))"

    # Toggle back
    $response = Invoke-RestMethod -Uri $jobToggleUrl -Method Patch -Headers $headers
    Write-Host "   Toggle 2 Result: $($response.message) (Status: $($response.status))"
}

# 6. Fetch System Logs
Write-Host "`n6. Fetching System Logs..."
$logsUrl = "$baseUrl/logs"
$logs = Invoke-RestMethod -Uri $logsUrl -Method Get -Headers $headers

if ($logs.Count -gt 0) {
    Write-Host "   Logs found: $($logs.Count)"
    $logs | Select-Object -First 3 | Format-Table timestamp, level, source, message -AutoSize
    Write-Host "   SUCCESS: Backend verification complete."
}
else {
    Write-Warning "   No logs found. Expected logs from toggles above."
}
