// src/adapters/centraleRisqueAdapter.ts
// Adaptateur pour convertir les données API documentées vers le format des composants existants

import type { 
  CreditRiskEntry, 
  LeasingRiskEntry, 
  InvestmentRiskEntry 
} from '../data/mockCentraleRisque';

// Types basés sur la documentation officielle de l'API
interface CreditRiskResponse {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  encours: number;
  statut: 'Actif' | 'En défaut' | 'Clôturé';
  coteCredit: string;
  incidents: number;
  creditScore: number;
  debtRatio: number;
  lastUpdated: string;
}

interface LeasingRiskResponse {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  equipmentType: string;
  valeurFinancement: number;
  statut: 'Actif' | 'En défaut' | 'Clôturé';
  coteCredit: string;
  incidents: number;
  lastUpdated: string;
}

interface InvestmentRiskResponse {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  investmentType: 'Action' | 'Obligation';
  montantInvesti: number;
  valorisation: number;
  statut: 'Performant' | 'En difficulté' | 'Clôturé';
  coteCredit: string;
  rendementActuel: number;
  lastUpdated: string;
}

/**
 * Convertit une réponse API crédit vers le format de données crédit mock
 * (Les données API sont déjà dans le bon format selon la documentation)
 */
export function adaptApiCreditToMock(apiData: CreditRiskResponse): CreditRiskEntry {
  return {
    id: apiData.id,
    companyId: apiData.companyId,
    companyName: apiData.companyName,
    sector: apiData.sector,
    institution: apiData.institution,
    encours: apiData.encours,
    statut: apiData.statut,
    coteCredit: apiData.coteCredit,
    incidents: apiData.incidents,
    creditScore: apiData.creditScore,
    debtRatio: apiData.debtRatio,
    lastUpdated: apiData.lastUpdated
  };
}

/**
 * Convertit une réponse API leasing vers le format de données leasing mock
 */
export function adaptApiLeasingToMock(apiData: LeasingRiskResponse): LeasingRiskEntry {
  return {
    id: apiData.id,
    companyId: apiData.companyId,
    companyName: apiData.companyName,
    sector: apiData.sector,
    institution: apiData.institution,
    equipmentType: apiData.equipmentType,
    valeurFinancement: apiData.valeurFinancement,
    statut: apiData.statut,
    coteCredit: apiData.coteCredit,
    incidents: apiData.incidents,
    lastUpdated: apiData.lastUpdated
  };
}

/**
 * Convertit une réponse API investissement vers le format de données investissement mock
 */
export function adaptApiInvestmentToMock(apiData: InvestmentRiskResponse): InvestmentRiskEntry {
  return {
    id: apiData.id,
    companyId: apiData.companyId,
    companyName: apiData.companyName,
    sector: apiData.sector,
    institution: apiData.institution,
    investmentType: apiData.investmentType,
    montantInvesti: apiData.montantInvesti,
    valorisation: apiData.valorisation,
    statut: apiData.statut,
    coteCredit: apiData.coteCredit,
    rendementActuel: apiData.rendementActuel,
    lastUpdated: apiData.lastUpdated
  };
}

/**
 * Adaptateur principal qui filtre et convertit les entrées par type
 */
export class CentraleRisqueAdapter {
  static getCreditData(entries: Array<CreditRiskResponse | LeasingRiskResponse | InvestmentRiskResponse>): CreditRiskEntry[] {
    return entries
      .filter((entry): entry is CreditRiskResponse => 'encours' in entry)
      .map(adaptApiCreditToMock);
  }

  static getLeasingData(entries: Array<CreditRiskResponse | LeasingRiskResponse | InvestmentRiskResponse>): LeasingRiskEntry[] {
    return entries
      .filter((entry): entry is LeasingRiskResponse => 'equipmentType' in entry)
      .map(adaptApiLeasingToMock);
  }

  static getInvestmentData(entries: Array<CreditRiskResponse | LeasingRiskResponse | InvestmentRiskResponse>): InvestmentRiskEntry[] {
    return entries
      .filter((entry): entry is InvestmentRiskResponse => 'investmentType' in entry)
      .map(adaptApiInvestmentToMock);
  }

  /**
   * Crée une nouvelle entrée API à partir des données du formulaire
   * selon les spécifications de la documentation API
   */
  static createApiEntryFromForm(formData: any, riskType: 'credit' | 'leasing' | 'investment') {
    const baseEntry = {
      companyId: formData.companyId,
      companyName: formData.companyName,
      institution: formData.institution,
      sector: formData.sector
    };

    switch (riskType) {
      case 'credit':
        return {
          ...baseEntry,
          encours: formData.encours || formData.amount || 0,
          coteCredit: formData.coteCredit || 'B',
          incidents: formData.incidents || 0,
          creditScore: formData.creditScore || 0,
          debtRatio: formData.debtRatio || 0
        };

      case 'leasing':
        return {
          ...baseEntry,
          equipmentType: formData.equipmentType || 'Non spécifié',
          valeurFinancement: formData.valeurFinancement || formData.amount || 0,
          coteCredit: formData.coteCredit || 'B',
          incidents: formData.incidents || 0
        };

      case 'investment':
        return {
          ...baseEntry,
          investmentType: formData.investmentType || 'Action',
          montantInvesti: formData.montantInvesti || formData.amount || 0,
          valorisation: formData.valorisation || formData.amount || 0,
          coteCredit: formData.coteCredit || 'B',
          rendementActuel: formData.rendementActuel || 0
        };

      default:
        throw new Error(`Type de risque non supporté: ${riskType}`);
    }
  }
}