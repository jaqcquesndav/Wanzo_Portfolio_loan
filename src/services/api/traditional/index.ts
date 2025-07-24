// src/services/api/traditional/index.ts
/**
 * Services API pour les portefeuilles traditionnels
 * 
 * Ce module expose les services API suivants:
 * - portfolio: Gestion des portefeuilles traditionnels
 * - fundingRequest: Gestion des demandes de financement
 * - creditContract: Gestion des contrats de crédit
 * - payment: Gestion des paiements
 * - portfolioSettings: Gestion des paramètres du portefeuille
 * - dataService: Service de données local (fallback)
 */

import { traditionalPortfolioApi } from './portfolio.api';
import { fundingRequestApi } from './funding-request.api';
import { creditContractApi } from './credit-contract.api';
import { paymentApi } from './payment.api';
import { portfolioSettingsApi } from './portfolio-settings.api';
import { traditionalDataService } from './dataService';

// Initialise les données mock locales si nécessaire (pour le développement)
traditionalDataService.initData();

export const traditionalApi = {
  portfolios: traditionalPortfolioApi,
  fundingRequests: fundingRequestApi,
  creditContracts: creditContractApi,
  payments: paymentApi,
  portfolioSettings: portfolioSettingsApi,
  dataService: traditionalDataService
};

export {
  traditionalPortfolioApi as portfolioApi,
  fundingRequestApi,
  creditContractApi,
  paymentApi,
  portfolioSettingsApi,
  traditionalDataService
};
