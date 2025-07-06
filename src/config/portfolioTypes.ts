// src/config/portfolioTypes.ts
import { FundingRequestsTable } from '../components/portfolio/traditional/FundingRequestsTable';
import { DisbursementsTable } from '../components/portfolio/traditional/DisbursementsTable';
import { RepaymentsTable } from '../components/portfolio/traditional/RepaymentsTable';
import { GuaranteesTable } from '../components/portfolio/traditional/GuaranteesTable';
import { ReportingTable } from '../components/portfolio/traditional/ReportingTable';
import { FinancialProductsList } from '../components/portfolio/traditional/FinancialProductsList';
// Leasing et Investment à compléter

export const portfolioTypeConfig = {
  traditional: {
    label: 'Portefeuille traditionnel',
    tabs: [
      { key: 'products', label: 'Produits', component: FinancialProductsList },
      { key: 'requests', label: 'Demandes', component: FundingRequestsTable },
      { key: 'disbursements', label: 'Virements', component: DisbursementsTable },
      { key: 'repayments', label: 'Remb.', component: RepaymentsTable },
      { key: 'guarantees', label: 'Garanties', component: GuaranteesTable },
      { key: 'reporting', label: 'Reporting', component: ReportingTable },
      { key: 'settings', label: 'Param.', component: null },
    ],
    mockData: {
      products: 'mockFinancialProducts',
      requests: 'mockFundingRequests',
      disbursements: 'mockDisbursements',
      repayments: 'mockRepayments',
      guarantees: 'mockGuarantees',
      reporting: 'mockReporting',
    },
    hook: 'useTraditionalPortfolio',
  },
  leasing: {
    label: 'Portefeuille de leasing',
    tabs: [
      { key: 'equipments', label: 'Équip.', component: null },
      { key: 'contracts', label: 'Contrats', component: null },
      { key: 'incidents', label: 'Incidents', component: null },
      { key: 'maintenance', label: 'Maint.', component: null },
      { key: 'payments', label: 'Paiem.', component: null },
      { key: 'reporting', label: 'Reporting', component: null },
      { key: 'settings', label: 'Param.', component: null },
    ],
    mockData: {
      equipments: 'mockEquipments',
      contracts: 'mockLeasingContracts',
      incidents: 'mockIncidents',
      maintenance: 'mockMaintenance',
      payments: 'mockPayments',
      reporting: 'mockLeasingReporting',
    },
    hook: 'useLeasingPortfolio',
  },
  investment: {
    label: 'Portefeuille d’investissement',
    tabs: [
      { key: 'assets', label: 'Actifs', component: null },
      { key: 'subscriptions', label: 'Souscrip.', component: null },
      { key: 'valuations', label: 'Valo.', component: null },
      { key: 'reporting', label: 'Reporting', component: null },
      { key: 'settings', label: 'Param.', component: null },
    ],
    mockData: {
      assets: 'mockAssets',
      subscriptions: 'mockSubscriptions',
      valuations: 'mockValuations',
      reporting: 'mockInvestmentReporting',
    },
    hook: 'useInvestmentPortfolio',
  },
};
