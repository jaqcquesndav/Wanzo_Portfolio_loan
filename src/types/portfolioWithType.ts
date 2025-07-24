// src/types/portfolioWithType.ts
import type { Portfolio } from './portfolio';
import type { SecuritySubscription, CompanyValuation } from './securities';
import type { InvestmentRequest, InvestmentTransaction, PortfolioCompanyReport, ExitEvent } from './investment-portfolio';
import type { Equipment, LeasingContract } from './leasing';
import type { Incident, Maintenance } from './leasing-asset';
import type { LeasingPayment } from './leasing-payment';

/**
 * Interface qui étend Portfolio pour inclure tous les types de portefeuilles
 * @description Cette interface permet le stockage polyvalent de différents types de portefeuilles
 * tout en conservant une typage fort pour les champs spécifiques à chaque type
 */
export interface PortfolioWithType extends Portfolio {
  // Champs spécifiques pour les portefeuilles d'investissement
  assets?: unknown[];
  subscriptions?: SecuritySubscription[];
  valuations?: CompanyValuation[];
  requests?: InvestmentRequest[];
  transactions?: InvestmentTransaction[];
  reports?: PortfolioCompanyReport[];
  exitEvents?: ExitEvent[];
  
  // Champs spécifiques pour les portefeuilles de leasing
  equipment_catalog?: Equipment[];
  contracts?: LeasingContract[];
  incidents?: Incident[];
  maintenances?: Maintenance[];
  payments?: LeasingPayment[];
  
  // Champs pour les portefeuilles traditionnels sont déjà dans Portfolio
  
  // Signature d'index pour compatibilité avec le stockage
  [key: string]: unknown;
}
