import { Disbursement } from '../types/disbursement';

export const mockDisbursements: Disbursement[] = [
  {
    id: 'DISB-TRAD-20250702-0001',
    company: 'PME Agro Sarl',
    product: 'Crédit PME 12 mois',
    amount: 15000000,
    currency: 'CDF',
    status: 'pending',
    date: '2025-07-02T11:00:00Z',
    requestId: 'REQ-TRAD-20250701-0001',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100001',
    
    debitAccount: {
      accountNumber: 'FR7630006000011234567890189',
      accountName: 'Institution Financière Portfolio',
      bankName: 'Banque Centrale Africaine',
      bankCode: 'BCA01',
      branchCode: 'ABIDJAN01'
    },
    
    beneficiary: {
      accountNumber: 'CI1010010100123456789012345',
      accountName: 'PME Agro Sarl',
      bankName: 'Banque Commerciale Africaine',
      bankCode: 'BCoA21',
      companyName: 'PME Agro Sarl',
      address: '123 Rue du Commerce, Abidjan'
    },
    
    paymentMethod: 'virement',
    description: 'Financement Crédit PME 12 mois - Réf. Contrat CRDT-100001'
  },
  {
    id: 'DISB-TRAD-20250629-0002',
    company: 'TransLogistics',
    product: 'Crédit Trésorerie',
    amount: 8000000,
    currency: 'CDF',
    status: 'completed',
    date: '2025-06-29T09:00:00Z',
    requestId: 'REQ-TRAD-20250628-0002',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100002',
    transactionReference: 'TRXVIR2506250001',
    valueDate: '2025-06-30T00:00:00Z',
    executionDate: '2025-06-29T14:30:00Z',
    
    debitAccount: {
      accountNumber: 'FR7630006000011234567890189',
      accountName: 'Institution Financière Portfolio',
      bankName: 'Banque Centrale Africaine',
      bankCode: 'BCA01',
      branchCode: 'ABIDJAN01'
    },
    
    beneficiary: {
      accountNumber: 'CI2020020200234567890123456',
      accountName: 'TransLogistics SA',
      bankName: 'Société Générale Côte d\'Ivoire',
      bankCode: 'SGCI22',
      swiftCode: 'SGCICIAB',
      companyName: 'TransLogistics',
      address: '45 Boulevard Industriel, Zone Portuaire, Abidjan'
    },
    
    paymentMethod: 'virement',
    paymentReference: 'VIR-TL-06250001',
    description: 'Décaissement Crédit Trésorerie - Réf. Contrat CRDT-100002'
  },
  {
    id: 'DISB-TRAD-20250615-0003',
    company: 'BTP Services',
    product: 'Crédit Equipement',
    amount: 24000000,
    currency: 'CDF',
    status: 'completed',
    date: '2025-06-15T10:15:00Z',
    requestId: 'REQ-TRAD-20250620-0003',
    portfolioId: 'qf3081zdd',
    contractReference: 'CRDT-100003',
    transactionReference: 'TRXVIR1506250003',
    valueDate: '2025-06-16T00:00:00Z',
    executionDate: '2025-06-15T16:45:00Z',
    
    debitAccount: {
      accountNumber: 'FR7630006000011234567890189',
      accountName: 'Institution Financière Portfolio',
      bankName: 'Banque Centrale Africaine',
      bankCode: 'BCA01',
      branchCode: 'ABIDJAN01'
    },
    
    beneficiary: {
      accountNumber: 'CI3030030300345678901234567',
      accountName: 'BTP Services SARL',
      bankName: 'NSIA Banque',
      bankCode: 'NSIA23',
      swiftCode: 'NSIACIAB',
      companyName: 'BTP Services',
      address: '78 Avenue des Entrepreneurs, Yopougon, Abidjan'
    },
    
    paymentMethod: 'virement',
    paymentReference: 'VIR-BTP-06150003',
    description: 'Financement Crédit Équipement - Réf. Contrat CRDT-100003'
  }
];
