// src/hooks/useFinancialProducts.ts
// Gestion complète des produits financiers d'un portefeuille traditionnel

import { useState, useCallback, useEffect } from 'react';
import { financialProductApi } from '../services/api/traditional/financialProduct.api';
import type {
  FinancialProduct,
  FinancialProductPayload,
  ProductStatus,
  ProductType,
} from '../types/traditional-portfolio';

export interface UseFinancialProductsOptions {
  portfolioId: string;
  /**
   * Déclencher automatiquement le fetch au montage.
   * Mettre à `false` pour un chargement paresseux (ex: déclenché à l'activation d'un onglet).
   * @default true
   */
  autoFetch?: boolean;
  /**
   * Produits déjà chargés (ex: champ financial_products du portfolio) —
   * utilisés comme état initial pour un affichage immédiat sans attendre le GET dédié.
   */
  initialProducts?: FinancialProduct[] | null;
  /** Filtre optionnel chargé au montage (ignoré si autoFetch=false) */
  initialFilters?: {
    status?: ProductStatus;
    type?: ProductType;
    search?: string;
  };
}

export interface UseFinancialProductsReturn {
  products: FinancialProduct[];
  loading: boolean;
  error: string | null;
  /** Recharger la liste (avec filtres optionnels) */
  fetchProducts: (filters?: {
    status?: ProductStatus;
    type?: ProductType;
    search?: string;
  }) => Promise<void>;
  /** Créer un produit */
  createProduct: (payload: FinancialProductPayload) => Promise<FinancialProduct>;
  /** Mettre à jour un produit */
  updateProduct: (
    id: string,
    payload: Partial<FinancialProductPayload>,
  ) => Promise<FinancialProduct>;
  /** Désactiver / supprimer un produit */
  deleteProduct: (id: string) => Promise<void>;
}

/** Normalise les champs numériques qui peuvent arriver sous forme de string depuis l'API */
function normalizeProduct(p: FinancialProduct): FinancialProduct {
  return {
    ...p,
    base_interest_rate:
      typeof p.base_interest_rate === 'string'
        ? parseFloat(p.base_interest_rate) || 0
        : p.base_interest_rate,
    min_amount:
      typeof p.min_amount === 'string'
        ? parseFloat(p.min_amount) || 0
        : p.min_amount,
    max_amount:
      typeof p.max_amount === 'string'
        ? parseFloat(p.max_amount) || 0
        : p.max_amount,
    min_term:
      typeof p.min_term === 'string' ? parseInt(p.min_term, 10) || 0 : p.min_term,
    max_term:
      typeof p.max_term === 'string' ? parseInt(p.max_term, 10) || 0 : p.max_term,
    fees: Array.isArray(p.fees) ? p.fees : [],
    required_documents: Array.isArray(p.required_documents)
      ? p.required_documents
      : [],
    eligibility_criteria: Array.isArray(p.eligibility_criteria)
      ? p.eligibility_criteria
      : [],
  };
}

export function useFinancialProducts(
  portfolioIdOrOptions: string | UseFinancialProductsOptions,
): UseFinancialProductsReturn {
  const { portfolioId, autoFetch = true, initialFilters, initialProducts } =
    typeof portfolioIdOrOptions === 'string'
      ? { portfolioId: portfolioIdOrOptions, autoFetch: true, initialFilters: undefined, initialProducts: undefined }
      : portfolioIdOrOptions;

  // Bootstrap depuis les données déjà chargées dans le portfolio (financial_products)
  const seed = Array.isArray(initialProducts) ? initialProducts.map(normalizeProduct) : [];

  const [products, setProducts] = useState<FinancialProduct[]>(seed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchroniser l'état si le portfolio se charge après le montage du hook
  // (initialProducts passe de [] à [produit1, ...])
  useEffect(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) {
      setProducts((prev) =>
        // Ne remplacer que si l'état est encore vide (pas encore de fetch dédié)
        prev.length === 0 ? initialProducts.map(normalizeProduct) : prev,
      );
    }
  }, [initialProducts]);

  const fetchProducts = useCallback(
    async (filters?: {
      status?: ProductStatus;
      type?: ProductType;
      search?: string;
    }) => {
      if (!portfolioId) return;
      setLoading(true);
      setError(null);
      try {
        const raw = await financialProductApi.getAll(portfolioId, filters);
        setProducts(raw.map(normalizeProduct));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erreur lors du chargement des produits';
        setError(message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [portfolioId],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchProducts(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId, autoFetch]);

  const createProduct = useCallback(
    async (payload: FinancialProductPayload): Promise<FinancialProduct> => {
      const created = await financialProductApi.create(payload);
      const normalized = normalizeProduct(created);
      setProducts((prev) => [normalized, ...prev]);
      return normalized;
    },
    [],
  );

  const updateProduct = useCallback(
    async (
      id: string,
      payload: Partial<FinancialProductPayload>,
    ): Promise<FinancialProduct> => {
      const updated = await financialProductApi.update(id, payload);
      const normalized = normalizeProduct(updated);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? normalized : p)),
      );
      return normalized;
    },
    [],
  );

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    await financialProductApi.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
