import { API_ENDPOINTS } from '../services/api/endpoints';

/**
 * Configuration API globale
 * 
 * Cette configuration centralise les paramètres de l'API:
 * - gatewayUrl: URL de base de l'API Gateway (pour WebSocket et services externes comme ADHA AI)
 * - baseUrl: URL de base complète de l'API Portfolio (depuis les variables d'environnement ou valeur par défaut)
 * - headers: En-têtes HTTP par défaut pour toutes les requêtes
 * - endpoints: Points d'entrée de l'API (importés depuis endpoints.ts)
 * - isProduction: Mode production (désactive les fallbacks et données mockées)
 * 
 * @see API DOCUMENTATION/chat/README.md - Section Architecture
 * 
 * Architecture des endpoints:
 * - Portfolio REST API: {baseUrl}/chat/..., {baseUrl}/portfolios/..., etc.
 * - ADHA AI Audio: {gatewayUrl}/adha-ai/audio/... (service séparé)
 * - WebSocket: {gatewayUrl} avec path '/portfolio/chat'
 */
// Vérification des variables d'environnement requises en production
const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;
const apiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD) {
  if (!gatewayUrl) console.error('⚠️ VITE_GATEWAY_URL non définie en production');
  if (!apiUrl) console.error('⚠️ VITE_API_URL non définie en production');
}

export const API_CONFIG = {
  // URL de l'API Gateway (pour WebSocket et ADHA AI Service)
  // En dev: localhost:8000, En prod: https://api.wanzo.com
  gatewayUrl: gatewayUrl || '',
  
  // URL de base de l'API Portfolio (inclut /portfolio/api/v1)
  // En dev: http://localhost:8000/portfolio/api/v1, En prod: https://api.wanzo.com/portfolio/api/v1
  baseUrl: apiUrl || '',
  
  // En-têtes HTTP par défaut
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Points d'entrée de l'API
  endpoints: API_ENDPOINTS,
  
  /**
   * Mode production - désactive les fallbacks et données mockées
   * En production: les erreurs sont propagées au lieu de créer des données locales
   * Activé par défaut pour préparer la mise en production
   */
  isProduction: import.meta.env.VITE_PRODUCTION_MODE === 'true' || import.meta.env.PROD || true,
  
  /**
   * Autoriser les fallbacks localStorage pour le mode offline
   * Désactivé par défaut en production
   */
  allowOfflineFallback: import.meta.env.VITE_ALLOW_OFFLINE_FALLBACK === 'true' || false,
};