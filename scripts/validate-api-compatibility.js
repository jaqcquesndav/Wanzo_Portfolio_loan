// scripts/validate-api-compatibility.js
/**
 * Script pour valider la compatibilité entre les endpoints du frontend et la documentation backend
 * 
 * Ce script analyse les appels API dans le code source du frontend et les compare
 * avec la documentation de l'API pour vérifier leur conformité.
 * 
 * Utilisation: node scripts/validate-api-compatibility.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Chemins des fichiers à analyser
const API_DOCS_PATH = path.join(__dirname, '..', 'PORTFOLIO_API_DOCUMENTATION.md');
const API_CONFIG_PATH = path.join(__dirname, '..', 'src', 'config', 'api.ts');
const API_FILES_GLOB = path.join(__dirname, '..', 'src', 'services', 'api', '**', '*.ts');

// Fonction pour extraire les endpoints de la documentation
function extractEndpointsFromDocumentation(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const endpoints = [];
  
  // Extraction des tableaux d'endpoints dans la documentation
  const sections = content.split(/^### \d+\.\s+/gm);
  
  sections.forEach(section => {
    const tableMatches = section.match(/\| Méthode \| URL \| Description \|[\s\S]*?\n\n/g);
    if (tableMatches) {
      tableMatches.forEach(table => {
        const lines = table.split('\n').filter(line => line.trim().startsWith('|'));
        // Skip header and separator rows
        const endpointLines = lines.slice(2);
        
        endpointLines.forEach(line => {
          const columns = line.split('|').map(col => col.trim());
          if (columns.length >= 4) {
            const method = columns[1].trim();
            const url = columns[2].trim().replace(/`/g, '');
            if (url && !url.includes('...')) {
              endpoints.push({
                method,
                url,
                description: columns[3].trim()
              });
            }
          }
        });
      });
    }
  });
  
  return endpoints;
}

// Fonction pour extraire l'URL de base de la configuration API
function extractBaseUrl(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const baseUrlMatch = content.match(/baseUrl:\s*.*?['"]([^'"]*)['"]/);
  return baseUrlMatch ? baseUrlMatch[1] : null;
}

// Fonction pour extraire les appels API du code source
function extractApiCalls(globPattern) {
  const files = glob.sync(globPattern);
  const apiCalls = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Recherche des appels apiClient.get, apiClient.post, apiClient.put, apiClient.delete
    const getMatches = content.matchAll(/apiClient\.get<[^>]*>\(`([^`]+)`/g);
    const postMatches = content.matchAll(/apiClient\.post<[^>]*>\(`?([^`\)]+)`?/g);
    const putMatches = content.matchAll(/apiClient\.put<[^>]*>\(`([^`]+)`/g);
    const deleteMatches = content.matchAll(/apiClient\.delete\(`([^`]+)`/g);
    
    // Analyser les correspondances et ajouter à apiCalls
    for (const match of getMatches) {
      apiCalls.push({ method: 'GET', url: match[1], file, line: getLineNumber(content, match.index) });
    }
    
    for (const match of postMatches) {
      apiCalls.push({ method: 'POST', url: match[1], file, line: getLineNumber(content, match.index) });
    }
    
    for (const match of putMatches) {
      apiCalls.push({ method: 'PUT', url: match[1], file, line: getLineNumber(content, match.index) });
    }
    
    for (const match of deleteMatches) {
      apiCalls.push({ method: 'DELETE', url: match[1], file, line: getLineNumber(content, match.index) });
    }
  });
  
  return apiCalls;
}

// Fonction pour obtenir le numéro de ligne à partir de l'index
function getLineNumber(content, index) {
  const lines = content.substring(0, index).split('\n');
  return lines.length;
}

// Fonction pour normaliser une URL
function normalizeUrl(url) {
  // Supprimer les paramètres d'URL et les variables de chemin (comme :id)
  return url
    .split('?')[0]
    .replace(/\${[^}]+}/g, ':id')
    .replace(/\$\{[^}]+\}/g, ':id')
    .replace(/\([^)]+\)/g, ':id');
}

// Fonction pour comparer les endpoints
function compareEndpoints(docEndpoints, apiCalls, baseUrl) {
  const results = {
    compatible: [],
    incompatible: [],
    missing: []
  };
  
  // Vérifier la compatibilité de chaque appel API
  apiCalls.forEach(call => {
    const normalizedCallUrl = normalizeUrl(call.url);
    
    // Ignorer les appels dynamiques et difficiles à analyser
    if (normalizedCallUrl.includes('$') || normalizedCallUrl.includes('${')) {
      return;
    }
    
    const matchingEndpoint = docEndpoints.find(endpoint => {
      const endpointUrl = endpoint.url.startsWith('/') ? endpoint.url : `/${endpoint.url}`;
      const pattern = new RegExp(
        '^' + endpointUrl.replace(/:[^/]+/g, '[^/]+') + '(\\?|$)'
      );
      
      return call.method === endpoint.method && pattern.test(normalizedCallUrl);
    });
    
    if (matchingEndpoint) {
      results.compatible.push({
        call,
        endpoint: matchingEndpoint
      });
    } else {
      results.incompatible.push({
        call,
        suggestion: findSimilarEndpoint(normalizedCallUrl, docEndpoints, call.method)
      });
    }
  });
  
  // Identifier les endpoints documentés mais non utilisés
  docEndpoints.forEach(endpoint => {
    const endpointUrl = endpoint.url.startsWith('/') ? endpoint.url : `/${endpoint.url}`;
    const isUsed = results.compatible.some(item => item.endpoint === endpoint);
    
    if (!isUsed) {
      results.missing.push(endpoint);
    }
  });
  
  return results;
}

// Fonction pour trouver un endpoint similaire
function findSimilarEndpoint(url, endpoints, method) {
  let bestMatch = null;
  let highestSimilarity = 0;
  
  endpoints.forEach(endpoint => {
    if (endpoint.method === method) {
      const similarity = calculateSimilarity(url, endpoint.url);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = endpoint;
      }
    }
  });
  
  return highestSimilarity > 0.6 ? bestMatch : null;
}

// Fonction pour calculer la similarité entre deux chaînes
function calculateSimilarity(str1, str2) {
  const longer = str1.length >= str2.length ? str1 : str2;
  const shorter = str1.length < str2.length ? str1 : str2;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const longerLength = longer.length;
  const editDistance = levenshteinDistance(longer, shorter);
  
  return (longerLength - editDistance) / longerLength;
}

// Implémentation de la distance de Levenshtein
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // suppression
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
}

// Fonction principale pour valider la compatibilité
function validateApiCompatibility() {
  // Extraire les données
  const docEndpoints = extractEndpointsFromDocumentation(API_DOCS_PATH);
  const baseUrl = extractBaseUrl(API_CONFIG_PATH);
  const apiCalls = extractApiCalls(API_FILES_GLOB);
  
  // Comparer les endpoints
  const results = compareEndpoints(docEndpoints, apiCalls, baseUrl);
  
  // Afficher les résultats
  console.log('\x1b[36m%s\x1b[0m', '=== API Compatibility Validation ===');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Total documented endpoints: ${docEndpoints.length}`);
  console.log(`Total API calls found: ${apiCalls.length}`);
  
  console.log('\n\x1b[32m%s\x1b[0m', '=== Compatible Endpoints ===');
  console.log(`Total: ${results.compatible.length}`);
  results.compatible.forEach(item => {
    console.log(`✓ ${item.call.method} ${item.call.url} (${path.basename(item.call.file)}:${item.call.line})`);
  });
  
  console.log('\n\x1b[31m%s\x1b[0m', '=== Incompatible Endpoints ===');
  console.log(`Total: ${results.incompatible.length}`);
  results.incompatible.forEach(item => {
    console.log(`✗ ${item.call.method} ${item.call.url} (${path.basename(item.call.file)}:${item.call.line})`);
    if (item.suggestion) {
      console.log(`  Suggestion: ${item.suggestion.method} ${item.suggestion.url}`);
    }
  });
  
  console.log('\n\x1b[33m%s\x1b[0m', '=== Missing Endpoints (Documented but not used) ===');
  console.log(`Total: ${results.missing.length}`);
  results.missing.forEach(endpoint => {
    console.log(`? ${endpoint.method} ${endpoint.url} (${endpoint.description})`);
  });
  
  // Calculer le taux de conformité
  const conformityRate = results.compatible.length / (results.compatible.length + results.incompatible.length) * 100;
  console.log('\n\x1b[36m%s\x1b[0m', '=== Conformity Rate ===');
  console.log(`${conformityRate.toFixed(2)}%`);
  
  return {
    conformityRate,
    compatible: results.compatible.length,
    incompatible: results.incompatible.length,
    missing: results.missing.length
  };
}

// Exécuter la validation
validateApiCompatibility();
