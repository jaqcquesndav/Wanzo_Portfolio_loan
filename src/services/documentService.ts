// src/services/documentService.ts
import { v4 as uuidv4 } from 'uuid';
import type { PortfolioDocument, DocumentUploadResponse } from '../types/document';

// Cette version utilise le stockage local pour la démo, mais dans un environnement de production,
// on utiliserait un service de stockage comme AWS S3, Firebase Storage, etc.

const STORAGE_KEY = 'portfolio_documents';

// Simuler un délai de réseau
const simulateNetworkDelay = async () => {
  return new Promise(resolve => setTimeout(resolve, 600));
};

// Charger les documents depuis le stockage local
const getDocumentsFromStorage = (): Record<string, PortfolioDocument[]> => {
  const storedDocs = localStorage.getItem(STORAGE_KEY);
  return storedDocs ? JSON.parse(storedDocs) : {};
};

// Sauvegarder les documents dans le stockage local
const saveDocumentsToStorage = (documents: Record<string, PortfolioDocument[]>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

// Convertir un File en base64 pour simulation de stockage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Récupérer tous les documents d'un portefeuille
export const getPortfolioDocuments = async (portfolioId: string): Promise<PortfolioDocument[]> => {
  await simulateNetworkDelay();
  const allDocuments = getDocumentsFromStorage();
  return allDocuments[portfolioId] || [];
};

// Uploader un nouveau document
export const uploadDocument = async (
  portfolioId: string,
  file: File,
  metadata: Omit<PortfolioDocument, 'id' | 'fileUrl' | 'fileSize' | 'fileType' | 'uploadedAt' | 'uploadedBy'>
): Promise<DocumentUploadResponse> => {
  try {
    await simulateNetworkDelay();
    
    // Convertir le fichier en base64 (dans un environnement réel, on l'enverrait à un serveur)
    const fileBase64 = await fileToBase64(file);
    
    const newDocument: PortfolioDocument = {
      id: uuidv4(),
      ...metadata,
      fileUrl: fileBase64,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current_user_id', // Dans un environnement réel, ce serait l'ID de l'utilisateur actuel
    };
    
    // Mettre à jour le stockage local
    const allDocuments = getDocumentsFromStorage();
    if (!allDocuments[portfolioId]) {
      allDocuments[portfolioId] = [];
    }
    allDocuments[portfolioId].push(newDocument);
    saveDocumentsToStorage(allDocuments);
    
    return {
      success: true,
      document: newDocument
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'upload du document'
    };
  }
};

// Supprimer un document
export const deleteDocument = async (portfolioId: string, documentId: string): Promise<boolean> => {
  try {
    await simulateNetworkDelay();
    
    const allDocuments = getDocumentsFromStorage();
    if (!allDocuments[portfolioId]) {
      return false;
    }
    
    const initialLength = allDocuments[portfolioId].length;
    allDocuments[portfolioId] = allDocuments[portfolioId].filter(doc => doc.id !== documentId);
    
    // Si aucun document n'a été supprimé, retourner false
    if (allDocuments[portfolioId].length === initialLength) {
      return false;
    }
    
    saveDocumentsToStorage(allDocuments);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};

// Récupérer un document spécifique
export const getDocument = async (portfolioId: string, documentId: string): Promise<PortfolioDocument | null> => {
  try {
    await simulateNetworkDelay();
    
    const allDocuments = getDocumentsFromStorage();
    if (!allDocuments[portfolioId]) {
      return null;
    }
    
    const document = allDocuments[portfolioId].find(doc => doc.id === documentId);
    return document || null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
};

// Télécharger un document (simulation)
export const downloadDocument = async (document: PortfolioDocument): Promise<boolean> => {
  try {
    // Dans un environnement réel, on utiliserait window.open ou fetch pour télécharger le fichier
    // Pour la démo, on extrait la base64 et crée un lien de téléchargement
    
    // Vérifier si l'URL commence par data:
    if (document.fileUrl.startsWith('data:')) {
      const link = document.fileUrl;
      const a = window.document.createElement('a');
      a.href = link;
      a.download = `${document.name}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      return true;
    }
    
    // Sinon, c'est une URL normale, ouvrir dans un nouvel onglet
    window.open(document.fileUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error downloading document:', error);
    return false;
  }
};
