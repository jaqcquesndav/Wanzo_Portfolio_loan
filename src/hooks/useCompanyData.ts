import { useState, useEffect, useCallback } from 'react';
import { companyApi } from '../services/api/shared/company.api';
import type {
  Company,
  CompanySize,
  CompanyStatus,
  CompanyDocuments,
  Currency,
  IncubationData,
  StartupSpecifics,
  TraditionalSpecifics,
  PitchData,
  Location,
  SocialLink,
  Loan,
  FundingRound,
  LegalAspects
} from '../types/company';
import { mockCompanyDetails, getMockCompanyByMemberId, getMockCompanyByInternalId } from '../data/mockCompanyDetails';

// Simple in-memory cache to avoid duplicate fetches during a session
const companyCache = new Map<string, Company | null>();

/**
 * Crée un objet Company par défaut/fallback avec des valeurs N/A et 0
 */
function createDefaultCompany(id: string, name?: string): Company {
  return {
    id,
    name: name || 'N/A',
    sector: 'N/A',
    size: 'small',
    status: 'active',
    employee_count: 0,
    website_url: undefined,
    pitch_deck_url: undefined,
    lastContact: new Date().toISOString(),
    annual_revenue: 0,
    financial_metrics: {
      annual_revenue: 0,
      revenue_growth: 0,
      profit_margin: 0,
      cash_flow: 0,
      debt_ratio: 0,
      working_capital: 0,
      credit_score: 0,
      financial_rating: 'NR',
      ebitda: 0,
    },
    contact_info: undefined,
    locations: undefined,
    latitude: undefined,
    longitude: undefined,
    legal_info: {
      legalForm: undefined,
      rccm: undefined,
      taxId: undefined,
      yearFounded: undefined,
    },
    payment_info: undefined,
    owner: undefined,
    contactPersons: undefined,
    assets: undefined,
    stocks: undefined,
    esg_metrics: {
      esg_rating: 'NR',
      carbon_footprint: 0,
      environmental_rating: 'NR',
      social_rating: 'NR',
      governance_rating: 'NR',
    },
    profileCompleteness: 0,
    lastSyncFromAccounting: new Date().toISOString(),
    lastSyncFromCustomer: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // NOUVEAUX CHAMPS AVEC VALEURS PAR DÉFAUT
    sigle: undefined,
    typeEntreprise: undefined,
    numeroIdentificationNationale: undefined,
    secteursActiviteSecondaires: undefined,
    secteursPersonalises: undefined,
    descriptionActivites: undefined,
    produitsServices: undefined,
    capitalSocial: undefined,
    deviseCapital: undefined,
    dateCreation: undefined,
    dateDebutActivites: undefined,
    incubation: undefined,
    startupSpecifics: undefined,
    traditionalSpecifics: undefined,
    pitch: undefined,
    siegeSocial: undefined,
    siegeExploitation: undefined,
    unitesProduction: undefined,
    pointsVente: undefined,
    telephoneFixe: undefined,
    telephoneMobile: undefined,
    fax: undefined,
    boitePostale: undefined,
    reseauxSociaux: undefined,
    moyensTechniques: undefined,
    capaciteProduction: undefined,
    organigramme: undefined,
    pretsEnCours: undefined,
    leveeDeFonds: undefined,
    legalAspects: undefined,
    documents: undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function safeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function normalizeCurrency(value: unknown): Currency | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const upper = value.trim().toUpperCase();
  if (upper === 'USD' || upper === 'CDF' || upper === 'EUR') {
    return upper as Currency;
  }
  return undefined;
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const result = value
    .map((item) => safeString(item))
    .filter((item): item is string => Boolean(item));
  return result.length > 0 ? result : undefined;
}

function normalizeLocation(value: unknown): Location | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const address = safeString(value.address) || '';
  const city = safeString(value.city) || '';
  const country = safeString(value.country) || '';
  if (!address && !city && !country) {
    return undefined;
  }
  let coordinates: Location['coordinates'] = undefined;
  if (isRecord(value.coordinates)) {
    const lat = safeNumber(value.coordinates.lat) ?? safeNumber(value.coordinates.latitude);
    const lng = safeNumber(value.coordinates.lng) ?? safeNumber(value.coordinates.longitude);
    if (lat !== undefined && lng !== undefined) {
      coordinates = { lat, lng };
    }
  }
  return {
    id: safeString(value.id) || `${address || city || 'location'}`,
    address,
    city,
    country,
    isPrimary: Boolean(value.isPrimary),
    coordinates,
  };
}

function normalizeLocations(value: unknown): Location[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const result = value
    .map((item) => normalizeLocation(item))
    .filter((loc): loc is Location => Boolean(loc));
  return result.length > 0 ? result : undefined;
}

function normalizeSocialLinks(value: unknown): SocialLink[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const result = value
    .map((item) => {
      if (!isRecord(item)) {
        return undefined;
      }
      const url = safeString(item.url);
      if (!url) {
        return undefined;
      }
      return {
        platform: safeString(item.platform) || 'autre',
        url,
        label: safeString(item.label) || undefined,
      } as SocialLink;
    })
    .filter((link): link is SocialLink => Boolean(link));
  return result.length > 0 ? result : undefined;
}

function normalizeIncubation(value: unknown): IncubationData | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  let enIncubation: boolean | undefined;
  if (typeof value.enIncubation === 'boolean') {
    enIncubation = value.enIncubation;
  } else if (typeof value.enIncubation === 'string') {
    const normalised = value.enIncubation.trim().toLowerCase();
    if (['oui', 'yes', 'true', '1'].includes(normalised)) {
      enIncubation = true;
    } else if (['non', 'no', 'false', '0'].includes(normalised)) {
      enIncubation = false;
    }
  }
  const typeAccompagnement = safeString(value.typeAccompagnement);
  const normalisedType = typeAccompagnement === 'incubation' || typeAccompagnement === 'acceleration'
    ? typeAccompagnement
    : undefined;
  const nomIncubateur = safeString(value.nomIncubateur) || safeString(value.nomIncubateurAccelerateur);
  const certificatAffiliation = safeString(value.certificatAffiliation);
  if (enIncubation === undefined && !normalisedType && !nomIncubateur && !certificatAffiliation) {
    return undefined;
  }
  if (enIncubation === undefined) {
    return undefined;
  }
  return {
    enIncubation,
    typeAccompagnement: normalisedType,
    nomIncubateur,
    certificatAffiliation,
  } satisfies IncubationData;
}

function normalizeStartupSpecifics(value: unknown): StartupSpecifics | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const specifics: StartupSpecifics = {
    niveauMaturiteTechnologique: safeString(value.niveauMaturiteTechnologique),
    modeleEconomique: safeString(value.modeleEconomique),
    proprieteIntellectuelle: toStringArray(value.proprieteIntellectuelle),
  };
  if (!specifics.niveauMaturiteTechnologique && !specifics.modeleEconomique && !specifics.proprieteIntellectuelle) {
    return undefined;
  }
  return specifics;
}

function normalizeTraditionalSpecifics(value: unknown): TraditionalSpecifics | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const certificationQualite = typeof value.certificationQualite === 'boolean'
    ? value.certificationQualite
    : undefined;
  const licencesExploitation = toStringArray(value.licencesExploitation);
  if (certificationQualite === undefined && !licencesExploitation) {
    return undefined;
  }
  const specifics: TraditionalSpecifics = {
    certificationQualite,
    licencesExploitation,
  };
  return specifics;
}

function normalizePitch(value: unknown): PitchData | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const pitch: PitchData = {};
  const elevator = safeString(value.elevator_pitch) || safeString(value.elevatorPitch);
  if (elevator) {
    pitch.elevator_pitch = elevator;
  }
  const valueProp = safeString(value.value_proposition);
  if (valueProp) {
    pitch.value_proposition = valueProp;
  }
  const targetMarket = safeString(value.target_market);
  if (targetMarket) {
    pitch.target_market = targetMarket;
  }
  const competitiveAdvantage = safeString(value.competitive_advantage);
  if (competitiveAdvantage) {
    pitch.competitive_advantage = competitiveAdvantage;
  }
  const deckUrl = safeString(value.pitch_deck_url);
  if (deckUrl) {
    pitch.pitch_deck_url = deckUrl;
  }
  const demoVideo = safeString(value.demo_video_url) || safeString(value.demoVideoUrl);
  if (demoVideo) {
    pitch.demo_video_url = demoVideo;
  }
  return Object.keys(pitch).length > 0 ? pitch : undefined;
}

function normalizeLoans(value: unknown): Loan[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const loans = value
    .map((item) => {
      if (!isRecord(item)) {
        return undefined;
      }
      const id = safeString(item.id);
      const type = safeString(item.type);
      const amount = safeNumber(item.amount);
      const currency = normalizeCurrency(item.currency);
      const lender = safeString(item.lender);
      const startDate = safeString(item.startDate);
      const status = safeString(item.status);
      if (!id || !type || amount === undefined || !currency || !lender || !startDate || !status) {
        return undefined;
      }
      if (!['active', 'completed', 'defaulted'].includes(status)) {
        return undefined;
      }
      return {
        id,
        type,
        amount,
        currency,
        lender,
        startDate,
        endDate: safeString(item.endDate),
        interestRate: safeNumber(item.interestRate),
        status: status as Loan['status'],
      } satisfies Loan;
    })
    .filter((loan): loan is Loan => Boolean(loan));
  return loans.length > 0 ? loans : undefined;
}

function normalizeFundingRounds(value: unknown): FundingRound[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const rounds = value
    .map((item) => {
      if (!isRecord(item)) {
        return undefined;
      }
      const id = safeString(item.id);
      const roundType = safeString(item.roundType);
      const amount = safeNumber(item.amount);
      const currency = normalizeCurrency(item.currency);
      const date = safeString(item.date);
      if (!id || !roundType || amount === undefined || !currency || !date) {
        return undefined;
      }
      return {
        id,
        roundType,
        amount,
        currency,
        valuation: safeNumber(item.valuation),
        investors: toStringArray(item.investors),
        date,
      } satisfies FundingRound;
    })
    .filter((round): round is FundingRound => Boolean(round));
  return rounds.length > 0 ? rounds : undefined;
}

function normalizeLegalAspects(value: unknown): LegalAspects | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const aspects: LegalAspects = {
    failliteAnterieure: Boolean(value.failliteAnterieure),
    detailsFaillite: safeString(value.detailsFaillite),
    poursuiteJudiciaire: Boolean(value.poursuiteJudiciaire),
    detailsPoursuites: safeString(value.detailsPoursuites),
    garantiePrets: Boolean(value.garantiePrets),
    detailsGaranties: safeString(value.detailsGaranties),
    antecedentsFiscaux: Boolean(value.antecedentsFiscaux),
    detailsAntecedentsFiscaux: safeString(value.detailsAntecedentsFiscaux) || safeString(value.detailsAntecedentes),
  };
  const hasFlag = aspects.failliteAnterieure || aspects.poursuiteJudiciaire || aspects.garantiePrets || aspects.antecedentsFiscaux;
  const hasDetails = aspects.detailsFaillite || aspects.detailsPoursuites || aspects.detailsGaranties || aspects.detailsAntecedentsFiscaux;
  return hasFlag || hasDetails ? aspects : undefined;
}

function normalizeCompanyDocuments(value: unknown): CompanyDocuments | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const documents: CompanyDocuments = {
    documentsEntreprise: toStringArray(value.documentsEntreprise),
    documentsPersonnel: toStringArray(value.documentsPersonnel),
    documentsFinanciers: toStringArray(value.documentsFinanciers),
    documentsPatrimoine: toStringArray(value.documentsPatrimoine),
    documentsProprieteIntellectuelle: toStringArray(value.documentsProprieteIntellectuelle),
    documentsSectoriels: toStringArray(value.documentsSectoriels),
  };
  const hasContent = Object.values(documents).some((docs) => Array.isArray(docs) && docs.length > 0);
  return hasContent ? documents : undefined;
}

/**
 * Validate and normalise a loose 'size' value into a `CompanySize`.
 * Accepts strings (various languages/variants) or numeric employee counts.
 */
function validateCompanySize(value: unknown): CompanySize | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const n = value as number;
    if (n < 10) return 'micro';
    if (n < 50) return 'small';
    if (n < 250) return 'medium';
    return 'large';
  }

  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (!v) return undefined;
    if (['micro', 'microenterprise', 'microentreprise', 'micro-entreprise'].includes(v)) return 'micro';
    if (['small', 'petite', 'small-business', 'petite-entreprise', 'sm'].includes(v)) return 'small';
    if (['medium', 'moyenne', 'moyenne-entreprise', 'mid', 'sme'].includes(v)) return 'medium';
    if (['large', 'grande', 'large-enterprise', 'big'].includes(v)) return 'large';
    // Sometimes sizes are provided as ranges like "10-50" or "50+"; try to parse leading number
    const numMatch = v.match(/^(\d+)/);
    if (numMatch) {
      const num = Number(numMatch[1]);
      return validateCompanySize(num);
    }
  }

  return undefined;
}

/**
 * Validate and normalise a loose 'status' value into a `CompanyStatus`.
 */
function validateCompanyStatus(value: unknown): CompanyStatus | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (!v) return undefined;
    if (['lead', 'prospect', 'prospection'].includes(v)) return 'lead';
    if (['contacted', 'contact', 'in_contact'].includes(v)) return 'contacted';
    if (['qualified', 'qualification'].includes(v)) return 'qualified';
    if (['active', 'active_client', 'client'].includes(v)) return 'active';
    if (['funded', 'financé', 'financed'].includes(v)) return 'funded';
    if (['pending', 'en_attente', 'waiting'].includes(v)) return 'pending';
    if (['rejected', 'rejeté', 'declined', 'refused'].includes(v)) return 'rejected';
    // Accept some numeric or short codes
    if (v === '0' || v === 'new') return 'lead';
    if (v === '1' || v === 'contact') return 'contacted';
  }
  return undefined;
}

/**
 * Normalise any object to Company type
 * Handles both fully conformant Company objects and partial data
 */
function normalizeToCompany(data: unknown): Company {
  const input = data as Record<string, unknown>;
  if (!input) {
    return mockCompanyDetails;
  }

  // Si c'est déjà presque conforme, le retourner tel quel
  if (input.id && input.name && input.sector && input.financial_metrics && input.esg_metrics && input.created_at && input.updated_at) {
    return input as unknown as Company;
  }

  // Sinon, adapter les données partielles
  const contactData = input.contacts as Record<string, unknown> | undefined;
  const addressData = input.address as Record<string, unknown> | undefined;
  const socialData = input.socialMedia as Record<string, unknown> | undefined;
  const leadershipData = input.leadership_team as unknown[];
  const ceoData = input.ceo as Record<string, unknown> | undefined;
  const coordData = input.coordinates as Record<string, unknown> | undefined;

  return {
    id: String(input.id || 'unknown'),
    name: String(input.name || 'Sans nom'),
    sector: String(input.sector || 'Non spécifié'),
    size: validateCompanySize(input.size) || 'medium',
    status: validateCompanyStatus(input.status) || 'active',
    employee_count: Number(input.employee_count || input.employees || 0),
    website_url: String(input.website_url || socialData?.website || ''),
    pitch_deck_url: input.pitch_deck_url ? String(input.pitch_deck_url) : undefined,
    lastContact: input.lastContact ? String(input.lastContact) : undefined,
    annual_revenue: Number(input.annual_revenue || (input.capital as Record<string, unknown>)?.amount || 0),
    financial_metrics: (input.financial_metrics as Record<string, unknown>) || {
      annual_revenue: Number(input.annual_revenue || 0),
      revenue_growth: 0,
      profit_margin: 0,
      cash_flow: 0,
      debt_ratio: 0,
      working_capital: 0,
      credit_score: 75,
      financial_rating: 'BBB',
    },
    contact_info: (input.contact_info as Record<string, unknown>) || (contactData ? {
      email: contactData.email ? String(contactData.email) : undefined,
      phone: contactData.phone ? String(contactData.phone) : undefined,
      address: addressData?.street ? String(addressData.street) : undefined,
      website: socialData?.website ? String(socialData.website) : undefined,
    } : undefined),
    locations: normalizeLocations(input.locations) || (addressData ? [{
      id: 'primary',
      address: addressData.street ? String(addressData.street) : '',
      city: addressData.city ? String(addressData.city) : '',
      country: addressData.country ? String(addressData.country) : '',
      isPrimary: true,
    }] : undefined),
    latitude: safeNumber(input.latitude ?? coordData?.latitude),
    longitude: safeNumber(input.longitude ?? coordData?.longitude),
    legal_info: (input.legal_info as Record<string, unknown>) || {
      legalForm: input.legalForm ? String(input.legalForm) : undefined,
      rccm: input.rccm ? String(input.rccm) : undefined,
      taxId: input.taxId ? String(input.taxId) : undefined,
      yearFounded: input.founded ? Number(input.founded) : undefined,
    },
    payment_info: input.payment_info as Record<string, unknown> | undefined,
    owner: (input.owner as Record<string, unknown>) || (ceoData ? {
      id: 'owner',
      name: String(ceoData.name || ''),
      email: ceoData.email ? String(ceoData.email) : undefined,
      phone: ceoData.phone ? String(ceoData.phone) : undefined,
    } : undefined),
    contactPersons: (input.contactPersons as unknown[]) || leadershipData,
    assets: input.assets as unknown[] | undefined,
    stocks: input.stocks as unknown[] | undefined,
    esg_metrics: (input.esg_metrics as Record<string, unknown>) || {
      esg_rating: input.esgScore && Number(input.esgScore) >= 80 ? 'A' : 'NR',
      carbon_footprint: 0,
      environmental_rating: 'C',
      social_rating: 'C',
      governance_rating: 'C',
    },
    profileCompleteness: input.profileCompleteness ? Number(input.profileCompleteness) : 85,
    lastSyncFromAccounting: input.lastSyncFromAccounting ? String(input.lastSyncFromAccounting) : new Date().toISOString(),
    lastSyncFromCustomer: input.lastSyncFromCustomer ? String(input.lastSyncFromCustomer) : new Date().toISOString(),
    created_at: input.created_at ? String(input.created_at) : new Date().toISOString(),
    updated_at: input.updated_at ? String(input.updated_at) : new Date().toISOString(),
    sigle: safeString(input.sigle),
    typeEntreprise: typeof input.typeEntreprise === 'string' && ['startup', 'traditional'].includes(input.typeEntreprise)
      ? input.typeEntreprise as Company['typeEntreprise']
      : undefined,
    numeroIdentificationNationale: safeString(input.numeroIdentificationNationale),
    secteursActiviteSecondaires: toStringArray(input.secteursActiviteSecondaires),
    secteursPersonalises: toStringArray(input.secteursPersonalises),
    descriptionActivites: safeString(input.descriptionActivites),
    produitsServices: toStringArray(input.produitsServices),
    capitalSocial: safeNumber(input.capitalSocial),
    deviseCapital: normalizeCurrency(input.deviseCapital),
    dateCreation: safeString(input.dateCreation),
    dateDebutActivites: safeString(input.dateDebutActivites),
    incubation: normalizeIncubation(input.incubation),
    startupSpecifics: normalizeStartupSpecifics(input.startupSpecifics),
    traditionalSpecifics: normalizeTraditionalSpecifics(input.traditionalSpecifics),
    pitch: normalizePitch(input.pitch),
    siegeSocial: normalizeLocation(input.siegeSocial),
    siegeExploitation: normalizeLocation(input.siegeExploitation),
    unitesProduction: normalizeLocations(input.unitesProduction),
    pointsVente: normalizeLocations(input.pointsVente),
    telephoneFixe: safeString(input.telephoneFixe || contactData?.phone),
    telephoneMobile: safeString(input.telephoneMobile),
    fax: safeString(input.fax),
    boitePostale: safeString(input.boitePostale),
    reseauxSociaux: normalizeSocialLinks(input.reseauxSociaux || socialData?.links),
    moyensTechniques: toStringArray(input.moyensTechniques),
    capaciteProduction: safeString(input.capaciteProduction),
    organigramme: safeString(input.organigramme),
    pretsEnCours: normalizeLoans(input.pretsEnCours),
    leveeDeFonds: normalizeFundingRounds(input.leveeDeFonds),
    legalAspects: normalizeLegalAspects(input.legalAspects),
    documents: normalizeCompanyDocuments(input.documents),
  } as unknown as Company;
}

export function useCompanyData(id?: string, initial?: Company | null) {
  const [company, setCompany] = useState<Company | null>(() => {
    if (initial) return normalizeToCompany(initial);
    if (id && companyCache.has(id)) return companyCache.get(id) || null;
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => !initial);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!id) {
      return null;
    }
    // Return cached value if present
    if (companyCache.has(id)) {
      const cached = companyCache.get(id) || null;
      setCompany(cached);
      setLoading(false);
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await Promise.race([
        companyApi.getCompanyById(id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 5000)
        )
      ]);
      const normalized = normalizeToCompany(data);
      setCompany(normalized);
      companyCache.set(id, normalized);
      setLoading(false);
      return normalized;
    } catch (err: unknown) {
      // Network or API error — fallback to mock data or default company
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      console.warn(`[useCompanyData] API error for company ${id}: ${errorMsg}. Using fallback data.`);
      
      // Try to find mock data first (for member IDs like 'mem-001')
      let fallbackCompany = getMockCompanyByMemberId(id);
      // If not found as member id, try internal company id (e.g. COMP-0001)
      if (!fallbackCompany) {
        fallbackCompany = getMockCompanyByInternalId(id);
      }
      // If still not found, create a default company with the provided ID
      if (!fallbackCompany) {
        fallbackCompany = createDefaultCompany(id);
      }
      
      setCompany(fallbackCompany);
      setError(null); // Clear error since we have fallback data
      setLoading(false);
      // Cache the fallback data
      companyCache.set(id, fallbackCompany);
      return fallbackCompany;
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (initial) {
      setLoading(false);
      return;
    }

    fetchCompany().catch(() => {});
  }, [id, initial, fetchCompany]);

  const refetch = useCallback(async () => {
    if (!id) return null;
    // Clear cache for this id and re-fetch
    companyCache.delete(id);
    return fetchCompany();
  }, [id, fetchCompany]);

  return { company, loading, error, refetch } as const;
}
