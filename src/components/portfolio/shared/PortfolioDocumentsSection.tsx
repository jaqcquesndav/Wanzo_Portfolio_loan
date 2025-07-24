// src/components/portfolio/shared/PortfolioDocumentsSection.tsx
import { useState, useEffect } from 'react';
import { DocumentManager } from '../../common/DocumentManager';
import { useNotification } from '../../../contexts/useNotification';
import { 
  getPortfolioDocuments, 
  uploadDocument, 
  deleteDocument, 
  downloadDocument
} from '../../../services/documentService';
import type { PortfolioDocument } from '../../../types/document';

interface PortfolioDocumentsSectionProps {
  portfolioId: string;
}

export function PortfolioDocumentsSection({ portfolioId }: PortfolioDocumentsSectionProps) {
  const [documents, setDocuments] = useState<PortfolioDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  // Charger les documents au chargement du composant
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const docs = await getPortfolioDocuments(portfolioId);
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
        showNotification('Erreur lors du chargement des documents', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [portfolioId, showNotification]);

  // Gérer l'upload d'un nouveau document
  const handleUpload = async (
    file: File, 
    metadata: Omit<PortfolioDocument, 'id' | 'fileUrl' | 'fileSize' | 'fileType' | 'uploadedAt' | 'uploadedBy'>
  ) => {
    try {
      // Compléter les données manquantes pour correspondre au type attendu
      const documentData: Omit<PortfolioDocument, 'id' | 'fileUrl' | 'uploadedAt'> = {
        ...metadata,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: 'current-user' // Valeur par défaut pour le développement
      };
      
      const result = await uploadDocument(portfolioId, documentData, file);
      
      if (result.success && result.document) {
        // S'assurer que document n'est pas undefined avant de l'ajouter
        const newDocument = result.document;
        setDocuments(prev => [...prev, newDocument]);
        showNotification('Document importé avec succès', 'success');
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      showNotification('Erreur lors de l\'import du document', 'error');
    }
  };

  // Gérer la suppression d'un document
  const handleDelete = async (documentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        const success = await deleteDocument(documentId);
        
        if (success) {
          setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          showNotification('Document supprimé avec succès', 'success');
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        showNotification('Erreur lors de la suppression du document', 'error');
      }
    }
  };

  // Gérer la visualisation d'un document
  const handleView = (document: PortfolioDocument) => {
    // Si c'est une URL data:, on peut l'ouvrir dans un nouvel onglet
    if (document.fileUrl.startsWith('data:')) {
      window.open(document.fileUrl, '_blank');
    } else {
      // Sinon, on pourrait afficher une prévisualisation dans un modal
      window.open(document.fileUrl, '_blank');
    }
  };

  // Gérer le téléchargement d'un document
  const handleDownload = async (doc: PortfolioDocument) => {
    try {
      const downloadUrl = await downloadDocument(doc.id);
      
      if (downloadUrl) {
        // Créer un lien temporaire pour le téléchargement
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      showNotification('Erreur lors du téléchargement du document', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
      <DocumentManager
        documents={documents}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onView={handleView}
        onDownload={handleDownload}
        asSection={true}
      />
    </div>
  );
}
