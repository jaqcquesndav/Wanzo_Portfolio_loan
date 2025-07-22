// src/hooks/useCentraleRisqueV2.ts
import { useState, useEffect } from 'react';
import { centraleRisqueStorageService } from '../services/storage/centraleRisqueStorage';
import type { 
  CreditRiskEntry, 
  LeasingRiskEntry, 
  InvestmentRiskEntry 
} from '../data/mockCentraleRisque';

type RiskDataType = 'credit' | 'leasing' | 'investment';

/**
 * Hook générique pour accéder aux données de la centrale de risque
 * @param type Type de données de risque à récupérer
 */
export function useCentraleRisqueV2<T>(type: RiskDataType = 'credit') {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result: unknown[] = [];
      
      // Charger les données en fonction du type
      switch (type) {
        case 'credit':
          result = await centraleRisqueStorageService.getCreditRiskData();
          break;
        case 'leasing':
          result = await centraleRisqueStorageService.getLeasingRiskData();
          break;
        case 'investment':
          result = await centraleRisqueStorageService.getInvestmentRiskData();
          break;
        default:
          throw new Error(`Type de données de risque non supporté: ${type}`);
      }
      
      setData(result as T[]);
    } catch (err) {
      console.error(`Erreur lors du chargement des données de risque ${type}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, [type]);

  // Fonction pour rafraîchir les données
  const refresh = async () => {
    await loadData();
  };

  return { data, loading, error, refresh };
}

/**
 * Hook pour accéder aux données de risque crédit
 */
export function useCreditRisk() {
  return useCentraleRisqueV2<CreditRiskEntry>('credit');
}

/**
 * Hook pour accéder aux données de risque leasing
 */
export function useLeasingRisk() {
  return useCentraleRisqueV2<LeasingRiskEntry>('leasing');
}

/**
 * Hook pour accéder aux données de risque investissement
 */
export function useInvestmentRisk() {
  return useCentraleRisqueV2<InvestmentRiskEntry>('investment');
}

/**
 * Hook pour accéder aux données de risque d'une entreprise spécifique
 * @param companyId ID de l'entreprise
 */
export function useCompanyRiskData(companyId: string) {
  const [data, setData] = useState<{
    credit?: CreditRiskEntry;
    leasing?: LeasingRiskEntry;
    investment?: InvestmentRiskEntry;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les données de risque pour les trois types
        const [creditRisk, leasingRisk, investmentRisk] = await Promise.all([
          centraleRisqueStorageService.getCreditRiskByCompanyId(companyId),
          centraleRisqueStorageService.getLeasingRiskByCompanyId(companyId),
          centraleRisqueStorageService.getInvestmentRiskByCompanyId(companyId)
        ]);
        
        setData({
          credit: creditRisk,
          leasing: leasingRisk,
          investment: investmentRisk
        });
      } catch (err) {
        console.error(`Erreur lors du chargement des données de risque pour l'entreprise ${companyId}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  return { data, loading, error };
}
