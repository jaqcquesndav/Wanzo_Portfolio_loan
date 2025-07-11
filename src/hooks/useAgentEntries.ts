import { useState, useEffect, useCallback } from 'react';
// These imports are commented out for development, but will be used in production
// import { IndexedDBService } from '../services/storage/IndexedDBService';
// import { agentEntriesApi } from '../services/api/endpoints/agentEntries';
// import { journalEntriesApi } from '../services/api/endpoints/journalEntries';
import { mockAgentEntries } from '../data/mockAgentEntries';
import type { JournalEntry } from '../types/accounting';

export function useAgentEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      
      // En mode développement, utiliser les données mock
      setEntries(mockAgentEntries);
      
      // Dans une application réelle, vous utiliseriez ce code:
      /*
      // Charger depuis IndexedDB d'abord pour une expérience rapide
      const localEntries = await IndexedDBService.getAll<JournalEntry>('agent_entries');
      if (localEntries.length > 0) {
        setEntries(localEntries);
      }

      // Si en ligne, synchroniser avec l'API
      if (navigator.onLine) {
        const response = await agentEntriesApi.getAll();
        if (response.success && response.data) {
          setEntries(response.data.data);
          
          // Mettre à jour IndexedDB
          await IndexedDBService.clear('agent_entries');
          for (const entry of response.data.data) {
            await IndexedDBService.add('agent_entries', entry);
          }
        }
      }
      */
    } catch (error) {
      console.error('Failed to load agent entries:', error);
      setError('Erreur lors du chargement des écritures proposées par l\'agent');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);
  
  // Valider une entrée individuelle
  const validateEntry = async (id: string, updates?: Partial<JournalEntry>): Promise<void> => {
    try {
      setLoading(true);
      
      // Pour les besoins de la démonstration, simuler la validation
      const entryToValidate = entries.find(e => e.id === id);
      
      if (!entryToValidate) {
        throw new Error('Entry not found');
      }
      
      // Appliquer les mises à jour si fournies
      const finalEntry = updates ? { ...entryToValidate, ...updates } : entryToValidate;
      
      // Supprimer l'entrée de la liste des entrées d'agent
      setEntries(prev => prev.filter(e => e.id !== id));
      
      // En mode production, vous utiliseriez ce code:
      /*
      const response = await agentEntriesApi.validate(id, updates);
      
      if (response.success) {
        // Supprimer de la liste des entrées d'agent
        await IndexedDBService.delete('agent_entries', id);
        setEntries(prev => prev.filter(e => e.id !== id));
        
        // Ajouter aux entrées de journal régulières
        if (response.data) {
          const validatedEntry = {
            ...response.data,
            source: 'agent',
            status: 'approved',
            validationStatus: 'validated',
            validatedAt: new Date().toISOString()
          };
          
          await IndexedDBService.add('journal_entries', validatedEntry);
        }
      }
      */
      
      console.log(`Entrée ${id} validée avec succès:`, finalEntry);
    } catch (error) {
      console.error('Failed to validate agent entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valider plusieurs entrées à la fois
  const validateBatchEntries = async (ids: string[]): Promise<number> => {
    try {
      setLoading(true);
      
      // En mode développement, simuler la validation par lots
      if (true) { // Remplacer par une condition comme process.env.NODE_ENV === 'development'
        // Filtrer les entrées validées
        setEntries(prev => prev.filter(e => !ids.includes(e.id)));
        
        console.log(`${ids.length} entrées validées avec succès`);
        return ids.length;
      }
      
      // En mode production, utiliser ce code:
      /*
      const response = await agentEntriesApi.validateBatch(ids);
      
      if (response.success) {
        // Supprimer les entrées validées de la liste des entrées d'agent
        for (const id of ids) {
          await IndexedDBService.delete('agent_entries', id);
        }
        setEntries(prev => prev.filter(e => !ids.includes(e.id)));
        
        // Rafraîchir les entrées de journal pour inclure les nouvelles entrées validées
        await loadEntries();
        
        return response.data?.count || 0;
      }
      */
      return 0;
    } catch (error) {
      console.error('Failed to validate batch entries:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Rejeter une entrée
  const rejectEntry = async (id: string, reason: string): Promise<void> => {
    try {
      setLoading(true);
      
      // En mode développement, simuler le rejet
      if (true) { // Remplacer par une condition comme process.env.NODE_ENV === 'development'
        setEntries(prev => prev.filter(e => e.id !== id));
        console.log(`Entrée ${id} rejetée avec succès. Raison: ${reason}`);
        return;
      }
      
      // En mode production, utiliser ce code:
      /*
      await agentEntriesApi.reject(id, reason);
      
      // Supprimer de la liste des entrées d'agent
      await IndexedDBService.delete('agent_entries', id);
      setEntries(prev => prev.filter(e => e.id !== id));
      */
    } catch (error) {
      console.error('Failed to reject agent entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une entrée avant validation
  const updateEntry = async (id: string, updates: Partial<JournalEntry>): Promise<void> => {
    try {
      setLoading(true);
      
      // En mode développement, simuler la mise à jour
      if (true) { // Remplacer par une condition comme process.env.NODE_ENV === 'development'
        const entryIndex = entries.findIndex(e => e.id === id);
        if (entryIndex === -1) throw new Error('Entry not found');
        
        const updatedEntry = { ...entries[entryIndex], ...updates };
        const newEntries = [...entries];
        newEntries[entryIndex] = updatedEntry as JournalEntry;
        
        setEntries(newEntries);
        console.log(`Entrée ${id} mise à jour avec succès:`, updatedEntry);
        return;
      }
      
      // En mode production, utiliser ce code:
      /*
      const response = await agentEntriesApi.update(id, updates);
      
      if (response.success && response.data) {
        // Mettre à jour localement
        await IndexedDBService.update('agent_entries', response.data);
        setEntries(prev => {
          const newEntries = [...prev];
          const index = newEntries.findIndex(e => e.id === id);
          if (index !== -1) {
            newEntries[index] = response.data;
          }
          return newEntries;
        });
      }
      */
    } catch (error) {
      console.error('Failed to update agent entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une entrée
  const deleteEntry = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      
      // En mode développement, simuler la suppression
      if (true) { // Remplacer par une condition comme process.env.NODE_ENV === 'development'
        setEntries(prev => prev.filter(e => e.id !== id));
        console.log(`Entrée ${id} supprimée avec succès`);
        return;
      }
      
      // En mode production, utiliser ce code:
      /*
      await agentEntriesApi.delete(id);
      
      // Supprimer localement
      await IndexedDBService.delete('agent_entries', id);
      setEntries(prev => prev.filter(e => e.id !== id));
      */
    } catch (error) {
      console.error('Failed to delete agent entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    error,
    loadEntries,
    validateEntry,
    validateBatchEntries,
    rejectEntry,
    updateEntry,
    deleteEntry
  };
}
