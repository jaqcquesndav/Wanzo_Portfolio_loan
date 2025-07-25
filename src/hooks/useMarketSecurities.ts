// src/hooks/useMarketSecurities.ts
import { useState, useEffect } from 'react';
import { marketApi } from '../services/api/investment/market.api';
import { MarketSecurity } from '../types/market-securities';

interface UseMarketSecuritiesProps {
  initialFilters?: {
    type?: string;
    sector?: string;
    country?: string;
    risk?: 'faible' | 'modéré' | 'élevé';
    listed?: boolean;
    search?: string;
  };
}

export function useMarketSecurities(props?: UseMarketSecuritiesProps) {
  const { initialFilters } = props || {};
  const [securities, setSecurities] = useState<MarketSecurity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters || {});

  const fetchSecurities = async () => {
    setLoading(true);
    try {
      const data = await marketApi.getSecurities(filters);
      setSecurities(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des titres:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  // Récupération d'un titre par ID
  const getSecurityById = async (id: string) => {
    try {
      return await marketApi.getSecurityById(id);
    } catch (err) {
      console.error(`Erreur lors du chargement du titre ${id}:`, err);
      throw err;
    }
  };

  // Création d'un nouveau titre
  const createSecurity = async (security: Omit<MarketSecurity, 'id'>) => {
    try {
      const newSecurity = await marketApi.createSecurity(security);
      setSecurities(prev => [...prev, newSecurity]);
      return newSecurity;
    } catch (err) {
      console.error('Erreur lors de la création du titre:', err);
      throw err;
    }
  };

  // Mise à jour d'un titre
  const updateSecurity = async (id: string, updates: Partial<MarketSecurity>) => {
    try {
      const updatedSecurity = await marketApi.updateSecurity(id, updates);
      setSecurities(prev => 
        prev.map(security => security.id === id ? updatedSecurity : security)
      );
      return updatedSecurity;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du titre ${id}:`, err);
      throw err;
    }
  };

  // Suppression d'un titre
  const deleteSecurity = async (id: string) => {
    try {
      const success = await marketApi.deleteSecurity(id);
      if (success) {
        setSecurities(prev => prev.filter(security => security.id !== id));
      }
      return success;
    } catch (err) {
      console.error(`Erreur lors de la suppression du titre ${id}:`, err);
      throw err;
    }
  };

  // Application de filtres
  const applyFilters = (newFilters: typeof filters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({});
  };

  // Effet pour charger les titres initiaux
  useEffect(() => {
    fetchSecurities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]); // Recharger quand les filtres changent

  return {
    securities,
    loading,
    error,
    filters,
    applyFilters,
    resetFilters,
    refreshSecurities: fetchSecurities,
    getSecurityById,
    createSecurity,
    updateSecurity,
    deleteSecurity
  };
}

export default useMarketSecurities;
