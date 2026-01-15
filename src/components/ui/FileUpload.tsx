// components/ui/FileUpload.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface FileUploadProps {
  onFileChange: (file: File) => void;
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // Taille maximale en Mo
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileChange,
  onUpload,
  accept = '.pdf,application/pdf',
  maxSize = 10, // 10 Mo par défaut
  label = 'Télécharger un fichier',
  description = 'Glissez-déposez un fichier PDF ou cliquez pour parcourir'
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    setError(null);
    
    // Vérifier le type de fichier
    if (accept && !accept.split(',').some(type => 
      selectedFile.type === type || 
      type.startsWith('.') && selectedFile.name.endsWith(type)
    )) {
      setError(`Format de fichier non pris en charge. Formats acceptés: ${accept}`);
      return;
    }
    
    // Vérifier la taille du fichier
    if (maxSize && selectedFile.size > maxSize * 1024 * 1024) {
      setError(`La taille du fichier dépasse la limite de ${maxSize} Mo`);
      return;
    }
    
    setFile(selectedFile);
    onFileChange(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(file);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError('Erreur lors du téléchargement du fichier. Veuillez réessayer.');
      console.error('Erreur de téléchargement:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 mb-2">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        
        <div
          className={`border-2 border-dashed rounded-lg p-4 transition-colors duration-200 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : error 
                ? 'border-red-300 bg-red-50' 
                : isSuccess 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center py-4 text-sm">
            {!file ? (
              <>
                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">{description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Taille maximale: {maxSize}Mo
                </p>
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3 truncate">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-2 inline-flex text-gray-400 hover:text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center mt-2 text-red-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">{error}</span>
              </div>
            )}
            
            {isSuccess && (
              <div className="flex items-center mt-2 text-green-500">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-xs">Fichier téléchargé avec succès</span>
              </div>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleInputChange}
            ref={fileInputRef}
          />
        </div>
      </div>
      
      {file && !isSuccess && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleUpload();
          }}
          disabled={isUploading}
          className="w-full mt-2"
        >
          {isUploading ? 'Téléchargement en cours...' : 'Télécharger'}
        </Button>
      )}
    </div>
  );
}
