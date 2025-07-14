import { Repayment } from '../components/portfolio/traditional/RepaymentsTable';

export const mockRepayments: Repayment[] = [
  {
    id: 'REPAY-TRAD-20250801-0001',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    dueDate: '2025-08-01T00:00:00Z',
    amount: 1250000,
    status: 'à venir',
    requestId: 'REQ-TRAD-20250701-0001',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100001',
    installmentNumber: 1,
    totalInstallments: 12,
    principal: 1125000,
    interest: 125000
  },
  {
    id: 'REPAY-TRAD-20250715-0002',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    dueDate: '2025-07-15T00:00:00Z',
    amount: 800000,
    status: 'payé',
    requestId: 'REQ-TRAD-20250628-0002',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100002',
    paymentDate: '2025-07-14T09:30:00Z',
    valueDate: '2025-07-14T00:00:00Z',
    transactionReference: 'TRXREC1407250001',
    installmentNumber: 1,
    totalInstallments: 12,
    principal: 666667,
    interest: 133333,
    
    creditAccount: {
      accountNumber: 'FR7630006000011234567890189',
      accountName: 'Institution Financière Portfolio',
      bankName: 'Banque Centrale Africaine',
      bankCode: 'BCA01',
      branchCode: 'ABIDJAN01'
    },
    
    debitAccount: {
      accountNumber: 'CI2020020200234567890123456',
      accountName: 'TransLogistics SA',
      bankName: 'Société Générale Côte d\'Ivoire',
      bankCode: 'SGCI22'
    },
    
    paymentMethod: 'virement',
    paymentReference: 'VIR-REMB-TL-07140001'
  },
  {
    id: 'REPAY-TRAD-20250710-0003',
    company: 'BTP Services',
    product: 'Crédit Equipement',
    dueDate: '2025-07-10T00:00:00Z',
    amount: 2100000,
    status: 'retard',
    requestId: 'REQ-TRAD-20250620-0003',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100003',
    installmentNumber: 1,
    totalInstallments: 24,
    principal: 1800000,
    interest: 300000,
    penalties: 105000 // 5% de pénalités de retard
  },
  {
    id: 'REPAY-TRAD-20250901-0004',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    dueDate: '2025-09-01T00:00:00Z',
    amount: 1250000,
    status: 'à venir',
    requestId: 'REQ-TRAD-20250701-0001',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100001',
    installmentNumber: 2,
    totalInstallments: 12,
    principal: 1125000,
    interest: 125000
  },
  {
    id: 'REPAY-TRAD-20250815-0005',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    dueDate: '2025-08-15T00:00:00Z',
    amount: 800000,
    status: 'à venir',
    requestId: 'REQ-TRAD-20250628-0002',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100002',
    installmentNumber: 2,
    totalInstallments: 12,
    principal: 666667,
    interest: 133333
  }
];
