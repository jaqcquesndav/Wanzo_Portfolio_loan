// src/services/api/chat.api.ts
import { apiClient } from './base.api';
import type { Message, Conversation } from '../../types/chat';
import { API_CONFIG } from '../../config/api';

/**
 * Service API pour les fonctionnalités de chat
 */
export class ChatApi {
  /**
   * Récupère l'historique des conversations pour un utilisateur
   * @returns Liste des conversations
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      return await apiClient.get(API_CONFIG.endpoints.messages.getConversations);
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      // En cas d'erreur, retourner un tableau vide au lieu de propager l'erreur
      return [];
    }
  }

  /**
   * Récupère les messages d'une conversation spécifique
   * @param conversationId ID de la conversation
   * @returns Liste des messages de la conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      return await apiClient.get(`${API_CONFIG.endpoints.messages.getMessages}/${conversationId}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages pour la conversation ${conversationId}:`, error);
      return [];
    }
  }

  /**
   * Envoie un nouveau message
   * @param conversationId ID de la conversation
   * @param content Contenu du message
   * @param attachment Pièce jointe éventuelle
   * @param mode Mode de chat (analyse ou standard)
   * @returns Le message créé avec ID et timestamp
   */
  async sendMessage(
    conversationId: string, 
    content: string, 
    attachment?: Message['attachment'],
    mode: 'chat' | 'analyse' = 'chat'
  ): Promise<Message> {
    try {
      return await apiClient.post(API_CONFIG.endpoints.messages.sendMessage, {
        conversationId,
        content,
        attachment,
        mode
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // En cas d'erreur, retourner un message local avec indication d'erreur
      return {
        id: `local-${Date.now()}`,
        sender: 'user',
        content,
        timestamp: new Date().toISOString(),
        error: true,
        attachment
      };
    }
  }

  /**
   * Crée une nouvelle conversation
   * @param title Titre de la conversation
   * @returns La conversation créée
   */
  async createConversation(title: string = 'Nouvelle conversation'): Promise<Conversation> {
    try {
      return await apiClient.post(API_CONFIG.endpoints.messages.createConversation, { title });
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      // Créer une conversation locale en cas d'erreur
      return {
        id: `local-${Date.now()}`,
        title,
        timestamp: new Date().toISOString(),
        messages: [],
        isActive: true,
        model: {
          id: 'adha-credit',
          name: 'Adha Crédit',
          description: 'Spécialisé en gestion de crédits et analyse de risques',
          capabilities: ['Analyse de solvabilité', 'Évaluation des risques', 'Gestion des garanties', 'Plans de remboursement'],
          contextLength: 8192
        },
        context: [],
        error: true
      };
    }
  }

  /**
   * Supprime une conversation
   * @param conversationId ID de la conversation à supprimer
   * @returns Statut de la suppression
   */
  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`${API_CONFIG.endpoints.messages.deleteConversation}/${conversationId}`);
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression de la conversation ${conversationId}:`, error);
      return { success: false };
    }
  }

  /**
   * Met à jour un message existant (par exemple, pour les réactions)
   * @param messageId ID du message
   * @param updates Mises à jour à appliquer
   * @returns Le message mis à jour
   */
  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message> {
    try {
      return await apiClient.put(`${API_CONFIG.endpoints.messages.updateMessage}/${messageId}`, updates);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du message ${messageId}:`, error);
      throw error;
    }
  }
}

// Exporter une instance unique du service
export const chatApi = new ChatApi();
