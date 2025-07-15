import { useState, useEffect } from 'react';
import { mockOrganization, additionalOrganizationInfo } from '../data/mockOrganization';
import { Institution } from '../types/institution';

export interface OrganizationData extends Institution {
  legalForm: 'sa' | 'sarl' | 'sas' | 'other';
  capital: number;
  employeeCount: number;
  subsidiaryCount: number;
  boardMembers: number;
  executiveCommitteeMembers: number;
  specializedCommittees: number;
  subsidiaries?: Array<{
    name: string;
    address: string;
    manager: string;
  }>;
}

export function useOrganization() {
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      setIsLoading(true);
      try {
        // Vérifier d'abord si les données sont dans le localStorage
        const storedOrgData = localStorage.getItem('organizationData');
        
        if (storedOrgData) {
          setOrganizationData(JSON.parse(storedOrgData));
        } else {
          // Sinon, utiliser les données mockées
          const combinedData = {
            ...mockOrganization,
            ...additionalOrganizationInfo
          } as OrganizationData;
          
          // Sauvegarder dans localStorage pour une utilisation future
          localStorage.setItem('organizationData', JSON.stringify(combinedData));
          
          setOrganizationData(combinedData);
        }
      } catch (err: unknown) {
        console.error("Erreur lors du chargement des données de l'organisation:", err);
        setError(err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Erreur inconnue'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  // Fonction pour mettre à jour l'organisation
  const updateOrganization = async (data: Partial<OrganizationData>) => {
    try {
      if (organizationData) {
        // Dans une application réelle, vous feriez un appel API ici
        // Simuler un délai pour une API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const updatedData = {
          ...organizationData,
          ...data,
          updated_at: new Date().toISOString()
        };
        
        // Mettre à jour dans localStorage
        localStorage.setItem('organizationData', JSON.stringify(updatedData));
        
        // Mettre à jour le state
        setOrganizationData(updatedData);
        
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'organisation:", err);
      throw err;
    }
  };

  return {
    organizationData,
    isLoading,
    error,
    updateOrganization
  };
}
