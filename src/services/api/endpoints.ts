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
    profile: '/users/profile',
    preferences: '/users/me/preferences',
    resetPassword: (id: string) => `/users/${id}/reset-password`,
    status: (id: string) => `/users/${id}/status`,
    activities: (id: string) => `/users/${id}/activities`,
    userPreferences: {
      getAll: (id: string) => `/users/${id}/preferences`,
      getByCategory: (id: string, category: string) => `/users/${id}/preferences/${category}`,
      set: (id: string) => `/users/${id}/preferences`,
      delete: (id: string, preferenceId: string) => `/users/${id}/preferences/${preferenceId}`
    },
    sessions: {
      getAll: (id: string) => `/users/${id}/sessions`,
      terminate: (id: string, sessionId: string) => `/users/${id}/sessions/${sessionId}`,
      terminateAll: (id: string) => `/users/${id}/sessions`
    },
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
    metrics: (id: string) => `/portfolios/traditional/${id}/metrics`,
    products: (id: string) => `/portfolios/traditional/${id}/products`,
    // Workflow portfolio
    activate: (id: string) => `/portfolios/traditional/${id}/activate`,
    suspend: (id: string) => `/portfolios/traditional/${id}/suspend`,
    close: (id: string) => `/portfolios/traditional/${id}/close`,
    listForSale: (id: string) => `/portfolios/traditional/${id}/list-for-sale`,
    archive: (id: string) => `/portfolios/traditional/${id}/archive`,
    updateStatus: (id: string) => `/portfolios/traditional/${id}/status`,
    contracts: {
      base: '/portfolios/traditional/credit-contracts',
      getAll: '/portfolios/traditional/credit-contracts',
      getById: (id: string) => `/portfolios/traditional/credit-contracts/${id}`,
      create: '/portfolios/traditional/credit-contracts/from-request',
      update: (id: string) => `/portfolios/traditional/credit-contracts/${id}`,
      // Workflow contrat
      activate: (id: string) => `/portfolios/traditional/credit-contracts/${id}/activate`,
      suspend: (id: string) => `/portfolios/traditional/credit-contracts/${id}/suspend`,
      default: (id: string) => `/portfolios/traditional/credit-contracts/${id}/default`,
      restructure: (id: string) => `/portfolios/traditional/credit-contracts/${id}/restructure`,
      litigation: (id: string) => `/portfolios/traditional/credit-contracts/${id}/litigation`,
      complete: (id: string) => `/portfolios/traditional/credit-contracts/${id}/complete`,
      cancel: (id: string) => `/portfolios/traditional/credit-contracts/${id}/cancel`,
      schedule: (id: string) => `/portfolios/traditional/credit-contracts/${id}/schedule`,
    },
    creditRequests: {
      base: '/portfolios/traditional/credit-requests',
      getAll: '/portfolios/traditional/credit-requests',
      getById: (id: string) => `/portfolios/traditional/credit-requests/${id}`,
      create: '/portfolios/traditional/credit-requests',
      update: (id: string) => `/portfolios/traditional/credit-requests/${id}`,
      updateStatus: (id: string) => `/portfolios/traditional/credit-requests/${id}/status`,
      delete: (id: string) => `/portfolios/traditional/credit-requests/${id}`,
      // Workflow demande de crédit
      approve: (id: string) => `/portfolios/traditional/credit-requests/${id}/approve`,
      reject: (id: string) => `/portfolios/traditional/credit-requests/${id}/reject`,
      cancel: (id: string) => `/portfolios/traditional/credit-requests/${id}/cancel`,
    },
    fundingRequests: {
      base: '/portfolios/traditional/funding-requests',
      getAll: '/portfolios/traditional/funding-requests',
      getById: (id: string) => `/portfolios/traditional/funding-requests/${id}`,
      create: '/portfolios/traditional/funding-requests',
      update: (id: string) => `/portfolios/traditional/funding-requests/${id}`,
      updateStatus: (id: string) => `/portfolios/traditional/funding-requests/${id}/status`,
      delete: (id: string) => `/portfolios/traditional/funding-requests/${id}`,
    },
    disbursements: {
      base: '/portfolios/traditional/disbursements',
      getAll: '/portfolios/traditional/disbursements',
      getById: (id: string) => `/portfolios/traditional/disbursements/${id}`,
      create: '/portfolios/traditional/disbursements',
      update: (id: string) => `/portfolios/traditional/disbursements/${id}`,
      // Workflow décaissement
      confirm: (id: string) => `/portfolios/traditional/disbursements/${id}/confirm`,
      approve: (id: string) => `/portfolios/traditional/disbursements/${id}/approve`,
      reject: (id: string) => `/portfolios/traditional/disbursements/${id}/reject`,
      process: (id: string) => `/portfolios/traditional/disbursements/${id}/process`,
      cancel: (id: string) => `/portfolios/traditional/disbursements/${id}/cancel`,
    },
    repayments: {
      base: '/portfolios/traditional/repayments',
      getAll: '/portfolios/traditional/repayments',
      getById: (id: string) => `/portfolios/traditional/repayments/${id}`,
      create: '/portfolios/traditional/repayments',
      update: (id: string) => `/portfolios/traditional/repayments/${id}`,
      cancel: (id: string) => `/portfolios/traditional/repayments/${id}/cancel`,
      generateReceipt: (id: string) => `/portfolios/traditional/repayments/${id}/generate-receipt`,
      receipt: (id: string) => `/portfolios/traditional/repayments/${id}/receipt`,
      receiptDownload: (id: string) => `/portfolios/traditional/repayments/${id}/receipt/download`,
      hasReceipt: (id: string) => `/portfolios/traditional/repayments/${id}/has-receipt`,
      supportingDocument: (id: string) => `/portfolios/traditional/repayments/${id}/supporting-document`,
    },
    paymentSchedules: {
      base: '/portfolios/traditional/payment-schedules',
      getAll: '/portfolios/traditional/payment-schedules',
      getById: (id: string) => `/portfolios/traditional/payment-schedules/${id}`,
      create: '/portfolios/traditional/payment-schedules',
      update: (id: string) => `/portfolios/traditional/payment-schedules/${id}`,
      simulate: '/portfolios/traditional/payment-schedules/simulate',
      // Le planning d'un contrat se récupère via: GET /payment-schedules?contractId=X
      byContract: (contractId: string) => `/portfolios/traditional/payment-schedules?contractId=${contractId}`,
    },
    documents: {
      base: '/portfolios/traditional/documents',
      getAll: '/portfolios/traditional/documents',
      getById: (id: string) => `/portfolios/traditional/documents/${id}`,
      create: '/portfolios/traditional/documents',
      delete: (id: string) => `/portfolios/traditional/documents/${id}`,
    },
  },

  // Paiements unifiés (décaissements + remboursements)
  unifiedPayments: {
    base: '/unified-payments',
    process: '/unified-payments/process',
    disbursement: (contractId: string) => `/unified-payments/disbursement/${contractId}`,
    repayment: (contractId: string) => `/unified-payments/repayment/${contractId}`,
    paymentInfo: (contractId: string) => `/unified-payments/contract/${contractId}/payment-info`,
    callback: (type: 'disbursement' | 'repayment') => `/unified-payments/callback/serdipay/${type}`,
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
    send: '/messages'
  },

  // Chat ADHA - Endpoints alignés avec la documentation API
  chat: {
    base: '/chat',
    // Contextes de conversation
    contexts: {
      base: '/chat/contexts',
      getAll: '/chat/contexts',
      getById: (id: string) => `/chat/contexts/${id}`,
      create: '/chat/contexts',
      update: (id: string) => `/chat/contexts/${id}`,
      delete: (id: string) => `/chat/contexts/${id}`,
      getMessages: (contextId: string) => `/chat/contexts/${contextId}/messages`
    },
    // Messages
    messages: {
      base: '/chat/messages',
      send: '/chat/messages',
      stream: '/chat/stream', // Mode streaming - retourne immédiatement, réponse via WebSocket
      getById: (id: string) => `/chat/messages/${id}`,
      update: (id: string) => `/chat/messages/${id}`,
      rate: (messageId: string) => `/chat/messages/${messageId}/rating`,
      addAttachment: (messageId: string) => `/chat/messages/${messageId}/attachments`
    },
    // Fonctionnalités avancées
    suggestions: '/chat/suggestions',
    reports: '/chat/reports',
    predefinedResponses: '/chat/predefined-responses'
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