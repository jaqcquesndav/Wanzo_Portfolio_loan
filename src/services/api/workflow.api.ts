import { apiClient } from './base.api';
import { API_CONFIG } from '../../config/api';
import type { Workflow } from '../../types/workflow';

// Token de test pour la démo
const DEMO_TOKEN = '123456';

export const workflowApi = {
  async getWorkflow(id: string): Promise<Workflow> {
    try {
      const response = await apiClient.get(`/workflows/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  },

  async validateStep(operationId: string, stepId: string, token?: string): Promise<{
    success: boolean;
    generatedToken?: string;
    nextStep?: string;
    estimatedDuration?: number;
  }> {
    try {
      // Pour la démo, on simule la validation avec un token fixe
      if (token && token !== DEMO_TOKEN) {
        throw new Error('Token invalide');
      }

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Générer un nouveau token si nécessaire (pour la démo)
      const generatedToken = Math.random().toString(36).substr(2, 6).toUpperCase();

      return {
        success: true,
        generatedToken,
        estimatedDuration: 7 * 24 * 60 * 60 * 1000 // 1 semaine en millisecondes
      };
    } catch (error) {
      console.error('Error validating step:', error);
      throw error;
    }
  },

  async getStepDuration(workflowId: string, stepId: string): Promise<{
    estimatedDuration: number;
    actualDuration?: number;
  }> {
    // Durées estimées par type d'étape (en jours)
    const stepDurations: Record<string, number> = {
      validation: 2,
      financial_analysis: 5,
      risk_assessment: 3,
      committee_review: 2,
      legal_review: 4,
      payment_execution: 1,
      equipment_inspection: 2,
      delivery: 5,
      due_diligence: 14,
      valuation: 7
    };

    try {
      // Dans un cas réel, appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Pour la démo, retourner une durée fixe selon le type d'étape
      const workflow = await this.getWorkflow(workflowId);
      const step = workflow.steps.find(s => s.id === stepId);
      
      if (!step) throw new Error('Step not found');

      const duration = stepDurations[step.type] || 3; // 3 jours par défaut
      
      return {
        estimatedDuration: duration * 24 * 60 * 60 * 1000 // Convertir en millisecondes
      };
    } catch (error) {
      console.error('Error getting step duration:', error);
      throw error;
    }
  },

  async uploadStepDocument(
    operationId: string,
    stepId: string,
    file: File
  ): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.upload(
        `/operations/${operationId}/steps/${stepId}/documents`,
        formData
      );

      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getStepDocuments(
    operationId: string,
    stepId: string
  ): Promise<Array<{ name: string; url: string }>> {
    try {
      const response = await apiClient.get(
        `/operations/${operationId}/steps/${stepId}/documents`
      );
      return response;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
};