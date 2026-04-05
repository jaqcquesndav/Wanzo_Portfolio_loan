// src/adapters/centraleRisqueAdapter.ts
// Converts backend RiskEntry objects to the component-facing legacy format.

import type { RiskEntry } from '../types/centrale-risque';
import type {
  CreditRiskEntry,
  LeasingRiskEntry,
  InvestmentRiskEntry,
} from '../data/mockCentraleRisque';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Maps RiskCategory enum → letter grade used by legacy UI components */
function categoryToGrade(category: string | undefined): string {
  switch (category) {
    case 'low':       return 'A';
    case 'medium':    return 'B';
    case 'high':      return 'C';
    case 'very_high': return 'D';
    default:          return 'B';
  }
}

/** Maps RiskEntryStatus → French status label for credit/leasing */
function statusToStatutCredit(status: string | undefined): 'Actif' | 'En défaut' | 'Clôturé' {
  switch (status) {
    case 'active':       return 'Actif';
    case 'defaulted':    return 'En défaut';
    case 'closed':
    case 'restructured': return 'Clôturé';
    default:             return 'Actif';
  }
}

/** Maps RiskEntryStatus → French status label for investment */
function statusToStatutInvestment(status: string | undefined): 'Performant' | 'En difficulté' | 'Clôturé' {
  switch (status) {
    case 'active':       return 'Performant';
    case 'defaulted':    return 'En difficulté';
    case 'closed':
    case 'restructured': return 'Clôturé';
    default:             return 'Performant';
  }
}

/** Counts missed payments from paymentHistory */
function countIncidents(entry: RiskEntry): number {
  if (!Array.isArray(entry.paymentHistory)) return 0;
  return entry.paymentHistory.filter((p) => p.status === 'missed').length;
}

// ── Individual adapters ───────────────────────────────────────────────────────

export function adaptApiCreditToMock(entry: RiskEntry): CreditRiskEntry {
  return {
    id: entry.id,
    companyId: entry.companyId,
    companyName: entry.companyName,
    sector: entry.sector ?? '',
    institution: entry.institution ?? '',
    encours: Number(entry.amount ?? 0),
    statut: statusToStatutCredit(entry.status as string),
    coteCredit: categoryToGrade(entry.category as string),
    incidents: countIncidents(entry),
    creditScore: entry.creditScore ?? 0,
    debtRatio: Number(entry.riskScore ?? 0),
    lastUpdated: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : new Date().toISOString(),
    createdBy: entry.createdBy,
  };
}

export function adaptApiLeasingToMock(entry: RiskEntry): LeasingRiskEntry {
  return {
    id: entry.id,
    companyId: entry.companyId,
    companyName: entry.companyName,
    sector: entry.sector ?? '',
    institution: entry.institution ?? '',
    equipmentType: (entry.collateral as any)?.type ?? 'Non spécifié',
    valeurFinancement: Number(entry.amount ?? 0),
    statut: statusToStatutCredit(entry.status as string),
    coteCredit: categoryToGrade(entry.category as string),
    incidents: countIncidents(entry),
    lastUpdated: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : new Date().toISOString(),
    createdBy: entry.createdBy,
  };
}

export function adaptApiInvestmentToMock(entry: RiskEntry): InvestmentRiskEntry {
  return {
    id: entry.id,
    companyId: entry.companyId,
    companyName: entry.companyName,
    sector: entry.sector ?? '',
    institution: entry.institution ?? '',
    investmentType: 'Action',
    montantInvesti: Number(entry.amount ?? 0),
    valorisation: Number(entry.amount ?? 0),
    statut: statusToStatutInvestment(entry.status as string),
    coteCredit: categoryToGrade(entry.category as string),
    rendementActuel: Number(entry.riskScore ?? 0),
    lastUpdated: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : new Date().toISOString(),
    createdBy: entry.createdBy,
  };
}

// ── Main adapter class ────────────────────────────────────────────────────────

/**
 * Converts a flat RiskEntry[] (discriminated by riskType) to the legacy
 * component-facing types used by CreditRiskTable / LeasingRiskTable / InvestmentRiskTable.
 */
export class CentraleRisqueAdapter {
  static getCreditData(entries: RiskEntry[]): CreditRiskEntry[] {
    return entries
      .filter((e) => e.riskType === 'credit')
      .map(adaptApiCreditToMock);
  }

  static getLeasingData(entries: RiskEntry[]): LeasingRiskEntry[] {
    return entries
      .filter((e) => e.riskType === 'leasing')
      .map(adaptApiLeasingToMock);
  }

  static getInvestmentData(entries: RiskEntry[]): InvestmentRiskEntry[] {
    return entries
      .filter((e) => e.riskType === 'investment')
      .map(adaptApiInvestmentToMock);
  }

  /**
   * Builds a CreateRiskEntryDto-compatible payload from a form.
   * Uses actual backend field names.
   */
  static createApiEntryFromForm(formData: any, riskType: 'credit' | 'leasing' | 'investment') {
    return {
      companyId: formData.companyId,
      companyName: formData.companyName,
      institution: formData.institution,
      sector: formData.sector,
      riskType,
      amount: formData.amount ?? 0,
      currency: formData.currency ?? 'CDF',
      creditScore: formData.creditScore ?? 0,
      riskScore: formData.riskScore ?? formData.debtRatio ?? 0,
      category: formData.category ?? 'medium',
      description: formData.description,
      collateral: formData.collateral,
      guarantees: formData.guarantees ?? [],
    };
  }
}
