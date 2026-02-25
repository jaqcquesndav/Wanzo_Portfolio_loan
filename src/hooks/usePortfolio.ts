// src/hooks/usePortfolio.ts
import { useEffect, useState, useCallback } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import { traditionalPortfolioApi } from '../services/api/traditional/portfolio.api';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';
import type { TraditionalPortfolio } from '../types/traditional-portfolio';
export type PortfolioType = 'traditional' | 'leasing' | 'investment';

export function usePortfolio(id: string | undefined, type: PortfolioType) {
  const [portfolio, setPortfolio] = useState<AnyPortfolio | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const load = async () => {
      console.log(`Loading portfolio ${id} of type ${type}`);

      // 1) Essayer d'abord le localStorage
      const local = await portfolioStorageService.getPortfolio(id);
      if (local && local.type === type) {
        console.log(`Portfolio ${id} loaded from localStorage.`);
        setPortfolio(local);
        setLoading(false);
        return;
      }

      // 2) Fallback: récupérer depuis l'API backend
      console.log(`Portfolio ${id} non trouvé localement — requête API...`);
      try {
        const response = await traditionalPortfolioApi.getPortfolioById(id);
        const apiPortfolio = response && typeof response === 'object' && 'id' in response
          ? (response as TraditionalPortfolio)
          : ((response as { data: TraditionalPortfolio }).data);

        if (apiPortfolio?.id) {
          // Sanitiser le champ products : l'API peut retourner ["[]"] au lieu de []
          // On filtre les entrées invalides (chaînes, objets sans id)
          const rawProducts = apiPortfolio.products as unknown[];
          const cleanProducts = Array.isArray(rawProducts)
            ? rawProducts.filter(
                (p): p is import('../types/traditional-portfolio').FinancialProduct =>
                  typeof p === 'object' && p !== null && 'id' in p
              )
            : [];
          const sanitized = { ...apiPortfolio, products: cleanProducts };

          // Persister dans localStorage pour les prochains accès
          await portfolioStorageService.addOrUpdatePortfolio({
            ...sanitized,
            type: 'traditional',
          } as import('../types/portfolio').PortfolioWithType);
          console.log(`Portfolio ${id} chargé depuis l'API et persisté localement.`);
          setPortfolio(sanitized as AnyPortfolio);
        } else {
          console.warn(`Portfolio ${id} introuvable via l'API.`);
          setError(new Error(`Portfolio ${id} not found`));
          setPortfolio(undefined);
        }
      } catch (apiErr) {
        console.error(`Erreur API pour portfolio ${id}:`, apiErr);
        setError(apiErr instanceof Error ? apiErr : new Error(String(apiErr)));
        setPortfolio(undefined);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, type]);


  const addOrUpdate = useCallback(async (data: Partial<AnyPortfolio>) => {
    if (!id) return;
    const updated = { ...portfolio, ...data, id, type, updated_at: new Date().toISOString() } as AnyPortfolio;
    await portfolioStorageService.addOrUpdatePortfolio(updated as import('../types/portfolio').PortfolioWithType);
    // Relire la donnée depuis localStorage pour garantir la cohérence
    const fresh = await portfolioStorageService.getPortfolio(id);
    setPortfolio(fresh);
  }, [id, type, portfolio]);

  return {
    portfolio,
    loading,
    error,
    addOrUpdate,
    // ...autres actions génériques (delete, etc.)
  };
}
