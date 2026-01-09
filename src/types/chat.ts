export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  likes?: number;
  dislikes?: number;
  isEditing?: boolean;
  attachment?: {
    name: string;
    type: string;
    content: string;
  };
  error?: boolean;
  pending?: boolean;
  retry?: number;
  /** Indique si le message est en cours de streaming */
  isStreaming?: boolean;
  /** Actions suggérées par l'IA à la fin du streaming */
  suggestedActions?: string[];
}

/**
 * Types pour le streaming des réponses IA
 * @see API DOCUMENTATION/chat/README.md - Section "Streaming des Réponses IA"
 */
export type StreamChunkType = 'chunk' | 'end' | 'error' | 'tool_call' | 'tool_result';

/**
 * Interface pour les événements de streaming reçus via WebSocket
 */
export interface PortfolioStreamChunkEvent {
  /** UUID unique du chunk */
  id: string;
  /** ID du message original de l'utilisateur */
  requestMessageId: string;
  /** ID du contexte de chat */
  conversationId: string;
  /** Type de chunk */
  type: StreamChunkType;
  /** Contenu du chunk */
  content: string;
  /** Numéro de séquence du chunk */
  chunkId: number;
  /** ISO 8601 format */
  timestamp: string;
  /** ID de l'utilisateur */
  userId: string;
  /** ID de l'institution (companyId) */
  companyId: string;
  /** Présent uniquement dans les messages 'end' */
  totalChunks?: number;
  /** Actions recommandées basées sur l'analyse */
  suggestedActions?: string[];
  /** Détails de traitement */
  processingDetails?: {
    totalChunks: number;
    contentLength: number;
    aiModel: string;
    source: string;
  };
  /** Métadonnées du streaming */
  metadata?: StreamChunkMetadata;
}

export interface StreamChunkMetadata {
  source: string;
  streamVersion: string;
  streamComplete?: boolean;
  error?: boolean;
  institutionId?: string;
  portfolioId?: string;
  portfolioType?: 'traditional' | 'investment' | 'leasing';
}

/**
 * État du streaming en cours
 */
export interface StreamingState {
  /** ID du message en cours de streaming */
  messageId: string | null;
  /** Contenu accumulé */
  accumulatedContent: string;
  /** Numéro du dernier chunk reçu */
  lastChunkId: number;
  /** Le streaming est-il en cours */
  isActive: boolean;
  /** Erreur éventuelle */
  error?: string;
}

/**
 * Configuration du streaming
 */
export interface StreamingConfig {
  /** URL du WebSocket */
  websocketUrl: string;
  /** Timeout en ms (défaut: 45000) */
  timeout?: number;
  /** Réessayer automatiquement en cas d'erreur */
  autoRetry?: boolean;
  /** Nombre max de tentatives */
  maxRetries?: number;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  isActive: boolean;
  model: AIModel;
  context: string[];
  error?: boolean;
  synced?: boolean;
  lastSyncTime?: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  contextLength: number;
}

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