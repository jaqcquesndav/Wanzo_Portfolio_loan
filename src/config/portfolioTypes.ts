// src/config/portfolioTypes.ts
import { FinancialProductsList } from '../components/portfolio/traditional/FinancialProductsList';
import { FundingRequestsTable } from '../components/portfolio/traditional/FundingRequestsTable';
import { DisbursementsTable } from '../components/portfolio/traditional/DisbursementsTable';
import { RepaymentsTable } from '../components/portfolio/traditional/RepaymentsTable';
import { GuaranteesTable } from '../components/portfolio/traditional/GuaranteesTable';
import { EquipmentsTable } from '../components/portfolio/leasing/EquipmentsTable';
import { ContractsTable } from '../components/portfolio/leasing/ContractsTable';
import { IncidentsTable } from '../components/portfolio/leasing/IncidentsTable';
import { MaintenanceTable } from '../components/portfolio/leasing/MaintenanceTable';
import { PaymentsTable } from '../components/portfolio/leasing/PaymentsTable';
import { LeasingPortfolioSettingsDisplay } from '../components/portfolio/leasing/LeasingPortfolioSettingsDisplay';
import { AssetsTable } from '../components/portfolio/investment/AssetsTable';
import { SubscriptionsTable } from '../components/portfolio/investment/SubscriptionsTable';
import { ValuationsTable } from '../components/portfolio/investment/ValuationsTable';
import { InvestmentPortfolioSettingsDisplay } from '../components/portfolio/investment/InvestmentPortfolioSettingsDisplay';
import { PortfolioSettingsDisplay } from '../components/portfolio/traditional/PortfolioSettingsDisplay';
import { MarketSecuritiesTable } from '../components/portfolio/investment/market/MarketSecuritiesTable';

// Fonction utilitaire pour vérifier la validité d'un type de portefeuille
export function isValidPortfolioType(type: string | null | undefined): boolean {
  return !!type && ['traditional', 'investment', 'leasing'].includes(type);
}

// Fonction pour obtenir un type par défaut si le type fourni n'est pas valide
export function getDefaultPortfolioType(type?: string | null): 'traditional' | 'investment' | 'leasing' {
  if (isValidPortfolioType(type)) {
    return type as 'traditional' | 'investment' | 'leasing';
  }
  return 'traditional'; // Type par défaut
}

export const portfolioTypeConfig = {
  traditional: {
    label: 'Portefeuille traditionnel',
    tabs: [
      { key: 'products', label: 'Produits', component: FinancialProductsList },
      { key: 'requests', label: 'Demandes', component: FundingRequestsTable },
      { key: 'disbursements', label: 'Virements', component: DisbursementsTable },
      { key: 'repayments', label: 'Remb.', component: RepaymentsTable },
      { key: 'guarantees', label: 'Garanties', component: GuaranteesTable },
      { key: 'settings', label: 'Param.', component: PortfolioSettingsDisplay },
    ],
    mockData: {
      products: 'mockFinancialProducts',
      requests: 'mockFundingRequests',
      disbursements: 'mockDisbursements',
      repayments: 'mockRepayments',
      guarantees: 'mockGuarantees',
    },
    hook: 'useTraditionalPortfolio',
  },
  leasing: {
    label: 'Portefeuille de leasing',
    tabs: [
      { key: 'equipments', label: 'Équipements', component: EquipmentsTable },
      { key: 'contracts', label: 'Contrats', component: ContractsTable },
      { key: 'incidents', label: 'Incidents', component: IncidentsTable },
      { key: 'maintenance', label: 'Maintenance', component: MaintenanceTable },
      { key: 'payments', label: 'Paiements', component: PaymentsTable },
      { key: 'settings', label: 'Paramètres', component: LeasingPortfolioSettingsDisplay },
    ],
    mockData: {
      equipments: 'mockEquipments',
      contracts: 'mockLeasingContracts',
      incidents: 'mockIncidents',
      maintenance: 'mockMaintenance',
      payments: 'mockPayments',
    },
    hook: 'useLeasingPortfolio',
  },
  investment: {
    label: 'Portefeuille d\'investissement',
    tabs: [
      { key: 'market', label: 'Marché', component: MarketSecuritiesTable },
      { key: 'assets', label: 'Actifs', component: AssetsTable },
      { key: 'subscriptions', label: 'Souscriptions', component: SubscriptionsTable },
      { key: 'valuations', label: 'Valorisation', component: ValuationsTable },
      { key: 'settings', label: 'Paramètres', component: InvestmentPortfolioSettingsDisplay },
    ],
    mockData: {
      assets: 'mockAssets',
      subscriptions: 'mockSubscriptions',
      valuations: 'mockValuations',
      market: 'mockMarketSecurities', // Ajout des données pour le marché
    },
    hook: 'useInvestmentPortfolio',
  },
};
