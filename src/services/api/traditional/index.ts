// src/services/api/traditional/index.ts
/**
 * Services API pour les portefeuilles traditionnels
 * 
 * Ce module expose les services API suivants:
 * - portfolios: Gestion des portefeuilles traditionnels (CRUD, filtrage)
 * - fundingRequests: Gestion des demandes de financement (création, approbation, rejet)
 * - creditContracts: Gestion des contrats de crédit (création, visualisation, modification)
 * - payments: Gestion des paiements (création, annulation, recherche)
 * - portfolioSettings: Gestion des paramètres du portefeuille (configuration, mise à jour)
 * - dataService: Service de données local (fallback pour développement)
 * 
 * Les services font d'abord appel à l'API distante, et en cas d'échec,
 * utilisent le service de données local comme fallback.
 */

import { traditionalPortfolioApi } from './portfolio.api';
import { fundingRequestApi } from './funding-request.api';
import { creditContractApi } from './credit-contract.api';
import { paymentApi } from './payment.api';
import { portfolioSettingsApi } from './portfolio-settings.api';
import { traditionalDataService } from './dataService';

// Initialise les données mock locales si nécessaire (pour le développement)
traditionalDataService.initData();

/**
 * Objet principal exposant tous les services API pour les portefeuilles traditionnels
 * @example 
 * import { traditionalApi } from '../services/api/traditional';
 * // Utilisation
 * const portfolios = await traditionalApi.portfolios.getAllPortfolios();
 */
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

// Exporter également les types depuis les fichiers API
export type {
  TraditionalPortfolio,
  FinancialProduct
} from '../../../types/traditional-portfolio';

export type {
  FundingRequest
} from '../../../types/funding-request';

export type {
  CreditContract
} from '../../../types/credit-contract';

export type {
  CreditPayment
} from '../../../types/credit-payment';
