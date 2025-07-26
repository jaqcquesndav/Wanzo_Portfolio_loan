
import { useEffect, useState, useCallback } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import type { Portfolio as AnyPortfolio } from '../types/portfolio';

// Simuler une API pour démontrer la gestion des erreurs
// Dans un cas réel, cela serait remplacé par une vraie API
const mockBackendAPI = {
  async getPortfoliosByType(type: string): Promise<AnyPortfolio[]> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler une erreur de connexion aléatoirement (20% du temps)
    if (Math.random() < 0.2) {
      throw new Error('Failed to connect to server: Network error');
    }
    
    // Si pas d'erreur, on retourne les données du localStorage (mock)
    return portfolioStorageService.getPortfoliosByType(type);
  }
};

export type PortfolioType = 'traditional';

export function usePortfolios(type: PortfolioType) {
  const [portfolios, setPortfolios] = useState<AnyPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backendFailed, setBackendFailed] = useState(false);

  // Permet de forcer le rechargement depuis l'extérieur (ex: après création)
  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    
    // Essayer d'abord de récupérer les données du backend
    mockBackendAPI.getPortfoliosByType(type)
      .then(data => {
        setPortfolios(data);
        setBackendFailed(false);
      })
      .catch(err => {
        console.error('Erreur lors de la récupération des portefeuilles depuis le backend:', err);
        setError(err);
        setBackendFailed(true);
        
        // En cas d'échec du backend, utiliser les données du localStorage comme fallback
        return portfolioStorageService.getPortfoliosByType(type)
          .then(localData => {
            if (localData.length > 0) {
              console.log('Utilisation des données locales comme fallback');
              setPortfolios(localData);
            }
          });
      })
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { portfolios, loading, error, backendFailed, refresh };
}
