import { PortfolioMetrics } from '../../types/portfolio';

export const metricsApi = {
  getDashboardMetrics: async (): Promise<PortfolioMetrics> => {
    // Simulation d'appel API
    return mockMetrics;
  }
};

const mockMetrics: PortfolioMetrics = {
  totalFundsRaised: 1500000,
  totalRepayments: 500000,
  activeInvestments: 12,
  pendingOperations: 5
};