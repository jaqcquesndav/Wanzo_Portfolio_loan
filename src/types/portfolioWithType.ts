// src/types/portfolioWithType.ts
import type { Portfolio } from './portfolio';

/**
 * Interface qui étend Portfolio pour inclure tous les types de portefeuilles
 * @description Cette interface permet le stockage polyvalent de différents types de portefeuilles
 * tout en conservant une typage fort pour les champs spécifiques à chaque type
 */
export interface PortfolioWithType extends Portfolio {
  // Champs pour les portefeuilles traditionnels sont déjà dans Portfolio
  
  // Signature d'index pour compatibilité avec le stockage
  [key: string]: unknown;
}
