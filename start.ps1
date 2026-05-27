# Plug — Start Script
# Opens two PowerShell terminals: one for the API, one for the frontend

Write-Host "🚀 Starting Plug..." -ForegroundColor Cyan
Write-Host ""
Write-Host "API  → http://localhost:4000/api" -ForegroundColor Green
Write-Host "Web  → http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Demo login: alex@auraprep.com / demo1234!" -ForegroundColor Yellow
Write-Host ""

# Start API in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Stainx\auraprep\apps\api'; `$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/auraprep'; `$env:JWT_SECRET='auraprep-super-secret-jwt-key-2024-secure'; `$env:PORT='4000'; npx nest start --watch"

Start-Sleep -Seconds 3

# Start web in a new terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Stainx\auraprep\apps\web'; `$env:NEXT_PUBLIC_API_URL='http://localhost:4000'; pnpm dev"

Write-Host "✅ Both servers starting. Please wait a few seconds then open http://localhost:3000" -ForegroundColor Green
