import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { FileUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAuthHeadersForUpload } from '../../services/api/authHeaders';

interface ExtractedData {
  [key: string]: string | number | undefined;
}

interface ProfessionalPDFExtractionButtonProps {
  onExtract?: (data: ExtractedData) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * Composant pour extraire les données depuis un PDF professionnel
 * Utilise une API OCR/PDF extraction (à intégrer avec un service externe)
 * 
 * Services possibles:
 * - Google Cloud Vision API
 * - AWS Textract
 * - Azure Form Recognizer
 * - Pytesseract (backend)
 */
export const ProfessionalPDFExtractionButton: React.FC<ProfessionalPDFExtractionButtonProps> = ({
  onExtract,
  onError,
  disabled = false
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validation du type de fichier
    if (!file.type.includes('pdf')) {
      setExtractionStatus('error');
      setStatusMessage('Veuillez sélectionner un fichier PDF');
      onError?.('Format PDF requis');
      return;
    }

    setIsExtracting(true);
    setExtractionStatus('idle');

    try {
      // TODO: Appeler le backend pour extraction OCR
      // Exemple avec une API backend:
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'extraction');
      }

      const extractedData = await response.json();

      setExtractionStatus('success');
      setStatusMessage('Données extraites avec succès');
      onExtract?.(extractedData);

      // Reset après 3 secondes
      setTimeout(() => setExtractionStatus('idle'), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      setExtractionStatus('error');
      setStatusMessage(errorMsg);
      onError?.(errorMsg);

      // Reset après 3 secondes
      setTimeout(() => setExtractionStatus('idle'), 3000);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={disabled || isExtracting}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <Button
          disabled={disabled || isExtracting}
          className="flex items-center gap-2"
        >
          <FileUp className="w-4 h-4" />
          {isExtracting ? 'Extraction...' : 'Extraire du PDF'}
        </Button>
      </div>

      {extractionStatus === 'success' && (
        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {extractionStatus === 'error' && (
        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      <p className="text-xs text-gray-600 dark:text-gray-400">
        Importez un PDF professionnel pour extraire automatiquement les données
      </p>
    </div>
  );
};
