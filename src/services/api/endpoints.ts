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

  // Companies
  companies: {
    base: '/companies',
    getAll: '/companies',
    getById: (id: string) => `/companies/${id}`,
    create: '/companies',
    update: (id: string) => `/companies/${id}`,
    delete: (id: string) => `/companies/${id}`,
    documents: {
      upload: (id: string) => `/companies/${id}/documents`,
      delete: (id: string, documentId: string) => `/companies/${id}/documents/${documentId}`
    },
    financials: (id: string) => `/companies/${id}/financials`,
    valuation: (id: string) => `/companies/${id}/valuation`
  },

  // Institutions
  institutions: {
    base: '/institutions',
    getAll: '/institutions',
    getById: (id: string) => `/institutions/${id}`,
    create: '/institutions',
    update: (id: string) => `/institutions/${id}`,
    delete: (id: string) => `/institutions/${id}`,
    metrics: (id: string) => `/institutions/${id}/metrics`
  },

  // Payments
  payments: {
    base: '/payments',
    getAll: '/payments',
    getById: (id: string) => `/payments/${id}`,
    create: '/payments',
    update: (id: string) => `/payments/${id}`,
    cancel: (id: string) => `/payments/${id}/cancel`,
    approve: (id: string) => `/payments/${id}/approve`,
    reject: (id: string) => `/payments/${id}/reject`,
    methods: '/payments/methods',
    schedule: '/payments/schedule'
  },

  // Risk
  risk: {
    base: '/risk',
    centralBank: '/risk/central-bank',
    companyRisk: (id: string) => `/risk/companies/${id}`,
    portfolioRisk: (id: string) => `/risk/portfolios/${id}`,
    scoring: '/risk/scoring',
    alerts: '/risk/alerts',
    create: '/risk/entries',
    update: (id: string) => `/risk/entries/${id}`,
    delete: (id: string) => `/risk/entries/${id}`
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
    },
    equipment: {
      base: (portfolioId: string) => `/portfolios/${portfolioId}/equipment`,
      create: (portfolioId: string) => `/portfolios/${portfolioId}/equipment`,
      update: (portfolioId: string, equipmentId: string) => `/portfolios/${portfolioId}/equipment/${equipmentId}`,
      delete: (portfolioId: string, equipmentId: string) => `/portfolios/${portfolioId}/equipment/${equipmentId}`
    }
  },

  // Traditional Portfolios
  traditional: {
    base: '/traditional',
    getAll: '/traditional',
    getById: (id: string) => `/traditional/${id}`,
    create: '/traditional',
    update: (id: string) => `/traditional/${id}`,
    delete: (id: string) => `/traditional/${id}`,
    contracts: {
      base: (portfolioId: string) => `/traditional/${portfolioId}/contracts`,
      getById: (portfolioId: string, contractId: string) => `/traditional/${portfolioId}/contracts/${contractId}`,
      create: (portfolioId: string) => `/traditional/${portfolioId}/contracts`,
      update: (portfolioId: string, contractId: string) => `/traditional/${portfolioId}/contracts/${contractId}`,
      delete: (portfolioId: string, contractId: string) => `/traditional/${portfolioId}/contracts/${contractId}`
    }
  },

  // Investment Portfolios
  investment: {
    base: '/investment',
    getAll: '/investment',
    getById: (id: string) => `/investment/${id}`,
    create: '/investment',
    update: (id: string) => `/investment/${id}`,
    delete: (id: string) => `/investment/${id}`,
    positions: {
      base: (portfolioId: string) => `/investment/${portfolioId}/positions`,
      getById: (portfolioId: string, positionId: string) => `/investment/${portfolioId}/positions/${positionId}`,
      create: (portfolioId: string) => `/investment/${portfolioId}/positions`,
      update: (portfolioId: string, positionId: string) => `/investment/${portfolioId}/positions/${positionId}`,
      delete: (portfolioId: string, positionId: string) => `/investment/${portfolioId}/positions/${positionId}`
    },
    transactions: {
      base: (portfolioId: string) => `/investment/${portfolioId}/transactions`,
      getById: (portfolioId: string, transactionId: string) => `/investment/${portfolioId}/transactions/${transactionId}`,
      create: (portfolioId: string) => `/investment/${portfolioId}/transactions`,
      update: (portfolioId: string, transactionId: string) => `/investment/${portfolioId}/transactions/${transactionId}`,
      delete: (portfolioId: string, transactionId: string) => `/investment/${portfolioId}/transactions/${transactionId}`
    }
  },

  // Leasing Portfolios
  leasing: {
    base: '/leasing',
    getAll: '/leasing',
    getById: (id: string) => `/leasing/${id}`,
    create: '/leasing',
    update: (id: string) => `/leasing/${id}`,
    delete: (id: string) => `/leasing/${id}`,
    contracts: {
      base: (portfolioId: string) => `/leasing/${portfolioId}/contracts`,
      getById: (portfolioId: string, contractId: string) => `/leasing/${portfolioId}/contracts/${contractId}`,
      create: (portfolioId: string) => `/leasing/${portfolioId}/contracts`,
      update: (portfolioId: string, contractId: string) => `/leasing/${portfolioId}/contracts/${contractId}`,
      delete: (portfolioId: string, contractId: string) => `/leasing/${portfolioId}/contracts/${contractId}`
    },
    assets: {
      base: (portfolioId: string) => `/leasing/${portfolioId}/assets`,
      getById: (portfolioId: string, assetId: string) => `/leasing/${portfolioId}/assets/${assetId}`,
      create: (portfolioId: string) => `/leasing/${portfolioId}/assets`,
      update: (portfolioId: string, assetId: string) => `/leasing/${portfolioId}/assets/${assetId}`,
      delete: (portfolioId: string, assetId: string) => `/leasing/${portfolioId}/assets/${assetId}`
    },
    maintenance: {
      base: (portfolioId: string) => `/leasing/${portfolioId}/maintenance`,
      getById: (portfolioId: string, maintenanceId: string) => `/leasing/${portfolioId}/maintenance/${maintenanceId}`,
      create: (portfolioId: string) => `/leasing/${portfolioId}/maintenance`,
      update: (portfolioId: string, maintenanceId: string) => `/leasing/${portfolioId}/maintenance/${maintenanceId}`,
      delete: (portfolioId: string, maintenanceId: string) => `/leasing/${portfolioId}/maintenance/${maintenanceId}`
    },
    incidents: {
      base: (portfolioId: string) => `/leasing/${portfolioId}/incidents`,
      getById: (portfolioId: string, incidentId: string) => `/leasing/${portfolioId}/incidents/${incidentId}`,
      create: (portfolioId: string) => `/leasing/${portfolioId}/incidents`,
      update: (portfolioId: string, incidentId: string) => `/leasing/${portfolioId}/incidents/${incidentId}`,
      delete: (portfolioId: string, incidentId: string) => `/leasing/${portfolioId}/incidents/${incidentId}`
    }
  },

  // Prospection
  prospection: {
    base: '/prospection',
    getAll: '/prospection',
    getById: (id: string) => `/prospection/${id}`,
    create: '/prospection',
    update: (id: string) => `/prospection/${id}`,
    delete: (id: string) => `/prospection/${id}`,
    opportunities: {
      base: '/prospection/opportunities',
      getById: (id: string) => `/prospection/opportunities/${id}`,
      create: '/prospection/opportunities',
      update: (id: string) => `/prospection/opportunities/${id}`,
      delete: (id: string) => `/prospection/opportunities/${id}`
    },
    leads: {
      base: '/prospection/leads',
      getById: (id: string) => `/prospection/leads/${id}`,
      create: '/prospection/leads',
      update: (id: string) => `/prospection/leads/${id}`,
      delete: (id: string) => `/prospection/leads/${id}`
    }
  },

  // Communication
  messages: {
    base: '/messages',
    getAll: '/messages',
    getById: (id: string) => `/messages/${id}`,
    send: '/messages',
    reply: (id: string) => `/messages/${id}/reply`,
    markAsRead: (id: string) => `/messages/${id}/read`,
    archive: (id: string) => `/messages/${id}/archive`
  },

  meetings: {
    base: '/meetings',
    getAll: '/meetings',
    getById: (id: string) => `/meetings/${id}`,
    create: '/meetings',
    update: (id: string) => `/meetings/${id}`,
    delete: (id: string) => `/meetings/${id}`,
    join: (id: string) => `/meetings/${id}/join`
  },

  // Documents
  documents: {
    base: '/documents',
    getAll: '/documents',
    getById: (id: string) => `/documents/${id}`,
    upload: '/documents/upload',
    download: (id: string) => `/documents/${id}/download`,
    delete: (id: string) => `/documents/${id}`
  },

  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    performance: '/analytics/performance',
    risk: '/analytics/risk',
    portfolio: '/analytics/portfolio',
    trends: '/analytics/trends',
    predictions: '/analytics/predictions'
  },

  // Reports
  reports: {
    base: '/reports',
    getAll: '/reports',
    getById: (id: string) => `/reports/${id}`,
    generate: '/reports/generate',
    download: (id: string) => `/reports/${id}/download`,
    preview: (id: string) => `/reports/${id}/preview`,
    schedule: '/reports/schedule'
  },

  // Settings
  settings: {
    base: '/settings',
    system: '/settings/system',
    notifications: '/settings/notifications',
    security: '/settings/security',
    appearance: '/settings/appearance',
    integrations: '/settings/integrations'
  }
} as const;