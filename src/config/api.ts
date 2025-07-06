export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      validateInstitution: '/auth/validate-institution'
    },
    users: {
      profile: '/users/profile',
      changePassword: '/users/change-password',
      resetPassword: '/users/reset-password',
      twoFactor: {
        enable: '/users/2fa/enable',
        disable: '/users/2fa/disable',
        verify: '/users/2fa/verify'
      }
    },
    operations: {
      list: '/operations',
      create: '/operations',
      details: (id: string) => `/operations/${id}`,
      update: (id: string) => `/operations/${id}`,
      delete: (id: string) => `/operations/${id}`,
      validate: (id: string) => `/operations/${id}/validate`,
      workflow: {
        start: (id: string) => `/operations/${id}/workflow/start`,
        step: (id: string, stepId: string) => `/operations/${id}/workflow/steps/${stepId}`,
        validate: (id: string, stepId: string) => `/operations/${id}/workflow/steps/${stepId}/validate`,
        token: (id: string, stepId: string) => `/operations/${id}/workflow/steps/${stepId}/token`
      }
    },
    portfolios: {
      list: '/portfolios',
      create: '/portfolios',
      details: (id: string) => `/portfolios/${id}`,
      update: (id: string) => `/portfolios/${id}`,
      delete: (id: string) => `/portfolios/${id}`,
      products: {
        list: (portfolioId: string) => `/portfolios/${portfolioId}/products`,
        create: (portfolioId: string) => `/portfolios/${portfolioId}/products`,
        update: (portfolioId: string, productId: string) => `/portfolios/${portfolioId}/products/${productId}`,
        delete: (portfolioId: string, productId: string) => `/portfolios/${portfolioId}/products/${productId}`
      }
    },
    companies: {
      list: '/companies',
      create: '/companies',
      details: (id: string) => `/companies/${id}`,
      update: (id: string) => `/companies/${id}`,
      delete: (id: string) => `/companies/${id}`,
      documents: {
        upload: (id: string) => `/companies/${id}/documents`,
        delete: (id: string, documentId: string) => `/companies/${id}/documents/${documentId}`
      }
    },
    meetings: {
      list: '/meetings',
      create: '/meetings',
      details: (id: string) => `/meetings/${id}`,
      update: (id: string) => `/meetings/${id}`,
      delete: (id: string) => `/meetings/${id}`
    },
    messages: {
      list: '/messages',
      send: '/messages',
      details: (id: string) => `/messages/${id}`,
      markAsRead: (id: string) => `/messages/${id}/read`
    },
    sync: {
      status: '/sync/status',
      push: '/sync/push',
      pull: '/sync/pull'
    }
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};