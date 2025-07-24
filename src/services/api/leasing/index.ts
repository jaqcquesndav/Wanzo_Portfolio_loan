// src/services/api/leasing/index.ts
/**
 * Services API pour les portefeuilles de leasing
 * 
 * Ce module expose les services API suivants:
 * - portfolio: Gestion des portefeuilles de leasing
 * - requests: Gestion des demandes de leasing
 * - contracts: Gestion des contrats de leasing
 * - equipment: Gestion des équipements de leasing
 * - incidents: Gestion des incidents
 * - maintenance: Gestion de la maintenance
 * - payments: Gestion des paiements
 * - portfolioSettings: Gestion des paramètres du portefeuille
 * - dataService: Service de données local (fallback)
 * - useInitData: Hook pour initialiser les données
 */

// Utiliser les exports des fichiers directement
export * from './portfolio.api';
export * from './requests.api';
export * from './contracts.api';
export * from './equipment.api';
export * from './incidents.api';
export * from './maintenance.api';
export * from './payments.api';
export * from './portfolio-settings.api';
export * from './dataService';
export * from './useInitData';

// Créer un objet vide pour l'API leasing pour l'instant
// Il faudra ajuster les exports dans chaque fichier API individuel
// pour exporter les bonnes constantes
export const leasingApi = {
  // Ces entrées seront remplies lorsque les fichiers API seront mis à jour
};
