// services/storage/contractDocumentsStorage.ts
import { ContractDocument } from '../../types/contract';

const STORAGE_KEY = 'contract_documents';

/**
 * Service de gestion des documents de contrat dans le localStorage
 */
export const contractDocumentsStorageService = {
  /**
   * Récupère tous les documents
   */
  getAllDocuments(): ContractDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return [];
    }
  },

  /**
   * Récupère les documents d'un contrat spécifique
   */
  getDocumentsByContractId(contractId: string): ContractDocument[] {
    try {
      const documents = this.getAllDocuments();
      return documents.filter(doc => doc.contractId === contractId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des documents pour le contrat ${contractId}:`, error);
      return [];
    }
  },

  /**
   * Ajoute un nouveau document
   */
  addDocument(document: ContractDocument): ContractDocument {
    try {
      const documents = this.getAllDocuments();
      documents.push(document);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      return document;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      throw error;
    }
  },

  /**
   * Met à jour un document existant
   */
  updateDocument(id: string, updates: Partial<ContractDocument>): ContractDocument | undefined {
    try {
      const documents = this.getAllDocuments();
      const index = documents.findIndex(doc => doc.id === id);
      
      if (index !== -1) {
        documents[index] = { ...documents[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
        return documents[index];
      }
      
      return undefined;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du document ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un document
   */
  deleteDocument(id: string): boolean {
    try {
      const documents = this.getAllDocuments();
      const updatedDocuments = documents.filter(doc => doc.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du document ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime tous les documents d'un contrat
   */
  deleteContractDocuments(contractId: string): boolean {
    try {
      const documents = this.getAllDocuments();
      const updatedDocuments = documents.filter(doc => doc.contractId !== contractId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression des documents du contrat ${contractId}:`, error);
      throw error;
    }
  }
};
