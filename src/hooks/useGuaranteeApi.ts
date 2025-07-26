// src/hooks/useGuaranteeApi.ts
import { useState, useEffect, useCallback } from 'react';
import { guaranteeApi, GuaranteeResponse } from '../services/api/traditional/guarantee.api';
import type { Guarantee } from '../types/guarantee';

/**
 * Hook pour gérer les garanties d'un contrat spécifique
 */
export function useContractGuarantees(portfolioId: string, contractId: string) {
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuarantees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await guaranteeApi.getContractGuarantees(portfolioId, contractId);
      
      // Handle both direct API response or the shaped object from localStorage fallback
      const responseData = 'success' in response.data 
        ? response.data 
        : { success: true, data: response.data };
      
      if (!responseData || !responseData.success) {
        setGuarantees([]);
        setError('Échec de récupération des garanties');
        return;
      }
      
      const apiGuarantees = responseData.data || [];
      
      // Convertir du format API au format interne
      const formattedGuarantees: Guarantee[] = apiGuarantees.map((apiGuarantee: GuaranteeResponse) => ({
        id: apiGuarantee.id,
        company: 'N/A', // À compléter avec les données réelles
        type: apiGuarantee.type,
        value: apiGuarantee.value,
        status: apiGuarantee.status === 'validated' ? 'active' : 
                apiGuarantee.status === 'rejected' ? 'expirée' : 'pending',
        created_at: apiGuarantee.created_at,
        contractId: apiGuarantee.contract_id,
        portfolioId: portfolioId,
        details: {
          description: apiGuarantee.description || '',
          location: apiGuarantee.location?.address || '',
          reference: apiGuarantee.details?.reference?.toString() || '',
          document_url: apiGuarantee.documents && apiGuarantee.documents.length > 0 ? apiGuarantee.documents[0].url : ''
        }
      }));
      
      setGuarantees(formattedGuarantees);
      setError(null);
    } catch (err) {
      console.error('Error fetching guarantees:', err);
      setError('Erreur lors de la récupération des garanties');
    } finally {
      setLoading(false);
    }
  }, [portfolioId, contractId]);

  useEffect(() => {
    fetchGuarantees();
  }, [fetchGuarantees]);

  const getGuaranteeById = useCallback(async (guaranteeId: string): Promise<Guarantee | null> => {
    try {
      const response = await guaranteeApi.getGuaranteeDetails(portfolioId, contractId, guaranteeId);
      
      // Handle both direct API response or the shaped object from localStorage fallback
      const responseData = 'success' in response.data 
        ? response.data 
        : { success: true, data: response.data };
      
      if (!responseData || !responseData.success) {
        return null;
      }
      
      const apiGuarantee = responseData.data;
      
      if (!apiGuarantee) return null;
      
      // Convertir du format API au format interne
      return {
        id: apiGuarantee.id,
        company: 'N/A', // À compléter avec les données réelles
        type: apiGuarantee.type,
        value: apiGuarantee.value,
        status: apiGuarantee.status === 'validated' ? 'active' : 
                apiGuarantee.status === 'rejected' ? 'expirée' : 'pending',
        created_at: apiGuarantee.created_at,
        contractId: apiGuarantee.contract_id,
        portfolioId: portfolioId,
        details: {
          description: apiGuarantee.description || '',
          location: apiGuarantee.location?.address || '',
          reference: apiGuarantee.details?.reference?.toString() || '',
          document_url: apiGuarantee.documents && apiGuarantee.documents.length > 0 ? apiGuarantee.documents[0].url : ''
        }
      };
    } catch (err) {
      console.error(`Error getting guarantee ${guaranteeId}:`, err);
      setError(`Erreur lors de la récupération de la garantie ${guaranteeId}`);
      return null;
    }
  }, [portfolioId, contractId]);

  const createGuarantee = useCallback(async (data: Omit<Guarantee, 'id' | 'created_at' | 'status'>): Promise<Guarantee | null> => {
    try {
      const response = await guaranteeApi.createGuarantee(portfolioId, contractId, {
        type: data.type,
        description: data.details?.description || '',
        value: data.value,
        currency: 'XOF',
        location: data.details?.location ? {
          address: data.details.location,
          city: 'N/A',
          country: 'CI'
        } : undefined,
        details: data.details as Record<string, string | number | boolean>
      });
      
      if (!response || !response.data) {
        return null;
      }
      
      // Handle both direct API response or the shaped object from localStorage fallback
      const responseData = response.data && 'success' in response.data 
        ? response.data 
        : { success: true, data: response.data };
      
      const newGuarantee = 'data' in responseData ? responseData.data : responseData;
      
      if (!newGuarantee) return null;
      
      // Convertir du format API au format interne
      const formattedGuarantee: Guarantee = {
        id: newGuarantee.id,
        company: 'N/A', // À compléter avec les données réelles
        type: newGuarantee.type,
        value: newGuarantee.value,
        status: newGuarantee.status === 'validated' ? 'active' : 
                newGuarantee.status === 'rejected' ? 'expirée' : 'pending',
        created_at: newGuarantee.created_at,
        contractId: newGuarantee.contract_id,
        portfolioId: portfolioId,
        details: {
          description: newGuarantee.description || '',
          location: newGuarantee.location?.address || '',
          reference: newGuarantee.details?.reference?.toString() || '',
          document_url: newGuarantee.documents && newGuarantee.documents.length > 0 ? newGuarantee.documents[0].url : ''
        }
      };
      
      // Mettre à jour la liste locale
      setGuarantees(prev => [...prev, formattedGuarantee]);
      
      return formattedGuarantee;
    } catch (err) {
      console.error('Error creating guarantee:', err);
      setError('Erreur lors de la création de la garantie');
      return null;
    }
  }, [portfolioId, contractId]);

  const updateGuarantee = useCallback(async (guaranteeId: string, data: Partial<Guarantee>): Promise<Guarantee | null> => {
    try {
      const response = await guaranteeApi.updateGuarantee(portfolioId, contractId, guaranteeId, {
        description: data.details?.description,
        value: data.value,
        details: data.details as Record<string, string | number | boolean>
      });
      
      if (!response || !response.data) {
        return null;
      }
      
      // Handle both direct API response or the shaped object from localStorage fallback
      const responseData = response.data && 'success' in response.data 
        ? response.data 
        : { success: true, data: response.data };
      
      const updatedGuarantee = 'data' in responseData ? responseData.data : responseData;
      
      if (!updatedGuarantee) return null;
      
      // Convertir du format API au format interne
      const formattedGuarantee: Guarantee = {
        id: updatedGuarantee.id,
        company: 'N/A', // À compléter avec les données réelles
        type: updatedGuarantee.type,
        value: updatedGuarantee.value,
        status: updatedGuarantee.status === 'validated' ? 'active' : 
                updatedGuarantee.status === 'rejected' ? 'expirée' : 'pending',
        created_at: updatedGuarantee.created_at,
        contractId: updatedGuarantee.contract_id,
        portfolioId: portfolioId,
        details: {
          description: updatedGuarantee.description || '',
          location: updatedGuarantee.location?.address || '',
          reference: updatedGuarantee.details?.reference?.toString() || '',
          document_url: updatedGuarantee.documents && updatedGuarantee.documents.length > 0 ? updatedGuarantee.documents[0].url : ''
        }
      };
      
      // Mettre à jour la liste locale
      setGuarantees(prev => prev.map(g => g.id === guaranteeId ? formattedGuarantee : g));
      
      return formattedGuarantee;
    } catch (err) {
      console.error(`Error updating guarantee ${guaranteeId}:`, err);
      setError(`Erreur lors de la mise à jour de la garantie ${guaranteeId}`);
      return null;
    }
  }, [portfolioId, contractId]);

  const validateGuarantee = useCallback(async (guaranteeId: string, notes: string, valueAdjustment?: number): Promise<boolean> => {
    try {
      await guaranteeApi.validateGuarantee(portfolioId, contractId, guaranteeId, {
        validator_notes: notes,
        value_adjustment: valueAdjustment
      });
      
      // Rafraîchir la liste après validation
      fetchGuarantees();
      
      return true;
    } catch (err) {
      console.error(`Error validating guarantee ${guaranteeId}:`, err);
      setError(`Erreur lors de la validation de la garantie ${guaranteeId}`);
      return false;
    }
  }, [portfolioId, contractId, fetchGuarantees]);

  const rejectGuarantee = useCallback(async (guaranteeId: string, reason: string, notes: string): Promise<boolean> => {
    try {
      await guaranteeApi.rejectGuarantee(portfolioId, contractId, guaranteeId, {
        rejection_reason: reason,
        rejection_notes: notes
      });
      
      // Rafraîchir la liste après rejet
      fetchGuarantees();
      
      return true;
    } catch (err) {
      console.error(`Error rejecting guarantee ${guaranteeId}:`, err);
      setError(`Erreur lors du rejet de la garantie ${guaranteeId}`);
      return false;
    }
  }, [portfolioId, contractId, fetchGuarantees]);

  return {
    guarantees,
    loading,
    error,
    getGuaranteeById,
    createGuarantee,
    updateGuarantee,
    validateGuarantee,
    rejectGuarantee,
    refreshGuarantees: fetchGuarantees
  };
}

/**
 * Hook pour récupérer les types de garanties disponibles
 */
export function useGuaranteeTypes(portfolioId: string) {
  const [types, setTypes] = useState<Array<{
    id: string;
    name: string;
    description: string;
    coverage_ratio: number;
    required_documents: Array<{
      type: string;
      name: string;
      required: boolean;
    }>;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const response = await guaranteeApi.getGuaranteeTypes(portfolioId);
        
        // Handle both direct API response or the shaped object from localStorage fallback
        const responseData = response.data && 'success' in response.data 
          ? response.data 
          : { success: true, data: response.data };
        
        if (responseData && responseData.success) {
          setTypes('data' in responseData ? responseData.data : responseData);
        } else {
          setTypes([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching guarantee types:', err);
        setError('Erreur lors de la récupération des types de garanties');
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, [portfolioId]);

  return { types, loading, error };
}

/**
 * Hook pour obtenir des statistiques sur les garanties d'un portefeuille
 */
export function useGuaranteeStats(portfolioId: string) {
  const [stats, setStats] = useState<{
    total_guarantees_count: number;
    total_guarantees_value: number;
    average_coverage_ratio: number;
    by_type: Array<{
      type: string;
      count: number;
      value: number;
      percentage: number;
    }>;
    by_status: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    pending_revaluations: number;
    overdue_revaluations: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await guaranteeApi.getGuaranteeStats(portfolioId);
      
      // Handle both direct API response or the shaped object from localStorage fallback
      const responseData = response.data && 'success' in response.data 
        ? response.data 
        : { success: true, data: response.data };
      
      if (responseData && responseData.success) {
        setStats('data' in responseData ? responseData.data : responseData);
      } else {
        setStats(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching guarantee stats:', err);
      setError('Erreur lors de la récupération des statistiques de garanties');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refreshStats: fetchStats };
}
