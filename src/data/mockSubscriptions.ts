// Mock data pour les souscriptions d'investissement
export const mockSubscriptions = [
  {
    id: 'SUB-INV-20250705-001',
    type: 'subscription',
    date: '2025-07-05T10:00:00Z',
    assetId: 'ASSET-INV-001',
    assetName: 'Actions société Tech Innovations',
    portfolioId: 'investment-1',
    portfolioName: 'Portefeuille Actions Tech',
    clientName: 'Investisseur Privé Alpha',
    amount: 2000000,
    units: 348,
    unitPrice: 5750,
    currency: 'XOF',
    status: 'completed',
    transactionId: 'TR-SUB-20250705-001',
    fees: 20000,
    effectiveDate: '2025-07-05T16:00:00Z'
  },
  {
    id: 'SUB-INV-20250708-002',
    type: 'subscription',
    date: '2025-07-08T11:30:00Z',
    assetId: 'ASSET-INV-002',
    assetName: 'Obligations d\'État 5 ans',
    portfolioId: 'investment-2',
    portfolioName: 'Portefeuille Obligations',
    clientName: 'Société d\'Assurance Secura',
    amount: 5000000,
    units: 48,
    unitPrice: 103500,
    currency: 'XOF',
    status: 'completed',
    transactionId: 'TR-SUB-20250708-015',
    fees: 25000,
    effectiveDate: '2025-07-08T16:00:00Z'
  },
  {
    id: 'SUB-INV-20250715-003',
    type: 'redemption', // Rachat
    date: '2025-07-15T09:15:00Z',
    assetId: 'ASSET-INV-003',
    assetName: 'Fonds Commun Afrique Croissance',
    portfolioId: 'investment-3',
    portfolioName: 'Portefeuille Fonds Diversifiés',
    clientName: 'Caisse de Retraite Nationale',
    amount: 1500000,
    units: 137,
    unitPrice: 10933.33,
    currency: 'XOF',
    status: 'pending',
    transactionId: 'TR-RED-20250715-008',
    fees: 15000,
    effectiveDate: null // Pas encore effectif
  }
];
