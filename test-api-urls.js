// Test de vérification de la duplication des préfixes API

/**
 * Test pour vérifier que les URLs API sont construites correctement
 * sans duplication du préfixe /portfolio/api/v1
 */

import { buildPortfolioApiUrl } from '../src/config/api';

// Simulation des appels API pour tester les URLs

console.log('=== Test de construction des URLs API ===');

// 1. Endpoints avec buildPortfolioApiUrl (comme dans traditional APIs)
const traditionalEndpoint = buildPortfolioApiUrl('/portfolios/traditional/credit-requests');
console.log('Endpoint traditionnel:', traditionalEndpoint);
// Attendu: /portfolio/api/v1/portfolios/traditional/credit-requests

// 2. Endpoints directs (comme dans shared APIs)
const sharedEndpoint = '/users';
console.log('Endpoint partagé:', sharedEndpoint);
// Attendu: /users (sera préfixé automatiquement par base.api.ts si nécessaire)

// 3. URLs finales après traitement par base.api.ts
const baseUrl = 'http://localhost:8000';

function simulateBaseApiProcessing(endpoint) {
  // Simulation de la logique dans base.api.ts
  const finalUrl = endpoint.startsWith('/portfolio/api/v1') 
    ? endpoint 
    : buildPortfolioApiUrl(endpoint);
  return `${baseUrl}${finalUrl}`;
}

console.log('\n=== URLs finales après traitement ===');
console.log('Traditional API:', simulateBaseApiProcessing(traditionalEndpoint));
// Attendu: http://localhost:8000/portfolio/api/v1/portfolios/traditional/credit-requests

console.log('Shared API:', simulateBaseApiProcessing(sharedEndpoint));
// Attendu: http://localhost:8000/portfolio/api/v1/users

console.log('Endpoint déjà préfixé:', simulateBaseApiProcessing('/portfolio/api/v1/some-endpoint'));
// Attendu: http://localhost:8000/portfolio/api/v1/some-endpoint

console.log('\n✅ Test terminé - Vérifiez qu\'il n\'y a pas de duplication du préfixe');