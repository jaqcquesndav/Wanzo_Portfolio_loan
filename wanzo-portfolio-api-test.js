// Script de test API pour Wanzo Portfolio Loan
// Basé sur l'analyse complète des services, endpoints et types de l'application

// Configuration Auth0 - Remplacez par votre token valide
const JWT_TOKEN = process.env.JWT_TOKEN || "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjRlQUJzRldHVC1yTnZCeTVjTGNLWiJ9.eyJpc3MiOiJodHRwczovL2Rldi10ZXptbG4wdGswZzFnb3VmLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExMzUzMTY4NjEyMTI2NzA3MDQ4OSIsImF1ZCI6WyJodHRwczovL2FwaS53YW56by5jb20iLCJodHRwczovL2Rldi10ZXptbG4wdGswZzFnb3VmLmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NTgyMjkwNzIsImV4cCI6MTc1ODMxNTQ3Miwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF6cCI6ImhpNVFKTDA2cVF2TWlkcThaWnZxcDJIV3MwQWlXaEJJIiwicGVybWlzc2lvbnMiOlsiYWNjb3VudGluZzpyZWFkIiwiYWNjb3VudGluZzp3cml0ZSIsImFkbWluOmZ1bGwiLCJhbmFseXRpY3M6cmVhZCIsImFuYWx5dGljczp3cml0ZSIsImluc3RpdHV0aW9uOm1hbmFnZSIsIm1vYmlsZTpyZWFkIiwibW9iaWxlOndyaXRlIiwicG9ydGZvbGlvOnJlYWQiLCJwb3J0Zm9saW86d3JpdGUiLCJzZXR0aW5nczptYW5hZ2UiLCJ1c2VyczptYW5hZ2UiXX0.hUO_76I_q8UE9qZPlkG51XRWJkkhOn7BwTHEuZOgxNHIAVuzjrGxH7ALkSf2TpOW-kBXvCaYMsY08579gO4TXnwsTIfyd3hBPCH90CRwclyDg-pJPnieVRbtLERMBwf9_u37JgP36fbaTkC27r0yjKGbs0pxUnDNEDRo8sw2nlIxN8KGa57oILlrPNGNlPPgW9RZmAMV6i9FggwKlOxim1kZPQcSCU2H5GWF9U2EG58n29zE9NfXd4qk3pz2qkG98DS5KCQVxXRcK1qnXd_3wrEQSNSXPTlZ0M-AClciA_F7taMhv94oFeDW-uJE3PBJpDEa3NeNDvvmhPJJh5xEfw";

// Configuration API basée sur l'analyse du code source
const API_CONFIG = {
  baseUrl: process.env.VITE_API_URL || 'http://localhost:8000',
  portfolioApiPrefix: '/portfolio/api/v1',
  timeout: 15000
};

// Headers standardisés selon la configuration de l'application
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'X-Wanzo-Client': 'Portfolio-Test-Client/1.0.0',
    'X-Request-Time': new Date().toISOString()
  };
}

// Construction des URLs selon les patterns identifiés
function buildApiUrl(endpoint, isPortfolioApi = false) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (isPortfolioApi) {
    return `${API_CONFIG.baseUrl}${API_CONFIG.portfolioApiPrefix}${cleanEndpoint}`;
  }
  return `${API_CONFIG.baseUrl}${cleanEndpoint}`;
}

// Fonction de test générique avec gestion des réponses Wanzo
async function testEndpoint(endpoint, method = 'GET', data = null, description = '', isPortfolioApi = false) {
  const url = buildApiUrl(endpoint, isPortfolioApi);
  console.log(`\n🔍 ${description}`);
  console.log(`   ${method} ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const options = {
      method,
      headers: getAuthHeaders(),
      signal: controller.signal
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    console.log(`   📊 Status: ${response.status} ${response.statusText}`);
    
    // Gestion du rate limiting avec backoff exponentiel
    if (response.status === 429) {
      console.log(`   ⏳ Rate limit détecté, attente de 3 secondes...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Un seul retry pour éviter les boucles
      const retryResponse = await fetch(url, options);
      console.log(`   🔄 Retry Status: ${retryResponse.status} ${retryResponse.statusText}`);
      return await processWanzoResponse(retryResponse);
    }
    
    return await processWanzoResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`   ⏰ Timeout après ${API_CONFIG.timeout}ms`);
      return { success: false, error: 'Timeout', status: 0 };
    }
    console.log(`   💥 Erreur de connexion: ${error.message}`);
    return { success: false, error: error.message, status: 0 };
  }
}

// Traitement des réponses selon les formats Wanzo (ApiResponse<T> et WanzoApiResponse<T>)
async function processWanzoResponse(response) {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      
      // Format WanzoApiResponse<T> - réponse encapsulée dans data
      if (responseData.data && responseData.data.success !== undefined) {
        console.log(`   ✅ Format WanzoApiResponse: success=${responseData.data.success}`);
        if (responseData.data.data) {
          analyzeDataStructure(responseData.data.data, '     ');
        }
        if (responseData.data.message) {
          console.log(`   💬 Message: ${responseData.data.message}`);
        }
        return { success: true, data: responseData, status: response.status, format: 'WanzoApiResponse' };
      }
      
      // Format ApiResponse<T> - réponse directe
      else if (responseData.success !== undefined) {
        console.log(`   ✅ Format ApiResponse: success=${responseData.success}`);
        if (responseData.data) {
          analyzeDataStructure(responseData.data, '     ');
        }
        if (responseData.message) {
          console.log(`   💬 Message: ${responseData.message}`);
        }
        return { success: true, data: responseData, status: response.status, format: 'ApiResponse' };
      }
      
      // Format de données brutes
      else {
        console.log(`   📄 Données brutes (${Array.isArray(responseData) ? 'Array' : 'Object'})`);
        analyzeDataStructure(responseData, '     ');
        return { success: true, data: responseData, status: response.status, format: 'Raw' };
      }
    } else {
      const text = await response.text();
      console.log(`   ✅ Réponse texte: ${text.substring(0, 100)}...`);
      return { success: true, data: text, status: response.status, format: 'Text' };
    }
  } else {
    let errorData;
    try {
      errorData = await response.json();
      console.log(`   ❌ Erreur API: ${errorData.message || 'Erreur inconnue'}`);
      if (errorData.errors) {
        console.log(`   🔍 Détails des erreurs:`);
        Object.entries(errorData.errors).forEach(([field, errors]) => {
          console.log(`     • ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
        });
      }
    } catch (e) {
      const errorText = await response.text();
      console.log(`   ❌ Erreur: ${errorText.substring(0, 200)}...`);
    }
    return { success: false, error: errorData || 'Erreur inconnue', status: response.status };
  }
}

// Analyse intelligente de la structure des données
function analyzeDataStructure(data, indent = '') {
  if (Array.isArray(data)) {
    console.log(`${indent}📋 Array avec ${data.length} éléments`);
    if (data.length > 0) {
      console.log(`${indent}   Premier élément: ${JSON.stringify(data[0]).substring(0, 100)}...`);
    }
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    console.log(`${indent}📦 Objet avec ${keys.length} propriétés: [${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}]`);
    
    // Détecter les patterns spécifiques à Wanzo
    if (data.pagination) {
      console.log(`${indent}   📑 Pagination: page ${data.pagination.page || '?'}, total: ${data.pagination.total || '?'}`);
    }
    if (data.id) {
      console.log(`${indent}   🆔 ID: ${data.id}`);
    }
    if (data.name) {
      console.log(`${indent}   📝 Nom: ${data.name}`);
    }
  } else {
    console.log(`${indent}📄 Valeur: ${JSON.stringify(data).substring(0, 100)}...`);
  }
}

// Décodage et validation du token JWT
function analyzeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Format de token JWT invalide');
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('\n🔐 ANALYSE DU TOKEN AUTH0');
    console.log('=========================');
    console.log('📅 Émis le:', new Date(payload.iat * 1000).toLocaleString());
    console.log('⏰ Expire le:', new Date(payload.exp * 1000).toLocaleString());
    console.log('👤 Utilisateur:', payload.sub);
    console.log('📧 Email:', payload.email || 'Non spécifié');
    console.log('🏢 Audience:', payload.aud);
    
    // Analyser les permissions spécifiques à Wanzo
    if (payload.permissions) {
      console.log('🔑 Permissions:', payload.permissions);
    }
    
    if (payload['https://wanzo.com/roles']) {
      console.log('👑 Rôles Wanzo:', payload['https://wanzo.com/roles']);
    }
    
    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log('⚠️  ATTENTION: Le token est expiré!');
      return false;
    } else {
      const remainingTime = payload.exp - now;
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      console.log(`✅ Token valide, expire dans ${hours}h ${minutes}m`);
      return true;
    }
  } catch (error) {
    console.log('❌ Erreur lors de l\'analyse du token:', error.message);
    return false;
  }
}

// Tests de diagnostic préliminaires
async function runDiagnostics() {
  console.log('\n🔬 DIAGNOSTIC DE CONNECTIVITÉ');
  console.log('=============================');
  
  // Test 1: Vérifier la base API
  try {
    console.log('\n1. Test de connectivité de base...');
    const baseResponse = await fetch(API_CONFIG.baseUrl, { method: 'GET' });
    console.log(`   📡 Serveur accessible: ${baseResponse.status} ${baseResponse.statusText}`);
  } catch (error) {
    console.log(`   ❌ Serveur inaccessible: ${error.message}`);
  }
  
  // Test 2: Vérifier l'endpoint health Portfolio API
  try {
    console.log('\n2. Test de l\'endpoint health Portfolio API...');
    const healthResponse = await fetch(buildApiUrl('/health', true));
    console.log(`   🏥 Portfolio Health check: ${healthResponse.status} ${healthResponse.statusText}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log(`   📄 Réponse: ${healthData.substring(0, 100)}`);
    }
  } catch (error) {
    console.log(`   ❓ Portfolio Health endpoint non disponible: ${error.message}`);
  }
  
  // Test 3: Vérifier la base portfolio API
  try {
    console.log('\n3. Test de la base Portfolio API...');
    const portfolioBaseResponse = await fetch(buildApiUrl('/', true));
    console.log(`   📁 Portfolio API: ${portfolioBaseResponse.status} ${portfolioBaseResponse.statusText}`);
  } catch (error) {
    console.log(`   ❌ Portfolio API inaccessible: ${error.message}`);
  }
}

// Tests des endpoints principaux basés sur l'analyse du code
async function runMainEndpointTests() {
  console.log('\n📋 TESTS DES ENDPOINTS PRINCIPAUX');
  console.log('=================================');
  
  const results = [];
  
  // Définition des endpoints à tester basés sur les instructions backend
  const endpointsToTest = [
    // 0. Health check Portfolio API (selon instructions backend)
    { endpoint: '/health', method: 'GET', description: 'Health check Portfolio API', isPortfolioApi: true },
    
    // 1. Authentification (services généraux)
    { endpoint: '/auth/login', method: 'GET', description: 'Endpoint de connexion' },
    { endpoint: '/auth/validate-institution', method: 'GET', description: 'Validation institution' },
    
    // 2. Utilisateurs (services généraux)
    { endpoint: '/users', method: 'GET', description: 'Liste des utilisateurs' },
    { endpoint: '/users/me', method: 'GET', description: 'Profil utilisateur connecté' },
    { endpoint: '/users/me/preferences', method: 'GET', description: 'Préférences utilisateur' },
    { endpoint: '/users/roles', method: 'GET', description: 'Rôles disponibles' },
    { endpoint: '/users/permissions', method: 'GET', description: 'Permissions utilisateur' },
    
    // 3. Entreprises (services généraux)
    { endpoint: '/companies', method: 'GET', description: 'Liste des entreprises' },
    
    // 4. Institutions financières (services généraux)
    { endpoint: '/institutions', method: 'GET', description: 'Institutions financières' },
    
    // 5. PORTFOLIO API - Endpoints conformes aux instructions backend
    { endpoint: '/portfolios/traditional', method: 'GET', description: 'Portfolios traditionnels (@Controller)', isPortfolioApi: true },
    { endpoint: '/portfolios/traditional/credit-requests', method: 'GET', description: 'Demandes de crédit (@Controller)', isPortfolioApi: true },
    { endpoint: '/portfolios/traditional/credit-contracts', method: 'GET', description: 'Contrats de crédit (@Controller)', isPortfolioApi: true },
    { endpoint: '/portfolios/traditional/disbursements', method: 'GET', description: 'Débloquements (@Controller)', isPortfolioApi: true },
    { endpoint: '/portfolios/traditional/repayments', method: 'GET', description: 'Remboursements (@Controller)', isPortfolioApi: true },
    
    // 6. Autres services (probablement d'autres microservices)
    { endpoint: '/leasing', method: 'GET', description: 'Portfolios leasing' },
    { endpoint: '/investment', method: 'GET', description: 'Portfolios investissement' },
    { endpoint: '/risk', method: 'GET', description: 'Base gestion des risques' },
    { endpoint: '/risk/central-bank', method: 'GET', description: 'Données centrale des risques' },
    { endpoint: '/risk/alerts', method: 'GET', description: 'Alertes de risque' },
    { endpoint: '/payments', method: 'GET', description: 'Liste des paiements' },
    { endpoint: '/payments/methods', method: 'GET', description: 'Méthodes de paiement' },
    { endpoint: '/payments/schedule', method: 'GET', description: 'Planning des paiements' },
    { endpoint: '/messages', method: 'GET', description: 'Messages utilisateur' },
    { endpoint: '/chat/conversations', method: 'GET', description: 'Conversations chat' },
    { endpoint: '/meetings', method: 'GET', description: 'Réunions planifiées' },
    { endpoint: '/prospection', method: 'GET', description: 'Données de prospection' },
    { endpoint: '/prospection/opportunities', method: 'GET', description: 'Opportunités commerciales' },
    { endpoint: '/prospection/leads', method: 'GET', description: 'Prospects' },
    { endpoint: '/documents', method: 'GET', description: 'Gestion documentaire' },
    { endpoint: '/reports', method: 'GET', description: 'Rapports disponibles' },
    { endpoint: '/settings', method: 'GET', description: 'Paramètres application' },
    { endpoint: '/settings/system', method: 'GET', description: 'Paramètres système' },
    { endpoint: '/settings/notifications', method: 'GET', description: 'Paramètres notifications' },
    { endpoint: '/settings/integrations', method: 'GET', description: 'Paramètres intégrations' }
  ];
  
  // Exécuter les tests avec un délai pour éviter le rate limiting
  for (const test of endpointsToTest) {
    const result = await testEndpoint(
      test.endpoint, 
      test.method, 
      null, 
      test.description, 
      test.isPortfolioApi || false
    );
    
    results.push({
      ...test,
      ...result,
      fullUrl: buildApiUrl(test.endpoint, test.isPortfolioApi || false)
    });
    
    // Délai entre les requêtes pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  return results;
}

// Tests avec des données d'exemple
async function runDataTests() {
  console.log('\n🧪 TESTS AVEC DONNÉES D\'EXEMPLE');
  console.log('===============================');
  
  const results = [];
  
  // Test de création d'un portfolio traditionnel
  const portfolioData = {
    name: 'Portfolio Test API',
    description: 'Portfolio créé par le script de test',
    type: 'traditional',
    status: 'active',
    institution_id: 'test-institution'
  };
  
  const createResult = await testEndpoint(
    '/portfolios/traditional',
    'POST',
    portfolioData,
    'Création d\'un portfolio de test',
    true
  );
  results.push({ endpoint: '/portfolios/traditional', method: 'POST', ...createResult });
  
  // Test de création d'une demande de crédit
  const creditRequestData = {
    company_id: 'test-company',
    amount: 100000,
    duration_months: 12,
    purpose: 'Financement équipement',
    interest_rate: 5.5,
    status: 'pending'
  };
  
  const creditResult = await testEndpoint(
    '/portfolios/traditional/credit-requests',
    'POST',
    creditRequestData,
    'Création d\'une demande de crédit test',
    true
  );
  results.push({ endpoint: '/portfolios/traditional/credit-requests', method: 'POST', ...creditResult });
  
  return results;
}

// Analyse complète des résultats
function analyzeResults(results) {
  console.log('\n📊 ANALYSE DÉTAILLÉE DES RÉSULTATS');
  console.log('==================================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  // Classification par type d'erreur
  const auth401 = failed.filter(f => f.status === 401);
  const forbidden403 = failed.filter(f => f.status === 403);
  const notFound404 = failed.filter(f => f.status === 404);
  const rateLimited429 = failed.filter(f => f.status === 429);
  const serverErrors = failed.filter(f => f.status >= 500);
  const connectionErrors = failed.filter(f => f.status === 0);
  
  // Statistiques générales
  console.log(`\n📈 STATISTIQUES GÉNÉRALES:`);
  console.log(`   ✅ Succès: ${successful.length}/${results.length} (${Math.round(successful.length/results.length*100)}%)`);
  console.log(`   ❌ Échecs: ${failed.length}/${results.length} (${Math.round(failed.length/results.length*100)}%)`);
  
  // Détail des erreurs
  if (connectionErrors.length > 0) console.log(`   💥 Erreurs de connexion: ${connectionErrors.length}`);
  if (auth401.length > 0) console.log(`   🔐 Non autorisé (401): ${auth401.length}`);
  if (forbidden403.length > 0) console.log(`   🚫 Accès refusé (403): ${forbidden403.length}`);
  if (notFound404.length > 0) console.log(`   ❓ Non trouvé (404): ${notFound404.length}`);
  if (rateLimited429.length > 0) console.log(`   ⏳ Rate limiting (429): ${rateLimited429.length}`);
  if (serverErrors.length > 0) console.log(`   ⚠️  Erreurs serveur (5xx): ${serverErrors.length}`);
  
  // Analyse des formats de réponse
  const formatCounts = {};
  successful.forEach(r => {
    const format = r.format || 'Unknown';
    formatCounts[format] = (formatCounts[format] || 0) + 1;
  });
  
  if (Object.keys(formatCounts).length > 0) {
    console.log(`\n📋 FORMATS DE RÉPONSE DÉTECTÉS:`);
    Object.entries(formatCounts).forEach(([format, count]) => {
      console.log(`   • ${format}: ${count} endpoint(s)`);
    });
  }
  
  // Endpoints fonctionnels par catégorie
  if (successful.length > 0) {
    console.log(`\n✅ ENDPOINTS FONCTIONNELS:`);
    const categories = {
      'Auth': successful.filter(s => s.endpoint.includes('/auth')),
      'Users': successful.filter(s => s.endpoint.includes('/users')),
      'Portfolios': successful.filter(s => s.endpoint.includes('/portfolios')),
      'Payments': successful.filter(s => s.endpoint.includes('/payments')),
      'Risk': successful.filter(s => s.endpoint.includes('/risk')),
      'Settings': successful.filter(s => s.endpoint.includes('/settings')),
      'Other': successful.filter(s => !['auth', 'users', 'portfolios', 'payments', 'risk', 'settings'].some(cat => s.endpoint.includes(`/${cat}`)))
    };
    
    Object.entries(categories).forEach(([category, endpoints]) => {
      if (endpoints.length > 0) {
        console.log(`\n   📁 ${category} (${endpoints.length}):`);
        endpoints.forEach(ep => {
          console.log(`      • ${ep.method} ${ep.endpoint} (${ep.status})`);
        });
      }
    });
  }
  
  // Recommandations spécifiques
  console.log(`\n💡 RECOMMANDATIONS:`);
  
  if (successful.some(s => s.endpoint.includes('/auth'))) {
    console.log(`   ✅ Authentification opérationnelle`);
  }
  
  if (successful.some(s => s.endpoint.includes('/portfolios'))) {
    console.log(`   ✅ Services portfolio fonctionnels`);
  }
  
  if (notFound404.length > 0) {
    console.log(`   ⚠️  Vérifier le démarrage des microservices (${notFound404.length} endpoints 404)`);
  }
  
  if (auth401.length > 0) {
    console.log(`   🔑 Vérifier la validité du token Auth0 (${auth401.length} erreurs d'auth)`);
  }
  
  if (serverErrors.length > 0) {
    console.log(`   🔧 Problèmes côté serveur détectés (${serverErrors.length} erreurs 5xx)`);
  }
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    successRate: Math.round(successful.length/results.length*100)
  };
}

// Fonction principale d'exécution
async function runWanzoPortfolioTests() {
  console.log('🚀 TEST API WANZO PORTFOLIO LOAN');
  console.log('=================================');
  console.log(`🌐 Base URL: ${API_CONFIG.baseUrl}`);
  console.log(`📁 Portfolio API: ${API_CONFIG.portfolioApiPrefix}`);
  console.log(`⏰ Timeout: ${API_CONFIG.timeout}ms`);
  
  // Validation du token
  console.log(`\n🔐 VALIDATION DU TOKEN`);
  if (JWT_TOKEN === "YOUR_AUTH0_JWT_TOKEN_HERE") {
    console.log('❌ ATTENTION: Token par défaut détecté!');
    console.log('   Veuillez définir une variable d\'environnement JWT_TOKEN avec votre token Auth0 valide.');
    console.log('   Exemple: set JWT_TOKEN=eyJhbGciOiJSUzI1NiIs...');
    return;
  }
  
  const isTokenValid = analyzeJWT(JWT_TOKEN);
  if (!isTokenValid) {
    console.log('\n❌ Token invalide ou expiré. Arrêt des tests.');
    console.log('   Générez un nouveau token depuis votre application Auth0.');
    return;
  }
  
  try {
    // Étape 1: Diagnostics préliminaires
    await runDiagnostics();
    
    // Étape 2: Tests des endpoints principaux
    const mainResults = await runMainEndpointTests();
    
    // Étape 3: Tests avec données
    const dataResults = await runDataTests();
    
    // Étape 4: Analyse complète
    const allResults = [...mainResults, ...dataResults];
    const summary = analyzeResults(allResults);
    
    // Résumé final
    console.log(`\n🏁 RÉSUMÉ EXÉCUTIF`);
    console.log('==================');
    console.log(`📊 Total testé: ${summary.total} endpoints`);
    console.log(`✅ Succès: ${summary.successful} (${summary.successRate}%)`);
    console.log(`❌ Échecs: ${summary.failed}`);
    console.log(`📅 Exécuté le: ${new Date().toLocaleString()}`);
    
    if (summary.successRate >= 80) {
      console.log(`\n🎉 EXCELLENT! Votre API Wanzo Portfolio est bien configurée.`);
    } else if (summary.successRate >= 50) {
      console.log(`\n⚠️  ATTENTION: Plusieurs endpoints ne répondent pas correctement.`);
    } else {
      console.log(`\n🚨 PROBLÈME MAJEUR: La majorité des endpoints sont inaccessibles.`);
    }
    
  } catch (error) {
    console.error('\n💥 Erreur critique lors de l\'exécution des tests:', error);
  }
}

// Point d'entrée du script
async function main() {
  try {
    await runWanzoPortfolioTests();
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécution automatique du script (ES module)
main().catch(console.error);

// Exports pour utilisation en module (ES module)
export {
  runWanzoPortfolioTests,
  testEndpoint,
  buildApiUrl,
  analyzeJWT,
  API_CONFIG
};