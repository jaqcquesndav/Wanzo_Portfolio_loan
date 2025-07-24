// src/services/api/index.ts
import { apiClient } from './base.api';

// Exporter l'API client de base
export { apiClient };

// Exporter les services API partagés
export * from './shared';

// Exporter les services API par type de portefeuille
export * from './traditional';
export * from './investment';
export * from './leasing';

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
