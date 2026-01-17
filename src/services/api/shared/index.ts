// src/services/api/shared/index.ts
export * from './chat.api';
export * from './company.api';
export * from './centrale-risque.api';
export * from './institution.api';
export * from './notifications.api';
export * from './payment.api';
export * from './portfolio.api';
export * from './portfolio-accounts.api';
export * from './risk.api';
export * from './risk-statistics.api';
export * from './user.api';

/**
 * Services API partagés
 * 
 * Ce module expose les services API partagés entre tous les types de portefeuilles:
 * - chatApi: Gestion des messages et conversations de chat
 * - companyApi: Gestion des entreprises
 * - centraleRisqueApi / centraleRisqueApiV2: Centrale des risques
 * - institutionApi: Gestion des institutions financières
 * - notificationsApi: Gestion des notifications
 * - paymentApi: Gestion des paiements
 * - portfolioApi: Fonctionnalités communes aux portefeuilles
 * - riskApi: Gestion des risques (evaluation)
 * - riskStatisticsApi: Statistiques de risque OHADA/BCC (PAR, NPL, provisions)
 * - userApi: Gestion des utilisateurs (profils, rôles, etc.)
 * 
 * Note: L'authentification et le 2FA sont gérés par Auth0 côté backend
 */
