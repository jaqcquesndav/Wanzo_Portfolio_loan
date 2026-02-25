// src/services/api/traditional/financialProduct.api.ts
// CRUD pour les produits financiers d'un portefeuille traditionnel
// Base URL : /portfolios/traditional/products

import { apiClient } from '../base.api';
import type {
  FinancialProduct,
  FinancialProductPayload,
  ProductType,
  ProductStatus,
} from '../../../types/traditional-portfolio';

const BASE = '/portfolios/traditional/products';

/** Extrait le tableau de produits quelle que soit la forme de la réponse */
function extractArray(raw: unknown): FinancialProduct[] {
  if (Array.isArray(raw)) return raw as FinancialProduct[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r?.data))    return r.data as FinancialProduct[];
  if (Array.isArray(r?.products)) return r.products as FinancialProduct[];
  return [];
}

/** Extrait un produit unique depuis { product: {...} } ou l'objet lui-même */
function extractOne(raw: unknown): FinancialProduct {
  const r = raw as Record<string, unknown>;
  if (r?.product && typeof r.product === 'object') return r.product as FinancialProduct;
  return raw as FinancialProduct;
}

export const financialProductApi = {
  /**
   * Lister les produits d'un portefeuille
   * GET /portfolios/traditional/products?portfolio_id=...
   */
  getAll: async (
    portfolioId: string,
    filters?: {
      status?: ProductStatus;
      type?: ProductType;
      search?: string;
      page?: number;
      per_page?: number;
    },
  ): Promise<FinancialProduct[]> => {
    const params = new URLSearchParams({ portfolio_id: portfolioId });
    if (filters?.status)   params.append('status', filters.status);
    if (filters?.type)     params.append('type', filters.type);
    if (filters?.search)   params.append('search', filters.search);
    if (filters?.page)     params.append('page', String(filters.page));
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    const raw = await apiClient.get<unknown>(`${BASE}?${params.toString()}`);
    return extractArray(raw);
  },

  /**
   * Récupérer un produit par ID
   * GET /portfolios/traditional/products/:id
   */
  getById: async (id: string): Promise<FinancialProduct> => {
    const raw = await apiClient.get<unknown>(`${BASE}/${id}`);
    return extractOne(raw);
  },

  /**
   * Créer un produit financier
   * POST /portfolios/traditional/products
   */
  create: async (payload: FinancialProductPayload): Promise<FinancialProduct> => {
    const raw = await apiClient.post<unknown>(BASE, payload);
    return extractOne(raw);
  },

  /**
   * Modifier un produit financier
   * PUT /portfolios/traditional/products/:id
   */
  update: async (
    id: string,
    payload: Partial<FinancialProductPayload>,
  ): Promise<FinancialProduct> => {
    const raw = await apiClient.put<unknown>(`${BASE}/${id}`, payload);
    return extractOne(raw);
  },

  /**
   * Désactiver / supprimer un produit
   * DELETE /portfolios/traditional/products/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
