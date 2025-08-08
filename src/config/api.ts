import { API_ENDPOINTS } from '../services/api/endpoints';

/**
 * Configuration API globale
 * 
 * Cette configuration centralise les paramètres de l'API:
 * - baseUrl: URL de base de l'API (depuis les variables d'environnement ou valeur par défaut)
 * - headers: En-têtes HTTP par défaut pour toutes les requêtes
 * - endpoints: Points d'entrée de l'API (importés depuis endpoints.ts)
 */
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/portfolio',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  endpoints: API_ENDPOINTS
};