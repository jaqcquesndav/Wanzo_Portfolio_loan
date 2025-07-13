export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    validateInstitution: '/auth/validate-institution'
  },

  // Operations - Supprimées

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

  // Documents
  documents: {
    upload: '/documents/upload',
    download: (id: string) => `/documents/${id}/download`,
    delete: (id: string) => `/documents/${id}`
  },

  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    performance: '/analytics/performance',
    risk: '/analytics/risk',
    portfolio: '/analytics/portfolio'
  },

  // Reports
  reports: {
    generate: '/reports/generate',
    download: (id: string) => `/reports/${id}/download`,
    preview: (id: string) => `/reports/${id}/preview`
  }
} as const;