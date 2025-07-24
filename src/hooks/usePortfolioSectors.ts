// src/hooks/usePortfolioSectors.ts
import { useState, useEffect } from 'react';
import { portfolioStorageService } from '../services/storage/localStorage';
import type { PortfolioType } from '../types/portfolio';
import type { PortfolioWithType } from '../types/portfolioWithType';
import { getMainSectors } from '../constants/sectors';

// Interface pour les données sectorielles
export interface SectorDistribution {
  [sector: string]: number; // Pourcentage de répartition
}

/**
 * Hook pour récupérer la répartition des investissements par secteur
 */
export function usePortfolioSectors(portfolioType?: PortfolioType) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [sectorDistribution, setSectorDistribution] = useState<SectorDistribution>({});

  useEffect(() => {
    const fetchSectorDistribution = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les portefeuilles du type spécifié
        const allPortfolios = await portfolioStorageService.getAllPortfolios();
        const portfolios = allPortfolios
          .filter((p: PortfolioWithType) => !portfolioType || p.type === portfolioType);
        
        // Si aucun portefeuille, utiliser des données par défaut
        if (portfolios.length === 0) {
          const defaultSectors = getDefaultSectorDistribution(portfolioType);
          return setSectorDistribution(defaultSectors);
        }
        
        // Calculer la répartition des secteurs
        const sectorCounts: Record<string, number> = {};
        let totalAmount = 0;
        
        // Agréger les montants par secteur
        portfolios.forEach((portfolio: PortfolioWithType) => {
          // Utiliser le premier secteur cible ou sauter si aucun secteur n'est défini
          const sector = portfolio.target_sectors && portfolio.target_sectors.length > 0 
            ? portfolio.target_sectors[0] 
            : undefined;
            
          if (!sector) return;
          
          // Utiliser target_amount ou la valeur nette du portefeuille comme montant
          const amount = portfolio.target_amount || (portfolio.metrics?.net_value) || 0;
          totalAmount += amount;
          
          if (sectorCounts[sector]) {
            sectorCounts[sector] += amount;
          } else {
            sectorCounts[sector] = amount;
          }
        });
        
        // Convertir en pourcentages
        const distribution: SectorDistribution = {};
        
        if (totalAmount > 0) {
          Object.entries(sectorCounts).forEach(([sector, amount]) => {
            distribution[sector] = Math.round((amount / totalAmount) * 100);
          });
        } else {
          // Fallback si pas de montants
          Object.keys(sectorCounts).forEach(sector => {
            distribution[sector] = Math.round(100 / Object.keys(sectorCounts).length);
          });
        }
        
        setSectorDistribution(distribution);
      } catch (err) {
        console.error('Erreur lors de la récupération des données sectorielles', err);
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        
        // Utiliser des données par défaut en cas d'erreur
        setSectorDistribution(getDefaultSectorDistribution(portfolioType));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectorDistribution();
  }, [portfolioType]);
  
  return { sectorDistribution, loading, error };
}

/**
 * Fonction utilitaire pour obtenir des données sectorielles par défaut
 */
function getDefaultSectorDistribution(portfolioType?: PortfolioType): SectorDistribution {
  // Données par défaut en fonction du type de portefeuille
  if (portfolioType === 'traditional') {
    return {
      'Agriculture': 25,
      'Commerce': 30,
      'Services': 20,
      'Industrie': 15,
      'BTP': 10
    };
  } else if (portfolioType === 'investment') {
    return {
      'Technologies': 35,
      'Finance': 25,
      'Santé': 15,
      'Énergie': 15,
      'Industrie': 10
    };
  } else if (portfolioType === 'leasing') {
    return {
      'Transport et logistique': 40,
      'BTP': 25,
      'Industrie': 20,
      'Agriculture': 10,
      'Services': 5
    };
  }
  
  // Par défaut, utiliser les secteurs principaux avec une distribution égale
  const mainSectors = getMainSectors().slice(0, 5);
  const equalDistribution = Math.round(100 / mainSectors.length);
  
  return mainSectors.reduce((acc, sector) => {
    acc[sector] = equalDistribution;
    return acc;
  }, {} as SectorDistribution);
}
