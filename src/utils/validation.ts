// src/utils/validation.ts
import { TraditionalPortfolio } from '../types/traditional-portfolio';
import { PortfolioType } from '../types/portfolio';

/**
 * Valide un portefeuille traditionnel
 * @param portfolio Le portefeuille à valider
 * @returns Objet contenant le résultat de la validation et les erreurs éventuelles
 */
export function validateTraditionalPortfolio(portfolio: Partial<TraditionalPortfolio>) {
  const errors: Record<string, string> = {};

  // Validation des champs obligatoires
  if (!portfolio.name) errors.name = 'Le nom est requis';
  if (!portfolio.target_amount) errors.target_amount = 'Le montant cible est requis';
  if (!portfolio.target_sectors || portfolio.target_sectors.length === 0) {
    errors.target_sectors = 'Au moins un secteur cible est requis';
  }
  if (!portfolio.risk_profile) errors.risk_profile = 'Le profil de risque est requis';
  if (!portfolio.manager_id) errors.manager_id = 'L\'identifiant du gestionnaire est requis';
  if (!portfolio.institution_id) errors.institution_id = 'L\'identifiant de l\'institution est requis';

  // Validation des valeurs
  if (portfolio.target_amount && portfolio.target_amount <= 0) {
    errors.target_amount = 'Le montant cible doit être supérieur à 0';
  }

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
