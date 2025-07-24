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