import { Cloudinary } from '@cloudinary/url-gen';

const cloudinary = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }
});

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
  return 'raw';
}

/**
 * Upload un fichier vers Cloudinary
 * Supporte images, vidéos, PDFs et autres documents
 * @param file - Le fichier à uploader
 * @param folder - Le dossier de destination (optionnel)
 * @returns L'URL sécurisée du fichier uploadé
 */
export async function uploadToCloudinary(file: File, folder?: string): Promise<string> {
  const resourceType = getResourceType(file);
  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  
  if (folder) {
    formData.append('folder', folder);
  }

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
 * @param files - Les fichiers à uploader
 * @param folder - Le dossier de destination (optionnel)
 * @returns Les URLs sécurisées des fichiers uploadés
 */
export async function uploadMultipleToCloudinary(files: File[], folder?: string): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Vérifie si une URL est une URL Cloudinary valide
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Vérifie si une chaîne est une URL valide
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function getCloudinaryUrl(publicId: string) {
  return cloudinary.image(publicId).toURL();
}