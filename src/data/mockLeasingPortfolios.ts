import type { LeasingPortfolio } from '../types/leasing';

export const mockLeasingPortfolios: LeasingPortfolio[] = [
  {
    id: 'lease-1',
    name: 'Portefeuille Équipements Industriels',
    type: 'leasing',
    status: 'active', // Portefeuille actif
    target_amount: 750000000,
    target_return: 14,
    target_sectors: ['Industrie', 'BTP', 'Transport'],
    risk_profile: 'moderate',
    products: [],
    leasing_requests: [
      {
        id: "WL-00000001",
        equipment_id: "WL-00000001",
        client_id: "CLI-001",
        client_name: "Entreprise Alpha SARL",
        request_date: "2025-05-15T10:30:00Z",
        requested_duration: 24,
        contract_type: "standard",
        monthly_budget: 250000,
        maintenance_included: true,
        insurance_included: true,
        status: "pending",
        status_date: "2025-05-15T10:30:00Z",
        notes: "Client prioritaire, traitement urgent demandé",
        technical_sheet_url: "/documents/technical-sheets/EQP-001.pdf",
        transaction_id: "TR-LR-25051500001"
      },
      {
        id: "WL-00000002",
        equipment_id: "WL-00000002",
        client_id: "CLI-002",
        client_name: "Compagnie Beta Inc.",
        request_date: "2025-05-16T14:45:00Z",
        requested_duration: 36,
        contract_type: "premium",
        monthly_budget: 350000,
        maintenance_included: true,
        insurance_included: true,
        status: "approved",
        status_date: "2025-05-18T09:20:00Z",
        technical_sheet_url: "/documents/technical-sheets/EQP-002.pdf",
        transaction_id: "TR-LR-25051600002"
      },
      {
        id: "WL-00000003",
        equipment_id: "EQP-003",
        client_id: "CLI-003",
        client_name: "Société Gamma SA",
        request_date: "2025-05-17T09:15:00Z",
        requested_duration: 12,
        contract_type: "flex",
        monthly_budget: 175000,
        maintenance_included: false,
        insurance_included: true,
        status: "rejected",
        status_date: "2025-05-19T16:30:00Z",
        notes: "Budget insuffisant pour l'équipement demandé",
        technical_sheet_url: "/documents/technical-sheets/EQP-003.pdf",
        transaction_id: "TR-LR-25051700003"
      }
    ],
    equipment_catalog: [
      {
        id: 'WL-00000001',
        name: 'Tracteur agricole XT5000',
        description: 'Tracteur polyvalent idéal pour les grandes exploitations agricoles',
        category: 'Agricole',
        manufacturer: 'AgriTech',
        model: 'XT5000',
        year: 2024,
        price: 75000000,
        condition: 'new',
        specifications: {
          puissance: '120 CV',
          carburant: 'Diesel',
          capacité: '5000 kg',
          vitesse: '40 km/h'
        },
        availability: true,
        maintenanceIncluded: true,
        warrantyDuration: 24,
        deliveryTime: 15,
        imageUrl: '/images/equipments/tracteur-xt5000.jpg'
      },
      {
        id: 'WL-00000002',
        name: 'Excavatrice BTP Pro X1',
        description: 'Excavatrice haute performance pour chantiers de grande envergure',
        category: 'Construction',
        manufacturer: 'ConstruMach',
        model: 'Pro X1',
        year: 2024,
        price: 85000000,
        condition: 'new',
        specifications: {
          poids: '12000 kg',
          puissance: '150 CV',
          profondeur_creusage: '5.5 m',
          capacité_godet: '1.2 m³'
        },
        availability: true,
        maintenanceIncluded: true,
        warrantyDuration: 36,
        deliveryTime: 30,
        imageUrl: '/images/equipments/excavatrice-prox1.jpg'
      },
      {
        id: 'WL-00000003',
        name: 'Camion Benne TD-200',
        description: 'Camion benne robuste pour transport de matériaux lourds',
        category: 'Transport',
        manufacturer: 'TransDiesel',
        model: 'TD-200',
        year: 2023,
        price: 65000000,
        condition: 'used',
        specifications: {
          charge_utile: '20 tonnes',
          puissance: '320 CV',
          carburant: 'Diesel',
          volume_benne: '16 m³'
        },
        availability: true,
        maintenanceIncluded: false,
        warrantyDuration: 12,
        deliveryTime: 7,
        imageUrl: '/images/equipments/camion-td200.jpg'
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
        id: 'EQ-000001',
        equipment_id: 'WL-00000001',
        client_id: 'CLI-001',
        client_name: 'Entreprise Alpha SARL',
        request_id: 'WL-00000001',
        start_date: '2025-01-15',
        end_date: '2027-01-15',
        monthly_payment: 3200000,
        interest_rate: 6.5,
        maintenance_included: true,
        insurance_included: true,
        status: 'active',
        nextInvoiceDate: '2025-08-15'
      },
      {
        id: 'EQ-000002',
        equipment_id: 'WL-00000002',
        client_id: 'CLI-002',
        client_name: 'Compagnie Beta Inc.',
        request_id: 'WL-00000002',
        start_date: '2025-02-10',
        end_date: '2027-02-10',
        monthly_payment: 2800000,
        interest_rate: 5.8,
        maintenance_included: true,
        insurance_included: true,
        status: 'pending',
        nextInvoiceDate: '2025-08-10'
      }
    ],
    incidents: [
      {
        id: 'INC-001',
        equipment_id: 'WL-00000001',
        reported_by: 'CLI-001',
        date_reported: '2025-04-10',
        description: 'Fuite hydraulique détectée sur le bras principal.',
        status: 'open',
        created_at: '2025-04-10',
        updated_at: '2025-04-10'
      }
    ],
    maintenances: [
      {
        id: 'MNT-001',
        equipment_id: 'WL-00000001',
        type: 'curative',
        description: 'Réparation de la fuite hydraulique.',
        scheduled_date: '2025-04-12',
        completed_date: '2025-04-13',
        status: 'completed',
        cost: 250000,
        provider: 'HydroServices',
        created_at: '2025-04-12',
        updated_at: '2025-04-13'
      }
    ],
    payments: [
      {
        id: 'PAY-20250201001',
        portfolioId: 'lease-1',
        contract_id: 'EQ-000001',
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
        portfolioId: 'lease-1',
        companyId: 'comp-1',
        period: 'T1 2024',
        kpis: { 
          type: 'Financier',
          status: 'validé'
        },
        created_at: '2024-03-31T00:00:00Z',
        updated_at: '2024-03-31T00:00:00Z'
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
    leasing_requests: [],
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
    reports: [] as import('../types/investment-portfolio').PortfolioCompanyReport[]
  }
];
