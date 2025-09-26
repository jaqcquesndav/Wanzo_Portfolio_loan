// Script d'analyse pour vérifier l'utilisation du préfixe /portfolio/api/v1/
// dans les endpoints de l'application Wanzo Portfolio

const fs = require('fs');
const path = require('path');

console.log('🔍 ANALYSE DU PRÉFIXE API /portfolio/api/v1/');
console.log('===============================================');

// Configuration
const EXPECTED_PREFIX = '/portfolio/api/v1';
const PORTFOLIO_INST_PREFIX = '/portfolio_inst';
const SRC_DIR = path.join(__dirname, 'src');

// Résultats d'analyse
const analysisResults = {
  usingCorrectPrefix: [],
  usingPortfolioInstPrefix: [],
  directApiCalls: [],
  inconsistentEndpoints: [],
  totalEndpoints: 0
};

// Fonction pour parcourir récursivement les fichiers
function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, callback);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filePath);
    }
  });
}

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(__dirname, filePath);
  
  // Rechercher les appels API
  const apiCallPatterns = [
    /apiClient\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /buildPortfolioApiUrl\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /fetch\s*\(\s*['"`]([^'"`]*\/[^'"`]+)['"`]/g
  ];
  
  let match;
  
  apiCallPatterns.forEach((pattern, patternIndex) => {
    while ((match = pattern.exec(content)) !== null) {
      const endpoint = patternIndex === 0 ? match[2] : match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      analysisResults.totalEndpoints++;
      
      const endpointInfo = {
        file: relativePath,
        line: lineNumber,
        endpoint: endpoint,
        fullMatch: match[0]
      };
      
      if (patternIndex === 1) {
        // buildPortfolioApiUrl utilise automatiquement le bon préfixe
        analysisResults.usingCorrectPrefix.push({
          ...endpointInfo,
          method: 'buildPortfolioApiUrl',
          resultingUrl: `${EXPECTED_PREFIX}${endpoint}`
        });
      } else if (endpoint.startsWith('/portfolio_inst')) {
        analysisResults.usingPortfolioInstPrefix.push(endpointInfo);
      } else if (endpoint.startsWith('/portfolio/api/v1')) {
        analysisResults.usingCorrectPrefix.push({
          ...endpointInfo,
          method: 'direct'
        });
      } else if (endpoint.startsWith('/')) {
        analysisResults.directApiCalls.push(endpointInfo);
      }
      
      // Vérifier les inconsistances
      if (endpoint.includes('/portfolios/') && !endpoint.startsWith('/portfolio') && !endpoint.startsWith('/portfolio_inst')) {
        analysisResults.inconsistentEndpoints.push({
          ...endpointInfo,
          issue: 'Endpoint portfolio sans préfixe approprié'
        });
      }
    }
  });
}

// Analyser tous les fichiers
console.log('\n📂 Analyse des fichiers sources...\n');

try {
  walkDirectory(SRC_DIR, analyzeFile);
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse:', error.message);
  process.exit(1);
}

// Afficher les résultats
console.log('📊 RÉSULTATS DE L\'ANALYSE');
console.log('==========================\n');

console.log(`📈 Total d'endpoints analysés: ${analysisResults.totalEndpoints}\n`);

// Endpoints utilisant le bon préfixe
if (analysisResults.usingCorrectPrefix.length > 0) {
  console.log(`✅ ENDPOINTS UTILISANT LE PRÉFIXE CORRECT (${analysisResults.usingCorrectPrefix.length}):`);
  console.log(`   Préfixe attendu: ${EXPECTED_PREFIX}\n`);
  
  const byMethod = {
    buildPortfolioApiUrl: analysisResults.usingCorrectPrefix.filter(e => e.method === 'buildPortfolioApiUrl'),
    direct: analysisResults.usingCorrectPrefix.filter(e => e.method === 'direct')
  };
  
  if (byMethod.buildPortfolioApiUrl.length > 0) {
    console.log(`   📦 Via buildPortfolioApiUrl (${byMethod.buildPortfolioApiUrl.length}):`);
    byMethod.buildPortfolioApiUrl.forEach(endpoint => {
      console.log(`      • ${endpoint.file}:${endpoint.line}`);
      console.log(`        ${endpoint.endpoint} → ${endpoint.resultingUrl}`);
    });
    console.log();
  }
  
  if (byMethod.direct.length > 0) {
    console.log(`   🔗 Appels directs (${byMethod.direct.length}):`);
    byMethod.direct.forEach(endpoint => {
      console.log(`      • ${endpoint.file}:${endpoint.line}`);
      console.log(`        ${endpoint.endpoint}`);
    });
    console.log();
  }
}

// Endpoints utilisant portfolio_inst
if (analysisResults.usingPortfolioInstPrefix.length > 0) {
  console.log(`⚠️  ENDPOINTS UTILISANT /portfolio_inst (${analysisResults.usingPortfolioInstPrefix.length}):`);
  console.log('   Ces endpoints utilisent un préfixe différent - vérifiez si c\'est intentionnel\n');
  
  analysisResults.usingPortfolioInstPrefix.forEach(endpoint => {
    console.log(`      • ${endpoint.file}:${endpoint.line}`);
    console.log(`        ${endpoint.endpoint}`);
  });
  console.log();
}

// Appels API directs sans préfixe
if (analysisResults.directApiCalls.length > 0) {
  console.log(`❓ ENDPOINTS SANS PRÉFIXE PORTFOLIO (${analysisResults.directApiCalls.length}):`);
  console.log('   Ces endpoints ne commencent pas par /portfolio - peuvent être des services généraux\n');
  
  // Grouper par type d'endpoint
  const groupedByType = {};
  analysisResults.directApiCalls.forEach(endpoint => {
    const firstSegment = endpoint.endpoint.split('/')[1] || 'root';
    if (!groupedByType[firstSegment]) {
      groupedByType[firstSegment] = [];
    }
    groupedByType[firstSegment].push(endpoint);
  });
  
  Object.entries(groupedByType).forEach(([type, endpoints]) => {
    console.log(`   📁 /${type} (${endpoints.length}):`);
    endpoints.slice(0, 5).forEach(endpoint => {
      console.log(`      • ${endpoint.file}:${endpoint.line} - ${endpoint.endpoint}`);
    });
    if (endpoints.length > 5) {
      console.log(`      ... et ${endpoints.length - 5} autres`);
    }
    console.log();
  });
}

// Endpoints inconsistants
if (analysisResults.inconsistentEndpoints.length > 0) {
  console.log(`🚨 ENDPOINTS POTENTIELLEMENT INCONSISTANTS (${analysisResults.inconsistentEndpoints.length}):`);
  console.log('   Ces endpoints peuvent nécessiter une correction\n');
  
  analysisResults.inconsistentEndpoints.forEach(endpoint => {
    console.log(`      • ${endpoint.file}:${endpoint.line}`);
    console.log(`        ${endpoint.endpoint}`);
    console.log(`        Issue: ${endpoint.issue}`);
    console.log();
  });
}

// Recommandations
console.log('💡 RECOMMANDATIONS');
console.log('===================\n');

const correctPrefixPercentage = analysisResults.usingCorrectPrefix.length / analysisResults.totalEndpoints * 100;
const portfolioInstPercentage = analysisResults.usingPortfolioInstPrefix.length / analysisResults.totalEndpoints * 100;

if (correctPrefixPercentage > 50) {
  console.log('✅ Bonne utilisation du préfixe /portfolio/api/v1 dans la majorité des cas');
} else {
  console.log('⚠️  Le préfixe /portfolio/api/v1 n\'est pas utilisé de manière cohérente');
}

if (analysisResults.usingPortfolioInstPrefix.length > 0) {
  console.log(`📋 ${analysisResults.usingPortfolioInstPrefix.length} endpoints utilisent /portfolio_inst:`);
  console.log('   - Vérifiez si c\'est un microservice différent');
  console.log('   - Considérez l\'uniformisation si possible');
}

if (analysisResults.directApiCalls.length > 0) {
  console.log(`🔍 ${analysisResults.directApiCalls.length} endpoints sans préfixe portfolio détectés:`);
  console.log('   - Normal pour les services généraux (auth, users, settings, etc.)');
  console.log('   - Vérifiez que les endpoints portfolio utilisent bien buildPortfolioApiUrl()');
}

console.log('\n📋 ACTIONS SUGGÉRÉES:');
console.log('- Utiliser buildPortfolioApiUrl() pour tous les endpoints portfolio');
console.log('- Vérifier la cohérence entre /portfolio/api/v1 et /portfolio_inst');
console.log('- S\'assurer que le backend respecte ces préfixes');

// Statistiques finales
console.log('\n📈 STATISTIQUES FINALES:');
console.log(`   Préfixe correct: ${analysisResults.usingCorrectPrefix.length}/${analysisResults.totalEndpoints} (${Math.round(correctPrefixPercentage)}%)`);
console.log(`   Préfixe portfolio_inst: ${analysisResults.usingPortfolioInstPrefix.length}/${analysisResults.totalEndpoints} (${Math.round(portfolioInstPercentage)}%)`);
console.log(`   Autres endpoints: ${analysisResults.directApiCalls.length}/${analysisResults.totalEndpoints} (${Math.round((analysisResults.directApiCalls.length / analysisResults.totalEndpoints) * 100)}%)`);

console.log('\n🏁 Analyse terminée!');