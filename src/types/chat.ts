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
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  contextLength: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'adha-1',
    name: 'Adha 1',
    description: 'Modèle de base pour la comptabilité générale',
    capabilities: ['Comptabilité générale', 'Écritures simples', 'Rapprochements'],
    contextLength: 4096
  },
  {
    id: 'adha-fisk',
    name: 'Adha Fisk',
    description: 'Spécialisé en fiscalité et déclarations',
    capabilities: ['Fiscalité', 'TVA', 'Déclarations fiscales', 'Optimisation fiscale'],
    contextLength: 8192
  },
  {
    id: 'adha-o1',
    name: 'Adha O1',
    description: 'Version avancée pour l\'analyse financière',
    capabilities: ['Analyse financière', 'Ratios', 'Prévisions', 'Tableaux de bord'],
    contextLength: 16384
  }
];