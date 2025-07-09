import type { LeasingPortfolio } from '../types/leasing';

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
    equipment_catalog: [
      {
        id: 'eq-1',
        name: 'Pelle hydraulique',
        description: 'Pelle hydraulique Caterpillar 320D, idéale pour les chantiers BTP.',
        category: 'Engin de chantier',
        manufacturer: 'Caterpillar',
        model: '320D',
        year: 2022,
        price: 120000000,
        condition: 'new',
        specifications: { puissance: '110kW', poids: '21t' },
        availability: true,
        imageUrl: 'https://dummyimage.com/400x300/cccccc/000000&text=Pelle+320D'
      },
      {
        id: 'eq-2',
        name: 'Camion benne',
        description: 'Camion benne Mercedes Actros pour transport de matériaux.',
        category: 'Véhicule industriel',
        manufacturer: 'Mercedes-Benz',
        model: 'Actros',
        year: 2021,
        price: 95000000,
        condition: 'used',
        specifications: { puissance: '330ch', volume: '18m3' },
        availability: false,
        imageUrl: 'https://dummyimage.com/400x300/cccccc/000000&text=Camion+Actros'
      }
    ],
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
      asset_utilization_rate: 87,
      average_residual_value: 12000000,
      default_rate: 2.1,
      avg_contract_duration_months: 36,
      assets_under_management: 120,
      contract_renewal_rate: 28,
      total_rent_billed: 95000000,
      collection_rate: 96.5
    },
    contracts: [
      {
        id: 'contr-1',
        equipment_id: 'eq-1',
        client_id: 'cli-1',
        start_date: '2024-01-15',
        end_date: '2027-01-15',
        monthly_payment: 3200000,
        interest_rate: 6.5,
        maintenance_included: true,
        insurance_included: true,
        status: 'active'
      }
    ],
    incidents: [
      {
        id: 'inc-1',
        equipment_id: 'eq-1',
        reported_by: 'cli-1',
        date_reported: '2024-04-10',
        description: 'Fuite hydraulique détectée sur le bras principal.',
        status: 'open',
        created_at: '2024-04-10',
        updated_at: '2024-04-10'
      }
    ],
    maintenances: [
      {
        id: 'mnt-1',
        equipment_id: 'eq-1',
        type: 'curative',
        description: 'Réparation de la fuite hydraulique.',
        scheduled_date: '2024-04-12',
        completed_date: '2024-04-13',
        status: 'completed',
        cost: 250000,
        provider: 'HydroServices',
        created_at: '2024-04-12',
        updated_at: '2024-04-13'
      }
    ],
    payments: [
      {
        id: 'pay-1',
        portfolio_id: 'lease-1',
        contract_id: 'contr-1',
        date: '2024-02-01',
        amount: 3200000,
        type: 'rent',
        status: 'paid',
        created_at: '2024-02-01',
        updated_at: '2024-02-01'
      }
    ],
    leasing_terms: {
      min_duration: 12,
      max_duration: 60,
      interest_rate_range: { min: 4.5, max: 8.5 },
      maintenance_included: true,
      insurance_required: true
    },
    created_at: '2024-02-01',
    updated_at: '2024-03-15',
    // Ajout d'un exemple de reporting pour la navigation
    reports: [
      {
        id: 'rep-1',
        period: 'T1 2024',
        type: 'Financier',
        status: 'validé'
      }
    ]
  },
  // Portefeuille vide pour test/état empty
  {
    id: 'lease-empty',
    name: 'Portefeuille Leasing Vide',
    type: 'leasing',
    status: 'inactive',
    target_amount: 0,
    target_return: 0,
    target_sectors: [],
    risk_profile: 'conservative',
    products: [],
    equipment_catalog: [],
    metrics: {
      net_value: 0,
      average_return: 0,
      risk_portfolio: 0,
      sharpe_ratio: 0,
      volatility: 0,
      alpha: 0,
      beta: 0,
      asset_allocation: [],
      performance_curve: [],
      returns: [],
      benchmark: []
    },
    contracts: [],
    incidents: [],
    maintenances: [],
    payments: [],
    leasing_terms: {
      min_duration: 0,
      max_duration: 0,
      interest_rate_range: { min: 0, max: 0 },
      maintenance_included: false,
      insurance_required: false
    },
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    reports: []
  }
];
