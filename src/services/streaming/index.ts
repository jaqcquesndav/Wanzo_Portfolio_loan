// src/services/streaming/index.ts
/**
 * Module d'exportation des services de streaming
 */

export { 
  ChatStreamService, 
  getChatStreamService, 
  resetChatStreamService,
  StreamingError
} from './chatStreamService';

export type {
  PortfolioStreamChunkEvent,
  StreamingState,
  StreamingConfig,
  StreamChunkType,
  StreamChunkMetadata
} from '../../types/chat';
