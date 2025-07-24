// src/services/api/shared/index.ts
export * from './company.api';
export * from './institution.api';
export * from './payment.api';
export * from './portfolio.api';
export * from './risk.api';
export * from './user.api';

/**
 * Services API partagés
 * 
 * Ce module expose les services API partagés entre tous les types de portefeuilles:
 * - companyApi: Gestion des entreprises
 * - institutionApi: Gestion des institutions financières
 * - paymentApi: Gestion des paiements
 * - portfolioApi: Fonctionnalités communes aux portefeuilles
 * - riskApi: Gestion des risques
 * - userApi: Gestion des utilisateurs
 */
