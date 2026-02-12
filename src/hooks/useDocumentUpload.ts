// src/hooks/useDocumentUpload.ts
/**
 * Hook pour l'upload de documents vers Cloudinary
 * 
 * Ce hook fournit une interface simple pour uploader des fichiers vers Cloudinary
 * et récupérer des URLs validées pour envoi au backend.
 * 
 * Le backend valide les URLs avec @IsUrl(), donc ce hook assure que:
 * - Les fichiers sont uploadés vers Cloudinary
 * - Les URLs retournées sont des URLs sécurisées HTTPS
 * - Les erreurs sont gérées proprement
 */

import { useState, useCallback } from 'react';
import { cloudinaryService } from '../services/cloudinary';
import { uploadToCloudinary, isValidUrl } from '../utils/cloudinary';

export interface UploadResult {
  url: string;
  success: boolean;
  error?: string;
}

export interface UseDocumentUploadOptions {
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export interface UseDocumentUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadDocument: (file: File) => Promise<UploadResult>;
  uploadMultipleDocuments: (files: File[]) => Promise<UploadResult[]>;
  uploadIdentityDocument: (file: File, userId: string) => Promise<UploadResult>;
  uploadProfilePicture: (file: File, userId: string) => Promise<UploadResult>;
  uploadContractDocument: (file: File, contractId: string) => Promise<UploadResult>;
  uploadDisbursementDocument: (file: File, disbursementId: string) => Promise<UploadResult>;
  uploadCompanyDocument: (file: File, companyId: string, documentType: string) => Promise<UploadResult>;
  validateUrl: (url: string) => boolean;
  reset: () => void;
}

/**
 * Valide un fichier selon les options spécifiées
 */
function validateFile(
  file: File, 
  options: UseDocumentUploadOptions
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, acceptedTypes } = options;
  
  // Vérifier la taille
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `Le fichier dépasse la taille maximale de ${maxSizeMB}MB` 
    };
  }
  
  // Vérifier le type si spécifié
  if (acceptedTypes && acceptedTypes.length > 0) {
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type || file.type.startsWith(type.replace('*', ''));
    });
    
    if (!isValidType) {
      return { 
        valid: false, 
        error: `Type de fichier non accepté. Types acceptés: ${acceptedTypes.join(', ')}` 
      };
    }
  }
  
  return { valid: true };
}

export function useDocumentUpload(options: UseDocumentUploadOptions = {}): UseDocumentUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUploading(false);
    setError(null);
  }, []);

  const uploadDocument = useCallback(async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    
    try {
      // Valider le fichier
      const validation = validateFile(file, options);
      if (!validation.valid) {
        setError(validation.error || 'Fichier invalide');
        return { url: '', success: false, error: validation.error };
      }
      
      // Upload vers Cloudinary
      const url = await uploadToCloudinary(file, options.folder);
      
      // Vérifier que l'URL est valide
      if (!isValidUrl(url)) {
        throw new Error('URL retournée invalide');
      }
      
      return { url, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      return { url: '', success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadMultipleDocuments = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    setUploading(true);
    setError(null);
    
    try {
      const results = await Promise.all(
        files.map(file => uploadDocument(file))
      );
      return results;
    } finally {
      setUploading(false);
    }
  }, [uploadDocument]);

  const uploadIdentityDocument = useCallback(async (
    file: File, 
    userId: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    
    try {
      // Validation spécifique pour les documents d'identité
      const validation = validateFile(file, {
        ...options,
        maxSizeMB: options.maxSizeMB || 5,
        acceptedTypes: options.acceptedTypes || ['image/jpeg', 'image/png', 'application/pdf']
      });
      
      if (!validation.valid) {
        setError(validation.error || 'Fichier invalide');
        return { url: '', success: false, error: validation.error };
      }
      
      const url = await cloudinaryService.uploadIdentityDocument(file, userId);
      return { url, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      return { url: '', success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadProfilePicture = useCallback(async (
    file: File, 
    userId: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    
    try {
      // Validation spécifique pour les photos de profil
      const validation = validateFile(file, {
        ...options,
        maxSizeMB: options.maxSizeMB || 2,
        acceptedTypes: options.acceptedTypes || ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (!validation.valid) {
        setError(validation.error || 'Fichier invalide');
        return { url: '', success: false, error: validation.error };
      }
      
      const url = await cloudinaryService.uploadProfilePicture(file, userId);
      return { url, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      return { url: '', success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadContractDocument = useCallback(async (
    file: File, 
    contractId: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    
    try {
      // Validation spécifique pour les documents de contrat
      const validation = validateFile(file, {
        ...options,
        maxSizeMB: options.maxSizeMB || 10,
        acceptedTypes: options.acceptedTypes || ['application/pdf', 'image/jpeg', 'image/png']
      });
      
      if (!validation.valid) {
        setError(validation.error || 'Fichier invalide');
        return { url: '', success: false, error: validation.error };
      }
      
      const url = await cloudinaryService.uploadContractDocument(file, contractId);
      return { url, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      return { url: '', success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadDisbursementDocument = useCallback(async (
    file: File, 
    disbursementId: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    
    try {
      // Validation spécifique pour les pièces justificatives de virement
      const validation = validateFile(file, {
        ...options,
        maxSizeMB: options.maxSizeMB || 5,
        acceptedTypes: options.acceptedTypes || ['application/pdf', 'image/jpeg', 'image/png']
      });
      
      if (!validation.valid) {
        setError(validation.error || 'Fichier invalide');
        return { url: '', success: false, error: validation.error };
      }
      
      const url = await cloudinaryService.uploadDisbursementDocument(file, disbursementId);
      return { url, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      return { url: '', success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadCompanyDocument = useCallback(async (
    file: File, 
    companyId: string,
    documentType: string
  ): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    
    try {
      const validation = validateFile(file, options);
      
      if (!validation.valid) {
        setError(validation.error || 'Fichier invalide');
        return { url: '', success: false, error: validation.error };
      }
      
      const url = await cloudinaryService.uploadCompanyDocument(file, companyId, documentType);
      return { url, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      return { url: '', success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, [options]);

  const validateUrl = useCallback((url: string): boolean => {
    return isValidUrl(url);
  }, []);

  return {
    uploading,
    error,
    uploadDocument,
    uploadMultipleDocuments,
    uploadIdentityDocument,
    uploadProfilePicture,
    uploadContractDocument,
    uploadDisbursementDocument,
    uploadCompanyDocument,
    validateUrl,
    reset
  };
}
