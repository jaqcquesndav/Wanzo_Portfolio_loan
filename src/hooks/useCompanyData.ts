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
  LegalAspects,
  ContactPerson,
  Asset,
  Stock,
  Insurance,
  PaymentInfo,
  HolderType,
  AssetType,
  AssetCondition,
  OwnershipType,
  StockCategory,
  StockCondition,
  InsuranceType
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

// ============================================================================
// NORMALISATEURS POUR PERSONNES (Dirigeants, Actionnaires, Employés)
// ============================================================================

const VALID_HOLDER_TYPES: HolderType[] = ['physique', 'morale'];

function normalizeHolderType(value: unknown): HolderType | undefined {
  if (typeof value === 'string' && VALID_HOLDER_TYPES.includes(value as HolderType)) {
    return value as HolderType;
  }
  return undefined;
}

/**
 * Normalise un ContactPerson (dirigeant, actionnaire, employé)
 */
function normalizeContactPerson(value: unknown): ContactPerson | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  
  const person: ContactPerson = {
    id: safeString(value.id),
    typeDetenteur: normalizeHolderType(value.typeDetenteur),
    
    // Champs personne physique
    nom: safeString(value.nom),
    prenoms: safeString(value.prenoms),
    fonction: safeString(value.fonction),
    nationalite: safeString(value.nationalite),
    telephone: safeString(value.telephone),
    email: safeString(value.email),
    adresse: safeString(value.adresse),
    linkedin: safeString(value.linkedin),
    cv: safeString(value.cv),
    cvFileName: safeString(value.cvFileName),
    
    // Champs personne morale
    raisonSociale: safeString(value.raisonSociale),
    formeJuridique: safeString(value.formeJuridique),
    rccm: safeString(value.rccm),
    idnat: safeString(value.idnat),
    siegeSocial: safeString(value.siegeSocial),
    representantLegal: safeString(value.representantLegal),
    representantFonction: safeString(value.representantFonction),
    
    // Champs actionnariat
    nombreActions: safeNumber(value.nombreActions),
    pourcentageActions: safeNumber(value.pourcentageActions),
    
    // Champs employé
    dateNomination: safeString(value.dateNomination),
    typeContrat: safeString(value.typeContrat),
    salaire: safeNumber(value.salaire),
    diplomes: toStringArray(value.diplomes),
    
    // Legacy
    role: safeString(value.role),
  };
  
  // Vérifier qu'il y a au moins des données significatives
  const hasPhysicalPerson = person.nom || person.prenoms;
  const hasMoralPerson = person.raisonSociale;
  const hasIdentity = hasPhysicalPerson || hasMoralPerson;
  
  return hasIdentity ? person : undefined;
}

function normalizeContactPersonArray(value: unknown): ContactPerson[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const result = value
    .map((item) => normalizeContactPerson(item))
    .filter((person): person is ContactPerson => Boolean(person));
  return result.length > 0 ? result : undefined;
}

// ============================================================================
// NORMALISATEURS POUR ACTIFS (Assets, Immobilisations, Équipements, Véhicules)
// ============================================================================

const VALID_ASSET_TYPES: AssetType[] = ['immobilier', 'vehicule', 'equipement', 'stock', 'autre'];
const VALID_ASSET_CONDITIONS: AssetCondition[] = ['neuf', 'excellent', 'bon', 'moyen', 'mauvais', 'deteriore'];
const VALID_OWNERSHIP_TYPES: OwnershipType[] = ['propre', 'location', 'leasing', 'emprunt'];

function normalizeAssetType(value: unknown): AssetType | undefined {
  if (typeof value === 'string' && VALID_ASSET_TYPES.includes(value as AssetType)) {
    return value as AssetType;
  }
  return undefined;
}

function normalizeAssetCondition(value: unknown): AssetCondition | undefined {
  if (typeof value === 'string' && VALID_ASSET_CONDITIONS.includes(value as AssetCondition)) {
    return value as AssetCondition;
  }
  return undefined;
}

function normalizeOwnershipType(value: unknown): OwnershipType | undefined {
  if (typeof value === 'string' && VALID_OWNERSHIP_TYPES.includes(value as OwnershipType)) {
    return value as OwnershipType;
  }
  return undefined;
}

/**
 * Normalise un Asset (immobilisation, équipement, véhicule)
 */
function normalizeAsset(value: unknown): Asset | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  
  const asset: Asset = {
    id: safeString(value.id),
    designation: safeString(value.designation),
    type: normalizeAssetType(value.type),
    description: safeString(value.description),
    
    // Valeurs financières
    prixAchat: safeNumber(value.prixAchat),
    valeurActuelle: safeNumber(value.valeurActuelle),
    devise: normalizeCurrency(value.devise),
    
    // Informations temporelles
    dateAcquisition: safeString(value.dateAcquisition),
    
    // État et localisation
    etatActuel: normalizeAssetCondition(value.etatActuel),
    localisation: safeString(value.localisation),
    
    // Informations techniques
    numeroSerie: safeString(value.numeroSerie),
    marque: safeString(value.marque),
    modele: safeString(value.modele),
    quantite: safeNumber(value.quantite),
    unite: safeString(value.unite),
    
    // Statut de propriété
    proprietaire: normalizeOwnershipType(value.proprietaire),
    
    // Observations
    observations: safeString(value.observations),
  };
  
  // Vérifier qu'il y a au moins des données significatives
  const hasContent = asset.designation || asset.description || asset.prixAchat !== undefined || asset.valeurActuelle !== undefined;
  
  return hasContent ? asset : undefined;
}

function normalizeAssetArray(value: unknown): Asset[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const result = value
    .map((item) => normalizeAsset(item))
    .filter((asset): asset is Asset => Boolean(asset));
  return result.length > 0 ? result : undefined;
}

// ============================================================================
// NORMALISATEURS POUR STOCKS
// ============================================================================

const VALID_STOCK_CATEGORIES: StockCategory[] = ['matiere_premiere', 'produit_semi_fini', 'produit_fini', 'fourniture', 'emballage', 'autre'];
const VALID_STOCK_CONDITIONS: StockCondition[] = ['excellent', 'bon', 'moyen', 'deteriore', 'perime'];

function normalizeStockCategory(value: unknown): StockCategory | undefined {
  if (typeof value === 'string' && VALID_STOCK_CATEGORIES.includes(value as StockCategory)) {
    return value as StockCategory;
  }
  return undefined;
}

function normalizeStockCondition(value: unknown): StockCondition | undefined {
  if (typeof value === 'string' && VALID_STOCK_CONDITIONS.includes(value as StockCondition)) {
    return value as StockCondition;
  }
  return undefined;
}

/**
 * Normalise un Stock
 */
function normalizeStock(value: unknown): Stock | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  
  const stock: Stock = {
    id: safeString(value.id),
    designation: safeString(value.designation),
    categorie: normalizeStockCategory(value.categorie),
    description: safeString(value.description),
    
    // Quantités et unités
    quantiteStock: safeNumber(value.quantiteStock),
    unite: safeString(value.unite),
    seuilMinimum: safeNumber(value.seuilMinimum),
    seuilMaximum: safeNumber(value.seuilMaximum),
    
    // Valeurs financières
    coutUnitaire: safeNumber(value.coutUnitaire),
    valeurTotaleStock: safeNumber(value.valeurTotaleStock),
    devise: normalizeCurrency(value.devise),
    
    // Informations temporelles
    dateDernierInventaire: safeString(value.dateDernierInventaire),
    dureeRotationMoyenne: safeNumber(value.dureeRotationMoyenne),
    datePeremption: safeString(value.datePeremption),
    
    // Localisation et stockage
    emplacement: safeString(value.emplacement),
    conditionsStockage: safeString(value.conditionsStockage),
    
    // Suivi et gestion
    fournisseurPrincipal: safeString(value.fournisseurPrincipal),
    numeroLot: safeString(value.numeroLot),
    codeArticle: safeString(value.codeArticle),
    
    // État
    etatStock: normalizeStockCondition(value.etatStock),
    observations: safeString(value.observations),
  };
  
  // Vérifier qu'il y a au moins des données significatives
  const hasContent = stock.designation || stock.quantiteStock !== undefined || stock.valeurTotaleStock !== undefined;
  
  return hasContent ? stock : undefined;
}

function normalizeStockArray(value: unknown): Stock[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const result = value
    .map((item) => normalizeStock(item))
    .filter((stock): stock is Stock => Boolean(stock));
  return result.length > 0 ? result : undefined;
}

// ============================================================================
// NORMALISATEURS POUR ASSURANCES
// ============================================================================

const VALID_INSURANCE_TYPES: InsuranceType[] = ['responsabilite_civile', 'incendie', 'vol', 'accidents_travail', 'marchandises', 'vehicules', 'multirisque', 'autre'];
const VALID_PAYMENT_FREQUENCIES = ['mensuel', 'trimestriel', 'annuel'] as const;

function normalizeInsuranceType(value: unknown): InsuranceType | undefined {
  if (typeof value === 'string' && VALID_INSURANCE_TYPES.includes(value as InsuranceType)) {
    return value as InsuranceType;
  }
  return undefined;
}

function normalizePaymentFrequency(value: unknown): 'mensuel' | 'trimestriel' | 'annuel' | undefined {
  if (typeof value === 'string' && VALID_PAYMENT_FREQUENCIES.includes(value as typeof VALID_PAYMENT_FREQUENCIES[number])) {
    return value as 'mensuel' | 'trimestriel' | 'annuel';
  }
  return undefined;
}

/**
 * Normalise une Insurance
 */
function normalizeInsurance(value: unknown): Insurance | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  
  const compagnie = safeString(value.compagnie);
  const numeroPolice = safeString(value.numeroPolice);
  
  // Une assurance doit avoir au minimum une compagnie et un numéro de police
  if (!compagnie || !numeroPolice) {
    return undefined;
  }
  
  return {
    id: safeString(value.id),
    compagnie,
    typeAssurance: normalizeInsuranceType(value.typeAssurance) || 'autre',
    numeroPolice,
    montantCouverture: safeNumber(value.montantCouverture),
    devise: normalizeCurrency(value.devise),
    dateDebut: safeString(value.dateDebut),
    dateExpiration: safeString(value.dateExpiration),
    prime: safeNumber(value.prime),
    frequencePaiement: normalizePaymentFrequency(value.frequencePaiement),
    observations: safeString(value.observations),
  };
}

function normalizeInsuranceArray(value: unknown): Insurance[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const result = value
    .map((item) => normalizeInsurance(item))
    .filter((insurance): insurance is Insurance => Boolean(insurance));
  return result.length > 0 ? result : undefined;
}

/**
 * Normalise les informations de paiement incluant les assurances
 */
function normalizePaymentInfo(value: unknown): PaymentInfo | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  
  const paymentInfo: PaymentInfo = {
    preferredMethod: value.preferredMethod === 'bank' || value.preferredMethod === 'mobile_money' 
      ? value.preferredMethod 
      : undefined,
    bankAccounts: Array.isArray(value.bankAccounts) ? value.bankAccounts as PaymentInfo['bankAccounts'] : undefined,
    mobileMoneyAccounts: Array.isArray(value.mobileMoneyAccounts) ? value.mobileMoneyAccounts as PaymentInfo['mobileMoneyAccounts'] : undefined,
    assurances: normalizeInsuranceArray(value.assurances),
  };
  
  const hasContent = paymentInfo.preferredMethod || 
                     (paymentInfo.bankAccounts && paymentInfo.bankAccounts.length > 0) ||
                     (paymentInfo.mobileMoneyAccounts && paymentInfo.mobileMoneyAccounts.length > 0) ||
                     (paymentInfo.assurances && paymentInfo.assurances.length > 0);
  
  return hasContent ? paymentInfo : undefined;
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
    logo_url: safeString(input.logo_url),
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
    payment_info: normalizePaymentInfo(input.payment_info),
    owner: (input.owner as Record<string, unknown>) || (ceoData ? {
      id: 'owner',
      name: String(ceoData.name || ''),
      email: ceoData.email ? String(ceoData.email) : undefined,
      phone: ceoData.phone ? String(ceoData.phone) : undefined,
    } : undefined),
    contactPersons: normalizeContactPersonArray(input.contactPersons) || (leadershipData ? normalizeContactPersonArray(leadershipData) : undefined),
    
    // Personnes par catégorie
    dirigeants: normalizeContactPersonArray(input.dirigeants),
    actionnaires: normalizeContactPersonArray(input.actionnaires),
    employes: normalizeContactPersonArray(input.employes),
    
    // Actifs génériques (legacy)
    assets: normalizeAssetArray(input.assets),
    stocks: normalizeStockArray(input.stocks),
    
    // Actifs par catégorie
    immobilisations: normalizeAssetArray(input.immobilisations),
    equipements: normalizeAssetArray(input.equipements),
    vehicules: normalizeAssetArray(input.vehicules),
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
