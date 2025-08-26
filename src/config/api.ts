import { API_ENDPOINTS } from '../services/api/endpoints';

/**
 * Configuration API globale
 * 
 * Cette configuration centralise les paramètres de l'API:
 * - baseUrl: URL de base de l'API (depuis les variables d'environnement ou valeur par défaut)
 * - portfolioApiPrefix: Préfixe pour tous les endpoints du microservice portfolio
 * - headers: En-têtes HTTP par défaut pour toutes les requêtes
 * - endpoints: Points d'entrée de l'API (importés depuis endpoints.ts)
 */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  portfolioApiPrefix: '/portfolio/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  endpoints: API_ENDPOINTS
};

/**
 * Construit une URL complète pour les endpoints du microservice portfolio
 * @param endpoint - L'endpoint relatif (ex: '/portfolios/traditional')
 * @returns URL complète avec base URL et préfixe
 */
export function buildPortfolioApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.portfolioApiPrefix}${cleanEndpoint}`;
}