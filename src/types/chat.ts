// src/types/chat.ts
// Types pour le module Chat ADHA - Synchronisé avec l'API backend

/**
 * Type de portefeuille pour le contexte du chat
 */
export type ChatPortfolioType = 'traditional' | 'investment' | 'leasing';

/**
 * Métadonnées du contexte de chat
 */
export interface ChatMetadata {
  portfolioId?: string;
  portfolioType?: ChatPortfolioType;
  companyId?: string;
  entityType?: string;
  entityId?: string;
  [key: string]: string | undefined;
}

/**
 * Pièce jointe à un message
 */
export interface MessageAttachment {
  id?: string;
  name: string;
  type: string;
  url?: string;
  content?: string;
  size?: number;
  uploaded_at?: string;
}

/**
 * Message dans une conversation
 */
export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'assistant';
  content: string;
  timestamp: string;
  contextId?: string;
  metadata?: ChatMetadata;
  likes?: number;
  dislikes?: number;
  isEditing?: boolean;
  attachment?: MessageAttachment;
  attachments?: MessageAttachment[];
  error?: boolean;
  pending?: boolean;
}

/**
 * Contact dans le chat (pour les conversations directes)
 */
export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

/**
 * Conversation/Contexte de chat
 */
export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
  messages: Message[];
  isActive: boolean;
  model: AIModel;
  context: string[];
  metadata?: ChatMetadata;
  messageCount?: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: 'user' | 'assistant';
  };
  error?: boolean;
  synced?: boolean;
  lastSyncTime?: string;
}

/**
 * Modèle d'IA disponible
 */
export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  contextLength: number;
}

/**
 * Suggestion de chat contextuelle
 */
export interface ChatSuggestion {
  id: string;
  text: string;
  category: string;
  relevance: number;
}

/**
 * Réponse prédéfinie
 */
export interface PredefinedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

/**
 * Évaluation d'un message
 */
export interface MessageRating {
  id: string;
  messageId: string;
  score: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  timestamp: string;
}

/**
 * Rapport généré à partir du chat
 */
export interface ChatReport {
  id: string;
  title: string;
  format: 'pdf' | 'docx' | 'html';
  url: string;
  generated_at: string;
  size: number;
}

/**
 * Mode de chat
 */
export type ChatMode = 'chat' | 'analyse';

/**
 * Modèles d'IA ADHA disponibles
 */
export const AI_MODELS: AIModel[] = [
  // Modèles pour la finance traditionnelle (crédit)
  {
    id: 'adha-credit',
    name: 'Adha Crédit',
    description: 'Spécialisé en gestion de crédits et analyse de risques',
    capabilities: ['Analyse de solvabilité', 'Évaluation des risques', 'Gestion des garanties', 'Plans de remboursement'],
    contextLength: 8192
  },
  {
    id: 'adha-prospection',
    name: 'Adha Prospection',
    description: 'Analyse des opportunités de marché et ciblage client',
    capabilities: ['Segmentation client', 'Analyse de marché', 'Scoring prospects', 'Simulations financières'],
    contextLength: 8192
  },
  // Modèles pour le leasing
  {
    id: 'adha-leasing',
    name: 'Adha Leasing',
    description: 'Expert en contrats de leasing et gestion d\'équipements',
    capabilities: ['Valorisation d\'actifs', 'Gestion de contrats', 'Maintenance prédictive', 'Analyse de valeur résiduelle'],
    contextLength: 12288
  },
  // Modèles pour l'investissement
  {
    id: 'adha-invest',
    name: 'Adha Invest',
    description: 'Spécialisé en capital-investissement et valorisation',
    capabilities: ['Due diligence', 'Valorisation d\'entreprises', 'Stratégies d\'exit', 'Analyse de performance'],
    contextLength: 16384
  },
  // Modèle analytique avancé
  {
    id: 'adha-analytics',
    name: 'Adha Analytics',
    description: 'Analyse approfondie des données financières et prévisions',
    capabilities: ['Modèles prédictifs', 'Détection de fraude', 'Tableaux de bord', 'Rapports d\'activité'],
    contextLength: 32768
  }
];