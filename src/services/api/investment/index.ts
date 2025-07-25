// src/services/api/investment/index.ts
/**
 * Services API pour les portefeuilles d'investissement
 * 
 * Ce module expose les services API suivants:
 * - portfolio: Gestion des portefeuilles d'investissement
 * - asset: Gestion des actifs d'investissement
 * - subscription: Gestion des souscriptions
 * - valuation: Gestion des évaluations
 * - portfolioSettings: Gestion des paramètres du portefeuille
 * - market: Gestion des titres du marché
 * - dataService: Service de données local (fallback)
 */

import { portfolioApi } from './portfolio.api';
import { assetApi } from './asset.api';
import { subscriptionApi } from './subscription.api';
import { valuationApi } from './valuation.api';
import { marketApi } from './market.api';
import { portfolioSettingsApi } from './portfolio-settings.api';
import { investmentDataService } from './dataService';

// Initialise les données mock locales si nécessaire (pour le développement)
investmentDataService.initData();

export const investmentApi = {
  portfolios: portfolioApi,
  assets: assetApi,
  subscriptions: subscriptionApi,
  valuations: valuationApi,
  portfolioSettings: portfolioSettingsApi,
  market: marketApi,
  dataService: investmentDataService
};

export {
  portfolioApi,
  assetApi,
  subscriptionApi,
  valuationApi,
  portfolioSettingsApi,
  marketApi,
  investmentDataService
};
