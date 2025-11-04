// src/services/api/traditional/index.ts
/**
 * Services API pour les portefeuilles traditionnels
 * 
 * Ce module expose les services API suivants:
 * - portfolios: Gestion des portefeuilles traditionnels (CRUD, filtrage)
 * - creditRequests: Gestion des demandes de crédit (création, approbation, rejet)
 * - creditContracts: Gestion des contrats de crédit (création, visualisation, modification)
 * - payments: Gestion des paiements (création, annulation, recherche)
 * - guarantees: Gestion des garanties (création, validation, réévaluation)
 * - portfolioSettings: Gestion des paramètres du portefeuille (configuration, mise à jour)
 * - disbursements: Gestion des décaissements/virements (création, confirmation, annulation)
 * - paymentSchedules: Gestion des échéanciers de paiement (génération, suivi)
 * - documents: Gestion des documents (téléversement, validation, téléchargement)
 * - dataService: Service de données local (fallback pour développement)
 * 
 * Les services font d'abord appel à l'API distante, et en cas d'échec,
 * utilisent le service de données local comme fallback.
 */

import { traditionalPortfolioApi } from './portfolio.api';
import { creditRequestApi } from './credit-request.api';
import { creditContractApi } from './credit-contract.api';
import { paymentApi } from './payment.api';
import { guaranteeApi } from './guarantee.api';
import { portfolioSettingsApi } from './portfolio-settings.api';
import { traditionalDataService } from './dataService';
import { disbursementApi } from './disbursement.api';
import { paymentScheduleApi } from './payment-schedule.api';
import { traditionalDocumentApi } from './document.api';

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
  creditRequests: creditRequestApi,
  creditContracts: creditContractApi,
  payments: paymentApi,
  guarantees: guaranteeApi,
  portfolioSettings: portfolioSettingsApi,
  disbursements: disbursementApi,
  paymentSchedules: paymentScheduleApi,
  documents: traditionalDocumentApi,
  dataService: traditionalDataService
};

export {
  traditionalPortfolioApi as portfolioApi,
  creditRequestApi,
  creditContractApi,
  paymentApi,
  guaranteeApi,
  portfolioSettingsApi,
  disbursementApi,
  paymentScheduleApi,
  traditionalDocumentApi,
  traditionalDataService
};

// Exporter également les types depuis les fichiers API
export type {
  TraditionalPortfolio,
  FinancialProduct
} from '../../../types/traditional-portfolio';

export type {
  CreditRequest
} from '../../../types/credit';

export type {
  CreditContract
} from '../../../types/credit-contract';

export type {
  CreditPayment
} from '../../../types/credit-payment';

export type {
  Guarantee
} from '../../../types/guarantee';

export type {
  Disbursement
} from '../../../types/disbursement';

export type {
  PaymentSchedule,
  PaymentScheduleDetails
} from '../../../types/payment-schedule';

export type {
  TraditionalDocument
} from './document.api';
