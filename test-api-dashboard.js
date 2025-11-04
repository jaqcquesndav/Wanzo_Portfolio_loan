/**
 * Test des endpoints API Dashboard avec token d'authentification
 */

const API_BASE_URL = 'http://localhost:8000/portfolio/api/v1';
const AUTH_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjRlQUJzRldHVC1yTnZCeTVjTGNLWiJ9.eyJpc3MiOiJodHRwczovL2Rldi10ZXptbG4wdGswZzFnb3VmLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExMzUzMTY4NjEyMTI2NzA3MDQ4OSIsImF1ZCI6WyJodHRwczovL2FwaS53YW56by5jb20iLCJodHRwczovL2Rldi10ZXptbG4wdGswZzFnb3VmLmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NjIyNjE1ODAsImV4cCI6MTc2MjM0Nzk4MCwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF6cCI6ImhpNVFKTDA2cVF2TWlkcThaWnZxcDJIV3MwQWlXaEJJIiwicGVybWlzc2lvbnMiOlsiYWNjb3VudGluZzpyZWFkIiwiYWNjb3VudGluZzp3cml0ZSIsImFkbWluOmZ1bGwiLCJhbmFseXRpY3M6cmVhZCIsImFuYWx5dGljczp3cml0ZSIsImluc3RpdHV0aW9uOm1hbmFnZSIsIm1vYmlsZTpyZWFkIiwibW9iaWxlOndyaXRlIiwicG9ydGZvbGlvOnJlYWQiLCJwb3J0Zm9saW86d3JpdGUiLCJzZXR0aW5nczptYW5hZ2UiLCJ1c2VyczptYW5hZ2UiXX0.In5y8qiNZWsSxjt-2FRRmv5ImESbidxmqESagXg4DmAqN-fXPAQncTZUaP9mJ6ybjMqvvxUnjdKRi9FplRztpQb2jz11KF8wYWRkLb6_96qrJv_zPtLDS2Mr188ZCwBaFGKDfuslO2gnhjzWZvLydJsaOqRnylMPD0To9YBUHloagA4IvoyAmOXO15oOFbvmYXne-W5Aev8U9KGfrOb5mqN_6riIe1JlEvrWsc2Z-XI8HAtQQYUAFuXM8M1udSi38vzq9CYrQ9q_OPijNdTi978-o_Xx69uJKT9_BAG49Eco96jCpS2Tl5JpAk_2MzCTJbomUDkNsq8G4JklLl5afg';

// Endpoints du dashboard à tester
const DASHBOARD_ENDPOINTS = [
  // Dashboard global
  '/dashboard',
  
  // Métriques OHADA
  '/metrics/ohada',
  '/metrics/global',
  
  // Conformité
  '/compliance/summary',
  
  // Portefeuilles traditionnels
  '/portfolios/traditional',
  
  // Préférences utilisateur
  '/preferences/user_001'
];

/**
 * Fonction pour tester un endpoint
 */
async function testEndpoint(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`\n🔍 Test: ${endpoint}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`   ✅ Succès - Données reçues:`, Object.keys(data).length > 0 ? Object.keys(data) : 'Vide');
        return { endpoint, status: response.status, success: true, data };
      } catch (jsonError) {
        console.log(`   ✅ Succès - Réponse non-JSON`);
        return { endpoint, status: response.status, success: true, data: null };
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Erreur: ${errorText}`);
      return { endpoint, status: response.status, success: false, error: errorText };
    }
    
  } catch (error) {
    console.log(`   💥 Erreur réseau: ${error.message}`);
    return { endpoint, status: 0, success: false, error: error.message };
  }
}

/**
 * Test du serveur de base
 */
async function testServerConnection() {
  console.log('🚀 TEST DE CONNEXION AU SERVEUR');
  console.log(`Base URL: ${API_BASE_URL}`);
  
  try {
    // Test simple sans authentification
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log('⚠️  Le serveur répond mais l\'endpoint racine n\'existe pas (normal)');
      return true;
    } else if (response.status >= 200 && response.status < 500) {
      console.log('✅ Serveur accessible');
      return true;
    } else {
      console.log('❌ Serveur non accessible');
      return false;
    }
    
  } catch (error) {
    console.log(`💥 Impossible de joindre le serveur: ${error.message}`);
    return false;
  }
}

/**
 * Vérification du token JWT
 */
function analyzeToken() {
  console.log('\n🔐 ANALYSE DU TOKEN JWT');
  
  try {
    // Décoder le payload (sans vérification de signature)
    const parts = AUTH_TOKEN.split('.');
    if (parts.length !== 3) {
      console.log('❌ Format JWT invalide');
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    console.log('Informations du token:');
    console.log(`- Émetteur: ${payload.iss}`);
    console.log(`- Sujet: ${payload.sub}`);
    console.log(`- Audience: ${JSON.stringify(payload.aud)}`);
    console.log(`- Émis le: ${new Date(payload.iat * 1000).toLocaleString()}`);
    console.log(`- Expire le: ${new Date(payload.exp * 1000).toLocaleString()}`);
    console.log(`- Permissions: ${JSON.stringify(payload.permissions)}`);
    
    // Vérifier l'expiration
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      console.log('❌ Token expiré');
      return false;
    } else {
      const remainingTime = Math.round((payload.exp - now) / 3600);
      console.log(`✅ Token valide (expire dans ${remainingTime}h)`);
      return true;
    }
    
  } catch (error) {
    console.log(`❌ Erreur d'analyse du token: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runDashboardTests() {
  console.log('🎯 TEST DES ENDPOINTS DASHBOARD WANZO\n');
  console.log('='.repeat(60));
  
  // 1. Analyser le token
  const tokenValid = analyzeToken();
  if (!tokenValid) {
    console.log('\n❌ Test arrêté - Token invalide');
    return;
  }
  
  // 2. Tester la connexion serveur
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('\n❌ Test arrêté - Serveur inaccessible');
    return;
  }
  
  // 3. Tester les endpoints
  console.log('\n📊 TEST DES ENDPOINTS DASHBOARD');
  console.log('-'.repeat(40));
  
  const results = [];
  
  for (const endpoint of DASHBOARD_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 4. Résumé
  console.log('\n📋 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Succès: ${successful.length}/${results.length}`);
  console.log(`❌ Échecs: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\nEndpoints fonctionnels:');
    successful.forEach(r => console.log(`  ✅ ${r.endpoint} (${r.status})`));
  }
  
  if (failed.length > 0) {
    console.log('\nEndpoints en échec:');
    failed.forEach(r => console.log(`  ❌ ${r.endpoint} (${r.status}) - ${r.error}`));
  }
  
  // 5. Recommandations
  console.log('\n💡 RECOMMANDATIONS');
  console.log('-'.repeat(40));
  
  if (failed.some(r => r.status === 0)) {
    console.log('- Vérifier que le serveur backend est démarré');
    console.log('- Vérifier l\'URL de base de l\'API');
  }
  
  if (failed.some(r => r.status === 401)) {
    console.log('- Le token d\'authentification pourrait être invalide ou expiré');
  }
  
  if (failed.some(r => r.status === 404)) {
    console.log('- Certains endpoints pourraient ne pas être implémentés côté backend');
  }
  
  if (failed.some(r => r.status === 403)) {
    console.log('- Vérifier les permissions du token pour ces endpoints');
  }
  
  console.log('\n🎯 Test terminé !');
}

// Exécuter les tests
runDashboardTests().catch(console.error);