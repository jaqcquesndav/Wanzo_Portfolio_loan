import type { Company, CompanySize, CompanyStatus } from '../types/company';
import { getMockTreasuryData } from './mockTreasuryData';

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
  
  // Récupérer les données de trésorerie pour extraire les comptes bancaires
  const treasuryData = getMockTreasuryData(company.id);
  const bankAccounts = treasuryData?.accounts
    .filter(acc => acc.type === 'bank')
    .map((acc, index) => ({
      accountNumber: acc.accountNumber || `CD39-${company.id}-${index}`,
      accountName: company.name,
      bankName: acc.bankName || 'Banque Inconnue',
      swiftCode: acc.bankName ? `${acc.bankName.substring(0, 4).toUpperCase()}CDKI` : undefined,
      currency: acc.currency,
      isPrimary: index === 0
    }));
  
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
      annual_revenue: safeNumber(company.annual_revenue),
      revenue_growth: safeNumber(safeGet(financialMetrics, 'revenue_growth')),
      profit_margin: safeNumber(safeGet(financialHighlights, 'operatingMargin')),
      cash_flow: safeNumber(safeGet(financialHighlights, 'ebitda')),
      debt_ratio: 0.3,
      working_capital: safeNumber(safeGet(financialHighlights, 'totalAssets')),
      credit_score: company.creditRating === 'A' ? 85 : company.creditRating === 'B' ? 75 : 65,
      financial_rating: (safeString(company.creditRating) || 'C') as 'A' | 'B' | 'C' | 'D',
      ebitda: safeNumber(safeGet(financialHighlights, 'ebitda')),
      treasury_data: treasuryData // Ajouter données de trésorerie
    },
    contact_info: {
      email: `contact@${company.name.toLowerCase().replace(/\s+/g, '')}.cd`,
      phone: `+243 ${80 + Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      address: `${Math.floor(Math.random() * 500) + 1} Avenue de la République, Kinshasa, RDC`,
      website: safeString(safeGet(socialMedia, 'website'))
    },
    legal_info: {
      legalForm: company.size === 'large' ? 'SA' : company.size === 'medium' ? 'SARL' : 'SPRL',
      rccm: `CD/KIN/${new Date().getFullYear()}/${company.id}`,
      taxId: `A${Math.floor(Math.random() * 900000) + 100000}${company.id.replace('COMP-', '')}`,
      yearFounded: 2024 - Math.floor(Math.random() * 15)
    },
    payment_info: bankAccounts && bankAccounts.length > 0 ? {
      preferredMethod: 'bank',
      bankAccounts: bankAccounts,
      mobileMoneyAccounts: [
        {
          phoneNumber: `+243 ${80 + Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
          accountName: company.name,
          provider: 'Orange Money',
          currency: 'CDF',
          isPrimary: false
        }
      ]
    } : undefined,
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