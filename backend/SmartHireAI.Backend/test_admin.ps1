$ErrorActionPreference = "Stop"
$body = @{
    email = "admin@hirelens.ai"
    password = "admin123"
}

$startParams = @{
    Uri = "http://localhost:5033/api/auth/login"
    Method = "Post"
    ContentType = "application/json"
    Body = ($body | ConvertTo-Json)
}

try {
    $response = Invoke-RestMethod @startParams
    Write-Output "Login Successful"
    Write-Output "Token: $($response.token)"
    
    $token = $response.token
    
    # Test Admin Stats
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    Write-Output "`nTesting Admin Stats..."
    $stats = Invoke-RestMethod -Uri "http://localhost:5033/api/admin/stats" -Method Get -Headers $headers
    Write-Output $stats
    
    # Test Admin Users
    Write-Output "`nTesting Admin Users..."
    $users = Invoke-RestMethod -Uri "http://localhost:5033/api/admin/users" -Method Get -Headers $headers
    Write-Output "Count: $($users.Count)"
    
    Write-Output "`nTesting Admin Jobs..."
    $jobs = Invoke-RestMethod -Uri "http://localhost:5033/api/admin/jobs" -Method Get -Headers $headers
    Write-Output "Count: $($jobs.Count)"

} catch {
    Write-Output "Request Failed"
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Output $reader.ReadToEnd()
        }
    }
}
