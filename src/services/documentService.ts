// src/services/documentService.ts
import { apiClient } from './api/base.api';
import type { PortfolioDocument, DocumentUploadResponse } from '../types/document';

// Clé pour le localStorage
const STORAGE_KEY = 'wanzo_portfolio_documents';

// Mock data pour le développement
const mockDocuments: PortfolioDocument[] = [
  {
    id: 'portfolio_1_doc_1',
    name: 'Contrat type',
    description: 'Modèle de contrat standard',
    type: 'contract_template',
    fileUrl: 'https://example.com/contract.pdf',
    fileSize: 1048576, // 1 MB
    fileType: 'application/pdf',
    uploadedAt: '2025-01-15T08:30:00Z',
    uploadedBy: 'user_1',
    version: '1.0',
    isPublic: false,
    tags: ['contrat', 'template']
  },
  {
    id: 'portfolio_1_doc_2',
    name: 'Procédure de décaissement',
    description: 'Procédure standard pour les décaissements',
    type: 'procedure',
    fileUrl: 'https://example.com/procedure.pdf',
    fileSize: 524288, // 512 KB
    fileType: 'application/pdf',
    uploadedAt: '2025-01-20T10:15:00Z',
    uploadedBy: 'user_2',
    isPublic: true,
    tags: ['procédure', 'décaissement']
  }
];

/**
 * Récupère tous les documents associés à un portefeuille
 * @param portfolioId - L'identifiant du portefeuille
 * @returns Une promesse qui résout avec un tableau de documents
 */
export async function getPortfolioDocuments(portfolioId: string): Promise<PortfolioDocument[]> {
  try {
    // Tenter de récupérer depuis l'API
    const response = await apiClient.get(`/portfolios/${portfolioId}/documents`);
    return response as unknown as PortfolioDocument[];
  } catch (error: unknown) {
    console.log('Fallback to local storage for documents', error);
    
    // Fallback: récupérer depuis localStorage (pour le développement)
    const storedDocs = localStorage.getItem(STORAGE_KEY);
    if (storedDocs) {
      const allDocs = JSON.parse(storedDocs) as PortfolioDocument[];
      // Filtrer pour ne récupérer que les documents du portefeuille spécifié
      return allDocs.filter(doc => doc.id.startsWith(`portfolio_${portfolioId}`));
    }
    
    // Si aucune donnée dans localStorage, utiliser les données mock
    return mockDocuments.filter(doc => doc.id.startsWith(`portfolio_${portfolioId}`));
  }
}

/**
 * Télécharge un document
 * @param documentId - L'identifiant du document à télécharger
 * @returns Une promesse qui résout avec une URL de téléchargement
 */
export async function downloadDocument(documentId: string): Promise<string> {
  try {
    // Tenter de récupérer depuis l'API
    const response = await apiClient.get(`/documents/${documentId}/download`);
    return (response as unknown as { downloadUrl: string }).downloadUrl;
  } catch (error: unknown) {
    console.log('Fallback to mock download URL', error);
    
    // Fallback: générer une URL factice pour le développement
    return `https://example.com/documents/download/${documentId}`;
  }
}

/**
 * Supprime un document
 * @param documentId - L'identifiant du document à supprimer
 * @returns Une promesse qui résout avec un booléen indiquant le succès
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    // Tenter de supprimer via l'API
    await apiClient.delete(`/documents/${documentId}`);
    return true;
  } catch (error: unknown) {
    console.log('Fallback to local storage for document deletion', error);
    
    // Fallback: supprimer depuis localStorage (pour le développement)
    const storedDocs = localStorage.getItem(STORAGE_KEY);
    if (storedDocs) {
      const allDocs = JSON.parse(storedDocs) as PortfolioDocument[];
      const updatedDocs = allDocs.filter(doc => doc.id !== documentId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
    }
    
    return true;
  }
}

/**
 * Téléverse un nouveau document
 * @param portfolioId - L'identifiant du portefeuille
 * @param documentData - Les données du document à téléverser
 * @param file - Le fichier à téléverser
 * @returns Une promesse qui résout avec la réponse de l'upload
 */
export async function uploadDocument(
  portfolioId: string, 
  documentData: Omit<PortfolioDocument, 'id' | 'fileUrl' | 'uploadedAt'>, 
  file: File
): Promise<DocumentUploadResponse> {
  try {
    // Créer un FormData pour l'upload de fichier
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', documentData.name);
    formData.append('description', documentData.description);
    formData.append('type', documentData.type);
    formData.append('isPublic', String(documentData.isPublic));
    
    if (documentData.tags && documentData.tags.length > 0) {
      formData.append('tags', JSON.stringify(documentData.tags));
    }
    
    if (documentData.version) {
      formData.append('version', documentData.version);
    }
    
    // Tenter d'uploader via l'API
    const response = await apiClient.upload<DocumentUploadResponse>(
      `/portfolios/${portfolioId}/documents`, 
      formData
    );
    
    return response;
  } catch (error: unknown) {
    console.log('Fallback to local storage for document upload', error);
    
    // Fallback: stocker dans localStorage (pour le développement)
    const newDoc: PortfolioDocument = {
      ...documentData,
      id: `portfolio_${portfolioId}_doc_${Date.now()}`,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
      fileType: file.type
    };
    
    const storedDocs = localStorage.getItem(STORAGE_KEY);
    let allDocs: PortfolioDocument[] = [];
    
    if (storedDocs) {
      allDocs = JSON.parse(storedDocs) as PortfolioDocument[];
    }
    
    allDocs.push(newDoc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
    
    return {
      success: true,
      document: newDoc
    };
  }
}
