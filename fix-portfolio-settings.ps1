$content = Get-Content -Path 'src\services\api\leasing\portfolio-settings.api.ts'

# Remplacer generateEquipmentId par generatePortfolioId
$content = $content -replace 'generateEquipmentId\(\)', 'generatePortfolioId()'

# Ajouter des type assertions pour maintenance_options
$content = $content -replace 'portfolio\.maintenance_options', '(portfolio as any).maintenance_options'
$content = $content -replace 'portfolio\?\.maintenance_options', '(portfolio as any)?.maintenance_options'

# Ajouter des type assertions pour insurance_options
$content = $content -replace 'portfolio\.insurance_options', '(portfolio as any).insurance_options'
$content = $content -replace 'portfolio\?\.insurance_options', '(portfolio as any)?.insurance_options'

# Ajouter des types explicites pour les fonctions callback
$content = $content -replace 'o => o\.id ===', '(o: any) => o.id ==='

# Remplacer find/findIndex directement
$content = $content -replace '(as any)\?\.find\(', '$1?.find('
$content = $content -replace '(as any)\?\.findIndex\(', '$1?.findIndex('
$content = $content -replace '(as any)\?\.filter\(', '$1?.filter('

Set-Content -Path 'src\services\api\leasing\portfolio-settings.api.ts' -Value $content
