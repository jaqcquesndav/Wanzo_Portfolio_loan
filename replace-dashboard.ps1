# Script to replace EnhancedPortfolioDashboard.tsx with the fixed version

# Backup the original file
Copy-Item -Path "src\components\dashboard\EnhancedPortfolioDashboard.tsx" -Destination "src\components\dashboard\EnhancedPortfolioDashboard.tsx.bak" -Force

# Copy the fixed file to the original location
Copy-Item -Path "src\components\dashboard\EnhancedPortfolioDashboard.fixed.tsx" -Destination "src\components\dashboard\EnhancedPortfolioDashboard.tsx" -Force

Write-Host "Dashboard component replaced successfully. Backup created at src\components\dashboard\EnhancedPortfolioDashboard.tsx.bak"
