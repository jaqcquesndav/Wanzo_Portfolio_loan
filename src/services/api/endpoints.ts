/**
 * API_ENDPOINTS
 * 
 * Cette constante définit tous les points d'entrée (endpoints) de l'API.
 * Elle sert de référence centrale pour toutes les URLs d'API utilisées dans l'application.
 * 
 * Avantages:
 * - Centralisation: Toutes les URLs sont définies à un seul endroit
 * - Maintenabilité: Facilite les modifications globales des URLs
 * - Typage: L'assertion 'as const' permet de garantir l'immutabilité et un typage précis
 * 
 * Structure:
 * Chaque section correspond à un domaine fonctionnel de l'application
 * (auth, users, portfolios, etc.) et contient les endpoints associés.
 */
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    validateInstitution: '/auth/validate-institution'
  },

  // Shared Services
  // Users
  users: {
    base: '/users',
    getAll: '/users',
    getById: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    me: '/users/me',
    preferences: '/users/me/preferences',
    resetPassword: (id: string) => `/users/${id}/reset-password`,
    portfolios: {
      assign: (userId: string) => `/users/${userId}/portfolios`,
      remove: (userId: string, portfolioId: string) => `/users/${userId}/portfolios/${portfolioId}`
    },
    roles: '/users/roles',
    permissions: '/users/permissions',
    activity: '/users/activity'
  },

  // Companies (read-only for prospection)
  companies: {
    base: '/companies',
    getAll: '/companies',
    getById: (id: string) => `/companies/${id}`,
    financials: (id: string) => `/companies/${id}/financials`,
    valuation: (id: string) => `/companies/${id}/valuation`
  },

  // Portfolios
  portfolios: {
    base: '/portfolios',
    getAll: '/portfolios',
    getById: (id: string) => `/portfolios/${id}`,
    create: '/portfolios',
    update: (id: string) => `/portfolios/${id}`,
    delete: (id: string) => `/portfolios/${id}`,
    metrics: (id: string) => `/portfolios/${id}/metrics`,
    products: {
      base: (portfolioId: string) => `/portfolios/${portfolioId}/products`,
      create: (portfolioId: string) => `/portfolios/${portfolioId}/products`,
      update: (portfolioId: string, productId: string) => `/portfolios/${portfolioId}/products/${productId}`,
      delete: (portfolioId: string, productId: string) => `/portfolios/${portfolioId}/products/${productId}`
    }
  },

  // Traditional Portfolios
  traditional: {
    base: '/portfolios/traditional',
    getAll: '/portfolios/traditional',
    getById: (id: string) => `/portfolios/traditional/${id}`,
    create: '/portfolios/traditional',
    update: (id: string) => `/portfolios/traditional/${id}`,
    delete: (id: string) => `/portfolios/traditional/${id}`,
    close: (id: string) => `/portfolios/traditional/${id}/close`,
    products: (id: string) => `/portfolios/traditional/${id}/products`,
    contracts: {
      base: '/portfolios/traditional/credit-contracts',
      getAll: '/portfolios/traditional/credit-contracts',
      getById: (id: string) => `/portfolios/traditional/credit-contracts/${id}`,
      create: '/portfolios/traditional/credit-contracts/from-request',
    },
    creditRequests: {
      base: '/portfolios/traditional/credit-requests',
      getAll: '/portfolios/traditional/credit-requests',
      getById: (id: string) => `/portfolios/traditional/credit-requests/${id}`,
      create: '/portfolios/traditional/credit-requests',
      update: (id: string) => `/portfolios/traditional/credit-requests/${id}`,
      delete: (id: string) => `/portfolios/traditional/credit-requests/${id}`
    },
    disbursements: {
      base: '/portfolios/traditional/disbursements',
      getAll: '/portfolios/traditional/disbursements',
      getById: (id: string) => `/portfolios/traditional/disbursements/${id}`,
      create: '/portfolios/traditional/disbursements',
    },
    repayments: {
      base: '/portfolios/traditional/repayments',
      getAll: '/portfolios/traditional/repayments',
      getById: (id: string) => `/portfolios/traditional/repayments/${id}`,
      create: '/portfolios/traditional/repayments',
    },
    paymentSchedules: {
      base: '/portfolios/traditional/payment-schedules',
      getAll: '/portfolios/traditional/payment-schedules',
      getById: (id: string) => `/portfolios/traditional/payment-schedules/${id}`,
      byContract: (contractId: string) => `/portfolios/traditional/payment-schedules/by-contract/${contractId}`
    },
    documents: {
      base: '/portfolios/traditional/documents',
      getAll: '/portfolios/traditional/documents',
      getById: (id: string) => `/portfolios/traditional/documents/${id}`,
      create: '/portfolios/traditional/documents',
      delete: (id: string) => `/portfolios/traditional/documents/${id}`
    }
  },

  // Prospection (includes companies access)
  prospection: {
    base: '/prospection'
  },

  // Communication (simplified)
  messages: {
    base: '/messages',
    getAll: '/messages',
    getById: (id: string) => `/messages/${id}`,
    send: '/messages',
    
    // Chat endpoints
    getConversations: '/chat/conversations',
    getMessages: '/chat/messages',
    sendMessage: '/chat/messages'
  },

  // Settings
  settings: {
    base: '/settings',
    system: '/settings/system',
    notifications: '/settings/notifications',
    security: '/settings/security',
    appearance: '/settings/appearance',
    integrations: '/settings/integrations'
  },

  // Dashboard (with integrated risk management)
  dashboard: {
    base: '/dashboard',
    // Métriques centralisées
    metrics: {
      ohada: '/metrics/ohada',
      portfolio: (portfolioId: string) => `/metrics/portfolio/${portfolioId}`,
      global: '/metrics/global'
    },
    // Conformité et risques intégrés
    compliance: {
      summary: '/compliance/summary'
    },
    risk: {
      centralBank: '/risk/central-bank',
      portfolioRisk: (id: string) => `/risk/portfolios/${id}`
    },
    // Préférences utilisateur
    preferences: {
      get: (userId: string) => `/preferences/${userId}`,
      updateWidget: (userId: string, widgetId: string) => `/preferences/${userId}/widget/${widgetId}`,
      reset: (userId: string) => `/preferences/${userId}/reset`
    }
  },

  // Synchronization
  sync: {
    base: '/sync',
    pull: '/sync/pull',
    push: '/sync/push',
    status: '/sync/status',
    reset: '/sync/reset'
  }
} as const;