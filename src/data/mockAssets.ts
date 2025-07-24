// Mock data pour les actifs d'investissement
export const mockAssets = [
  {
    id: 'ASSET-INV-001',
    name: 'Actions société Tech Innovations',
    type: 'actions',
    sector: 'technologie',
    portfolioId: 'investment-1',
    portfolioName: 'Portefeuille Actions Tech',
    acquisitionDate: '2025-01-15T10:00:00Z',
    initialValue: 5000000,
    currentValue: 5750000,
    quantity: 1000,
    unitPrice: 5750,
    currency: 'XOF',
    isin: 'XOF1234567890',
    marketPlace: 'BRVM',
    lastValuationDate: '2025-07-15T18:00:00Z',
    performance: {
      mtd: 3.2, // Month to date en %
      ytd: 15.0, // Year to date en %
      oneYear: null // Pas encore un an
    }
  },
  {
    id: 'ASSET-INV-002',
    name: 'Obligations d\'État 5 ans',
    type: 'obligations',
    sector: 'gouvernement',
    portfolioId: 'investment-2',
    portfolioName: 'Portefeuille Obligations',
    acquisitionDate: '2025-02-20T11:30:00Z',
    initialValue: 10000000,
    currentValue: 10350000,
    quantity: 100,
    unitPrice: 103500,
    currency: 'XOF',
    isin: 'XOF9876543210',
    marketPlace: 'BRVM',
    couponRate: 5.5,
    maturityDate: '2030-02-20T00:00:00Z',
    lastValuationDate: '2025-07-15T18:00:00Z',
    performance: {
      mtd: 0.5,
      ytd: 3.5,
      oneYear: null
    }
  },
  {
    id: 'ASSET-INV-003',
    name: 'Fonds Commun Afrique Croissance',
    type: 'fonds',
    sector: 'multi-secteurs',
    portfolioId: 'investment-3',
    portfolioName: 'Portefeuille Fonds Diversifiés',
    acquisitionDate: '2025-03-10T09:00:00Z',
    initialValue: 7500000,
    currentValue: 8200000,
    quantity: 750,
    unitPrice: 10933.33,
    currency: 'XOF',
    isin: 'XOF5432109876',
    lastValuationDate: '2025-07-15T18:00:00Z',
    fundManager: 'Afrique Gestion d\'Actifs',
    managementFee: 1.2, // en %
    performance: {
      mtd: 2.1,
      ytd: 9.3,
      oneYear: null
    }
  }
];
