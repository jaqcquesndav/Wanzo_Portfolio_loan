// src/components/portfolio/traditional/contract/ContractDocumentsManager.tsx
import { useState, useEffect } from 'react';
import { DocumentManager } from '../../../common/DocumentManager';
import { PortfolioDocument } from '../../../../types/document';
import { useNotification } from '../../../../contexts/NotificationContext';

interface ContractDocumentsManagerProps {
  contractId: string;
}

export function ContractDocumentsManager({ contractId }: ContractDocumentsManagerProps) {
  const [documents, setDocuments] = useState<PortfolioDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  // Simuler le chargement des documents du contrat
  useEffect(() => {
    // Dans une application réelle, nous chargerions les documents depuis une API
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        // Simule un appel API avec une attente de 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Données simulées
        const mockDocuments: PortfolioDocument[] = [
          {
            id: `${contractId}-doc-1`,
            name: 'Contrat signé',
            description: 'Version signée du contrat de crédit',
            type: 'contract_template',
            fileUrl: 'https://example.com/contracts/signed.pdf',
            fileSize: 2400000, // 2.4 MB
            fileType: 'application/pdf',
            uploadedAt: new Date(2025, 5, 15).toISOString(),
            uploadedBy: 'John Doe',
            isPublic: false,
            tags: ['signed', 'official']
          },
          {
            id: `${contractId}-doc-2`,
            name: 'Plan de remboursement',
            description: 'Échéancier détaillé du remboursement',
            type: 'technical',
            fileUrl: 'https://example.com/contracts/schedule.xlsx',
            fileSize: 1100000, // 1.1 MB
            fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            uploadedAt: new Date(2025, 5, 15).toISOString(),
            uploadedBy: 'Jane Smith',
            isPublic: false,
            tags: ['schedule', 'financial']
          },
          {
            id: `${contractId}-doc-3`,
            name: 'Documents d\'identification client',
            description: 'Pièces d\'identité et justificatifs du client',
            type: 'legal',
            fileUrl: 'https://example.com/contracts/identity.pdf',
            fileSize: 3700000, // 3.7 MB
            fileType: 'application/pdf',
            uploadedAt: new Date(2025, 5, 15).toISOString(),
            uploadedBy: 'Jane Smith',
            isPublic: false,
            tags: ['identity', 'kyc']
          },
        ];
        
        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        showNotification('Erreur lors du chargement des documents', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [contractId, showNotification]);

  // Gestionnaire pour l'upload de documents
  const handleUploadDocument = async (file: File, metadata: Omit<PortfolioDocument, 'id' | 'fileUrl' | 'fileSize' | 'fileType' | 'uploadedAt' | 'uploadedBy'>) => {
    try {
      // Simuler l'upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Créer un nouveau document simulé
      const newDocument: PortfolioDocument = {
        id: `${contractId}-doc-${Date.now()}`,
        name: metadata.name,
        description: metadata.description,
        type: metadata.type,
        fileUrl: URL.createObjectURL(file), // Crée une URL temporaire pour le fichier
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Utilisateur courant',
        isPublic: metadata.isPublic,
        tags: metadata.tags || []
      };
      
      // Ajouter le document à la liste
      setDocuments(prevDocuments => [...prevDocuments, newDocument]);
      showNotification('Document ajouté avec succès', 'success');
      
      // Ne pas retourner de valeur pour correspondre à l'interface Promise<void>
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
      showNotification('Erreur lors de l\'upload du document', 'error');
      throw error;
    }
  };

  // Gestionnaire pour la suppression de documents
  const handleDeleteDocument = async (documentId: string) => {
    try {
      // Simuler la suppression
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Supprimer le document de la liste
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== documentId)
      );
      
      showNotification('Document supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      showNotification('Erreur lors de la suppression du document', 'error');
      throw error;
    }
  };

  // Gestionnaire pour la visualisation de documents
  const handleViewDocument = (document: PortfolioDocument) => {
    // Dans une application réelle, on ouvrirait le document dans un nouvel onglet
    window.open(document.fileUrl, '_blank');
    console.log('Visualisation du document:', document.name);
  };

  // Gestionnaire pour le téléchargement de documents
  const handleDownloadDocument = (document: PortfolioDocument) => {
    // Dans une application réelle, on déclencherait le téléchargement du fichier
    const link = document.fileUrl;
    const a = window.document.createElement('a');
    a.href = link;
    a.download = document.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    
    console.log('Téléchargement du document:', document.name);
  };

  return (
    <div className="contract-documents-container">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DocumentManager
          documents={documents}
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
          asSection={true}
          portfolioType="traditional"
        />
      )}
    </div>
  );
}
