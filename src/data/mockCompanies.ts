import type { Company, CompanySize, CompanyStatus } from '../types/company';

// Importer depuis le nouveau système de données
import { mockCompanies as companiesData } from './companies';

// Type générique pour les objets avec clés de chaîne
type GenericRecord = Record<string, unknown>;

// Fonction d'aide pour les conversions de type sécurisées
function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// Fonction d'accès sécurisé pour les propriétés d'objet
function safeGet(obj: unknown, key: string): unknown {
  if (obj && typeof obj === 'object' && key in obj) {
    return (obj as Record<string, unknown>)[key];
  }
  return undefined;
}

// Adapter le format pour rétrocompatibilité avec le code existant
// Garder temporairement les deux formats pour une transition progressive
export const mockCompanies: Company[] = companiesData.map(company => {
  // Accès sécurisé aux propriétés potentiellement undefined
  const financialMetrics = typeof company.financial_metrics === 'object' ? company.financial_metrics as GenericRecord : {};
  const financialHighlights = typeof company.financialHighlights === 'object' ? company.financialHighlights as GenericRecord : {};
  const socialMedia = typeof company.socialMedia === 'object' ? company.socialMedia as GenericRecord : {};
  
  return {
    id: company.id,
    name: company.name,
    sector: company.sector,
    size: (safeString(company.size) || 'small') as CompanySize,
    annual_revenue: safeNumber(company.annual_revenue),
    employee_count: safeNumber(company.employee_count),
    website_url: safeString(safeGet(socialMedia, 'website')),
    pitch_deck_url: safeString(company.pitch_deck_url),
    status: (safeString(company.status) || 'active') as CompanyStatus,
    financial_metrics: {
      revenue_growth: safeNumber(safeGet(financialMetrics, 'revenue_growth')),
      profit_margin: safeNumber(safeGet(financialHighlights, 'operatingMargin')),
      cash_flow: safeNumber(safeGet(financialHighlights, 'ebitda')),
      debt_ratio: 0.3,
      working_capital: safeNumber(safeGet(financialHighlights, 'totalAssets')),
      credit_score: company.creditRating === 'A' ? 85 : company.creditRating === 'B' ? 75 : 65,
      financial_rating: (safeString(company.creditRating) || 'C') as 'A' | 'B' | 'C' | 'D'
    },
    esg_metrics: {
      carbon_footprint: 12.5,
      environmental_rating: 'B',
      social_rating: 'A',
      governance_rating: 'B',
      gender_ratio: {
        male: 60,
        female: 40
      }
    },
    created_at: '2024-01-01',
    updated_at: '2024-03-15'
  };
});