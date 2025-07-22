// src/hooks/useCentraleRisque.ts
// Hook personnalisé pour accéder aux données de la centrale de risque

import { useState, useEffect } from 'react';
import { CENTRALE_RISQUE_KEYS } from '../services/storage/centraleRisqueStorage';

// Types existants (à conserver pour la compatibilité)
export interface CreditRiskData {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  encours: number;
  statut: string;
  rating: string;
  incidents: number;
  creditScore: number;
  debtRatio: number;
  lastUpdated: string;
}

export interface LeasingRiskData {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  equipment: string;
  valeurFinancement: number;
  statut: string;
  rating: string;
  incidents: number;
  creditScore: number;
  lastUpdated: string;
}

export interface InvestmentRiskData {
  id: string;
  companyId: string;
  companyName: string;
  sector: string;
  institution: string;
  investmentType: 'Action' | 'Obligation';
  montantInvesti: number;
  valorisation: number;
  statut: string;
  rating: string;
  ebitda: number;
  rendementActuel: number;
  lastUpdated: string;
}

export type RiskDataType = 'credit' | 'leasing' | 'investment';

/**
 * Hook pour accéder aux données de risque de crédit
 */
export function useCreditRiskData() {
  const [data, setData] = useState<CreditRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        // Récupérer les données du localStorage
        const storedData = localStorage.getItem(CENTRALE_RISQUE_KEYS.CREDITS);
        
        if (storedData) {
          setData(JSON.parse(storedData));
        } else {
          // Aucune donnée trouvée
          console.warn('Données de risque crédit non trouvées dans le localStorage');
          setData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook pour accéder aux données de risque de leasing
 */
export function useLeasingRiskData() {
  const [data, setData] = useState<LeasingRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        // Récupérer les données du localStorage
        const storedData = localStorage.getItem(CENTRALE_RISQUE_KEYS.LEASING);
        
        if (storedData) {
          setData(JSON.parse(storedData));
        } else {
          // Aucune donnée trouvée
          console.warn('Données de risque leasing non trouvées dans le localStorage');
          setData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook pour accéder aux données de risque d'investissement
 */
export function useInvestmentRiskData() {
  const [data, setData] = useState<InvestmentRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        // Récupérer les données du localStorage
        const storedData = localStorage.getItem(CENTRALE_RISQUE_KEYS.INVESTMENTS);
        
        if (storedData) {
          setData(JSON.parse(storedData));
        } else {
          // Aucune donnée trouvée
          console.warn('Données de risque investissement non trouvées dans le localStorage');
          setData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook générique pour accéder aux données de la centrale de risque
 * @param type Type de données de risque à récupérer
 */
export function useCentraleRisque<T>(
  type: RiskDataType
): { data: T[], loading: boolean, error: Error | null, refresh: () => void } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Fonction pour rafraîchir les données
  const refresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        
        // Déterminer la clé de stockage en fonction du type
        let storageKey: string;
        switch (type) {
          case 'credit':
            storageKey = CENTRALE_RISQUE_KEYS.CREDITS;
            break;
          case 'leasing':
            storageKey = CENTRALE_RISQUE_KEYS.LEASING;
            break;
          case 'investment':
            storageKey = CENTRALE_RISQUE_KEYS.INVESTMENTS;
            break;
          default:
            throw new Error(`Type de données de risque non pris en charge: ${type}`);
        }
        
        // Récupérer les données du localStorage
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          setData(JSON.parse(storedData) as T[]);
        } else {
          // Aucune donnée trouvée
          console.warn(`Données de risque ${type} non trouvées dans le localStorage`);
          setData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, refreshCount]);

  return { data, loading, error, refresh };
}
