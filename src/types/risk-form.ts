// src/types/risk-form.ts
// Types pour les formulaires de risque

export interface RiskFormData {
  companyId: string;
  companyName: string;
  institution: string;
  sector: string;
  amount?: number;
  encours?: number;
  montantInvesti?: number;
  valeurFinancement?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  creditScore?: number;
  scoreCredit?: number;
  collateral?: {
    type: string;
    value: number;
    description: string;
  };
  guarantees?: Array<{
    type: string;
    value: number;
    description: string;
  }>;
}