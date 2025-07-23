// src/components/common/DocumentManager.tsx
import React, { useState } from 'react';
import { PlusCircle, File, Trash2, Download, Eye, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
// Use absolute import path instead
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import type { PortfolioDocument, DocumentType } from '../../types/document';

interface DocumentManagerProps {
  documents: PortfolioDocument[];
  onUpload: (file: File, metadata: Omit<PortfolioDocument, 'id' | 'fileUrl' | 'fileSize' | 'fileType' | 'uploadedAt' | 'uploadedBy'>) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
  onView: (document: PortfolioDocument) => void;
  onDownload: (document: PortfolioDocument) => void;
  asSection?: boolean; // Pour l'afficher comme une section dans un autre composant
  portfolioType?: 'traditional' | 'leasing' | 'investment'; // Type de portefeuille pour personnalisation
}

const DOCUMENT_TYPES: { label: string; value: DocumentType }[] = [
  { label: 'Template de contrat', value: 'contract_template' },
  { label: 'Procédure', value: 'procedure' },
  { label: 'Document légal', value: 'legal' },
  { label: 'Document marketing', value: 'marketing' },
  { label: 'Document technique', value: 'technical' },
  { label: 'Autre', value: 'other' }
];

export function DocumentManager({ 
  documents, 
  onUpload, 
  onDelete, 
  onView, 
  onDownload,
  asSection = false,
  portfolioType = 'traditional'
}: DocumentManagerProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('contract_template');
  const [isPublic, setIsPublic] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Generate portfolio-specific class based on portfolioType
  const portfolioSpecificClass = `document-manager-${portfolioType}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérification du type de fichier (PDF uniquement)
      if (file.type !== 'application/pdf') {
        setUploadError('Seuls les fichiers PDF sont acceptés');
        return;
      }
      
      // Vérification de la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('La taille du fichier ne doit pas dépasser 10MB');
        return;
      }
      
      setSelectedFile(file);
      // Utiliser le nom du fichier par défaut si aucun nom n'est saisi
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Nom sans extension
      }
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Veuillez sélectionner un fichier');
      return;
    }

    if (!documentName.trim()) {
      setUploadError('Veuillez saisir un nom pour le document');
      return;
    }

    try {
      await onUpload(selectedFile, {
        name: documentName,
        description: documentDescription,
        type: documentType,
        isPublic,
        tags: []
      });
      
      // Réinitialiser le formulaire
      setSelectedFile(null);
      setDocumentName('');
      setDocumentDescription('');
      setDocumentType('contract_template');
      setIsPublic(false);
      setIsUploadModalOpen(false);
    } catch (error) {
      setUploadError('Une erreur est survenue lors de l\'upload du document');
      console.error('Upload error:', error);
    }
  };

  // Fonction pour afficher le type de document en français
  const getDocumentTypeLabel = (type: DocumentType): string => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || 'Autre';
  };

  // Fonction pour formatter la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`${portfolioSpecificClass} ${asSection ? "" : "bg-white dark:bg-gray-800 rounded-lg shadow p-6"}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={asSection ? "text-lg font-bold text-primary mb-2" : "text-xl font-semibold"}>Documents du portefeuille</h2>
        <Button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Importer un document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 mb-3" />
          <p>Aucun document n'a été importé pour ce portefeuille</p>
          <p className="text-sm mt-2">Cliquez sur "Importer un document" pour ajouter des templates de contrats, procédures, etc.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Taille</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date d'import</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visibilité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <File className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</div>
                        {doc.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                            {doc.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getDocumentTypeLabel(doc.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(doc.uploadedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.isPublic 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {doc.isPublic ? 'Public' : 'Interne'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(doc)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Visualiser"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onDownload(doc)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Télécharger"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'upload de document */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Importer un document"
      >
        <div className="space-y-4 py-2">
          {uploadError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {uploadError}
            </div>
          )}

          <FormField label="Fichier (PDF uniquement)">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                  >
                    <span>Télécharger un fichier</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF jusqu'à 10MB</p>
                {selectedFile && (
                  <p className="text-sm text-green-500 mt-2">
                    Fichier sélectionné: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </FormField>

          <FormField label="Nom du document">
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Nom du document"
            />
          </FormField>

          <FormField label="Description">
            <TextArea
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Description du document (optionnel)"
              rows={3}
            />
          </FormField>

          <FormField label="Type de document">
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Visibilité">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                Document public (visible par les clients)
              </label>
            </div>
          </FormField>

          <div className="flex justify-end space-x-3 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || !documentName}
            >
              Importer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
