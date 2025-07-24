// Mock data pour les paiements de leasing
export const mockLeasingPayments = [
  {
    id: 'LEAS-PAY-20250701-001',
    date: '2025-07-01T10:00:00Z',
    amount: 450000,
    equipmentId: 'EQ-LEASE-001',
    equipmentName: 'Tracteur Agricole TX-500',
    clientName: 'Ferme Moderne SARL',
    portfolioId: 'leasing-1',
    portfolioName: 'Leasing Agricole',
    status: 'completed',
    paymentMethod: 'Virement bancaire',
    receiptNumber: 'REC-20250701-001',
    transactionId: 'TR-20250701-00156',
    installmentNumber: 5,
    totalInstallments: 36
  },
  {
    id: 'LEAS-PAY-20250705-002',
    date: '2025-07-05T14:20:00Z',
    amount: 280000,
    equipmentId: 'EQ-LEASE-005',
    equipmentName: 'Chariot Élévateur FT2000',
    clientName: 'Logistique Express',
    portfolioId: 'leasing-2',
    portfolioName: 'Leasing Industriel',
    status: 'completed',
    paymentMethod: 'Prélèvement automatique',
    receiptNumber: 'REC-20250705-015',
    transactionId: 'TR-20250705-00245',
    installmentNumber: 12,
    totalInstallments: 24
  },
  {
    id: 'LEAS-PAY-20250710-003',
    date: '2025-07-10T09:15:00Z',
    amount: 750000,
    equipmentId: 'EQ-LEASE-008',
    equipmentName: 'Camion Frigorifique MK-100',
    clientName: 'Transport Alimentaire SA',
    portfolioId: 'leasing-1',
    portfolioName: 'Leasing Agricole',
    status: 'pending',
    paymentMethod: 'Chèque',
    receiptNumber: 'REC-20250710-022',
    transactionId: 'TR-20250710-00301',
    installmentNumber: 3,
    totalInstallments: 48
  }
];
