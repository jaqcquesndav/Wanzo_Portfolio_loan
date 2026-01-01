// src/hooks/usePortfolios.ts
// Hook pour récupérer les portefeuilles via l'API backend avec fallback localStorage

import { useEffect, useState, useCallback } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import { traditionalPortfolioApi } from '../services/api/traditional/portfolio.api';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';

export type PortfolioType = 'traditional';

/**
 * Hook pour gérer la récupération des portefeuilles
 * Utilise l'API backend avec fallback sur localStorage en cas d'échec
 */
export function usePortfolios(type: PortfolioType) {
  const [portfolios, setPortfolios] = useState<AnyPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backendFailed, setBackendFailed] = useState(false);

  // Permet de forcer le rechargement depuis l'extérieur (ex: après création)
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Essayer d'abord de récupérer les données du backend
      console.log(`📡 Chargement des portefeuilles ${type} depuis le backend...`);
      
      let backendData: AnyPortfolio[] = [];
      let backendSuccess = false;
      
      if (type === 'traditional') {
        try {
          // Utiliser la vraie API backend
          const response = await traditionalPortfolioApi.getAllPortfolios();
          // La réponse peut être un tableau directement ou avoir une structure { data: [...] }
          backendData = Array.isArray(response) ? response : (response as unknown as { data: AnyPortfolio[] }).data || [];
          backendSuccess = true;
          console.log(`✅ ${backendData.length} portefeuilles chargés depuis le backend`);
        } catch (backendErr) {
          console.warn('⚠️ Erreur backend, utilisation des données locales:', backendErr);
          backendSuccess = false;
        }
      }
      
      // Toujours charger les données locales (pour les portefeuilles créés en mode offline)
      const localData = await portfolioStorageService.getPortfoliosByType(type);
      console.log(`📦 ${localData.length} portefeuilles trouvés dans localStorage`);
      
      // Fusionner les données: backend + locaux non synchronisés
      const backendIds = new Set(backendData.map(p => p.id));
      const localOnlyData = localData.filter(p => {
        // Garder les portefeuilles locaux qui:
        // 1. N'existent pas dans le backend
        // 2. Ou qui ont le flag _pendingSync (créés en mode offline)
        const isLocalOnly = !backendIds.has(p.id);
        const isPendingSync = (p as Record<string, unknown>)._pendingSync === true;
        return isLocalOnly || isPendingSync;
      });
      
      if (localOnlyData.length > 0) {
        console.log(`📦 ${localOnlyData.length} portefeuilles locaux (non synchronisés) ajoutés`);
      }
      
      // Combiner: backend d'abord, puis locaux non synchronisés
      const mergedData = [...backendData, ...localOnlyData];
      
      console.log(`✅ Total: ${mergedData.length} portefeuilles (${backendData.length} backend + ${localOnlyData.length} locaux)`);
      setPortfolios(mergedData);
      setBackendFailed(!backendSuccess);
      
      // Synchroniser le localStorage avec les données backend
      for (const portfolio of backendData) {
        await portfolioStorageService.addOrUpdatePortfolio(portfolio as Parameters<typeof portfolioStorageService.addOrUpdatePortfolio>[0]);
      }
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des portefeuilles:', err);
      setError(err instanceof Error ? err : new Error('Erreur de connexion'));
      setBackendFailed(true);
      
      // Fallback complet sur localStorage
      try {
        console.log('📦 Fallback complet sur localStorage...');
        const localData = await portfolioStorageService.getPortfoliosByType(type);
        if (localData.length > 0) {
          console.log(`✅ ${localData.length} portefeuilles chargés depuis le localStorage (fallback)`);
          setPortfolios(localData);
        } else {
          console.log('⚠️ Aucune donnée locale disponible');
          setPortfolios([]);
        }
      } catch (localErr) {
        console.error('❌ Erreur lors du fallback localStorage:', localErr);
        setPortfolios([]);
      }
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { portfolios, loading, error, backendFailed, refresh };
}
