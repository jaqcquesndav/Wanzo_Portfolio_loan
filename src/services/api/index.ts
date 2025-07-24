// src/services/api/index.ts
import { apiClient } from './base.api';
import { traditionalApi } from './traditional';
import { investmentApi } from './investment';

/**
 * Services API pour l'application Portfolio Institution
 * 
 * Ce module expose les services API pour tous les types de portefeuilles:
 * - Services partagés (entreprises, paiements, institutions, risques)
 * - Services pour les portefeuilles traditionnels
 * - Services pour les portefeuilles d'investissement
 * - Services pour les portefeuilles de leasing
 * 
 * Chaque service API est organisé selon son type de portefeuille pour
 * faciliter la maintenance et l'extension.
 */

// Exporter l'API client de base
export { apiClient };

// Exporter les services API partagés
export * from './shared';

// Exporter les services API par type de portefeuille de manière explicite
// pour éviter les conflits de noms
export { traditionalApi } from './traditional';
export { investmentApi } from './investment';

// Créer un objet leasingApi manuellement
// Une fois les fichiers API leasing corrigés, cette structure peut être importée directement
export const leasingApi = {
  portfolios: {},
  requests: {},
  contracts: {},
  equipment: {},
  incidents: {},
  maintenance: {},
  payments: {},
  portfolioSettings: {},
  dataService: {}
};

// Exporter un objet API principal avec tous les services
export const api = {
  traditional: traditionalApi,
  leasing: leasingApi,
  investment: investmentApi
};
