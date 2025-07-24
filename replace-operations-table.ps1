# Script pour remplacer le fichier RecentOperationsTable.tsx corrompu

# Créer une sauvegarde du fichier corrompu
Copy-Item -Path "src\components\dashboard\RecentOperationsTable.tsx" -Destination "src\components\dashboard\RecentOperationsTable.tsx.bak" -Force

# Remplacer le fichier corrompu par la nouvelle version
Copy-Item -Path "src\components\dashboard\RecentOperationsTable.new.tsx" -Destination "src\components\dashboard\RecentOperationsTable.tsx" -Force

Write-Host "Le fichier RecentOperationsTable.tsx a été remplacé avec succès. Une sauvegarde a été créée dans RecentOperationsTable.tsx.bak"
