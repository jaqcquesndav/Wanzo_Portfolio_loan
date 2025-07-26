// src/components/portfolio/traditional/UploadReceiptModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<boolean>;
}

export const UploadReceiptModal: React.FC<UploadReceiptModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Vérifier le type de fichier (PDF uniquement)
      if (selectedFile.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        return;
      }
      
      // Vérifier la taille du fichier (max 5 Mo)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('La taille du fichier ne doit pas dépasser 5 Mo');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    
    try {
      setLoading(true);
      const result = await onUpload(file);
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Une erreur est survenue lors du téléchargement');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Une erreur est survenue lors du téléchargement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => onClose()}
    >
      <DialogContent>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Télécharger un justificatif</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center p-4 rounded-lg border bg-red-50 text-red-800 border-red-200">
                <AlertCircle className="h-5 w-5 mr-3" />
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center p-4 rounded-lg border bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-5 w-5 mr-3" />
                <p>Justificatif téléchargé avec succès!</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="receipt">Justificatif de paiement (PDF)</Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Cliquez pour sélectionner ou glissez-déposez un fichier PDF
                </p>
                <p className="text-xs text-gray-400 mt-1">Max. 5 Mo</p>
                
                <Input
                  id="receipt"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('receipt')?.click()}
                >
                  Parcourir
                </Button>
                
                {file && (
                  <div className="mt-4 text-sm text-left bg-gray-50 p-2 rounded border">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-gray-500">{(file.size / 1024).toFixed(1)} Ko</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={!file || loading}>
                {loading ? 'Téléchargement...' : 'Télécharger'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
