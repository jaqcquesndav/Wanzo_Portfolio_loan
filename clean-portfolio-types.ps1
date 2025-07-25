# Script pour supprimer tous les fichiers et dossiers liés au leasing et à l'investissement
$rootFolder = "C:\Users\DevSpace\Wanzo_pf\Wanzo_Portfolio_loan"

# Dossiers de composants à supprimer
$componentFolders = @(
    "$rootFolder\src\components\portfolio\leasing",
    "$rootFolder\src\components\portfolio\investment"
)

# Dossiers de pages à supprimer
$pageFolders = @(
    "$rootFolder\src\pages\leasing"
)

# Fichiers de pages à supprimer
$pageFiles = @(
    "$rootFolder\src\pages\LeasingPortfolio.tsx",
    "$rootFolder\src\pages\LeasingPortfolioDetails.tsx",
    "$rootFolder\src\pages\LeasingContractDetail.tsx",
    "$rootFolder\src\pages\InvestmentPortfolio.tsx",
    "$rootFolder\src\pages\InvestmentPortfolioDetails.tsx",
    "$rootFolder\src\pages\InvestmentAssetDetail.tsx",
    "$rootFolder\src\pages\InvestmentSubscriptionDetail.tsx",
    "$rootFolder\src\pages\InvestmentValuationDetail.tsx",
    "$rootFolder\src\pages\InvestmentReportingDetail.tsx"
)

# Fichiers de types à supprimer
$typeFiles = @(
    "$rootFolder\src\types\leasing.ts",
    "$rootFolder\src\types\leasing-asset.ts",
    "$rootFolder\src\types\leasing-payment.ts",
    "$rootFolder\src\types\leasing-request.ts",
    "$rootFolder\src\types\leasing-transaction.ts",
    "$rootFolder\src\types\investment-portfolio.ts"
)

# Fichiers de hooks à supprimer
$hookFiles = @(
    "$rootFolder\src\hooks\useLeasingPortfolio.ts",
    "$rootFolder\src\hooks\useInvestmentPortfolio.ts"
)

# Fichiers de données mock à supprimer
$mockDataFiles = @(
    "$rootFolder\src\data\mockLeasingRequests.ts",
    "$rootFolder\src\data\mockLeasingContracts.ts",
    "$rootFolder\src\data\mockIncidents.ts",
    "$rootFolder\src\data\mockMaintenance.ts",
    "$rootFolder\src\data\mockLeasingTransactions.ts",
    "$rootFolder\src\data\mockEquipments.ts",
    "$rootFolder\src\data\mockAssets.ts",
    "$rootFolder\src\data\mockSubscriptions.ts",
    "$rootFolder\src\data\mockValuations.ts",
    "$rootFolder\src\data\mockMarketSecurities.ts"
)

# Fichiers de documentation API à supprimer
$apiDocsFolders = @(
    "$rootFolder\api-docs\leasing",
    "$rootFolder\api-docs\investment"
)

# Supprimer les dossiers de composants
foreach ($folder in $componentFolders) {
    if (Test-Path $folder) {
        Write-Host "Suppression du dossier: $folder"
        Remove-Item -Path $folder -Recurse -Force
    } else {
        Write-Host "Dossier non trouvé: $folder"
    }
}

# Supprimer les dossiers de pages
foreach ($folder in $pageFolders) {
    if (Test-Path $folder) {
        Write-Host "Suppression du dossier: $folder"
        Remove-Item -Path $folder -Recurse -Force
    } else {
        Write-Host "Dossier non trouvé: $folder"
    }
}

# Supprimer les fichiers de pages
foreach ($file in $pageFiles) {
    if (Test-Path $file) {
        Write-Host "Suppression du fichier: $file"
        Remove-Item -Path $file -Force
    } else {
        Write-Host "Fichier non trouvé: $file"
    }
}

# Supprimer les fichiers de types
foreach ($file in $typeFiles) {
    if (Test-Path $file) {
        Write-Host "Suppression du fichier: $file"
        Remove-Item -Path $file -Force
    } else {
        Write-Host "Fichier non trouvé: $file"
    }
}

# Supprimer les fichiers de hooks
foreach ($file in $hookFiles) {
    if (Test-Path $file) {
        Write-Host "Suppression du fichier: $file"
        Remove-Item -Path $file -Force
    } else {
        Write-Host "Fichier non trouvé: $file"
    }
}

# Supprimer les fichiers de données mock
foreach ($file in $mockDataFiles) {
    if (Test-Path $file) {
        Write-Host "Suppression du fichier: $file"
        Remove-Item -Path $file -Force
    } else {
        Write-Host "Fichier non trouvé: $file"
    }
}

# Supprimer les dossiers de documentation API
foreach ($folder in $apiDocsFolders) {
    if (Test-Path $folder) {
        Write-Host "Suppression du dossier: $folder"
        Remove-Item -Path $folder -Recurse -Force
    } else {
        Write-Host "Dossier non trouvé: $folder"
    }
}

Write-Host "Suppression terminée. Tous les fichiers et dossiers liés au leasing et à l'investissement ont été supprimés."
