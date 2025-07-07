import type { LeasingPortfolio } from '../lib/indexedDbPortfolioService';

export const mockLeasingPortfolios: LeasingPortfolio[] = [
  {
    id: 'lease-1',
    name: 'Portefeuille Équipements Industriels',
    type: 'leasing',
    status: 'active',
    target_amount: 750000000,
    target_return: 14,
    target_sectors: ['Industrie', 'BTP', 'Transport'],
    risk_profile: 'moderate',
    products: [],
    equipment_catalog: [],
    metrics: {
      net_value: 680000000,
      average_return: 12.8,
      risk_portfolio: 9,
      sharpe_ratio: 1.7,
      volatility: 11,
      alpha: 2.8,
      beta: 0.75,
      asset_allocation: [
        { type: 'Équipements industriels', percentage: 45 },
        { type: 'Véhicules', percentage: 35 },
        { type: 'Matériel BTP', percentage: 20 }
      ],
      performance_curve: [100, 105, 110, 120, 125, 130, 140],
      returns: [1.8, 2.2, 2.0, 2.7, 2.9, 3.1, 3.5],
      benchmark: [1.5, 2.0, 1.8, 2.2, 2.4, 2.7, 3.0],
      // --- Métriques spécifiques leasing ---
      asset_utilization_rate: 87, // en %
      average_residual_value: 12000000, // valeur résiduelle moyenne (en FCFA)
      default_rate: 2.1, // taux de défaut de paiement (%)
      avg_contract_duration_months: 36, // durée moyenne des contrats (mois)
      assets_under_management: 120, // nombre d’actifs sous gestion
      contract_renewal_rate: 28, // taux de renouvellement (%)
      total_rent_billed: 95000000, // montant total des loyers facturés (FCFA)
      collection_rate: 96.5 // taux de recouvrement (%)
    },
    created_at: '2024-02-01',
    updated_at: '2024-03-15'
  }
];
