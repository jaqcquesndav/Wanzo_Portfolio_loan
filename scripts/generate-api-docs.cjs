// scripts/generate-api-docs.cjs
/**
 * Script pour générer la documentation API à partir du code source du frontend
 * 
 * Ce script analyse les appels API dans le code source et génère une documentation
 * complète des endpoints utilisés par l'application.
 * 
 * Utilisation: node scripts/generate-api-docs.cjs
 */

const fs = require('fs');
const path = require('path');

// Fonction pour obtenir tous les fichiers TypeScript
function getFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Fonction pour extraire les endpoints du code source
function extractEndpointsFromCode(apiFilesDir) {
  const files = getFiles(apiFilesDir);
  const endpoints = {};
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(apiFilesDir, file);
    
    // Extraire les commentaires de documentation
    const functionMatches = [...content.matchAll(/\/\*\*\s*\n([\s\S]*?)\*\/\s*\n\s*(\w+):\s*async[^{]*{[\s\S]*?apiClient\.(\w+)[^(]*\([^`]*`([^`]+)`/g)];
    
    functionMatches.forEach(match => {
      const [, comment, functionName, method, url] = match;
      const description = comment.replace(/\s*\*/g, '').trim();
      
      if (!endpoints[relativePath]) {
        endpoints[relativePath] = [];
      }
      
      endpoints[relativePath].push({
        method: method.toUpperCase(),
        url: url,
        functionName,
        description: description || `${functionName} - ${method.toUpperCase()} ${url}`,
        file: relativePath
      });
    });
    
    // Extraire aussi les appels directs sans commentaires détaillés
    const directMatches = [
      ...content.matchAll(/apiClient\.get<[^>]*>\(`([^`]+)`[^}]*}/g),
      ...content.matchAll(/apiClient\.post<[^>]*>\(`([^`\)]+)`/g),
      ...content.matchAll(/apiClient\.put<[^>]*>\(`([^`]+)`/g),
      ...content.matchAll(/apiClient\.delete\(`([^`]+)`/g)
    ];
    
    directMatches.forEach(match => {
      const url = match[1];
      let method = 'GET';
      
      if (match[0].includes('.post')) method = 'POST';
      else if (match[0].includes('.put')) method = 'PUT';
      else if (match[0].includes('.delete')) method = 'DELETE';
      
      if (!endpoints[relativePath]) {
        endpoints[relativePath] = [];
      }
      
      // Éviter les doublons
      const exists = endpoints[relativePath].some(ep => ep.url === url && ep.method === method);
      if (!exists) {
        endpoints[relativePath].push({
          method,
          url,
          functionName: 'N/A',
          description: `${method} ${url}`,
          file: relativePath
        });
      }
    });
  });
  
  return endpoints;
}

// Fonction pour grouper les endpoints par catégorie
function categorizeEndpoints(endpoints) {
  const categories = {
    'Portefeuilles traditionnels': [],
    'Contrats de crédit': [],
    'Demandes de crédit': [],
    'Décaissements': [],
    'Remboursements': [],
    'Produits financiers': [],
    'Documents': [],
    'Utilisateurs': [],
    'Entreprises': [],
    'Gestion des risques': [],
    'Paiements': [],
    'Paramètres': [],
    'Prospection': [],
    'Chat et notifications': [],
    'Authentification': [],
    'Autres': []
  };
  
  Object.values(endpoints).flat().forEach(endpoint => {
    const url = endpoint.url.toLowerCase();
    
    if (url.includes('/portfolios/traditional') && !url.includes('credit') && !url.includes('payment') && !url.includes('disbursement')) {
      categories['Portefeuilles traditionnels'].push(endpoint);
    } else if (url.includes('credit-contract')) {
      categories['Contrats de crédit'].push(endpoint);
    } else if (url.includes('credit-request')) {
      categories['Demandes de crédit'].push(endpoint);
    } else if (url.includes('disbursement')) {
      categories['Décaissements'].push(endpoint);
    } else if (url.includes('repayment') || url.includes('/payments/')) {
      categories['Remboursements'].push(endpoint);
    } else if (url.includes('financial-product') || url.includes('/products')) {
      categories['Produits financiers'].push(endpoint);
    } else if (url.includes('/documents')) {
      categories['Documents'].push(endpoint);
    } else if (url.includes('/users')) {
      categories['Utilisateurs'].push(endpoint);
    } else if (url.includes('/companies')) {
      categories['Entreprises'].push(endpoint);
    } else if (url.includes('/risk')) {
      categories['Gestion des risques'].push(endpoint);
    } else if (url.includes('/payments') || url.includes('/virements')) {
      categories['Paiements'].push(endpoint);
    } else if (url.includes('/settings')) {
      categories['Paramètres'].push(endpoint);
    } else if (url.includes('/prospection')) {
      categories['Prospection'].push(endpoint);
    } else if (url.includes('/chat') || url.includes('/notification')) {
      categories['Chat et notifications'].push(endpoint);
    } else if (url.includes('/auth') || url.includes('2fa') || url.includes('password')) {
      categories['Authentification'].push(endpoint);
    } else {
      categories['Autres'].push(endpoint);
    }
  });
  
  return categories;
}

// Fonction pour générer la documentation markdown
function generateMarkdownDoc(categories, baseUrl) {
  let markdown = `# Documentation de l'API du microservice Portfolio Institution

Cette documentation décrit la structure des URLs et les endpoints disponibles pour communiquer avec le microservice Portfolio Institution via l'API Gateway.

*Cette documentation est générée automatiquement à partir du code source du frontend.*

## Informations générales

- **Base URL**: \`${baseUrl}\`
- **Port API Gateway**: 8000
- **Port Microservice Portfolio Institution**: 3005 (interne)

## Authentification

Toutes les requêtes nécessitent une authentification via un token JWT.

**Headers requis**:
\`\`\`
Authorization: Bearer <token_jwt>
Content-Type: application/json
\`\`\`

## Structure des URLs

Tous les endpoints du microservice sont accessibles via l'API Gateway à l'adresse suivante:
\`${baseUrl}/<endpoint>\`

## Format des réponses

Les réponses suivent un format standardisé:

**Succès**:
\`\`\`json
{
  "success": true,
  "data": {
    // Les données spécifiques retournées
  }
}
\`\`\`

**Pagination**:
\`\`\`json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
\`\`\`

**Erreur**:
\`\`\`json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "Type d'erreur"
}
\`\`\`

## Endpoints disponibles

`;

  let sectionNumber = 1;
  
  Object.entries(categories).forEach(([categoryName, endpoints]) => {
    if (endpoints.length === 0) return;
    
    markdown += `### ${sectionNumber}. ${categoryName}\n\n`;
    
    // Créer le tableau des endpoints
    markdown += `| Méthode | URL | Description |\n`;
    markdown += `|---------|-----|-------------|\n`;
    
    // Grouper par URL unique pour éviter les doublons
    const uniqueEndpoints = {};
    endpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.url}`;
      if (!uniqueEndpoints[key]) {
        uniqueEndpoints[key] = endpoint;
      }
    });
    
    Object.values(uniqueEndpoints).forEach(endpoint => {
      const cleanDescription = endpoint.description
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100);
      
      markdown += `| ${endpoint.method} | \`${endpoint.url}\` | ${cleanDescription} |\n`;
    });
    
    markdown += `\n`;
    sectionNumber++;
  });
  
  // Ajouter des exemples d'utilisation
  markdown += `## Exemples d'utilisation

### Récupérer tous les portefeuilles

\`\`\`javascript
const fetchPortfolios = async () => {
  try {
    const response = await fetch('${baseUrl}/portfolios/traditional?page=1&limit=10&status=active', {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des portefeuilles:', error);
    throw error;
  }
};
\`\`\`

### Créer un nouveau contrat de crédit

\`\`\`javascript
const createCreditContract = async (contractData) => {
  try {
    const response = await fetch('${baseUrl}/portfolio_inst/portfolios/traditional/credit-contracts/from-request', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contractData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    throw error;
  }
};
\`\`\`

### Enregistrer un remboursement

\`\`\`javascript
const recordRepayment = async (repaymentData) => {
  try {
    const response = await fetch('${baseUrl}/portfolio_inst/portfolios/traditional/repayments', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(repaymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de l\\'enregistrement du remboursement:', error);
    throw error;
  }
};
\`\`\`
`;

  return markdown;
}

// Fonction principale
function generateApiDocumentation() {
  const apiFilesDir = path.join(__dirname, '..', 'src', 'services', 'api');
  const configPath = path.join(__dirname, '..', 'src', 'config', 'api.ts');
  const outputPath = path.join(__dirname, '..', 'PORTFOLIO_API_DOCUMENTATION.md');
  
  console.log('🔍 Extraction des endpoints depuis le code source...');
  const endpoints = extractEndpointsFromCode(apiFilesDir);
  
  console.log('📂 Catégorisation des endpoints...');
  const categories = categorizeEndpoints(endpoints);
  
  // Extraire l'URL de base
  let baseUrl = 'http://localhost:8000/portfolio';
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const baseUrlMatch = configContent.match(/baseUrl:\s*.*?['"`]([^'"`]*)['"`]/);
    if (baseUrlMatch) {
      baseUrl = baseUrlMatch[1];
    }
  } catch (error) {
    console.warn('⚠️  Impossible de lire la configuration API, utilisation de l\'URL par défaut');
  }
  
  console.log('📝 Génération de la documentation...');
  const documentation = generateMarkdownDoc(categories, baseUrl);
  
  console.log('💾 Sauvegarde de la documentation...');
  fs.writeFileSync(outputPath, documentation, 'utf8');
  
  // Statistiques
  const totalEndpoints = Object.values(endpoints).flat().length;
  const categoriesWithEndpoints = Object.entries(categories).filter(([, eps]) => eps.length > 0);
  
  console.log('\n✅ Documentation générée avec succès !');
  console.log(`📊 Statistiques:`);
  console.log(`   - Total des endpoints trouvés: ${totalEndpoints}`);
  console.log(`   - Catégories avec endpoints: ${categoriesWithEndpoints.length}`);
  console.log(`   - URL de base: ${baseUrl}`);
  console.log(`   - Fichier généré: ${outputPath}`);
  
  console.log('\n📋 Répartition par catégorie:');
  categoriesWithEndpoints.forEach(([category, endpoints]) => {
    console.log(`   - ${category}: ${endpoints.length} endpoints`);
  });
}

// Exécuter la génération
generateApiDocumentation();
