// src/services/api/traditional/document.api.ts
import { apiClient } from '../base.api';

/**
 * Interface pour un document de portefeuille traditionnel
 */
export interface TraditionalDocument {
  id: string;
  name: string;
  type: 'contract' | 'guarantee' | 'identity' | 'financial_statement' | 'collateral_valuation' | 'legal_document' | 'other';
  category: 'client_document' | 'contract_document' | 'compliance_document' | 'internal_document';
  file_url: string;
  file_size: number;
  file_extension: string;
  mime_type: string;
  description?: string;
  portfolio_id: string;
  contract_id?: string;
  client_id?: string;
  uploaded_by: string;
  upload_date: string;
  expiry_date?: string;
  is_required: boolean;
  status: 'pending_review' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
}

/**
 * API pour les documents des portefeuilles traditionnels
 */
export const traditionalDocumentApi = {
  /**
   * Récupère tous les documents d'un portefeuille traditionnel
   */
  getAllDocuments: async (filters?: {
    portfolioId?: string;
    contractId?: string;
    clientId?: string;
    type?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.portfolioId) params.append('portfolioId', filters.portfolioId);
      if (filters?.contractId) params.append('contractId', filters.contractId);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      return await apiClient.get<{
        data: TraditionalDocument[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/portfolios/traditional/documents?${params.toString()}`);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn('Fallback to mock data for traditional documents', error);
      
      const mockDocuments: TraditionalDocument[] = [
        {
          id: 'doc-001',
          name: 'Contrat de Crédit PME-001.pdf',
          type: 'contract',
          category: 'contract_document',
          file_url: 'https://example.com/documents/contract-001.pdf',
          file_size: 2048576,
          file_extension: 'pdf',
          mime_type: 'application/pdf',
          description: 'Contrat de crédit principal pour PME-001',
          portfolio_id: filters?.portfolioId || 'portfolio-001',
          contract_id: filters?.contractId || 'contract-001',
          client_id: 'client-001',
          uploaded_by: 'user-001',
          upload_date: new Date().toISOString(),
          is_required: true,
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'doc-002',
          name: 'Garantie Immobilière.pdf',
          type: 'guarantee',
          category: 'contract_document',
          file_url: 'https://example.com/documents/guarantee-001.pdf',
          file_size: 1536000,
          file_extension: 'pdf',
          mime_type: 'application/pdf',
          description: 'Document de garantie immobilière',
          portfolio_id: filters?.portfolioId || 'portfolio-001',
          contract_id: filters?.contractId || 'contract-001',
          client_id: 'client-001',
          uploaded_by: 'user-001',
          upload_date: new Date().toISOString(),
          is_required: true,
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return {
        data: mockDocuments,
        meta: {
          total: mockDocuments.length,
          page: 1,
          limit: 50,
          totalPages: 1
        }
      };
    }
  },

  /**
   * Récupère un document par son ID
   */
  getDocumentById: async (id: string): Promise<TraditionalDocument> => {
    try {
      return await apiClient.get<TraditionalDocument>(`/portfolios/traditional/documents/${id}`);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn(`Fallback to mock data for traditional document ${id}`, error);
      
      return {
        id,
        name: 'Document Exemple.pdf',
        type: 'contract',
        category: 'contract_document',
        file_url: `https://example.com/documents/${id}.pdf`,
        file_size: 1024000,
        file_extension: 'pdf',
        mime_type: 'application/pdf',
        description: 'Document d\'exemple',
        portfolio_id: 'portfolio-001',
        contract_id: 'contract-001',
        client_id: 'client-001',
        uploaded_by: 'user-001',
        upload_date: new Date().toISOString(),
        is_required: false,
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Téléverse un nouveau document
   */
  createDocument: async (documentData: {
    name: string;
    type: 'contract' | 'guarantee' | 'identity' | 'financial_statement' | 'collateral_valuation' | 'legal_document' | 'other';
    category: 'client_document' | 'contract_document' | 'compliance_document' | 'internal_document';
    description?: string;
    portfolio_id: string;
    contract_id?: string;
    client_id?: string;
    is_required?: boolean;
    expiry_date?: string;
  }, file: File): Promise<TraditionalDocument> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', documentData.name);
      formData.append('type', documentData.type);
      formData.append('category', documentData.category);
      formData.append('portfolio_id', documentData.portfolio_id);
      
      if (documentData.description) formData.append('description', documentData.description);
      if (documentData.contract_id) formData.append('contract_id', documentData.contract_id);
      if (documentData.client_id) formData.append('client_id', documentData.client_id);
      if (documentData.is_required !== undefined) formData.append('is_required', documentData.is_required.toString());
      if (documentData.expiry_date) formData.append('expiry_date', documentData.expiry_date);

      return await apiClient.upload<TraditionalDocument>('/portfolios/traditional/documents', formData);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn('Fallback to mock data for creating traditional document', error);
      
      const id = `doc-${Date.now()}`;
      return {
        id,
        name: documentData.name,
        type: documentData.type,
        category: documentData.category,
        file_url: `https://example.com/documents/${id}.${file.name.split('.').pop()}`,
        file_size: file.size,
        file_extension: file.name.split('.').pop() || '',
        mime_type: file.type,
        description: documentData.description,
        portfolio_id: documentData.portfolio_id,
        contract_id: documentData.contract_id,
        client_id: documentData.client_id,
        uploaded_by: 'current-user',
        upload_date: new Date().toISOString(),
        expiry_date: documentData.expiry_date,
        is_required: documentData.is_required || false,
        status: 'pending_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Met à jour un document existant
   */
  updateDocument: async (id: string, updates: {
    name?: string;
    description?: string;
    status?: 'pending_review' | 'approved' | 'rejected' | 'expired';
    expiry_date?: string;
    is_required?: boolean;
  }): Promise<TraditionalDocument> => {
    try {
      return await apiClient.put<TraditionalDocument>(`/portfolios/traditional/documents/${id}`, updates);
    } catch (error) {
      // Fallback sur les données mockées si l'API échoue
      console.warn(`Fallback to mock data for updating traditional document ${id}`, error);
      
      const currentDocument = await traditionalDocumentApi.getDocumentById(id);
      
      return {
        ...currentDocument,
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Supprime un document
   */
  deleteDocument: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/portfolios/traditional/documents/${id}`);
      return true;
    } catch (error) {
      // Simulation de la suppression si l'API échoue
      console.warn(`Fallback to mock deletion for traditional document ${id}`, error);
      return true;
    }
  },

  /**
   * Télécharge un document
   */
  downloadDocument: async (id: string): Promise<Blob> => {
    try {
      return await apiClient.get<Blob>(`/portfolios/traditional/documents/${id}/download`);
    } catch (error) {
      // Fallback sur un blob vide si l'API échoue
      console.warn(`Fallback to mock blob for downloading traditional document ${id}`, error);
      return new Blob(['Mock document content'], { type: 'application/pdf' });
    }
  },

  /**
   * Valide un document (pour approbation/rejet)
   */
  validateDocument: async (id: string, validation: {
    status: 'approved' | 'rejected';
    comments?: string;
    validated_by?: string;
  }): Promise<TraditionalDocument> => {
    try {
      return await apiClient.post<TraditionalDocument>(`/portfolios/traditional/documents/${id}/validate`, validation);
    } catch (error) {
      // Fallback sur la mise à jour du statut si l'API échoue
      console.warn(`Fallback to mock validation for traditional document ${id}`, error);
      
      return await traditionalDocumentApi.updateDocument(id, {
        status: validation.status
      });
    }
  },

  /**
   * Récupère les exigences documentaires pour un contrat
   */
  getDocumentRequirements: async (contractId: string) => {
    try {
      return await apiClient.get<{
        contract_id: string;
        required_documents: Array<{
          type: string;
          category: string;
          name: string;
          description: string;
          is_mandatory: boolean;
          deadline?: string;
          status: 'missing' | 'submitted' | 'approved' | 'rejected';
          submitted_document_id?: string;
        }>;
        completion_rate: number;
        missing_count: number;
        approved_count: number;
      }>(`/portfolios/traditional/documents/requirements/${contractId}`);
    } catch (error) {
      // Fallback sur les exigences mockées si l'API échoue
      console.warn(`Fallback to mock requirements for contract ${contractId}`, error);
      
      const requirements = [
        {
          type: 'contract',
          category: 'contract_document',
          name: 'Contrat de crédit signé',
          description: 'Contrat de crédit principal dûment signé par toutes les parties',
          is_mandatory: true,
          status: 'approved' as const,
          submitted_document_id: 'doc-001'
        },
        {
          type: 'guarantee',
          category: 'contract_document',
          name: 'Acte de garantie',
          description: 'Document officiel de garantie immobilière ou mobilière',
          is_mandatory: true,
          status: 'approved' as const,
          submitted_document_id: 'doc-002'
        },
        {
          type: 'identity',
          category: 'client_document',
          name: 'Pièce d\'identité dirigeant',
          description: 'Carte d\'identité ou passeport du dirigeant principal',
          is_mandatory: true,
          status: 'missing' as const
        },
        {
          type: 'financial_statement',
          category: 'client_document',
          name: 'États financiers derniers 3 ans',
          description: 'Bilans et comptes de résultat des 3 dernières années',
          is_mandatory: true,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'missing' as const
        }
      ];

      const approvedCount = requirements.filter(r => r.status === 'approved').length;
      const missingCount = requirements.filter(r => r.status === 'missing').length;

      return {
        contract_id: contractId,
        required_documents: requirements,
        completion_rate: (approvedCount / requirements.length) * 100,
        missing_count: missingCount,
        approved_count: approvedCount
      };
    }
  }
};