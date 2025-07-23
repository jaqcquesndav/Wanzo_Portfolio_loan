// src/types/document.ts
/**
 * Types pour la gestion des documents dans les portefeuilles
 */

export type DocumentType = 
  | 'contract_template' 
  | 'procedure' 
  | 'legal' 
  | 'marketing' 
  | 'technical' 
  | 'other';

export interface PortfolioDocument {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number; // en octets
  fileType: string; // mimetype
  uploadedAt: string; // ISO date
  uploadedBy: string; // ID utilisateur
  version?: string;
  isPublic: boolean; // visible par les clients
  tags?: string[];
}

export interface DocumentUploadResponse {
  success: boolean;
  document?: PortfolioDocument;
  error?: string;
}
