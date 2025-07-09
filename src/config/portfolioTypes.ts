// src/config/portfolioTypes.ts
import { FinancialProductsList } from '../components/portfolio/traditional/FinancialProductsList';
import { FundingRequestsTable } from '../components/portfolio/traditional/FundingRequestsTable';
import { DisbursementsTable } from '../components/portfolio/traditional/DisbursementsTable';
import { RepaymentsTable } from '../components/portfolio/traditional/RepaymentsTable';
import { GuaranteesTable } from '../components/portfolio/traditional/GuaranteesTable';
import { ReportingTable } from '../components/portfolio/traditional/ReportingTable';
import { EquipmentsTable } from '../components/portfolio/leasing/EquipmentsTable';
import { ContractsTable } from '../components/portfolio/leasing/ContractsTable';
import { IncidentsTable } from '../components/portfolio/leasing/IncidentsTable';
import { MaintenanceTable } from '../components/portfolio/leasing/MaintenanceTable';
import { PaymentsTable } from '../components/portfolio/leasing/PaymentsTable';
import { ReportingTable as LeasingReportingTable } from '../components/portfolio/leasing/ReportingTable';
import { SettingsTable as LeasingSettingsTable } from '../components/portfolio/leasing/SettingsTable';
import { AssetsTable } from '../components/portfolio/investment/AssetsTable';
import { SubscriptionsTable } from '../components/portfolio/investment/SubscriptionsTable';
import { ValuationsTable } from '../components/portfolio/investment/ValuationsTable';
import { ReportingTable as InvestmentReportingTable } from '../components/portfolio/investment/ReportingTable';
import { SettingsTable as InvestmentSettingsTable } from '../components/portfolio/investment/SettingsTable';
import { SettingsTable as TraditionalSettingsTable } from '../components/portfolio/traditional/SettingsTable';

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
      { key: 'settings', label: 'Param.', component: TraditionalSettingsTable },
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
      { key: 'equipments', label: 'Équipements', component: EquipmentsTable },
      { key: 'contracts', label: 'Contrats', component: ContractsTable },
      { key: 'incidents', label: 'Incidents', component: IncidentsTable },
      { key: 'maintenance', label: 'Maintenance', component: MaintenanceTable },
      { key: 'payments', label: 'Paiements', component: PaymentsTable },
      { key: 'reporting', label: 'Reporting', component: LeasingReportingTable },
      { key: 'settings', label: 'Paramètres', component: LeasingSettingsTable },
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
      { key: 'assets', label: 'Actifs', component: AssetsTable },
      { key: 'subscriptions', label: 'Souscriptions', component: SubscriptionsTable },
      { key: 'valuations', label: 'Valorisation', component: ValuationsTable },
      { key: 'reporting', label: 'Reporting', component: InvestmentReportingTable },
      { key: 'settings', label: 'Paramètres', component: InvestmentSettingsTable },
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
