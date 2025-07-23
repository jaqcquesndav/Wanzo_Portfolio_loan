import { LeasingContract } from '../types/leasing';

export const mockLeasingContracts: LeasingContract[] = [
  {
    id: 'EQ-000001',
    equipment_id: 'WL-00000001',
    client_id: 'CLI-001',
    client_name: 'Société Industrielle Alpha',
    request_id: 'WL-00000001',
    start_date: '2025-01-15',
    end_date: '2027-01-15',
    monthly_payment: 1250.00,
    interest_rate: 3.75,
    maintenance_included: true,
    insurance_included: true,
    status: 'active',
    activationDate: '2025-01-15',
    nextInvoiceDate: '2025-08-15',
    amortization_schedule: [
      {
        date: '2025-02-15',
        amount: 1250,
        principal: 1100,
        interest: 150,
        balance: 28900
      },
      {
        date: '2025-03-15',
        amount: 1250,
        principal: 1110,
        interest: 140,
        balance: 27790
      },
      // ... autres entrées du calendrier d'amortissement
    ]
  },
  {
    id: 'EQ-000002',
    equipment_id: 'WL-00000002',
    client_id: 'CLI-002',
    client_name: 'Entreprise Beta Tech',
    request_id: 'WL-00000002',
    start_date: '2025-02-01',
    end_date: '2026-08-01',
    monthly_payment: 950.00,
    interest_rate: 4.25,
    maintenance_included: false,
    insurance_included: true,
    status: 'pending',
    nextInvoiceDate: '2025-08-01'
  },
  {
    id: 'EQ-000003',
    equipment_id: 'WL-00000003',
    client_id: 'CLI-003',
    client_name: 'Compagnie Delta Construction',
    request_id: 'WL-00000003',
    start_date: '2024-11-10',
    end_date: '2026-11-10',
    monthly_payment: 2100.00,
    interest_rate: 3.5,
    maintenance_included: true,
    insurance_included: true,
    status: 'terminated',
    activationDate: '2024-11-10',
    terminationDate: '2025-06-10',
    terminationReason: 'Retour anticipé du matériel suite à l\'achèvement du projet',
  },
  {
    id: 'LC-00004',
    equipment_id: 'EQ-13579',
    client_id: 'CL-24680',
    client_name: 'Gamma Solutions',
    request_id: 'WL-00004',
    start_date: '2024-12-05',
    end_date: '2027-12-05',
    monthly_payment: 1875.00,
    interest_rate: 3.85,
    maintenance_included: true,
    insurance_included: false,
    status: 'active',
    activationDate: '2024-12-05',
    nextInvoiceDate: '2025-08-05'
  },
  {
    id: 'LC-00005',
    equipment_id: 'EQ-97531',
    client_id: 'CL-86420',
    client_name: 'Epsilon Consulting',
    request_id: 'WL-00005',
    start_date: '2025-03-20',
    end_date: '2026-09-20',
    monthly_payment: 735.00,
    interest_rate: 4.1,
    maintenance_included: false,
    insurance_included: false,
    status: 'draft'
  }
];
