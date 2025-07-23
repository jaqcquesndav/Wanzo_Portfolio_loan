// src/hooks/useContractDocuments.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  PortfolioDocument, 
  getContractDocumentsFromLocalStorage, 
  saveContractDocumentsToLocalStorage 
} from '../data/mockContractDocuments';

interface UseContractDocumentsOptions {
  contractId: string;
}

interface ContractDocumentsState {
  documents: PortfolioDocument[];
  isLoading: boolean;
  error: Error | null;
}

const useContractDocuments = ({ contractId }: UseContractDocumentsOptions) => {
  const [state, setState] = useState<ContractDocumentsState>({
    documents: [],
    isLoading: true,
    error: null
  });

  // Fonction pour charger les documents
  const loadDocuments = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer les données du localStorage
      const allDocuments = getContractDocumentsFromLocalStorage();
      
      // Récupérer les documents du contrat spécifié
      const contractDocuments = allDocuments[contractId] || [];
      
      setState({
        documents: contractDocuments,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState({
        documents: [],
        isLoading: false,
        error: error instanceof Error ? error : new Error('Une erreur est survenue lors du chargement des documents')
      });
    }
  }, [contractId]);

  // Fonction pour ajouter un document
  const addDocument = useCallback(async (document: Omit<PortfolioDocument, 'id'>) => {
    try {
      // Récupérer les données existantes
      const allDocuments = getContractDocumentsFromLocalStorage();
      
      // Créer un nouvel ID unique
      const newId = `doc-${Date.now()}`;
      
      // Créer le nouveau document
      const newDocument: PortfolioDocument = {
        ...document,
        id: newId
      };
      
      // Ajouter le document à la liste des documents du contrat
      if (!allDocuments[contractId]) {
        allDocuments[contractId] = [];
      }
      
      allDocuments[contractId].push(newDocument);
      
      // Sauvegarder les changements
      saveContractDocumentsToLocalStorage(allDocuments);
      
      // Recharger les documents
      await loadDocuments();
      
      return newDocument;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      return null;
    }
  }, [contractId, loadDocuments]);

  // Fonction pour supprimer un document
  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      // Récupérer les données existantes
      const allDocuments = getContractDocumentsFromLocalStorage();
      
      // Vérifier si le contrat existe
      if (!allDocuments[contractId]) {
        return false;
      }
      
      // Filtrer pour supprimer le document
      allDocuments[contractId] = allDocuments[contractId].filter(doc => doc.id !== documentId);
      
      // Sauvegarder les changements
      saveContractDocumentsToLocalStorage(allDocuments);
      
      // Recharger les documents
      await loadDocuments();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      return false;
    }
  }, [contractId, loadDocuments]);

  // Fonction pour mettre à jour un document
  const updateDocument = useCallback(async (updatedDocument: PortfolioDocument) => {
    try {
      // Récupérer les données existantes
      const allDocuments = getContractDocumentsFromLocalStorage();
      
      // Vérifier si le contrat existe
      if (!allDocuments[contractId]) {
        return false;
      }
      
      // Mettre à jour le document
      allDocuments[contractId] = allDocuments[contractId].map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      );
      
      // Sauvegarder les changements
      saveContractDocumentsToLocalStorage(allDocuments);
      
      // Recharger les documents
      await loadDocuments();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      return false;
    }
  }, [contractId, loadDocuments]);

  // Charger les documents au montage et quand les dépendances changent
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    ...state,
    addDocument,
    deleteDocument,
    updateDocument,
    refresh: loadDocuments
  };
};

export default useContractDocuments;
