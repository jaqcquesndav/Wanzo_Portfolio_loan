import { useState, useEffect } from 'react';
import { mockFinancialInstitution } from '../data/mockFinancialInstitution';
import { FinancialInstitution } from '../types/financialInstitution';

export function useOrganization() {
  const [institutionData, setInstitutionData] = useState<FinancialInstitution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInstitution = async () => {
      setIsLoading(true);
      try {
        // Vérifier d'abord si les données sont dans le localStorage
        const storedInstitutionData = localStorage.getItem('financialInstitutionData');
        
        if (storedInstitutionData) {
          setInstitutionData(JSON.parse(storedInstitutionData));
        } else {
          // Sinon, utiliser les données mockées
          // Sauvegarder dans localStorage pour une utilisation future
          localStorage.setItem('financialInstitutionData', JSON.stringify(mockFinancialInstitution));
          
          setInstitutionData(mockFinancialInstitution);
        }
      } catch (err: unknown) {
        console.error("Erreur lors du chargement des données de l'institution:", err);
        setError(err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Erreur inconnue'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
  }, []);

  // Nous ne fournissons plus de fonction de mise à jour car les modifications ne sont plus permises
  return {
    institutionData,
    isLoading,
    error
  };
}
