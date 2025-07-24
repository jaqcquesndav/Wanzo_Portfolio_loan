// Mock data pour les valorisations d'actifs
export const mockValuations = [
  {
    id: 'VAL-INV-20250715-001',
    date: '2025-07-15T18:00:00Z',
    assetId: 'ASSET-INV-001',
    assetName: 'Actions société Tech Innovations',
    portfolioId: 'investment-1',
    portfolioName: 'Portefeuille Actions Tech',
    previousValue: 5650000, // Valeur précédente
    value: 5750000, // Nouvelle valeur
    change: 1.77, // Changement en pourcentage
    units: 1000,
    unitPriceBefore: 5650,
    unitPriceAfter: 5750,
    currency: 'XOF',
    valuationType: 'quotidienne',
    source: 'BRVM closing price',
    validator: 'Système automatique'
  },
  {
    id: 'VAL-INV-20250715-002',
    date: '2025-07-15T18:00:00Z',
    assetId: 'ASSET-INV-002',
    assetName: 'Obligations d\'État 5 ans',
    portfolioId: 'investment-2',
    portfolioName: 'Portefeuille Obligations',
    previousValue: 10300000,
    value: 10350000,
    change: 0.49,
    units: 100,
    unitPriceBefore: 103000,
    unitPriceAfter: 103500,
    currency: 'XOF',
    valuationType: 'quotidienne',
    source: 'BRVM closing price',
    validator: 'Système automatique'
  },
  {
    id: 'VAL-INV-20250715-003',
    date: '2025-07-15T18:00:00Z',
    assetId: 'ASSET-INV-003',
    assetName: 'Fonds Commun Afrique Croissance',
    portfolioId: 'investment-3',
    portfolioName: 'Portefeuille Fonds Diversifiés',
    previousValue: 8050000,
    value: 8200000,
    change: 1.86,
    units: 750,
    unitPriceBefore: 10733.33,
    unitPriceAfter: 10933.33,
    currency: 'XOF',
    valuationType: 'quotidienne',
    source: 'Valeur Liquidative',
    validator: 'Afrique Gestion d\'Actifs'
  }
];
