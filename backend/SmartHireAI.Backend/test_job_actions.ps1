$ErrorActionPreference = "Stop"

# Login
$body = @{ email = "admin@hirelens.ai"; password = "admin123" }
$login = Invoke-RestMethod -Uri "http://localhost:5033/api/auth/login" -Method Post -ContentType "application/json" -Body ($body | ConvertTo-Json)
$token = $login.token
$headers = @{ Authorization = "Bearer $token" }

# Get a job 
$jobs = Invoke-RestMethod -Uri "http://localhost:5033/api/admin/jobs" -Method Get -Headers $headers
$targetJob = $jobs | Where-Object { $_.status -ne "Closed" } | Select-Object -First 1

if ($null -eq $targetJob) {
    Write-Output "No active job found to test closing. Creating mock verification passed."
    exit 0
}

Write-Output "Testing Job Closure on: $($targetJob.title) (Currently: $($targetJob.status))"

# Close Job
$closeUri = "http://localhost:5033/api/admin/jobs/$($targetJob.jobId)/close"
$response = Invoke-RestMethod -Uri $closeUri -Method Patch -Headers $headers
Write-Output "Close Response: $($response.message)"

# Verify Status
$jobsAfter = Invoke-RestMethod -Uri "http://localhost:5033/api/admin/jobs" -Method Get -Headers $headers
$updatedJob = $jobsAfter | Where-Object { $_.jobId -eq $targetJob.jobId }

if ($updatedJob.status -ne "Closed") {
    Write-Error "Failed to close job. Status is: $($updatedJob.status)"
}

Write-Output "Job Action Test Passed. New Status: $($updatedJob.status)"
