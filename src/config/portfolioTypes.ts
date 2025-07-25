// src/config/portfolioTypes.ts
import { CreditRequestsTable } from '../components/portfolio/traditional/CreditRequestsTable';
import { CreditContractsList } from '../components/portfolio/traditional/credit-contract/CreditContractsList';
import { DisbursementsTable } from '../components/portfolio/traditional/DisbursementsTable';
import { RepaymentsTable } from '../components/portfolio/traditional/RepaymentsTable';
import { PortfolioSettingsDisplay } from '../components/portfolio/traditional/PortfolioSettingsDisplay';

// Fonction utilitaire pour vérifier la validité d'un type de portefeuille
export function isValidPortfolioType(type: string | null | undefined): boolean {
  return !!type && ['traditional'].includes(type);
}

// Fonction pour obtenir un type par défaut si le type fourni n'est pas valide
export function getDefaultPortfolioType(type?: string | null): 'traditional' {
  if (isValidPortfolioType(type)) {
    return type as 'traditional';
  }
  return 'traditional'; // Type par défaut
}

export const portfolioTypeConfig = {
  traditional: {
    label: 'Portefeuille traditionnel',
    tabs: [
      { key: 'requests', label: 'Demandes', component: CreditRequestsTable },
      { key: 'contracts', label: 'Contrats', component: CreditContractsList },
      { key: 'disbursements', label: 'Virements', component: DisbursementsTable },
      { key: 'repayments', label: 'Remboursements', component: RepaymentsTable },
      { key: 'settings', label: 'Paramètres', component: PortfolioSettingsDisplay },
    ],
    mockData: {
      products: 'mockFinancialProducts',
      requests: 'mockCreditRequests',
      disbursements: 'mockDisbursements',
      repayments: 'mockRepayments',
    },
    hook: 'useTraditionalPortfolio',
  }
};
