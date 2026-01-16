// src/utils/chatContextFormatter.ts
/**
 * Utilitaire pour formater le contexte de conversation à envoyer à l'IA
 * 
 * Stratégie: Enrichir le message envoyé avec l'historique des échanges précédents
 * pour que l'IA ADHA puisse maintenir la continuité de la conversation.
 * 
 * @see API DOCUMENTATION/chat/README.md - La structure du message reste inchangée,
 * seul le contenu est enrichi avec le contexte conversationnel.
 */

import type { Message } from '../types/chat';

/**
 * Configuration du formateur de contexte
 */
export interface ContextFormatterConfig {
  /** Nombre maximum de messages précédents à inclure (défaut: 10) */
  maxPreviousMessages: number;
  /** Nombre maximum de caractères pour l'historique (défaut: 4000) */
  maxHistoryLength: number;
  /** Inclure les timestamps dans l'historique (défaut: false) */
  includeTimestamps: boolean;
  /** Format du séparateur entre les messages */
  messageSeparator: string;
}

const DEFAULT_CONFIG: ContextFormatterConfig = {
  maxPreviousMessages: 10,
  maxHistoryLength: 4000,
  includeTimestamps: false,
  messageSeparator: '\n'
};

/**
 * Interface pour un échange formaté
 */
interface FormattedExchange {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

/**
 * Formate un message individuel pour l'historique
 */
function formatMessageForHistory(msg: Message, includeTimestamp: boolean): FormattedExchange {
  return {
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content,
    timestamp: includeTimestamp ? msg.timestamp : undefined
  };
}

/**
 * Tronque le contenu si nécessaire tout en préservant le sens
 */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  
  // Chercher une coupure naturelle (fin de phrase, de paragraphe)
  const truncated = content.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('.\n'),
    truncated.lastIndexOf('? '),
    truncated.lastIndexOf('! ')
  );
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.slice(0, lastSentenceEnd + 1) + '...';
  }
  
  return truncated + '...';
}

/**
 * Construit l'historique formaté des échanges précédents
 * 
 * @param messages - Liste des messages de la conversation (du plus ancien au plus récent)
 * @param config - Configuration du formateur
 * @returns Historique formaté sous forme de chaîne
 */
export function buildConversationHistory(
  messages: Message[],
  config: Partial<ContextFormatterConfig> = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  // Filtrer les messages valides (exclure les messages en erreur, pending, streaming)
  const validMessages = messages.filter(msg => 
    !msg.error && 
    !msg.pending && 
    !msg.isStreaming &&
    msg.content && 
    msg.content.trim().length > 0
  );
  
  // Prendre les N derniers messages (exclure le dernier si c'est le message courant de l'user)
  const recentMessages = validMessages.slice(-cfg.maxPreviousMessages);
  
  if (recentMessages.length === 0) {
    return '';
  }
  
  // Formater chaque message
  const formattedExchanges = recentMessages.map(msg => {
    const formatted = formatMessageForHistory(msg, cfg.includeTimestamps);
    const roleLabel = formatted.role === 'user' ? 'Utilisateur' : 'Assistant ADHA';
    const timestampStr = formatted.timestamp 
      ? ` (${new Date(formatted.timestamp).toLocaleString('fr-FR')})` 
      : '';
    
    return `[${roleLabel}${timestampStr}]: ${formatted.content}`;
  });
  
  // Joindre et tronquer si nécessaire
  let history = formattedExchanges.join(cfg.messageSeparator);
  
  if (history.length > cfg.maxHistoryLength) {
    // Retirer des messages du début pour respecter la limite
    while (formattedExchanges.length > 1 && history.length > cfg.maxHistoryLength) {
      formattedExchanges.shift();
      history = formattedExchanges.join(cfg.messageSeparator);
    }
    
    // Si toujours trop long, tronquer le premier message
    if (history.length > cfg.maxHistoryLength) {
      const firstMsg = formattedExchanges[0];
      const remaining = formattedExchanges.slice(1).join(cfg.messageSeparator);
      const availableSpace = cfg.maxHistoryLength - remaining.length - cfg.messageSeparator.length - 50;
      formattedExchanges[0] = truncateContent(firstMsg, availableSpace);
      history = formattedExchanges.join(cfg.messageSeparator);
    }
  }
  
  return history;
}

/**
 * Formate le message avec le contexte conversationnel pour l'envoi à l'IA
 * 
 * Structure du message enrichi:
 * ```
 * === CONTEXTE DE CONVERSATION ===
 * [Historique des échanges précédents]
 * 
 * === MESSAGE ACTUEL ===
 * [Message de l'utilisateur]
 * ```
 * 
 * @param currentMessage - Le message actuel de l'utilisateur
 * @param previousMessages - Les messages précédents de la conversation (sans le message courant)
 * @param config - Configuration optionnelle
 * @returns Message enrichi avec le contexte conversationnel
 */
export function formatMessageWithContext(
  currentMessage: string,
  previousMessages: Message[],
  config: Partial<ContextFormatterConfig> = {}
): string {
  // Si pas de messages précédents, retourner le message tel quel
  if (!previousMessages || previousMessages.length === 0) {
    return currentMessage;
  }
  
  const history = buildConversationHistory(previousMessages, config);
  
  // Si l'historique est vide après filtrage, retourner le message tel quel
  if (!history || history.trim().length === 0) {
    return currentMessage;
  }
  
  // Construire le message enrichi avec une structure claire pour l'IA
  return `=== CONTEXTE DE CONVERSATION (échanges précédents) ===
${history}

=== MESSAGE ACTUEL DE L'UTILISATEUR ===
${currentMessage}

Note: Réponds uniquement au MESSAGE ACTUEL en tenant compte du contexte de conversation ci-dessus.`;
}

/**
 * Version alternative: Ajouter l'historique dans les metadata au lieu du content
 * Utile si le backend supporte un champ history dans metadata
 * 
 * @param previousMessages - Les messages précédents
 * @param config - Configuration optionnelle
 * @returns Objet metadata enrichi avec l'historique
 */
export function buildContextMetadata(
  previousMessages: Message[],
  config: Partial<ContextFormatterConfig> = {}
): { conversationHistory: FormattedExchange[] } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  const validMessages = previousMessages.filter(msg => 
    !msg.error && 
    !msg.pending && 
    !msg.isStreaming &&
    msg.content && 
    msg.content.trim().length > 0
  );
  
  const recentMessages = validMessages.slice(-cfg.maxPreviousMessages);
  
  const formattedHistory = recentMessages.map(msg => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: truncateContent(msg.content, 500) // Limiter chaque message à 500 chars dans les metadata
  }));
  
  return {
    conversationHistory: formattedHistory
  };
}

/**
 * Calcule le nombre de tokens approximatif (estimation simple: 1 token ≈ 4 caractères)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Vérifie si le message enrichi dépasse la limite de tokens recommandée
 */
export function isWithinTokenLimit(enrichedMessage: string, maxTokens: number = 4000): boolean {
  return estimateTokenCount(enrichedMessage) <= maxTokens;
}
