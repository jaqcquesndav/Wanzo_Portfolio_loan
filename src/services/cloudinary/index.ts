// src/services/cloudinary/index.ts
/**
 * Service Cloudinary pour l'upload de fichiers
 * 
 * Ce module expose le service Cloudinary pour l'upload de fichiers vers Cloudinary.
 * Les URLs retournées sont des URLs sécurisées (https) validées par le backend avec @IsUrl().
 * 
 * Types de fichiers supportés:
 * - Images (JPEG, PNG, GIF, WebP, etc.)
 * - Documents (PDF, Word, Excel, etc.)
 * - Vidéos (MP4, etc.)
 * 
 * Usage:
 * ```typescript
 * import { cloudinaryService } from '@/services/cloudinary';
 * 
 * // Upload simple
 * const url = await cloudinaryService.uploadFile(file, 'folder-name');
 * 
 * // Upload document de vérification d'identité
 * const idDocUrl = await cloudinaryService.uploadIdentityDocument(file, userId);
 * 
 * // Upload pièce justificative de virement
 * const disbursementDocUrl = await cloudinaryService.uploadDisbursementDocument(file, disbursementId);
 * ```
 */

export { cloudinaryService } from './cloudinaryService';
