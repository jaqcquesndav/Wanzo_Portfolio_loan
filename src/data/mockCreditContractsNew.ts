// src/data/mockCreditContractsNew.ts
import { CreditContract } from '../types/credit-contract';

/**
 * Données de contrats de crédit alignées avec l'API officielle
 */
export const mockCreditContracts: CreditContract[] = [
  {
    id: "CC-00001",
    portfolioId: "TP-00001",
    contract_number: "CONT-2025-001",
    client_id: "CL-00001",
    company_name: "Entreprise ABC",
    product_type: "Crédit PME",
    amount: 50000.00,
    interest_rate: 12.5,
    start_date: "2025-01-15T00:00:00.000Z",
    end_date: "2026-01-15T00:00:00.000Z",
    status: "active",
    amortization_method: "linear",
    terms: "Ce contrat est soumis aux conditions générales de crédit de l'institution...",
    created_at: "2025-01-10T08:00:00.000Z",
    updated_at: "2025-01-15T10:30:00.000Z",
    funding_request_id: "FR-00001"
  },
  {
    id: "CC-00002", 
    portfolioId: "TP-00001",
    contract_number: "CONT-2025-002",
    client_id: "CL-00002",
    company_name: "Société XYZ",
    product_type: "Crédit Investissement",
    amount: 75000.00,
    interest_rate: 10.0,
    start_date: "2025-01-20T00:00:00.000Z",
    end_date: "2026-07-20T00:00:00.000Z",
    status: "active",
    amortization_method: "linear",
    terms: "Ce contrat est soumis aux conditions générales de crédit de l'institution...",
    created_at: "2025-01-15T14:30:00.000Z",
    updated_at: "2025-01-20T09:15:00.000Z",
    funding_request_id: "FR-00002"
  },
  {
    id: "CC-00003",
    portfolioId: "TP-00001",
    contract_number: "CONT-2025-003",
    client_id: "CL-00003",
    company_name: "SARL Tech Solutions",
    product_type: "Crédit Équipement", 
    amount: 25000.00,
    interest_rate: 15.0,
    start_date: "2025-02-01T00:00:00.000Z",
    end_date: "2026-02-01T00:00:00.000Z",
    status: "defaulted",
    amortization_method: "linear",
    terms: "Contrat équipement informatique...",
    created_at: "2025-01-28T09:00:00.000Z",
    updated_at: "2025-03-15T16:00:00.000Z",
    funding_request_id: "FR-00003",
    default_date: "2025-03-15T16:00:00.000Z",
    default_reason: "Non-paiement pendant 3 mois consécutifs"
  },
  {
    id: "CC-00004",
    portfolioId: "TP-00001", 
    contract_number: "CONT-2025-004",
    client_id: "CL-00004",
    company_name: "Entreprise Delta",
    product_type: "Crédit PME",
    amount: 40000.00,
    interest_rate: 13.0,
    start_date: "2025-03-01T00:00:00.000Z",
    end_date: "2027-03-01T00:00:00.000Z",
    status: "restructured",
    amortization_method: "linear",
    terms: "Contrat restructuré suite à difficultés temporaires...",
    created_at: "2025-02-20T10:00:00.000Z",
    updated_at: "2025-04-15T14:30:00.000Z",
    funding_request_id: "FR-00004",
    restructuring_history: [
      {
        date: "2025-04-15T14:30:00.000Z",
        reason: "Difficultés de trésorerie temporaires",
        previous_terms: "Contrat initial avec conditions standards...",
        previous_rate: 15.0,
        previous_end_date: "2026-03-01T00:00:00.000Z"
      }
    ]
  },
  {
    id: "CC-00005",
    portfolioId: "TP-00001",
    contract_number: "CONT-2025-005", 
    client_id: "CL-00005",
    company_name: "Innovation Corp",
    product_type: "Crédit Innovation",
    amount: 100000.00,
    interest_rate: 8.5,
    start_date: "2025-03-15T00:00:00.000Z",
    end_date: "2028-03-15T00:00:00.000Z",
    status: "completed",
    amortization_method: "linear",
    terms: "Contrat innovation avec conditions préférentielles...",
    created_at: "2025-03-10T11:00:00.000Z",
    updated_at: "2025-10-20T16:00:00.000Z",
    funding_request_id: "FR-00005",
    completion_date: "2025-10-20T16:00:00.000Z"
  }
];
