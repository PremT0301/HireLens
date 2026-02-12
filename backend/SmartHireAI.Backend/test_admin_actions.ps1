$ErrorActionPreference = "Stop"

# Login
$body = @{ email = "admin@hirelens.ai"; password = "admin123" }
$login = Invoke-RestMethod -Uri "http://localhost:5033/api/auth/login" -Method Post -ContentType "application/json" -Body ($body | ConvertTo-Json)
$token = $login.token
$headers = @{ Authorization = "Bearer $token" }

# Get first non-admin user
$users = Invoke-RestMethod -Uri "http://localhost:5033/api/admin/users" -Method Get -Headers $headers
$targetUser = $users | Where-Object { $_.role -ne "Admin" } | Select-Object -First 1

if ($null -eq $targetUser) {
    Write-Error "No non-admin user found to test."
    exit 1
}

Write-Output "Testing User Disable on: $($targetUser.email) (Currently Active: $($targetUser.isActive))"

# Disable User
$disableUri = "http://localhost:5033/api/admin/users/$($targetUser.userId)/disable"
$response = Invoke-RestMethod -Uri $disableUri -Method Patch -Headers $headers
Write-Output "Disable Response: $($response.message) (Active: $($response.isActive))"

if ($response.isActive -eq $true) {
    Write-Error "Failed to disable user."
}

# Re-enable User
$response2 = Invoke-RestMethod -Uri $disableUri -Method Patch -Headers $headers
Write-Output "Re-enable Response: $($response2.message) (Active: $($response2.isActive))"

if ($response2.isActive -ne $true) {
    Write-Error "Failed to re-enable user."
}

Write-Output "User Action Test Passed."
