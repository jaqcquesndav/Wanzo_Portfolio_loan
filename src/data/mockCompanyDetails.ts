// src/data/mockCompanyDetails.ts
// Fichier d'adaptation des données mock legacy vers le type Company

import { techinnovate } from './companies/techinnovate';
import type { Company } from '../types/company';

/**
 * Adapter les données legacy vers le type Company strict
 */
function adaptLegacyCompanyToType(legacy: any): Company {
  return {
    // Identité
    id: legacy.id || 'unknown',
    name: legacy.name || 'Sans nom',
    sector: legacy.sector || legacy.industry || 'Non spécifié',
    size: legacy.size || ((legacy.employee_count || 0) > 100 ? 'large' : (legacy.employee_count || 0) > 20 ? 'medium' : 'small') as any,
    status: legacy.status as any || 'active',

    // Opérationnel
    employee_count: legacy.employee_count || legacy.employees || 0,
    website_url: legacy.socialMedia?.website || legacy.website,
    pitch_deck_url: legacy.pitch_deck_url,
    lastContact: legacy.scenario?.lastContact,

    // Financier
    annual_revenue: legacy.annual_revenue || legacy.capital?.amount || 0,
    financial_metrics: {
      annual_revenue: legacy.annual_revenue || legacy.capital?.amount || 0,
      revenue_growth: legacy.financial_metrics?.revenue_growth || legacy.financialHighlights?.growthRate || 0,
      profit_margin: legacy.financialHighlights?.operatingMargin || 0,
      cash_flow: legacy.financialHighlights?.netIncome || 0,
      debt_ratio: legacy.financialHighlights?.equityRatio ? (100 - legacy.financialHighlights.equityRatio) / 100 : 0,
      working_capital: (legacy.financialHighlights?.totalAssets || 0) - (legacy.financialHighlights?.totalLiabilities || 0),
      credit_score: legacy.creditRating ? (legacy.creditRating === 'A' ? 85 : legacy.creditRating === 'B' ? 70 : 55) : 75,
      financial_rating: (legacy.creditRating || 'BBB') as any,
      ebitda: legacy.financialHighlights?.ebitda,
    },

    // Contact et localisation
    contact_info: legacy.contacts ? {
      email: legacy.contacts.email,
      phone: legacy.contacts.phone,
      address: legacy.address?.street ? `${legacy.address.street}, ${legacy.address.city}` : undefined,
      website: legacy.socialMedia?.website || legacy.website,
    } : undefined,
    locations: legacy.address ? [{
      id: 'primary',
      address: legacy.address.street || '',
      city: legacy.address.city || '',
      country: legacy.address.country || legacy.country || '',
      isPrimary: true,
    }] : undefined,
    latitude: legacy.coordinates?.latitude,
    longitude: legacy.coordinates?.longitude,

    // Légales et paiement
    legal_info: {
      legalForm: (legacy.legalForm || 'SARL') as any,
      rccm: legacy.rccm,
      taxId: legacy.taxId,
      yearFounded: legacy.founded,
    },
    payment_info: undefined, // Non présent dans les données legacy

    // Personnes
    owner: legacy.ceo ? {
      id: legacy.ceo.id || 'ceo',
      name: legacy.ceo.name,
      email: legacy.ceo.email,
      phone: legacy.ceo.phone,
    } : undefined,
    contactPersons: legacy.leadership_team?.map((leader: any, idx: number) => ({
      id: leader.id || `leader-${idx}`,
      nom: leader.name?.split(' ')[0],
      prenoms: leader.name?.split(' ').slice(1).join(' '),
      fonction: leader.title,
      email: leader.email,
      telephone: leader.phone,
      role: leader.title,
    })),

    // Patrimoines et actifs
    assets: undefined, // Non présent dans les données legacy
    stocks: undefined, // Non présent dans les données legacy

    // ESG
    esg_metrics: {
      esg_rating: legacy.esgScore ? (legacy.esgScore >= 80 ? 'A' : legacy.esgScore >= 60 ? 'B' : 'C') : undefined,
      carbon_footprint: 0,
      environmental_rating: (legacy.esgScore >= 80 ? 'A' : legacy.esgScore >= 60 ? 'B' : 'C') as any,
      social_rating: 'B' as any,
      governance_rating: 'A' as any,
    },

    // Métadonnées
    profileCompleteness: 85,
    lastSyncFromAccounting: new Date().toISOString(),
    lastSyncFromCustomer: new Date().toISOString(),

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Adapter et exporter les données mock
export const mockCompanyDetails = adaptLegacyCompanyToType(techinnovate) as Company;

