// src/services/api/shared/index.ts
export * from './company.api';
export * from './institution.api';
export * from './notifications.api';
export * from './payment.api';
export * from './portfolio.api';
export * from './portfolio-accounts.api';
export * from './risk.api';
export * from './user.api';
export * from './users.api';

// Chat API exporté depuis le niveau supérieur
// import { chatApi } from '../chat.api';

/**
 * Services API partagés
 * 
 * Ce module expose les services API partagés entre tous les types de portefeuilles:
 * - companyApi: Gestion des entreprises
 * - institutionApi: Gestion des institutions financières
 * - notificationsApi: Gestion des notifications
 * - paymentApi: Gestion des paiements
 * - portfolioApi: Fonctionnalités communes aux portefeuilles
 * - riskApi: Gestion des risques
 * - userApi: Gestion des utilisateurs (profils, rôles, etc.)
 * - usersApi: Gestion de la sécurité des utilisateurs (mot de passe, 2FA, etc.)
 * 
 * Note: chatApi est maintenant exporté depuis src/services/api/chat.api.ts
 */
