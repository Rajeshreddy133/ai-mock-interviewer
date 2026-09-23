Write-Host "Starting AI Mock Interviewer backend..." -ForegroundColor Cyan
if (-not $env:DB_PASSWORD) { Write-Host "DB_PASSWORD is not set. Set it first: `$env:DB_PASSWORD=\"your_mysql_password\"" -ForegroundColor Yellow }
if (-not $env:GROQ_API_KEY) { Write-Host "GROQ_API_KEY is not set. Local fallback AI will be used." -ForegroundColor Yellow }
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn spring-boot:run
} elseif (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd spring-boot:run
} else {
    Write-Host "Maven was not found. Install Maven or open the project in VS Code with Spring Boot Extension Pack." -ForegroundColor Red
}
