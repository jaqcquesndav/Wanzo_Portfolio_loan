/**
 * ENDPOINTS REGISTRY
 * 
 * Ce fichier centralise tous les endpoints de l'application avec leur documentation.
 * Il sert de référence unique pour l'API et peut être utilisé pour :
 * - Documentation automatique
 * - Tests d'intégration
 * - Validation des endpoints
 * - Génération de clients API
 */

import { API_ENDPOINTS } from '../services/api/endpoints';

// Types pour la documentation des endpoints
interface EndpointInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  authenticated: boolean;
  parameters?: {
    path?: string[];
    query?: string[];
    body?: string;
  };
  responses?: {
    [statusCode: number]: string;
  };
}

/**
 * REGISTRY COMPLET DES ENDPOINTS
 * 
 * Chaque endpoint est documenté avec :
 * - Méthode HTTP
 * - Chemin de l'endpoint
 * - Description fonctionnelle
 * - Catégorie
 * - Authentification requise
 * - Paramètres attendus
 * - Réponses possibles
 */
export const ENDPOINTS_REGISTRY: Record<string, EndpointInfo> = {
  // ===== AUTHENTIFICATION =====
  'auth.login': {
    method: 'POST',
    path: API_ENDPOINTS.auth.login,
    description: 'Authentification utilisateur avec email et mot de passe',
    category: 'Auth',
    authenticated: false,
    parameters: {
      body: 'LoginCredentials'
    },
    responses: {
      200: 'Connexion réussie avec token JWT',
      401: 'Identifiants invalides',
      422: 'Données de connexion invalides'
    }
  },

  'auth.logout': {
    method: 'POST',
    path: API_ENDPOINTS.auth.logout,
    description: 'Déconnexion utilisateur et invalidation du token',
    category: 'Auth',
    authenticated: true,
    responses: {
      200: 'Déconnexion réussie',
      401: 'Token invalide'
    }
  },

  'auth.refresh': {
    method: 'POST',
    path: API_ENDPOINTS.auth.refresh,
    description: 'Rafraîchissement du token JWT',
    category: 'Auth',
    authenticated: true,
    responses: {
      200: 'Token rafraîchi avec succès',
      401: 'Token de rafraîchissement invalide'
    }
  },

  'auth.validateInstitution': {
    method: 'POST',
    path: API_ENDPOINTS.auth.validateInstitution,
    description: 'Validation de l\'institution financière',
    category: 'Auth',
    authenticated: false,
    parameters: {
      body: 'InstitutionValidationData'
    },
    responses: {
      200: 'Institution validée',
      404: 'Institution non trouvée',
      422: 'Données d\'institution invalides'
    }
  },

  // ===== UTILISATEURS =====
  'users.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.users.getAll,
    description: 'Récupération de la liste complète des utilisateurs',
    category: 'Users',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'search', 'role', 'status']
    },
    responses: {
      200: 'Liste des utilisateurs',
      403: 'Accès non autorisé'
    }
  },

  'users.getById': {
    method: 'GET',
    path: '/users/{id}',
    description: 'Récupération des détails d\'un utilisateur spécifique',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Détails de l\'utilisateur',
      404: 'Utilisateur non trouvé',
      403: 'Accès non autorisé'
    }
  },

  'users.create': {
    method: 'POST',
    path: API_ENDPOINTS.users.create,
    description: 'Création d\'un nouveau compte utilisateur',
    category: 'Users',
    authenticated: true,
    parameters: {
      body: 'CreateUserData'
    },
    responses: {
      201: 'Utilisateur créé avec succès',
      422: 'Données utilisateur invalides',
      409: 'Email déjà utilisé'
    }
  },

  'users.update': {
    method: 'PUT',
    path: '/users/{id}',
    description: 'Mise à jour des informations utilisateur',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id'],
      body: 'UpdateUserData'
    },
    responses: {
      200: 'Utilisateur mis à jour',
      404: 'Utilisateur non trouvé',
      422: 'Données invalides'
    }
  },

  'users.delete': {
    method: 'DELETE',
    path: '/users/{id}',
    description: 'Suppression définitive d\'un compte utilisateur',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      204: 'Utilisateur supprimé',
      404: 'Utilisateur non trouvé',
      403: 'Suppression non autorisée'
    }
  },

  'users.me': {
    method: 'GET',
    path: API_ENDPOINTS.users.me,
    description: 'Utilisateur courant avec son institution (version lite ~5KB). Retourne: { user, institution, auth0Id, role, permissions }',
    category: 'Users',
    authenticated: true,
    responses: {
      200: 'Utilisateur avec institution',
      401: 'Non authentifié'
    }
  },

  'users.profile': {
    method: 'GET',
    path: API_ENDPOINTS.users.profile,
    description: 'Profil simple de l\'utilisateur courant (sans institution ~2KB)',
    category: 'Users',
    authenticated: true,
    responses: {
      200: 'Profil utilisateur simple',
      401: 'Non authentifié'
    }
  },

  'users.status': {
    method: 'PATCH',
    path: '/users/{id}/status',
    description: 'Change le statut d\'un utilisateur (active, inactive, suspended)',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id'],
      body: 'ChangeUserStatusDto'
    },
    responses: {
      200: 'Statut modifié',
      404: 'Utilisateur non trouvé',
      403: 'Action non autorisée'
    }
  },

  'users.activities': {
    method: 'GET',
    path: '/users/{id}/activities',
    description: 'Historique des activités d\'un utilisateur spécifique',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Liste des activités',
      404: 'Utilisateur non trouvé'
    }
  },

  'users.preferences.getAll': {
    method: 'GET',
    path: '/users/{id}/preferences',
    description: 'Récupère toutes les préférences d\'un utilisateur',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id'],
      query: ['category']
    },
    responses: {
      200: 'Liste des préférences'
    }
  },

  'users.preferences.set': {
    method: 'POST',
    path: '/users/{id}/preferences',
    description: 'Définit ou met à jour une préférence utilisateur',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id'],
      body: 'UserPreferenceDto'
    },
    responses: {
      201: 'Préférence créée/mise à jour'
    }
  },

  'users.sessions.getAll': {
    method: 'GET',
    path: '/users/{id}/sessions',
    description: 'Récupère toutes les sessions actives d\'un utilisateur',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Liste des sessions'
    }
  },

  'users.sessions.terminate': {
    method: 'DELETE',
    path: '/users/{id}/sessions/{sessionId}',
    description: 'Termine une session spécifique',
    category: 'Users',
    authenticated: true,
    parameters: {
      path: ['id', 'sessionId']
    },
    responses: {
      200: 'Session terminée'
    }
  },

  // ===== ENTREPRISES =====
  'companies.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.companies.getAll,
    description: 'Liste de toutes les entreprises clientes',
    category: 'Companies',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'search', 'sector', 'status', 'risk_level']
    },
    responses: {
      200: 'Liste des entreprises',
      403: 'Accès non autorisé'
    }
  },

  'companies.getById': {
    method: 'GET',
    path: '/companies/{id}',
    description: 'Détails complets d\'une entreprise spécifique',
    category: 'Companies',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Détails de l\'entreprise',
      404: 'Entreprise non trouvée'
    }
  },



  // ===== PORTEFEUILLES TRADITIONNELS =====
  'traditional.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.traditional.getAll,
    description: 'Liste de tous les portefeuilles traditionnels',
    category: 'Traditional Portfolios',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'status', 'manager_id', 'institution_id']
    },
    responses: {
      200: 'Liste des portefeuilles traditionnels',
      403: 'Accès non autorisé'
    }
  },

  'traditional.getById': {
    method: 'GET',
    path: '/portfolios/traditional/{id}',
    description: 'Détails complets d\'un portefeuille traditionnel',
    category: 'Traditional Portfolios',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Détails du portefeuille traditionnel',
      404: 'Portefeuille non trouvé'
    }
  },

  'traditional.create': {
    method: 'POST',
    path: API_ENDPOINTS.traditional.create,
    description: 'Création d\'un nouveau portefeuille traditionnel',
    category: 'Traditional Portfolios',
    authenticated: true,
    parameters: {
      body: 'CreateTraditionalPortfolioData'
    },
    responses: {
      201: 'Portefeuille traditionnel créé',
      422: 'Données de portefeuille invalides'
    }
  },

  // ===== DEMANDES DE CRÉDIT =====
  'creditRequests.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.traditional.creditRequests.getAll,
    description: 'Liste de toutes les demandes de crédit',
    category: 'Credit Requests',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'status', 'portfolioId', 'company_id', 'date_from', 'date_to']
    },
    responses: {
      200: 'Liste des demandes de crédit',
      403: 'Accès non autorisé'
    }
  },

  'creditRequests.getById': {
    method: 'GET',
    path: '/portfolios/traditional/credit-requests/{id}',
    description: 'Détails d\'une demande de crédit spécifique',
    category: 'Credit Requests',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Détails de la demande de crédit',
      404: 'Demande non trouvée'
    }
  },

  'creditRequests.create': {
    method: 'POST',
    path: API_ENDPOINTS.traditional.creditRequests.create,
    description: 'Soumission d\'une nouvelle demande de crédit',
    category: 'Credit Requests',
    authenticated: true,
    parameters: {
      body: 'CreateCreditRequestData'
    },
    responses: {
      201: 'Demande de crédit créée',
      422: 'Données de demande invalides'
    }
  },

  // ===== CONTRATS DE CRÉDIT =====
  'creditContracts.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.traditional.contracts.getAll,
    description: 'Liste de tous les contrats de crédit',
    category: 'Credit Contracts',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'status', 'portfolioId', 'company_id']
    },
    responses: {
      200: 'Liste des contrats de crédit',
      403: 'Accès non autorisé'
    }
  },

  'creditContracts.getById': {
    method: 'GET',
    path: '/portfolios/traditional/credit-contracts/{id}',
    description: 'Détails d\'un contrat de crédit spécifique',
    category: 'Credit Contracts',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Détails du contrat de crédit',
      404: 'Contrat non trouvé'
    }
  },

  'creditContracts.createFromRequest': {
    method: 'POST',
    path: API_ENDPOINTS.traditional.contracts.create,
    description: 'Création d\'un contrat de crédit à partir d\'une demande approuvée',
    category: 'Credit Contracts',
    authenticated: true,
    parameters: {
      body: 'CreateContractFromRequestData'
    },
    responses: {
      201: 'Contrat de crédit créé',
      422: 'Données de contrat invalides',
      404: 'Demande de crédit non trouvée'
    }
  },

  // ===== DÉBLOCAGES =====
  'disbursements.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.traditional.disbursements.getAll,
    description: 'Liste de tous les déblocages de fonds',
    category: 'Disbursements',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'status', 'contract_id', 'date_from', 'date_to']
    },
    responses: {
      200: 'Liste des déblocages',
      403: 'Accès non autorisé'
    }
  },

  'disbursements.getById': {
    method: 'GET',
    path: '/portfolios/traditional/disbursements/{id}',
    description: 'Détails d\'un déblocage spécifique',
    category: 'Disbursements',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Détails du déblocage',
      404: 'Déblocage non trouvé'
    }
  },

  'disbursements.create': {
    method: 'POST',
    path: API_ENDPOINTS.traditional.disbursements.create,
    description: 'Exécution d\'un nouveau déblocage de fonds',
    category: 'Disbursements',
    authenticated: true,
    parameters: {
      body: 'CreateDisbursementData'
    },
    responses: {
      201: 'Déblocage créé avec succès',
      422: 'Données de déblocage invalides',
      400: 'Montant supérieur au crédit disponible'
    }
  },

  // ===== REMBOURSEMENTS =====
  'repayments.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.traditional.repayments.getAll,
    description: 'Liste de tous les remboursements',
    category: 'Repayments',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'status', 'contract_id', 'date_from', 'date_to']
    },
    responses: {
      200: 'Liste des remboursements',
      403: 'Accès non autorisé'
    }
  },

  'repayments.getById': {
    method: 'GET',
    path: '/portfolios/traditional/repayments/{id}',
    description: 'Détails d\'un remboursement spécifique',
    category: 'Repayments',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Détails du remboursement',
      404: 'Remboursement non trouvé'
    }
  },

  'repayments.create': {
    method: 'POST',
    path: API_ENDPOINTS.traditional.repayments.create,
    description: 'Enregistrement d\'un nouveau remboursement',
    category: 'Repayments',
    authenticated: true,
    parameters: {
      body: 'CreateRepaymentData'
    },
    responses: {
      201: 'Remboursement enregistré',
      422: 'Données de remboursement invalides'
    }
  },



  // ===== PROSPECTION =====
  'prospection.opportunities.getAll': {
    method: 'GET',
    path: API_ENDPOINTS.prospection.base + '/opportunities',
    description: 'Liste de toutes les opportunités commerciales',
    category: 'Prospection',
    authenticated: true,
    parameters: {
      query: ['page', 'limit', 'status', 'value_min', 'value_max']
    },
    responses: {
      200: 'Liste des opportunités',
      403: 'Accès non autorisé'
    }
  },

  'prospection.leads.create': {
    method: 'POST',
    path: API_ENDPOINTS.prospection.base + '/leads',
    description: 'Création d\'un nouveau lead commercial',
    category: 'Prospection',
    authenticated: true,
    parameters: {
      body: 'CreateLeadData'
    },
    responses: {
      201: 'Lead créé avec succès',
      422: 'Données de lead invalides'
    }
  },

  // ===== COMMUNICATION =====
  'chat.getConversations': {
    method: 'GET',
    path: API_ENDPOINTS.messages.getConversations,
    description: 'Liste de toutes les conversations actives',
    category: 'Communication',
    authenticated: true,
    responses: {
      200: 'Liste des conversations',
      403: 'Accès non autorisé'
    }
  },

  'chat.sendMessage': {
    method: 'POST',
    path: API_ENDPOINTS.messages.sendMessage,
    description: 'Envoi d\'un nouveau message dans une conversation',
    category: 'Communication',
    authenticated: true,
    parameters: {
      body: 'SendMessageData'
    },
    responses: {
      201: 'Message envoyé',
      422: 'Données de message invalides',
      404: 'Conversation non trouvée'
    }
  },





  // ===== PARAMÈTRES APPLICATION =====
  'settings.getApplication': {
    method: 'GET',
    path: '/settings',
    description: 'Récupération des paramètres de l\'application',
    category: 'Settings',
    authenticated: true,
    responses: {
      200: 'Paramètres de l\'application (général, sécurité, notifications)',
      403: 'Accès non autorisé'
    }
  },

  'settings.updateGeneral': {
    method: 'PUT',
    path: '/settings/general',
    description: 'Mise à jour des paramètres généraux de l\'application',
    category: 'Settings',
    authenticated: true,
    parameters: {
      body: 'GeneralSettingsUpdate'
    },
    responses: {
      200: 'Paramètres généraux mis à jour',
      422: 'Données invalides'
    }
  },

  'settings.updateSecurity': {
    method: 'PUT',
    path: '/settings/security',
    description: 'Mise à jour des paramètres de sécurité',
    category: 'Settings',
    authenticated: true,
    parameters: {
      body: 'SecuritySettingsUpdate'
    },
    responses: {
      200: 'Paramètres de sécurité mis à jour',
      422: 'Données invalides'
    }
  },

  'settings.updateNotifications': {
    method: 'PUT',
    path: '/settings/notifications',
    description: 'Mise à jour des paramètres de notification',
    category: 'Settings',
    authenticated: true,
    parameters: {
      body: 'NotificationSettingsUpdate'
    },
    responses: {
      200: 'Paramètres de notification mis à jour',
      422: 'Données invalides'
    }
  },

  // ===== PARAMÈTRES PORTEFEUILLE =====
  'portfolioSettings.get': {
    method: 'GET',
    path: '/portfolios/traditional/{id}/settings',
    description: 'Récupération des paramètres d\'un portefeuille traditionnel',
    category: 'Portfolio Settings',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Paramètres du portefeuille',
      404: 'Portefeuille non trouvé'
    }
  },

  'portfolioSettings.update': {
    method: 'PUT',
    path: '/portfolios/traditional/{id}/settings',
    description: 'Mise à jour des paramètres d\'un portefeuille traditionnel',
    category: 'Portfolio Settings',
    authenticated: true,
    parameters: {
      path: ['id'],
      body: 'PortfolioSettingsUpdate'
    },
    responses: {
      200: 'Paramètres du portefeuille mis à jour',
      404: 'Portefeuille non trouvé',
      422: 'Données invalides'
    }
  },

  'portfolioSettings.reset': {
    method: 'POST',
    path: '/portfolios/traditional/{id}/settings/reset',
    description: 'Réinitialisation des paramètres d\'un portefeuille aux valeurs par défaut',
    category: 'Portfolio Settings',
    authenticated: true,
    parameters: {
      path: ['id']
    },
    responses: {
      200: 'Paramètres réinitialisés',
      404: 'Portefeuille non trouvé'
    }
  },

  // ===== TABLEAU DE BORD =====
  'dashboard.metrics.ohada': {
    method: 'GET',
    path: API_ENDPOINTS.dashboard.metrics.ohada,
    description: 'Métriques de conformité OHADA',
    category: 'Dashboard',
    authenticated: true,
    responses: {
      200: 'Métriques OHADA',
      503: 'Service de métriques indisponible'
    }
  },

  'dashboard.metrics.portfolio': {
    method: 'GET',
    path: '/metrics/portfolio/{portfolioId}',
    description: 'Métriques détaillées d\'un portefeuille',
    category: 'Dashboard',
    authenticated: true,
    parameters: {
      path: ['portfolioId']
    },
    responses: {
      200: 'Métriques du portefeuille',
      404: 'Portefeuille non trouvé'
    }
  },

  'dashboard.metrics.global': {
    method: 'GET',
    path: API_ENDPOINTS.dashboard.metrics.global,
    description: 'Vue d\'ensemble de toutes les métriques institution',
    category: 'Dashboard',
    authenticated: true,
    responses: {
      200: 'Métriques globales de l\'institution',
      403: 'Accès non autorisé'
    }
  }
};

/**
 * UTILITAIRES POUR LA GESTION DES ENDPOINTS
 */

/**
 * Récupère tous les endpoints d'une catégorie
 */
export function getEndpointsByCategory(category: string): EndpointInfo[] {
  return Object.values(ENDPOINTS_REGISTRY).filter(
    endpoint => endpoint.category === category
  );
}

/**
 * Récupère toutes les catégories disponibles
 */
export function getCategories(): string[] {
  return [...new Set(Object.values(ENDPOINTS_REGISTRY).map(e => e.category))];
}

/**
 * Recherche d'endpoints par description
 */
export function searchEndpoints(query: string): EndpointInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(ENDPOINTS_REGISTRY).filter(
    endpoint => 
      endpoint.description.toLowerCase().includes(lowercaseQuery) ||
      endpoint.path.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Génère la documentation Markdown pour un endpoint
 */
export function generateEndpointDocs(endpointKey: string): string {
  const endpoint = ENDPOINTS_REGISTRY[endpointKey];
  if (!endpoint) return '';

  let docs = `## ${endpointKey}\n\n`;
  docs += `**${endpoint.method}** \`${endpoint.path}\`\n\n`;
  docs += `${endpoint.description}\n\n`;
  docs += `**Catégorie**: ${endpoint.category}\n`;
  docs += `**Authentification**: ${endpoint.authenticated ? 'Requise' : 'Non requise'}\n\n`;

  if (endpoint.parameters) {
    docs += `### Paramètres\n\n`;
    if (endpoint.parameters.path) {
      docs += `**Path**: ${endpoint.parameters.path.join(', ')}\n`;
    }
    if (endpoint.parameters.query) {
      docs += `**Query**: ${endpoint.parameters.query.join(', ')}\n`;
    }
    if (endpoint.parameters.body) {
      docs += `**Body**: ${endpoint.parameters.body}\n`;
    }
    docs += '\n';
  }

  if (endpoint.responses) {
    docs += `### Réponses\n\n`;
    Object.entries(endpoint.responses).forEach(([code, description]) => {
      docs += `- **${code}**: ${description}\n`;
    });
    docs += '\n';
  }

  return docs;
}

/**
 * Statistiques sur les endpoints
 */
export function getEndpointStats() {
  const endpoints = Object.values(ENDPOINTS_REGISTRY);
  const methodCount = endpoints.reduce((acc, endpoint) => {
    acc[endpoint.method] = (acc[endpoint.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCount = endpoints.reduce((acc, endpoint) => {
    acc[endpoint.category] = (acc[endpoint.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: endpoints.length,
    byMethod: methodCount,
    byCategory: categoryCount,
    authenticated: endpoints.filter(e => e.authenticated).length,
    public: endpoints.filter(e => !e.authenticated).length
  };
}

// Export du registre pour usage externe
export default ENDPOINTS_REGISTRY;