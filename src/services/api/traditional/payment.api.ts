// src/services/api/traditional/payment.api.ts
import { apiClient } from '../base.api';
import type { CreditPayment } from '../../../types/credit-payment';
import { traditionalDataService } from './dataService';

/**
 * API pour les paiements de crédit
 */
export const paymentApi = {
  /**
   * Récupère tous les paiements pour un contrat
   */
  getPaymentsByContract: async (contractId: string) => {
    try {
      return await apiClient.get<CreditPayment[]>(`/portfolios/traditional/credit-contracts/${contractId}/payments`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payments of contract ${contractId}`, error);
      return traditionalDataService.getPaymentsByContractId(contractId);
    }
  },

  /**
   * Récupère tous les paiements pour un portefeuille
   */
  getPaymentsByPortfolio: async (portfolioId: string) => {
    try {
      return await apiClient.get<CreditPayment[]>(`/portfolios/traditional/${portfolioId}/payments`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payments of portfolio ${portfolioId}`, error);
      return traditionalDataService.getPaymentsByPortfolioId(portfolioId);
    }
  },

  /**
   * Récupère tous les paiements en retard pour un portefeuille
   */
  getLatePayments: async (portfolioId: string) => {
    try {
      return await apiClient.get<CreditPayment[]>(`/portfolios/traditional/${portfolioId}/late-payments`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for late payments of portfolio ${portfolioId}`, error);
      return traditionalDataService.getLatePayments(portfolioId);
    }
  },

/**
 * Récupère un paiement par son ID
 */
  getPaymentById: async (id: string) => {
    try {
      return await apiClient.get<CreditPayment>(`/portfolios/traditional/payments/${id}`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payment ${id}`, error);
      const payment = traditionalDataService.getPaymentById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      return payment;
    }
  },

  /**
   * Récupère un document justificatif par son ID de paiement
   */
  getPaymentReceipt: async (paymentId: string) => {
    try {
      const response = await apiClient.get<{ receipt_url: string }>(`/portfolios/traditional/payments/${paymentId}/receipt`);
      return response.receipt_url;
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payment receipt ${paymentId}`, error);
      const payment = traditionalDataService.getPaymentById(paymentId);
      return payment?.receipt_url || null;
    }
  },

  /**
   * Télécharge un document justificatif
   */
  downloadPaymentReceipt: async (paymentId: string) => {
    try {
      return await apiClient.get<Blob>(`/portfolios/traditional/payments/${paymentId}/receipt/download`, {
        responseType: 'blob'
      });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Failed to download receipt for payment ${paymentId}`, error);
      
      // Pour la démo, on génère un blob PDF simple
      if (process.env.NODE_ENV === 'development') {
        const payment = traditionalDataService.getPaymentById(paymentId);
        if (payment && payment.receipt_url) {
          // Génération d'un PDF minimaliste pour la démo
          const pdfContent = `
            %PDF-1.7
            1 0 obj
            << /Type /Catalog /Pages 2 0 R >>
            endobj
            2 0 obj
            << /Type /Pages /Kids [3 0 R] /Count 1 >>
            endobj
            3 0 obj
            << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >>
            /Contents 5 0 R /MediaBox [0 0 595 842] >>
            endobj
            4 0 obj
            << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
            endobj
            5 0 obj
            << /Length 170 >>
            stream
            BT
            /F1 16 Tf
            50 750 Td
            (Justificatif de paiement) Tj
            /F1 12 Tf
            0 -30 Td
            (Référence: ${payment.payment_reference || payment.transaction_reference || payment.id}) Tj
            0 -20 Td
            (Montant: ${payment.amount} FCFA) Tj
            0 -20 Td
            (Date: ${new Date(payment.payment_date).toLocaleDateString()}) Tj
            ET
            endstream
            endobj
            xref
            0 6
            0000000000 65535 f
            0000000010 00000 n
            0000000058 00000 n
            0000000115 00000 n
            0000000234 00000 n
            0000000301 00000 n
            trailer
            << /Size 6 /Root 1 0 R >>
            startxref
            471
            %%EOF
          `;
          return new Blob([pdfContent], { type: 'application/pdf' });
        }
      }
      
      throw new Error(`Failed to download receipt for payment ${paymentId}`);
    }
  },  /**
   * Enregistre un nouveau paiement
   */
  recordPayment: async (payment: Omit<CreditPayment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await apiClient.post<CreditPayment>('/portfolios/traditional/payments', payment);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn('Fallback to localStorage for recording payment', error);
      const newPayment = {
        ...payment,
        id: traditionalDataService.generatePaymentId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CreditPayment;
      
      traditionalDataService.addPayment(newPayment);
      return newPayment;
    }
  },

  /**
   * Met à jour un paiement
   */
  updatePayment: async (id: string, updates: Partial<CreditPayment>) => {
    try {
      return await apiClient.put<CreditPayment>(`/portfolios/traditional/payments/${id}`, updates);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for updating payment ${id}`, error);
      const payment = traditionalDataService.getPaymentById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      
      const updatedPayment = {
        ...payment,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updatePayment(updatedPayment);
      return updatedPayment;
    }
  },

  /**
   * Annule un paiement
   */
  cancelPayment: async (id: string, reason: string) => {
    try {
      return await apiClient.post<CreditPayment>(`/portfolios/traditional/payments/${id}/cancel`, { reason });
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for cancelling payment ${id}`, error);
      const payment = traditionalDataService.getPaymentById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }
      
      const updatedPayment = {
        ...payment,
        status: 'cancelled' as const,
        cancellation_reason: reason,
        cancellation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      traditionalDataService.updatePayment(updatedPayment);
      return updatedPayment;
    }
  },

  /**
   * Génère un reçu de paiement
   */
  generateReceipt: async (id: string) => {
    try {
      return await apiClient.post<{ receiptUrl: string }>(`/portfolios/traditional/payments/${id}/generate-receipt`, {});
    } catch (error) {
      // Fallback pour le développement
      console.warn(`Fallback for generating receipt for payment ${id}`, error);
      return { receiptUrl: `https://example.com/payment-receipts/${id}.pdf` };
    }
  },

  /**
   * Vérifie si un paiement possède un justificatif
   */
  hasPaymentReceipt: async (id: string) => {
    try {
      const response = await apiClient.get<{ has_receipt: boolean }>(`/portfolios/traditional/payments/${id}/has-receipt`);
      return response.has_receipt;
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for checking payment receipt ${id}`, error);
      const payment = traditionalDataService.getPaymentById(id);
      return !!payment?.receipt_url;
    }
  },

  /**
   * Télécharge un justificatif de paiement
   */
  uploadPaymentReceipt: async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      // Vérifions comment apiClient est implémenté
      const response = await fetch(`/api/portfolios/traditional/payments/${id}/upload-receipt`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      return data.receipt_url;
    } catch (error) {
      // Fallback pour le développement
      console.warn(`Fallback for uploading receipt for payment ${id}`, error);
      
      // Simuler une mise à jour dans le localStorage
      const payment = traditionalDataService.getPaymentById(id);
      if (payment) {
        const updatedPayment = {
          ...payment,
          receipt_url: `https://example.com/receipts/${id}-${file.name}`,
        };
        traditionalDataService.updatePayment(updatedPayment);
        return updatedPayment.receipt_url;
      }
      
      throw new Error(`Failed to upload receipt for payment ${id}`);
    }
  },
  
  /**
   * Télécharge une pièce justificative pour un paiement
   * @param paymentId ID du paiement
   * @returns Blob du document ou null si non trouvé
   */
  downloadSupportingDocument: async (paymentId: string) => {
    try {
      return await apiClient.get<Blob>(`/portfolios/traditional/payments/${paymentId}/supporting-document`, {
        responseType: 'blob'
      });
    } catch (error) {
      // Fallback pour le développement
      console.warn(`Fallback for downloading supporting document for payment ${paymentId}`, error);
      
      // Vérifier si le paiement a un document justificatif
      const payment = traditionalDataService.getPaymentById(paymentId);
      if (payment && payment.supporting_document_url) {
        // Pour la démo, générer un PDF simple
        const pdfContent = `
          %PDF-1.7
          1 0 obj
          << /Type /Catalog /Pages 2 0 R >>
          endobj
          2 0 obj
          << /Type /Pages /Kids [3 0 R] /Count 1 >>
          endobj
          3 0 obj
          << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >>
          /Contents 5 0 R /MediaBox [0 0 595 842] >>
          endobj
          4 0 obj
          << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
          endobj
          5 0 obj
          << /Length 200 >>
          stream
          BT
          /F1 16 Tf
          50 750 Td
          (Pièce justificative de paiement) Tj
          /F1 12 Tf
          0 -30 Td
          (Référence paiement: ${payment.payment_reference || payment.transaction_reference || payment.id}) Tj
          0 -20 Td
          (Montant: ${payment.amount} FCFA) Tj
          0 -20 Td
          (Date: ${new Date(payment.payment_date || new Date()).toLocaleDateString()}) Tj
          0 -20 Td
          (Description: ${payment.description || 'Paiement du contrat ' + payment.contract_id}) Tj
          ET
          endstream
          endobj
          xref
          0 6
          0000000000 65535 f
          0000000010 00000 n
          0000000058 00000 n
          0000000115 00000 n
          0000000234 00000 n
          0000000301 00000 n
          trailer
          << /Size 6 /Root 1 0 R >>
          startxref
          510
          %%EOF
        `;
        return new Blob([pdfContent], { type: 'application/pdf' });
      }
      
      throw new Error(`No supporting document found for payment ${paymentId}`);
    }
  },
  
  /**
   * Télécharge une pièce justificative pour un paiement
   * @param paymentId ID du paiement
   * @param file Fichier à télécharger
   * @returns Résultat de l'opération
   */
  uploadSupportingDocument: async (paymentId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch(`/api/portfolios/traditional/payments/${paymentId}/supporting-document`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, document_url: data.document_url };
    } catch (error) {
      // Fallback pour le développement
      console.warn(`Fallback for uploading supporting document for payment ${paymentId}`, error);
      
      // Simuler une mise à jour dans le localStorage
      const payment = traditionalDataService.getPaymentById(paymentId);
      if (payment) {
        const updatedPayment = {
          ...payment,
          supporting_document_url: `https://example.com/documents/${paymentId}-${file.name}`,
          has_supporting_document: true
        };
        traditionalDataService.updatePayment(updatedPayment);
        return { 
          success: true, 
          document_url: updatedPayment.supporting_document_url,
          message: 'Document téléchargé avec succès'
        };
      }
      
      return {
        success: false,
        message: `Échec du téléchargement du document justificatif pour le paiement ${paymentId}`
      };
    }
  },

  /**
   * Obtient le calendrier de paiement pour un contrat
   */
  getPaymentSchedule: async (contractId: string) => {
    try {
      return await apiClient.get<Array<{
        id: string;
        due_date: string;
        principal_amount: number;
        interest_amount: number;
        total_amount: number;
        status: 'pending' | 'paid' | 'partial' | 'late' | 'defaulted';
        payment_date?: string;
        payment_amount?: number;
      }>>(`/portfolios/traditional/credit-contracts/${contractId}/payment-schedule`);
    } catch (error) {
      // Fallback sur les données en localStorage si l'API échoue
      console.warn(`Fallback to localStorage for payment schedule of contract ${contractId}`, error);
      return traditionalDataService.getPaymentSchedule(contractId);
    }
  }
};
