import { useState, useEffect, useCallback } from 'react';
import { companyApi } from '../services/api/shared/company.api';
import type { Company, CompanySize, CompanyStatus } from '../types/company';
import { mockCompanyDetails } from '../data/mockCompanyDetails';

// Simple in-memory cache to avoid duplicate fetches during a session
const companyCache = new Map<string, Company | null>();

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
    return input as Company;
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
    locations: (input.locations as unknown[]) || (addressData ? [{
      id: 'primary',
      address: addressData.street ? String(addressData.street) : '',
      city: addressData.city ? String(addressData.city) : '',
      country: addressData.country ? String(addressData.country) : '',
      isPrimary: true,
    }] : undefined),
    latitude: Number(input.latitude || coordData?.latitude || 0) || undefined,
    longitude: Number(input.longitude || coordData?.longitude || 0) || undefined,
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
      esg_rating: input.esgScore && Number(input.esgScore) >= 80 ? 'A' : 'B',
      carbon_footprint: 0,
      environmental_rating: 'B',
      social_rating: 'B',
      governance_rating: 'A',
    },
    profileCompleteness: input.profileCompleteness ? Number(input.profileCompleteness) : 85,
    lastSyncFromAccounting: input.lastSyncFromAccounting ? String(input.lastSyncFromAccounting) : new Date().toISOString(),
    lastSyncFromCustomer: input.lastSyncFromCustomer ? String(input.lastSyncFromCustomer) : new Date().toISOString(),
    created_at: input.created_at ? String(input.created_at) : new Date().toISOString(),
    updated_at: input.updated_at ? String(input.updated_at) : new Date().toISOString(),
  } as Company;
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
    if (!id) return null;
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
      const data = await companyApi.getCompanyById(id);
      const normalized = normalizeToCompany(data);
      setCompany(normalized);
      companyCache.set(id, normalized);
      setLoading(false);
      return normalized;
    } catch (err: unknown) {
      // Network or API error — fallback to mock data for demo/fallback
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      console.warn(`[useCompanyData] API error for company ${id}: ${errorMsg}. Using mock data as fallback.`);
      
      // Use mock data as fallback
      setCompany(mockCompanyDetails);
      setError(null); // Clear error since we have fallback data
      setLoading(false);
      // Cache the mock data
      companyCache.set(id, mockCompanyDetails);
      return mockCompanyDetails;
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
