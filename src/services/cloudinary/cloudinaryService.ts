const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Types de ressources supportés par Cloudinary
 */
type CloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto';

/**
 * Détermine le type de ressource Cloudinary en fonction du type MIME du fichier
 */
function getResourceType(file: File): CloudinaryResourceType {
  const mimeType = file.type.toLowerCase();
  
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  // Pour les PDFs, documents, et autres fichiers
  // Utilise 'raw' pour les fichiers non-image/non-video
  return 'raw';
}

/**
 * Construit l'URL d'upload Cloudinary en fonction du type de ressource
 */
function getUploadEndpoint(resourceType: CloudinaryResourceType): string {
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
}

class CloudinaryService {
  /**
   * Upload un fichier vers Cloudinary
   * Supporte images, vidéos, PDFs et autres documents
   */
  async uploadFile(file: File, folder: string = 'general'): Promise<string> {
    const resourceType = getResourceType(file);
    const uploadEndpoint = getUploadEndpoint(resourceType);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Upload plusieurs fichiers vers Cloudinary
   */
  async uploadMultipleFiles(files: File[], folder: string = 'general'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload un document de vérification d'identité
   * Utilise un dossier spécifique pour la conformité
   */
  async uploadIdentityDocument(file: File, userId: string): Promise<string> {
    return this.uploadFile(file, `identity-documents/${userId}`);
  }

  /**
   * Upload un document de contrat
   */
  async uploadContractDocument(file: File, contractId: string): Promise<string> {
    return this.uploadFile(file, `contracts/${contractId}`);
  }

  /**
   * Upload une pièce justificative de virement
   */
  async uploadDisbursementDocument(file: File, disbursementId: string): Promise<string> {
    return this.uploadFile(file, `disbursements/${disbursementId}`);
  }

  /**
   * Upload une photo de profil utilisateur
   */
  async uploadProfilePicture(file: File, userId: string): Promise<string> {
    return this.uploadFile(file, `profiles/${userId}`);
  }

  /**
   * Upload un document d'entreprise (prospection)
   */
  async uploadCompanyDocument(file: File, companyId: string, documentType: string): Promise<string> {
    return this.uploadFile(file, `companies/${companyId}/${documentType}`);
  }

  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    let transformation = 'q_auto,f_auto';
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
    if (quality !== 'auto') transformation += `,q_${quality}`;
    if (format !== 'auto') transformation += `,f_${format}`;

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
  }

  /**
   * Vérifie si une URL est une URL Cloudinary valide
   */
  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }

  /**
   * Extraire le public_id d'une URL Cloudinary
   */
  extractPublicId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Format: /v1234567890/folder/filename.ext
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
        // Retirer la version et joindre le reste
        const relevantParts = pathParts.slice(uploadIndex + 2);
        return relevantParts.join('/').replace(/\.[^/.]+$/, ''); // Retirer l'extension
      }
      return null;
    } catch {
      return null;
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    // Note: Deletion should be handled through your backend for security
    console.warn('File deletion should be handled through backend');
  }
}

export const cloudinaryService = new CloudinaryService();