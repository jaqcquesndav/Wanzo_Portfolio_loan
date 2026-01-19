// src/utils/validation.ts
import { TraditionalPortfolio } from '../types/traditional-portfolio';
import { PortfolioType } from '../types/portfolio';

/**
 * Valide un portefeuille traditionnel
 * Supporte les deux formats de formulaire:
 * - Ancien format: target_amount, target_sectors, risk_profile
 * - Nouveau format simplifié: initial_capital, currency, start_date
 * 
 * @param portfolio Le portefeuille à valider
 * @returns Objet contenant le résultat de la validation et les erreurs éventuelles
 */
export function validateTraditionalPortfolio(portfolio: Partial<TraditionalPortfolio>) {
  const errors: Record<string, string> = {};

  // Validation du nom - toujours requis
  if (!portfolio.name) errors.name = 'Le nom est requis';

  // Validation du montant - accepter initial_capital OU target_amount
  const amount = portfolio.initial_capital ?? portfolio.target_amount;
  if (!amount) {
    errors.amount = 'Le capital initial ou montant cible est requis';
  } else if (amount <= 0) {
    errors.amount = 'Le montant doit être supérieur à 0';
  }

  // Validation conditionnelle pour l'ancien format
  // Si target_amount est utilisé, on s'attend à avoir target_sectors et risk_profile
  if (portfolio.target_amount !== undefined) {
    if (!portfolio.target_sectors || portfolio.target_sectors.length === 0) {
      errors.target_sectors = 'Au moins un secteur cible est requis';
    }
    if (!portfolio.risk_profile) errors.risk_profile = 'Le profil de risque est requis';
  }

  // Validation conditionnelle pour le nouveau format
  // Si initial_capital est utilisé, on s'attend à avoir currency et start_date
  if (portfolio.initial_capital !== undefined) {
    if (!portfolio.currency) errors.currency = 'La devise est requise';
    if (!portfolio.start_date) errors.start_date = 'La date de démarrage est requise';
  }

  // Manager et institution - requis dans les deux cas
  if (!portfolio.manager_id) errors.manager_id = 'L\'identifiant du gestionnaire est requis';
  if (!portfolio.institution_id) errors.institution_id = 'L\'identifiant de l\'institution est requis';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valide un portefeuille selon son type
 * @param portfolio Le portefeuille à valider
 * @param type Le type de portefeuille
 * @returns Objet contenant le résultat de la validation et les erreurs éventuelles
 */
export function validatePortfolio(
  portfolio: Partial<TraditionalPortfolio>, 
  type: PortfolioType
) {
  switch (type) {
    case 'traditional':
      return validateTraditionalPortfolio(portfolio as Partial<TraditionalPortfolio>);
    default:
      return { isValid: false, errors: { type: 'Type de portefeuille non valide' } };
  }
}
