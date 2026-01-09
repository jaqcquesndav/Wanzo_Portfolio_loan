// src/data/mockCompanyDetails.ts
// Fichier d'adaptation des données mock legacy vers le type Company
// + Registry des entreprises mockées associées aux IDs des membres

import { entrepriseAlpha, techinnovate, agritech, cleanenergy, constructionplus, healthsolutions } from './companies/index';
import { mockCompanies as flatMockCompanies } from './companies';
import type { CompanyData } from './companies';
import type {
  Company,
  CompanyDocuments,
  BankAccount,
  MobileMoneyAccount,
  Asset,
  Stock,
  SocialLink,
  LegalAspects,
  Location,
  IncubationData,
  StartupSpecifics,
  TraditionalSpecifics,
  PitchData,
  CompanySize,
  CompanyStatus,
  FinancialRating,
  ESGRating,
  LegalForm,
  PaymentInfo,
  Currency,
  ContactPerson,
  Insurance
} from '../types/company';

interface LegacyContacts {
  email?: string;
  phone?: string;
}

interface LegacyAddress {
  street?: string;
  city?: string;
  country?: string;
}

interface LegacyCoordinates {
  latitude?: number;
  longitude?: number;
}

interface LegacySocialMedia {
  website?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

interface LegacyCapital {
  amount?: number;
  currency?: string;
}

interface LegacyFinancialMetrics {
  revenue_growth?: number;
  profit_margin?: number;
  cash_flow?: number;
  debt_ratio?: number;
  working_capital?: number;
  credit_score?: number;
  ebitda?: number;
  annual_revenue?: number;
  treasury_data?: unknown;
}

interface LegacyFinancialHighlights {
  growthRate?: number;
  operatingMargin?: number;
  netIncome?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  ebitda?: number;
  equityRatio?: number;
}

interface LegacyScenario {
  lastContact?: string;
}

interface LegacyLeadershipMember {
  id?: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
}

interface LegacyExecutive {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface LegacyESG {
  esgScore?: number;
  environmental_rating?: ESGRating | string;
  social_rating?: ESGRating | string;
  governance_rating?: ESGRating | string;
  esg_rating?: ESGRating | string;
  carbon_footprint?: number;
  gender_ratio?: { male: number; female: number };
}

interface LegacyCompanyShape {
  id?: string;
  name?: string;
  sigle?: string;
  sector?: string;
  industry?: string;
  size?: CompanySize | string | number;
  status?: CompanyStatus | string;
  typeEntreprise?: string;
  country?: string;
  legalForm?: LegalForm | string;
  rccm?: string;
  taxId?: string;
  natId?: string;
  numeroIdentificationNationale?: string;
  description?: string;
  descriptionActivites?: string;
  produitsServices?: string[];
  annual_revenue?: number;
  employee_count?: number | string;
  employees?: number | string;
  website?: string;
  pitch_deck_url?: string;
  presentation_video?: string;
  contacts?: LegacyContacts;
  address?: LegacyAddress;
  coordinates?: LegacyCoordinates;
  socialMedia?: LegacySocialMedia;
  capital?: LegacyCapital & { currency?: string };
  capitalSocial?: number;
  deviseCapital?: string | Currency;
  dateCreation?: string;
  dateDebutActivites?: string;
  financial_metrics?: (LegacyFinancialMetrics & { financial_rating?: FinancialRating | string }) | Partial<Company['financial_metrics']>;
  financialHighlights?: LegacyFinancialHighlights;
  scenario?: LegacyScenario;
  leadership_team?: LegacyLeadershipMember[];
  preferredMethod?: 'bank' | 'mobile_money' | string;
  bankAccounts?: BankAccount[];
  mobileMoneyAccounts?: MobileMoneyAccount[];
  assets?: Asset[];
  stocks?: Stock[];
  reseauxSociaux?: SocialLink[];
  pretsEnCours?: unknown[];
  leveeDeFonds?: unknown[];
  legalAspects?: LegalAspects;
  documents?: CompanyDocuments | unknown[];
  securities?: unknown[];
  documentLibrary?: unknown;
  payment_info?: { 
    preferredMethod?: 'bank' | 'mobile_money' | string; 
    bankAccounts?: unknown[]; 
    mobileMoneyAccounts?: unknown[];
    assurances?: Insurance[];
  };
  esg_metrics?: LegacyESG;
  // Personnel categories
  logo_url?: string;
  dirigeants?: ContactPerson[];
  actionnaires?: ContactPerson[];
  employes?: ContactPerson[];
  // Patrimoine categories
  immobilisations?: Asset[];
  equipements?: Asset[];
  vehicules?: Asset[];
  esgScore?: number;
  esg_rating?: ESGRating | string;
  incubation?: IncubationData;
  startupSpecifics?: StartupSpecifics;
  traditionalSpecifics?: TraditionalSpecifics;
  pitch?: PitchData;
  siegeSocial?: Location;
  siegeExploitation?: Location;
  unitesProduction?: Location[];
  pointsVente?: Location[];
  telephoneFixe?: string;
  telephoneMobile?: string;
  fax?: string;
  boitePostale?: string;
  moyensTechniques?: string[];
  capaciteProduction?: string;
  organigramme?: string;
  profileCompleteness?: number;
  lastSyncFromAccounting?: string;
  lastSyncFromCustomer?: string;
  founded?: number;
  created_at?: string;
  updated_at?: string;
  pitch_deck?: string;
  elevator_pitch?: string;
  value_proposition?: string;
  target_market?: string;
  competitive_advantage?: string;
  creditRating?: FinancialRating | string;
  esgScoreHistory?: unknown;
  secteursActiviteSecondaires?: string[];
  secteursPersonalises?: string[];
  moyensFinancement?: unknown;
  lastContact?: string;
  ceo?: LegacyExecutive;
}

type LegacyCompany = Partial<CompanyData> & LegacyCompanyShape;

type LegacyCompanyRegistry = Record<string, LegacyCompany>;

/**
 * Registry qui mappe les IDs des membres aux données mockées des entreprises
 * Format: { 'mem-001': techinnovate, 'mem-002': agritech, etc. }
 */
export const mockCompanyRegistry: LegacyCompanyRegistry = {
  'mem-001': entrepriseAlpha,   // Entreprise Alpha SARL
  'mem-002': constructionplus,  // Beta Construction Inc.
  'mem-003': techinnovate,      // Delta Technologies
  'mem-004': cleanenergy,       // Gamma Retail
  'mem-005': agritech,          // Agriculteur 1
  'mem-006': healthsolutions,   // Sigma Services Ltd
  'mem-007': constructionplus,  // Omega Industries
  'mem-008': techinnovate,      // Epsilon Consulting
  'mem-009': cleanenergy,       // Zeta Logistics
  'mem-010': healthsolutions,   // Eta Education
  'mem-011': cleanenergy,       // Theta Retail
  'mem-012': techinnovate,      // Iota Innovations
  'mem-013': agritech,          // Kappa Farms
  'mem-014': constructionplus,  // Lambda Manufacturing
  'mem-015': agritech,          // Agriculteur 2
  'mem-016': agritech,          // Agriculteur 3
  'mem-017': cleanenergy,       // Transporteur 1
  'mem-018': cleanenergy,       // Transporteur 2
  'mem-019': healthsolutions,   // Transporteur 3
  'grp-001': agritech,          // Coopérative Agricole Epsilon (Groupe)
  'grp-002': cleanenergy,       // Coopérative de Transport (Groupe)
};

// Normalised lookup map (lowercased keys) for case-insensitive member id lookup
export const normalizedMockCompanyRegistry: LegacyCompanyRegistry = Object.keys(mockCompanyRegistry).reduce((acc, k) => {
  acc[k.toLowerCase()] = mockCompanyRegistry[k];
  return acc;
}, {} as LegacyCompanyRegistry);

const companySizeOrder: CompanySize[] = ['micro', 'small', 'medium', 'large'];

const normalizeCompanySize = (size: unknown, employeeCount: number): CompanySize => {
  if (typeof size === 'string') {
    const normalized = size.toLowerCase();
    if (normalized.includes('micro') || normalized === 'tpe') return 'micro';
    if (normalized.includes('medium') || normalized.includes('moyenne')) return 'medium';
    if (normalized.includes('large') || normalized.includes('grande')) return 'large';
    if (normalized.includes('small') || normalized.includes('petite')) return 'small';
  }

  if (typeof size === 'number' && size >= 0 && size < companySizeOrder.length) {
    return companySizeOrder[Math.floor(size)];
  }

  if (employeeCount <= 10) return 'micro';
  if (employeeCount <= 50) return 'small';
  if (employeeCount <= 200) return 'medium';
  return 'large';
};

const normalizeCompanyStatus = (status: unknown): CompanyStatus => {
  if (typeof status === 'string') {
    const normalized = status.toLowerCase();
    const mapping: Record<string, CompanyStatus> = {
      lead: 'lead',
      prospect: 'lead',
      contacted: 'contacted',
      qualified: 'qualified',
      active: 'active',
      funded: 'funded',
      pending: 'pending',
      review: 'pending',
      rejected: 'rejected',
      lost: 'rejected'
    };
    return mapping[normalized] ?? 'active';
  }
  return 'active';
};

const normalizeFinancialRating = (rating: unknown): FinancialRating => {
  if (typeof rating === 'string') {
    const normalized = rating.toUpperCase() as FinancialRating;
    const allowed: FinancialRating[] = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'C', 'D', 'E', 'NR'];
    if (allowed.includes(normalized)) {
      return normalized;
    }
  }
  return 'NR';
};

const deriveCreditScore = (rating: FinancialRating): number => {
  const mapping: Record<FinancialRating, number> = {
    AAA: 95,
    AA: 90,
    A: 85,
    BBB: 75,
    BB: 65,
    B: 55,
    C: 45,
    D: 30,
    E: 20,
    NR: 75
  };
  return mapping[rating];
};

const normalizeESGRating = (value: unknown, fallback: ESGRating): ESGRating => {
  if (typeof value === 'string') {
    const normalized = value.toUpperCase() as ESGRating;
    const allowed: ESGRating[] = ['A', 'B', 'C', 'D', 'NR'];
    if (allowed.includes(normalized)) {
      return normalized;
    }
  }
  return fallback;
};

const legalFormMap: Record<string, LegalForm> = {
  sarl: 'SARL',
  sa: 'SA',
  sas: 'SAS',
  eirl: 'EIRL',
  sprl: 'SPRL',
  autres: 'Autres',
};

const normalizeLegalForm = (value: unknown): LegalForm | undefined => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  const normalized = value.replace(/\./g, '').trim().toLowerCase();
  return legalFormMap[normalized] ?? 'Autres';
};

const currencyMap: Record<string, Currency> = {
  usd: 'USD',
  '$': 'USD',
  dollar: 'USD',
  dollars: 'USD',
  eur: 'EUR',
  euro: 'EUR',
  euros: 'EUR',
  cdf: 'CDF',
  fc: 'CDF',
  fcfa: 'CDF',
};

const normalizeCurrency = (value: unknown): Currency | undefined => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  return currencyMap[normalized] ?? undefined;
};

const normalizeCompanyType = (value: unknown): Company['typeEntreprise'] | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (['startup', 'start-up', 'start up'].includes(normalized)) {
    return 'startup';
  }
  if (['traditionnelle', 'traditional', 'traditionnel', 'traditional business'].includes(normalized)) {
    return 'traditional';
  }
  return undefined;
};

/**
 * Adapter les données legacy vers le type Company strict
 */
function adaptLegacyCompanyToType(legacy: LegacyCompany): Company {
  const employeeCount = Number(legacy.employee_count ?? legacy.employees ?? 0) || 0;
  const financialRating = normalizeFinancialRating(legacy.financial_metrics?.financial_rating ?? legacy.creditRating);
  const esgScore = legacy.esg_metrics?.esgScore ?? legacy.esgScore ?? 0;
  const esgBaseRating: ESGRating = esgScore >= 80 ? 'A' : esgScore >= 60 ? 'B' : esgScore > 0 ? 'C' : 'NR';
  const legalForm = normalizeLegalForm(legacy.legalForm);
  const capitalCurrency = normalizeCurrency(legacy.deviseCapital ?? legacy.capital?.currency);

  return {
    // Identité
    id: legacy.id || 'unknown',
    name: legacy.name || 'Sans nom',
    sector: legacy.sector || legacy.industry || 'Non spécifié',
    size: normalizeCompanySize(legacy.size, employeeCount),
    status: normalizeCompanyStatus(legacy.status),
    logo_url: legacy.logo_url || legacy.logo || undefined,

    // Opérationnel
    employee_count: employeeCount,
    website_url: legacy.socialMedia?.website || legacy.website || undefined,
    pitch_deck_url: legacy.pitch_deck_url || undefined,
    lastContact: legacy.scenario?.lastContact || new Date().toISOString(),

    // Financier
    annual_revenue: legacy.annual_revenue || legacy.capital?.amount || 0,
    financial_metrics: {
      annual_revenue: legacy.annual_revenue || legacy.capital?.amount || 0,
      revenue_growth: legacy.financial_metrics?.revenue_growth || legacy.financialHighlights?.growthRate || 0,
      profit_margin: legacy.financialHighlights?.operatingMargin || 0,
      cash_flow: legacy.financialHighlights?.netIncome || 0,
      debt_ratio: legacy.financialHighlights?.equityRatio ? (100 - legacy.financialHighlights.equityRatio) / 100 : 0,
      working_capital: (legacy.financialHighlights?.totalAssets || 0) - (legacy.financialHighlights?.totalLiabilities || 0),
      credit_score: deriveCreditScore(financialRating),
      financial_rating: financialRating,
      ebitda: legacy.financialHighlights?.ebitda || 0,
    },

    // Contact et localisation
    contact_info: legacy.contacts ? {
      email: legacy.contacts.email || undefined,
      phone: legacy.contacts.phone || undefined,
      address: legacy.address?.street ? `${legacy.address.street}, ${legacy.address.city}` : undefined,
      website: legacy.socialMedia?.website || legacy.website || undefined,
    } : undefined,
    locations: legacy.address ? [{
      id: 'primary',
      address: legacy.address.street || 'N/A',
      city: legacy.address.city || 'N/A',
      country: legacy.address.country || legacy.country || 'N/A',
      isPrimary: true,
      coordinates: legacy.coordinates ? { lat: legacy.coordinates.latitude || 0, lng: legacy.coordinates.longitude || 0 } : undefined,
    }] : undefined,
    latitude: legacy.coordinates?.latitude || undefined,
    longitude: legacy.coordinates?.longitude || undefined,

    // Légales et paiement
    legal_info: {
      legalForm: legalForm ?? 'Autres',
      rccm: legacy.rccm || undefined,
      taxId: legacy.taxId || undefined,
      yearFounded: legacy.founded || undefined,
    },
    payment_info: ((legacy.payment_info || (legacy.preferredMethod || legacy.bankAccounts || legacy.mobileMoneyAccounts))
      ? {
          preferredMethod: legacy.payment_info?.preferredMethod || legacy.preferredMethod,
          bankAccounts: Array.isArray(legacy.payment_info?.bankAccounts) 
            ? legacy.payment_info.bankAccounts as BankAccount[]
            : Array.isArray(legacy.bankAccounts) ? legacy.bankAccounts : undefined,
          mobileMoneyAccounts: Array.isArray(legacy.payment_info?.mobileMoneyAccounts) 
            ? legacy.payment_info.mobileMoneyAccounts as MobileMoneyAccount[]
            : Array.isArray(legacy.mobileMoneyAccounts) ? legacy.mobileMoneyAccounts : undefined,
          assurances: Array.isArray(legacy.payment_info?.assurances) 
            ? legacy.payment_info.assurances 
            : undefined,
        }
      : undefined) as PaymentInfo | undefined,

    // Personnes
    owner: legacy.ceo ? {
      id: legacy.ceo.id || 'ceo',
      name: legacy.ceo.name || 'N/A',
      email: legacy.ceo.email || undefined,
      phone: legacy.ceo.phone || undefined,
    } : undefined,
    contactPersons: Array.isArray(legacy.leadership_team)
      ? legacy.leadership_team.map((leader: LegacyLeadershipMember, idx: number) => ({
      id: leader.id || `leader-${idx}`,
      nom: leader.name?.split(' ')[0] || 'N/A',
      prenoms: leader.name?.split(' ').slice(1).join(' ') || undefined,
      fonction: leader.title || undefined,
      email: leader.email || undefined,
      telephone: leader.phone || undefined,
      role: leader.title || undefined,
      }))
      : undefined,

    // Patrimoines et actifs
    assets: Array.isArray(legacy.assets) ? legacy.assets : undefined,
    stocks: Array.isArray(legacy.stocks) ? legacy.stocks : undefined,
    
    // Personnes par catégorie
    dirigeants: Array.isArray(legacy.dirigeants) ? legacy.dirigeants : undefined,
    actionnaires: Array.isArray(legacy.actionnaires) ? legacy.actionnaires : undefined,
    employes: Array.isArray(legacy.employes) ? legacy.employes : undefined,
    
    // Actifs par catégorie
    immobilisations: Array.isArray(legacy.immobilisations) ? legacy.immobilisations : undefined,
    equipements: Array.isArray(legacy.equipements) ? legacy.equipements : undefined,
    vehicules: Array.isArray(legacy.vehicules) ? legacy.vehicules : undefined,

    // ESG
    esg_metrics: {
      esg_rating: normalizeESGRating(legacy.esg_metrics?.esg_rating ?? legacy.esg_rating, esgBaseRating),
      carbon_footprint: 0,
      environmental_rating: normalizeESGRating(legacy.esg_metrics?.environmental_rating, esgBaseRating),
      social_rating: normalizeESGRating(legacy.esg_metrics?.social_rating, 'B'),
      governance_rating: normalizeESGRating(legacy.esg_metrics?.governance_rating, 'A'),
      gender_ratio: undefined,
    },

    // Métadonnées
    profileCompleteness: legacy.profileCompleteness || 70,
    lastSyncFromAccounting: legacy.lastSyncFromAccounting || new Date().toISOString(),
    lastSyncFromCustomer: legacy.lastSyncFromCustomer || new Date().toISOString(),

    // Timestamps
    created_at: legacy.created_at || new Date().toISOString(),
    updated_at: legacy.updated_at || new Date().toISOString(),

    // Champs étendus
    sigle: legacy.sigle || undefined,
    typeEntreprise: normalizeCompanyType(legacy.typeEntreprise),
    numeroIdentificationNationale: legacy.numeroIdentificationNationale || legacy.natId || undefined,
    secteursActiviteSecondaires: Array.isArray(legacy.secteursActiviteSecondaires) ? legacy.secteursActiviteSecondaires : undefined,
    secteursPersonalises: Array.isArray(legacy.secteursPersonalises) ? legacy.secteursPersonalises : undefined,
    descriptionActivites: legacy.descriptionActivites || legacy.description || undefined,
    produitsServices: Array.isArray(legacy.produitsServices) ? legacy.produitsServices : undefined,
    capitalSocial: legacy.capitalSocial || legacy.capital?.amount || undefined,
    deviseCapital: capitalCurrency,
    dateCreation: legacy.dateCreation || undefined,
    dateDebutActivites: legacy.dateDebutActivites || undefined,
    incubation: legacy.incubation || undefined,
    startupSpecifics: legacy.startupSpecifics || undefined,
    traditionalSpecifics: legacy.traditionalSpecifics || undefined,
    pitch: legacy.pitch || (legacy.pitch_deck_url || legacy.presentation_video
      ? {
          elevator_pitch: legacy.elevator_pitch,
          value_proposition: legacy.value_proposition,
          target_market: legacy.target_market,
          competitive_advantage: legacy.competitive_advantage,
          pitch_deck_url: legacy.pitch_deck_url,
          demo_video_url: legacy.presentation_video,
        }
      : undefined),
    siegeSocial: legacy.siegeSocial || undefined,
    siegeExploitation: legacy.siegeExploitation || undefined,
    unitesProduction: Array.isArray(legacy.unitesProduction) ? legacy.unitesProduction : undefined,
    pointsVente: Array.isArray(legacy.pointsVente) ? legacy.pointsVente : undefined,
    telephoneFixe: legacy.telephoneFixe || legacy.contacts?.phone || undefined,
    telephoneMobile: legacy.telephoneMobile || undefined,
    fax: legacy.fax || undefined,
    boitePostale: legacy.boitePostale || undefined,
    reseauxSociaux: Array.isArray(legacy.reseauxSociaux) ? legacy.reseauxSociaux : undefined,
    moyensTechniques: Array.isArray(legacy.moyensTechniques) ? legacy.moyensTechniques : undefined,
    capaciteProduction: legacy.capaciteProduction || undefined,
    organigramme: legacy.organigramme || undefined,
    pretsEnCours: (Array.isArray(legacy.pretsEnCours) ? legacy.pretsEnCours : undefined) as Company['pretsEnCours'],
    leveeDeFonds: (Array.isArray(legacy.leveeDeFonds) ? legacy.leveeDeFonds : undefined) as Company['leveeDeFonds'],
    legalAspects: legacy.legalAspects || undefined,
    documents: typeof legacy.documents === 'object' && !Array.isArray(legacy.documents) 
      ? legacy.documents 
      : undefined,
  };
}

// Adapter et exporter la première entreprise mock comme fallback par défaut
export const mockCompanyDetails = adaptLegacyCompanyToType(entrepriseAlpha);

/**
 * Récupère les données mockées d'une entreprise par son ID de membre (mem-XXX)
 * Retourne les données adaptées ou null si non trouvé
 */
export function getMockCompanyByMemberId(memberId: string): Company | null {
  if (!memberId) return null;
  const key = String(memberId).toLowerCase();
  const legacyData = normalizedMockCompanyRegistry[key];
  if (!legacyData) {
    // Try to resolve as an internal company ID (e.g. COMP-0001)
    const internal = getMockCompanyByInternalId(memberId);
    if (internal) return internal;
    console.warn(`[mockCompanyDetails] No mock data found for member ID: ${memberId}`);
    return null;
  }
  
  // Adapter les données legacy avec l'ID du membre (pour cohérence)
  const company = adaptLegacyCompanyToType(legacyData);
  // Utiliser l'ID du membre comme ID principal pour l'application
  return { ...company, id: memberId };
}

/**
 * Récupère les données mockées d'une entreprise par son ID interne (techinnovate-cd, etc.)
 */
export function getMockCompanyByInternalId(internalId: string): Company | null {
  if (!internalId) return null;
  const idKey = String(internalId).toLowerCase();
  // First look into flat mock companies (COMP-XXXX style)
  const flat = flatMockCompanies.find(c => String(c.id).toLowerCase() === idKey);
  if (flat) {
    return adaptLegacyCompanyToType(flat as LegacyCompany);
  }

  // Next look into the registry values (legacy company objects)
  const legacyData = Object.values(normalizedMockCompanyRegistry).find(
    (company) => String(company.id).toLowerCase() === idKey
  );
  if (!legacyData) {
    console.warn(`[mockCompanyDetails] No mock data found for internal ID: ${internalId}`);
    return null;
  }
  return adaptLegacyCompanyToType(legacyData);
}
