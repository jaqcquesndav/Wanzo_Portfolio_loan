# Chat API - Portfolio Institution Service

> **Synchronisée avec le code source TypeScript** - Janvier 2026  
> **Version**: 2.0 (Streaming WebSocket + Mode Synchrone)

Ce document décrit l'architecture complète et les endpoints pour la gestion des conversations avec l'assistant IA ADHA dans l'API Wanzo Portfolio Institution.

## Architecture Globale

```
┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────┐
│    Frontend     │      │   Portfolio Service     │      │  ADHA AI Svc    │
│   (React+Vite)  │      │   (NestJS)              │      │                 │
└────────┬────────┘      └────────────┬────────────┘      └────────┬────────┘
         │                            │                            │
         │  POST /chat/messages       │                            │
         │  (Mode Sync)               │   portfolio.chat.message   │
         ├───────────────────────────►├───────────────────────────►│
         │                            │   (Kafka)                  │
         │◄───────────────────────────┤◄───────────────────────────┤
         │  Réponse JSON complète     │   portfolio.chat.response  │
         │                            │                            │
         │  POST /chat/stream         │                            │
         │  (Mode Streaming)          │   portfolio.chat.message   │
         ├───────────────────────────►├───────────────────────────►│
         │  {messageId, wsInfo}       │   (streaming: true)        │
         │◄───────────────────────────┤                            │
         │                            │                            │
         │  WebSocket                 │   portfolio.chat.stream    │
         │  subscribe_conversation    │◄───────────────────────────┤
         │◄═══════════════════════════╪═══════════════════════════╡
         │  adha.stream.chunk (×N)    │   Chunks temps réel        │
         │  adha.stream.end           │                            │
         │                            │                            │
└─────────────────────────────────────┴────────────────────────────┘
```

---

## ⚠️ IMPORTANT : Workflow Streaming - Ordre des Opérations

> **🚨 ERREUR FRÉQUENTE** : Si le frontend envoie le message HTTP **AVANT** de se connecter au WebSocket,
> les chunks de réponse seront **perdus** car aucun client ne sera abonné à la room de conversation.

### Symptôme côté backend (logs)
```
⚠️ No clients subscribed to conversation xxx - chunk not delivered!
📤 Sending chunk chunk 53 to 0 clients in room conversation:xxx
```

### ✅ Workflow CORRECT (obligatoire)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ORDRE DES OPÉRATIONS POUR LE STREAMING                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1️⃣  WebSocket.connect() via API Gateway                                │
│      URL: wss://api.wanzo.com/portfolio/chat (ou ws://localhost:8000)   │
│      ⚠️ NE PAS se connecter directement au port 3005 !                  │
│                                                                         │
│  2️⃣  WebSocket.emit('subscribe_conversation', { conversationId })       │
│      → Le client rejoint la room conversation:{id}                      │
│      → ATTENDRE la confirmation de connexion                            │
│                                                                         │
│  3️⃣  POST /portfolio/api/v1/chat/stream via API Gateway                 │
│      → Envoyer le message HTTP seulement APRÈS l'étape 2                │
│      → Retourne { messageId, conversationId }                           │
│                                                                         │
│  4️⃣  Recevoir les événements WebSocket                                  │
│      → adha.stream.chunk (×N) - chunks progressifs                      │
│      → adha.stream.end - fin du stream avec contenu complet             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### ❌ Workflow INCORRECT (perte de données)

```
1. POST /chat/stream  ← Message envoyé
2. WebSocket.connect() ← Trop tard ! Les chunks arrivent déjà
3. subscribe_conversation ← Trop tard ! Chunks perdus
```

### URLs de Connexion WebSocket (via API Gateway)

| Environnement | URL WebSocket | Path |
|---------------|---------------|------|
| **Production** | `wss://api.wanzo.com` | `/portfolio/chat` |
| **Développement** | `ws://localhost:8000` | `/portfolio/chat` |

> **⚠️ Ne JAMAIS se connecter directement à `ws://localhost:3005/socket.io`** en dehors des tests.
> Toujours passer par l'API Gateway qui gère l'authentification et le routage.

---

## 🎯 GUIDE COMPLET : Implémentation Frontend Streaming (React/TypeScript)

> **Ce guide vous montre comment implémenter correctement le streaming dans votre application React.**
> Suivez ces étapes **dans l'ordre exact** pour éviter la perte de chunks.

### Architecture du Streaming

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FLUX DE DONNÉES STREAMING                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   [Frontend React]                                                              │
│        │                                                                        │
│        │ 1️⃣ WebSocket.connect('ws://localhost:8000', {path: '/portfolio/chat'}) │
│        │                                                                        │
│        ▼                                                                        │
│   [API Gateway :8000]  ──────────────────────────────────────────────┐          │
│        │                                                             │          │
│        │ Proxy: /portfolio/chat → portfolio-service:3005/socket.io   │          │
│        │                                                             │          │
│        ▼                                                             │          │
│   [Portfolio Service :3005]                                          │          │
│        │                                                             │          │
│        │ 2️⃣ emit('subscribe_conversation', {conversationId})         │          │
│        │    → Client rejoint room: conversation:{id}                 │          │
│        │                                                             │          │
│        │ 3️⃣ POST /portfolio/api/v1/chat/stream                       │          │
│        │    → Message envoyé via Kafka                               │          │
│        │                                                             │          │
│        ▼                                                             │          │
│   [Kafka] ──► portfolio.chat.message ──► [ADHA AI Service]           │          │
│                                               │                      │          │
│                                               │ Traitement IA        │          │
│                                               ▼                      │          │
│   [Kafka] ◄── portfolio.chat.stream ◄── Chunks générés               │          │
│        │                                                             │          │
│        ▼                                                             │          │
│   [Portfolio Service]                                                │          │
│        │                                                             │          │
│        │ 4️⃣ emit('adha.stream.chunk') → room conversation:{id}       │          │
│        │ 5️⃣ emit('adha.stream.end')   → Fin du stream                │          │
│        │                                                             │          │
│        ▼                                                             │          │
│   [Frontend React] ◄─────────────────────────────────────────────────┘          │
│        │                                                                        │
│        └──► Affichage progressif du texte                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 📋 ÉTAPE 1 : Connexion WebSocket (AVANT tout message)

```typescript
// ✅ CORRECT : Connexion via API Gateway
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:8000', {
  path: '/portfolio/chat',  // ⚠️ Le proxy réécrira vers /socket.io
  transports: ['websocket', 'polling'],
  auth: {
    token: 'Bearer eyJhbGciOiJSUzI1NiI...'  // JWT Auth0
  }
});

socket.on('connect', () => {
  console.log('✅ WebSocket connecté:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur connexion:', error.message);
});
```

```typescript
// ❌ INCORRECT : Connexion directe au service (ne fonctionne pas en prod)
const socket = io('http://localhost:3005', {
  path: '/socket.io'  // ❌ Bypass l'API Gateway - INTERDIT
});
```

---

### 📋 ÉTAPE 2 : Configuration des Listeners (AVANT l'abonnement)

```typescript
// Configurer TOUS les listeners avant de s'abonner
socket.on('adha.stream.chunk', (data: StreamChunk) => {
  console.log(`📦 Chunk ${data.chunkIndex}:`, data.content);
  // Accumuler le texte progressivement
  setStreamingContent(prev => prev + data.content);
});

socket.on('adha.stream.end', (data: StreamEnd) => {
  console.log('✅ Stream terminé:', data.totalChunks, 'chunks');
  setIsStreaming(false);
  // Sauvegarder le message complet
  addMessageToHistory({
    role: 'assistant',
    content: data.fullContent,
    metadata: data.metadata
  });
});

socket.on('adha.stream.error', (error: StreamError) => {
  console.error('❌ Erreur streaming:', error.message);
  setError(error.message);
  setIsStreaming(false);
});

// Types TypeScript
interface StreamChunk {
  conversationId: string;
  messageId: string;
  chunkIndex: number;
  content: string;
  isLast: boolean;
}

interface StreamEnd {
  conversationId: string;
  messageId: string;
  fullContent: string;
  totalChunks: number;
  metadata: {
    processingTime: number;
    tokensUsed: number;
  };
}

interface StreamError {
  conversationId: string;
  messageId: string;
  code: string;
  message: string;
}
```

---

### 📋 ÉTAPE 3 : S'abonner à la Conversation (AVANT d'envoyer le message)

```typescript
// ⚠️ CRITIQUE : Cette étape DOIT être faite AVANT le POST /chat/stream

const subscribeToConversation = (conversationId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    socket.emit('subscribe_conversation', { conversationId }, (response: any) => {
      if (response?.success) {
        console.log(`✅ Abonné à conversation: ${conversationId}`);
        resolve();
      } else {
        console.error('❌ Échec abonnement:', response?.error);
        reject(new Error(response?.error || 'Subscription failed'));
      }
    });
    
    // Timeout de sécurité
    setTimeout(() => reject(new Error('Subscription timeout')), 5000);
  });
};

// Utilisation
await subscribeToConversation('ctx-uuid-123');
// ✅ Maintenant on peut envoyer le message HTTP
```

---

### 📋 ÉTAPE 4 : Envoyer le Message HTTP (APRÈS l'abonnement WebSocket)

```typescript
const sendStreamingMessage = async (
  content: string,
  conversationId?: string
): Promise<{ messageId: string; conversationId: string }> => {
  
  const response = await fetch('http://localhost:8000/portfolio/api/v1/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content,
      contextId: conversationId,
      metadata: {
        portfolioId: 'port-456',
        portfolioType: 'traditional'
      }
    })
  });
  
  const data = await response.json();
  return {
    messageId: data.data.messageId,
    conversationId: data.data.conversationId
  };
};
```

---

### 📋 ÉTAPE 5 : Si Nouvelle Conversation, S'abonner avec le Nouveau ID

```typescript
// Si contextId n'était pas fourni, le backend crée une nouvelle conversation
// Il faut s'abonner à ce nouveau conversationId !

const handleSendMessage = async (content: string, existingConversationId?: string) => {
  setIsStreaming(true);
  setStreamingContent('');
  
  // Si conversation existante, s'abonner d'abord
  if (existingConversationId) {
    await subscribeToConversation(existingConversationId);
  }
  
  // Envoyer le message
  const { messageId, conversationId } = await sendStreamingMessage(content, existingConversationId);
  
  // ⚠️ Si nouvelle conversation créée, s'abonner MAINTENANT
  if (!existingConversationId && conversationId) {
    await subscribeToConversation(conversationId);
    // Note: Quelques premiers chunks peuvent être perdus dans ce cas
    // Recommandation: Toujours créer la conversation d'abord via POST /chat/contexts
  }
  
  console.log(`📤 Message envoyé: ${messageId} dans conversation: ${conversationId}`);
};
```

---

### 🎣 Hook React Complet : `usePortfolioChatStreaming`

```typescript
// hooks/usePortfolioChatStreaming.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface StreamingState {
  isConnected: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  currentConversationId: string | null;
}

interface StreamChunk {
  conversationId: string;
  messageId: string;
  chunkIndex: number;
  content: string;
  isLast: boolean;
}

interface StreamEnd {
  conversationId: string;
  messageId: string;
  fullContent: string;
  totalChunks: number;
  metadata: { processingTime: number; tokensUsed: number };
}

interface UsePortfolioChatStreamingOptions {
  token: string;
  baseUrl?: string;
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (data: StreamEnd) => void;
  onError?: (error: Error) => void;
}

export const usePortfolioChatStreaming = (options: UsePortfolioChatStreamingOptions) => {
  const {
    token,
    baseUrl = 'http://localhost:8000',
    onChunk,
    onComplete,
    onError
  } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<StreamingState>({
    isConnected: false,
    isStreaming: false,
    streamingContent: '',
    error: null,
    currentConversationId: null
  });
  
  // 1️⃣ Initialiser la connexion WebSocket
  useEffect(() => {
    const socket = io(baseUrl, {
      path: '/portfolio/chat',
      transports: ['websocket', 'polling'],
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
      console.log('✅ Portfolio WebSocket connecté:', socket.id);
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });
    
    socket.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket déconnecté:', reason);
      setState(prev => ({ ...prev, isConnected: false }));
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Erreur connexion WebSocket:', error.message);
      setState(prev => ({ ...prev, error: error.message }));
      onError?.(error);
    });
    
    // 2️⃣ Listeners pour le streaming
    socket.on('adha.stream.chunk', (data: StreamChunk) => {
      setState(prev => ({
        ...prev,
        streamingContent: prev.streamingContent + data.content
      }));
      onChunk?.(data);
    });
    
    socket.on('adha.stream.end', (data: StreamEnd) => {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        streamingContent: data.fullContent
      }));
      onComplete?.(data);
    });
    
    socket.on('adha.stream.error', (error: { message: string }) => {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error.message
      }));
      onError?.(new Error(error.message));
    });
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, [token, baseUrl]);
  
  // 3️⃣ S'abonner à une conversation
  const subscribeToConversation = useCallback(async (conversationId: string): Promise<void> => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      throw new Error('WebSocket non connecté');
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout abonnement conversation'));
      }, 5000);
      
      socket.emit('subscribe_conversation', { conversationId }, (response: any) => {
        clearTimeout(timeout);
        if (response?.success) {
          setState(prev => ({ ...prev, currentConversationId: conversationId }));
          resolve();
        } else {
          reject(new Error(response?.error || 'Échec abonnement'));
        }
      });
    });
  }, []);
  
  // 4️⃣ Envoyer un message en streaming
  const sendMessage = useCallback(async (
    content: string,
    conversationId?: string,
    metadata?: Record<string, any>
  ): Promise<{ messageId: string; conversationId: string }> => {
    
    // Réinitialiser l'état
    setState(prev => ({
      ...prev,
      isStreaming: true,
      streamingContent: '',
      error: null
    }));
    
    // ⚠️ CRUCIAL : S'abonner AVANT d'envoyer si conversation existante
    if (conversationId) {
      await subscribeToConversation(conversationId);
    }
    
    // Envoyer la requête HTTP
    const response = await fetch(`${baseUrl}/portfolio/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content,
        contextId: conversationId,
        metadata
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur envoi message');
    }
    
    const data = await response.json();
    const newConversationId = data.data.conversationId;
    
    // ⚠️ Si nouvelle conversation, s'abonner maintenant
    if (!conversationId && newConversationId) {
      await subscribeToConversation(newConversationId);
    }
    
    return {
      messageId: data.data.messageId,
      conversationId: newConversationId
    };
  }, [token, baseUrl, subscribeToConversation]);
  
  // 5️⃣ Se désabonner d'une conversation
  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('unsubscribe_conversation', { conversationId });
    setState(prev => ({ ...prev, currentConversationId: null }));
  }, []);
  
  return {
    ...state,
    sendMessage,
    subscribeToConversation,
    unsubscribeFromConversation,
    socket: socketRef.current
  };
};
```

---

### 💻 Exemple d'Utilisation du Hook

```tsx
// components/PortfolioChat.tsx
import React, { useState } from 'react';
import { usePortfolioChatStreaming } from '../hooks/usePortfolioChatStreaming';

export const PortfolioChat: React.FC<{ token: string }> = ({ token }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const {
    isConnected,
    isStreaming,
    streamingContent,
    error,
    sendMessage
  } = usePortfolioChatStreaming({
    token,
    baseUrl: 'http://localhost:8000',
    onComplete: (data) => {
      // Ajouter la réponse complète à l'historique
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.fullContent
      }]);
      setConversationId(data.conversationId);
    },
    onError: (err) => {
      console.error('Erreur chat:', err);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    // Ajouter le message utilisateur
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    try {
      await sendMessage(input, conversationId || undefined, {
        portfolioId: 'port-456',
        portfolioType: 'traditional'
      });
      setInput('');
    } catch (err) {
      console.error('Erreur envoi:', err);
    }
  };
  
  return (
    <div className="portfolio-chat">
      {/* Indicateur de connexion */}
      <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
      </div>
      
      {/* Messages */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        
        {/* Message en cours de streaming */}
        {isStreaming && (
          <div className="message assistant streaming">
            {streamingContent}
            <span className="cursor">▊</span>
          </div>
        )}
      </div>
      
      {/* Erreur */}
      {error && <div className="error">❌ {error}</div>}
      
      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question sur le portefeuille..."
          disabled={!isConnected || isStreaming}
        />
        <button type="submit" disabled={!isConnected || isStreaming}>
          {isStreaming ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
};
```

---

### 📊 Points Clés à Retenir

| Étape | Action | Timing | Conséquence si Ignoré |
|-------|--------|--------|----------------------|
| 1 | `io.connect()` | Au montage du composant | ❌ Aucune communication possible |
| 2 | `socket.on('adha.stream.*')` | Après connexion | ❌ Événements non capturés |
| 3 | `emit('subscribe_conversation')` | **AVANT** POST | ❌ **Chunks perdus (0 clients)** |
| 4 | `POST /chat/stream` | Après abonnement | - |
| 5 | Traiter chunks | Pendant streaming | ❌ Affichage incomplet |

---

### ❌ Erreur Courante à Éviter

```typescript
// ❌ MAUVAIS : Envoyer AVANT de s'abonner
const sendMessage = async () => {
  const response = await fetch('/portfolio/api/v1/chat/stream', {...});
  const data = await response.json();
  
  // Trop tard ! Les chunks arrivent déjà et sont perdus
  socket.emit('subscribe_conversation', { conversationId: data.conversationId });
};

// ✅ BON : S'abonner AVANT d'envoyer
const sendMessage = async () => {
  // D'abord s'abonner (si conversation existante)
  if (existingConversationId) {
    await subscribeToConversation(existingConversationId);
  }
  
  // Ensuite envoyer
  const response = await fetch('/portfolio/api/v1/chat/stream', {...});
  const data = await response.json();
  
  // Si nouvelle conversation, s'abonner immédiatement
  if (!existingConversationId) {
    await subscribeToConversation(data.conversationId);
  }
};
```

---

### 🔍 Pourquoi "0 clients subscribed" ?

Si vous voyez ce message dans les logs backend :
```
📤 Sending chunk chunk 53 to 0 clients in room conversation:xxx
```

**Causes possibles :**

1. **WebSocket non connecté** - Vérifiez `socket.connected === true`
2. **Path incorrect** - Doit être `/portfolio/chat` via API Gateway
3. **Abonnement manquant** - `subscribe_conversation` non appelé
4. **Ordre incorrect** - POST envoyé avant l'abonnement
5. **ConversationId différent** - L'abonnement utilise un ID différent

**Debug rapide :**
```typescript
console.log('Socket connecté:', socket.connected);
console.log('Socket ID:', socket.id);
console.log('ConversationId abonné:', currentConversationId);
```

---

### Topics Kafka

| Topic | Direction | Description |
|-------|-----------|-------------|
| `portfolio.chat.message` | Portfolio → ADHA AI | Messages utilisateur (sync ou streaming) |
| `portfolio.chat.response` | ADHA AI → Portfolio | Réponses complètes (mode synchrone) |
| `portfolio.chat.stream` | ADHA AI → Portfolio | Chunks de réponse (mode streaming) |

### Modes de Communication

| Mode | Endpoint | Utilisation | Latence |
|------|----------|-------------|---------|
| **Synchrone** | `POST /chat/messages` | Questions rapides, mobile | ~2-5s |
| **Streaming** | `POST /chat/stream` | Analyses longues, UX temps réel | Immédiat (chunks) |

## Types de Données (TypeScript)

```typescript
// Rôles du message
enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

// Message de chat
interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    streaming?: boolean;
    suggestedActions?: SuggestedAction[];
  };
  attachments?: Attachment[];
}

// Contexte de conversation
interface ChatContext {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  metadata: ContextMetadata;
  messageCount: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
  };
}

// Métadonnées contextuelles
interface ContextMetadata {
  title?: string;
  portfolioId?: string;
  portfolioType?: 'traditional' | 'investment' | 'leasing';
  clientId?: string;
  companyId?: string;
  entityType?: string;
  entityId?: string;
  [key: string]: any;
}

// Actions suggérées par l'IA
interface SuggestedAction {
  type: string;
  payload: any;
}

// Pièce jointe
interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
}
```

## Endpoints

---

### 1. Mode Synchrone - Envoyer un message

Envoie un message et **attend** la réponse complète de l'IA ADHA.

#### Requête

```
POST /portfolio/api/v1/chat/messages
```

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Corps de la requête

```json
{
  "content": "Analysez la performance du portefeuille PME ce trimestre",
  "contextId": "ctx-uuid-123",
  "metadata": {
    "portfolioId": "port-456",
    "portfolioType": "traditional",
    "clientId": "client-789",
    "entityType": "portfolio"
  }
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `content` | string | ✅ | Message de l'utilisateur |
| `contextId` | string | ❌ | ID du contexte (conversation). Si absent, une nouvelle conversation est créée |
| `metadata` | object | ❌ | Informations contextuelles pour l'IA |

#### Réponse (200 OK)

```json
{
  "id": "msg-001",
  "content": "Analysez la performance du portefeuille PME ce trimestre",
  "timestamp": "2026-01-11T12:00:00.000Z",
  "sender": "user",
  "contextId": "ctx-uuid-123",
  "metadata": {
    "portfolioId": "port-456",
    "portfolioType": "traditional"
  },
  "response": {
    "id": "msg-002",
    "content": "📊 **Analyse du Portefeuille PME - Q4 2025**\n\nLe portefeuille présente une performance globale positive avec:\n- Encours total: 2.5M€ (+12% vs Q3)\n- Taux de défaut: 3.2% (-0.5 pts)\n- Secteurs performants: Commerce (45%), Services (30%)\n\nJe recommande de diversifier vers le secteur technologique.",
    "timestamp": "2026-01-11T12:00:03.500Z",
    "sender": "assistant",
    "processingDetails": {
      "tokensUsed": 450,
      "processingTime": 3500,
      "aiModel": "adha-1"
    },
    "suggestedActions": [
      {"type": "view_portfolio", "payload": {"portfolioId": "port-456"}},
      {"type": "generate_report", "payload": {"type": "quarterly"}}
    ]
  }
}
```

---

### 2. Mode Streaming - Envoyer un message avec réponse temps réel

Envoie un message et **retourne immédiatement**. Les réponses arrivent **chunk par chunk via WebSocket**.

> ⚡ **Recommandé pour** : Analyses longues, expérience utilisateur temps réel, affichage progressif

#### Requête

```
POST /portfolio/api/v1/chat/stream
```

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Corps de la requête

```json
{
  "content": "Effectuez une analyse détaillée des risques de défaut sur l'ensemble du portefeuille avec projections",
  "contextId": "ctx-uuid-123",
  "metadata": {
    "title": "Analyse risques Q4",
    "portfolioId": "port-456",
    "portfolioType": "traditional",
    "institutionId": "inst-xyz"
  }
}
```

#### Réponse (201 Created)

```json
{
  "success": true,
  "data": {
    "messageId": "msg-stream-uuid-789",
    "conversationId": "ctx-uuid-123",
    "userMessageId": "user-msg-001"
  },
  "websocket": {
    "namespace": "/",
    "events": {
      "subscribe": "subscribe_conversation",
      "chunk": "adha.stream.chunk",
      "end": "adha.stream.end",
      "error": "adha.stream.error",
      "tool": "adha.stream.tool"
    }
  }
}
```

#### Workflow Streaming Complet

```
1. POST /chat/stream → Reçoit messageId + conversationId
2. WebSocket.connect('wss://api.wanzo.com/portfolio/chat')  ← Via API Gateway
   - path: '/portfolio/chat' (sera réécrit en /socket.io par le proxy)
3. WebSocket.emit('subscribe_conversation', { conversationId })
4. WebSocket.on('adha.stream.chunk') → Afficher chunk progressif
5. WebSocket.on('adha.stream.end') → Finaliser affichage
```

> **⚠️ Important**: Le frontend se connecte via l'API Gateway (`/portfolio/chat`), 
> pas directement au service portfolio. Le proxy réécrira le path vers `/socket.io`.

---

### 3. Récupérer l'historique des messages

Récupère l'historique paginé des messages pour un contexte.

#### Requête

```
GET /portfolio/api/v1/chat/contexts/{contextId}/messages
```

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `contextId` | string | ✅ | ID du contexte (path param) |
| `limit` | number | ❌ | Nombre max de messages (défaut: 50) |
| `before` | string | ❌ | Pagination - messages avant cet ID/date |
| `after` | string | ❌ | Pagination - messages après cet ID/date |

#### Réponse (200 OK)

```json
{
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "Analysez le portefeuille PME",
      "timestamp": "2026-01-11T12:00:00.000Z",
      "metadata": {"portfolioId": "port-456"}
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "📊 Le portefeuille PME présente...",
      "timestamp": "2026-01-11T12:00:03.000Z",
      "metadata": {
        "streaming": true,
        "totalChunks": 12,
        "processingTime": 2800
      }
    }
  ],
  "hasMore": true,
  "nextCursor": "msg-003"
}
```

---

### 4. Créer un nouveau contexte (conversation)

Crée une nouvelle session de conversation avec mémoire.

#### Requête

```
POST /portfolio/api/v1/chat/contexts
```

#### Corps de la requête

```json
{
  "title": "Analyse du portefeuille PME",
  "metadata": {
    "portfolioId": "port456",
    "portfolioType": "traditional",
    "companyId": "comp789"
  }
}
```

#### Réponse

```json
{
  "id": "ctx123",
  "title": "Analyse du portefeuille PME",
  "created_at": "2025-07-25T12:00:00.000Z",
  "updated_at": "2025-07-25T12:00:00.000Z",
  "metadata": {
    "portfolioId": "port456",
    "portfolioType": "traditional",
    "companyId": "comp789"
  }
}
```

### Récupérer un contexte de chat

Récupère les détails d'un contexte de chat par son ID.

#### Requête

```
GET /portfolio/api/v1/chat/contexts/{id}
```

#### Paramètres de chemin
- `id` : Identifiant unique du contexte de chat

#### Réponse

```json
{
  "id": "ctx123",
  "title": "Analyse du portefeuille PME",
  "created_at": "2025-07-25T12:00:00.000Z",
  "updated_at": "2025-07-25T12:01:30.000Z",
  "metadata": {
    "portfolioId": "port456",
    "portfolioType": "traditional",
    "companyId": "comp789"
  },
  "messageCount": 3,
  "lastMessage": {
    "content": "Oui, pouvez-vous me donner la répartition par secteur d'activité?",
    "timestamp": "2025-07-25T12:01:30.000Z",
    "sender": "user"
  }
}
```

### Récupérer tous les contextes de chat

Récupère tous les contextes de chat de l'utilisateur.

#### Requête

```
GET /portfolio/api/v1/chat/contexts
```

#### Paramètres de requête
- `limit` (optionnel) : Nombre maximum de contextes à récupérer
- `offset` (optionnel) : Nombre de contextes à ignorer
- `search` (optionnel) : Terme de recherche
- `portfolioId` (optionnel) : Filtrer par ID de portefeuille
- `companyId` (optionnel) : Filtrer par ID d'entreprise

#### Réponse

```json
{
  "contexts": [
    {
      "id": "ctx123",
      "title": "Analyse du portefeuille PME",
      "created_at": "2025-07-25T12:00:00.000Z",
      "updated_at": "2025-07-25T12:01:30.000Z",
      "metadata": {
        "portfolioId": "port456",
        "portfolioType": "traditional",
        "companyId": "comp789"
      },
      "messageCount": 3,
      "lastMessage": {
        "content": "Oui, pouvez-vous me donner la répartition par secteur d'activité?",
        "timestamp": "2025-07-25T12:01:30.000Z",
        "sender": "user"
      }
    },
    {
      "id": "ctx124",
      "title": "Analyse des risques",
      "created_at": "2025-07-24T15:30:00.000Z",
      "updated_at": "2025-07-24T15:45:00.000Z",
      "metadata": {
        "portfolioId": "port789",
        "portfolioType": "investment"
      },
      "messageCount": 5,
      "lastMessage": {
        "content": "Merci pour ces informations détaillées.",
        "timestamp": "2025-07-24T15:45:00.000Z",
        "sender": "user"
      }
    }
  ],
  "total": 10,
  "limit": 2,
  "offset": 0
}
```

### Mettre à jour un contexte de chat

Met à jour les détails d'un contexte de chat existant.

#### Requête

```
PUT /portfolio/api/v1/chat/contexts/{id}
```

#### Paramètres de chemin
- `id` : Identifiant unique du contexte de chat

#### Corps de la requête

```json
{
  "title": "Analyse approfondie du portefeuille PME",
  "metadata": {
    "priority": "high"
  }
}
```

#### Réponse

```json
{
  "id": "ctx123",
  "title": "Analyse approfondie du portefeuille PME",
  "updated_at": "2025-07-25T12:10:00.000Z",
  "metadata": {
    "portfolioId": "port456",
    "portfolioType": "traditional",
    "companyId": "comp789",
    "priority": "high"
  }
}
```

### Supprimer un contexte de chat

Supprime un contexte de chat et tous ses messages.

#### Requête

```
DELETE /portfolio/api/v1/chat/contexts/{id}
```

#### Paramètres de chemin
- `id` : Identifiant unique du contexte de chat

#### Réponse

```
204 No Content
```

### Récupérer des suggestions de chat

Récupère des suggestions de questions ou de sujets basés sur le contexte actuel.

#### Requête

```
GET /portfolio/api/v1/chat/suggestions
```

#### Paramètres de requête
- `contextId` (optionnel) : ID du contexte de chat
- `portfolioId` (optionnel) : ID du portefeuille
- `portfolioType` (optionnel) : Type de portefeuille (traditional, investment, leasing)
- `companyId` (optionnel) : ID de l'entreprise
- `currentScreenPath` (optionnel) : Chemin de l'écran actuel

#### Réponse

```json
{
  "suggestions": [
    {
      "id": "sug1",
      "text": "Quelle est la répartition sectorielle du portefeuille?",
      "category": "analyse",
      "relevance": 0.95
    },
    {
      "id": "sug2",
      "text": "Quels sont les principaux risques identifiés?",
      "category": "risque",
      "relevance": 0.85
    },
    {
      "id": "sug3",
      "text": "Pouvez-vous me montrer l'évolution des performances sur les 12 derniers mois?",
      "category": "performance",
      "relevance": 0.80
    }
  ]
}
```

### Générer un rapport de chat

Génère un rapport basé sur les conversations de chat.

#### Requête

```
POST /portfolio/api/v1/chat/reports
```

#### Corps de la requête

```json
{
  "contextId": "ctx123",
  "title": "Rapport d'analyse du portefeuille PME",
  "format": "pdf",
  "includeMetadata": true
}
```

#### Réponse

```json
{
  "id": "rep123",
  "title": "Rapport d'analyse du portefeuille PME",
  "format": "pdf",
  "url": "https://api.wanzo.com/reports/rep123.pdf",
  "generated_at": "2025-07-25T12:15:00.000Z",
  "size": 245678
}
```

### Récupérer des réponses prédéfinies

Récupère des réponses prédéfinies pour le chat, optionnellement filtrées par catégorie.

#### Requête

```
GET /portfolio/api/v1/chat/predefined-responses
```

#### Paramètres de requête
- `category` (optionnel) : Catégorie de réponses (ex: risque, performance, analyse)

#### Réponse

```json
{
  "responses": [
    {
      "id": "resp1",
      "title": "Analyse des ratios financiers",
      "content": "Voici une analyse détaillée des ratios financiers de l'entreprise...",
      "category": "analyse",
      "tags": ["ratios", "financier", "analyse"]
    },
    {
      "id": "resp2",
      "title": "Explication du scoring de risque",
      "content": "Le scoring de risque est calculé en fonction des paramètres suivants...",
      "category": "risque",
      "tags": ["scoring", "risque", "méthodologie"]
    }
  ],
  "categories": ["analyse", "risque", "performance", "crédit", "leasing", "investissement"]
}
```

### Évaluer un message

Enregistre une évaluation pour une réponse de chat.

#### Requête

```
POST /portfolio/api/v1/chat/messages/{messageId}/rating
```

#### Paramètres de chemin
- `messageId` : Identifiant unique du message

#### Corps de la requête

```json
{
  "score": 4,
  "feedback": "Réponse très utile mais pourrait être plus détaillée"
}
```

#### Réponse

```json
{
  "id": "rat123",
  "messageId": "msg002",
  "score": 4,
  "feedback": "Réponse très utile mais pourrait être plus détaillée",
  "timestamp": "2025-07-25T12:20:00.000Z"
}
```

### Ajouter une pièce jointe à un message

Ajoute une pièce jointe à un message.

#### Requête

```
POST /portfolio/api/v1/chat/messages/{messageId}/attachments
```

#### Paramètres de chemin
- `messageId` : Identifiant unique du message

#### Corps de la requête
FormData contenant le fichier à télécharger.

#### Réponse

```json
{
  "id": "att123",
  "messageId": "msg001",
  "type": "application/pdf",
  "url": "https://api.wanzo.com/attachments/att123.pdf",
  "name": "rapport_analyse.pdf",
  "size": 123456,
  "uploaded_at": "2025-07-25T12:25:00.000Z"
}
```

## Architecture Technique Backend

### Composants Implémentés

| Composant | Fichier | Description |
|-----------|---------|-------------|
| **ChatModule** | `src/modules/chat/chat.module.ts` | Module principal, orchestration |
| **ChatController** | `controllers/chat.controller.ts` | Endpoints HTTP (sync + stream) |
| **PortfolioAdhaAiService** | `services/adha-ai.service.ts` | Communication Kafka vers ADHA AI |
| **ChatService** | `services/chat.service.ts` | Logique métier, persistance |
| **PortfolioChatGateway** | `gateways/chat.gateway.ts` | WebSocket Gateway (Socket.IO) |
| **PortfolioStreamingConsumer** | `consumers/streaming.consumer.ts` | Consumer Kafka chunks streaming |
| **AdhaResponseConsumer** | `consumers/adha-response.consumer.ts` | Consumer Kafka réponses sync |

### Topics Kafka

```typescript
// Définis dans adha-ai.service.ts
export const PortfolioChatTopics = {
  CHAT_MESSAGE: 'portfolio.chat.message',      // → ADHA AI
  CHAT_RESPONSE: 'portfolio.chat.response',    // ← ADHA AI (sync)
  CHAT_STREAM: 'portfolio.chat.stream',        // ← ADHA AI (streaming)
  ANALYSIS_REQUEST: 'portfolio.analysis.request',
  ANALYSIS_RESPONSE: 'portfolio.analysis.response',
};
```

### Format Standardisé des Messages Kafka (Important!)

> **⚠️ Mise à jour Janvier 2026**: Tous les messages envoyés à ADHA AI utilisent le format standardisé 
> `MessageVersionManager.createStandardMessage()` pour garantir la compatibilité et le bon routage 
> du `conversationId` dans les réponses streaming.

```typescript
// Structure du message Kafka standardisé
interface StandardKafkaMessage<T> {
  id: string;          // UUID unique du message
  eventType: string;   // ex: 'portfolio.chat.message'
  data: T;             // L'événement (PortfolioChatMessageEvent)
  metadata: {
    id: string;
    correlationId: string;
    timestamp: string;
    source: string;    // 'portfolio-institution-service'
    version: {
      version: string;
      schemaVersion: string;
    };
  };
}

// Exemple d'utilisation dans adha-ai.service.ts
const standardMessage = MessageVersionManager.createStandardMessage(
  PortfolioChatTopics.CHAT_MESSAGE,
  event,  // PortfolioChatMessageEvent avec conversationId
  'portfolio-institution-service'
);
await this.kafkaClient.emit(topic, standardMessage).toPromise();
```

Ce format garantit que le `conversationId` est correctement transmis à travers le cycle complet :
1. Portfolio Service → ADHA AI (via `portfolio.chat.message`)
2. ADHA AI extrait `data.conversationId` 
3. ADHA AI renvoie les chunks avec le même `conversationId`
4. WebSocket route vers la bonne room `conversation:{conversationId}`

### Services Backend

| Service | Méthodes principales |
|---------|---------------------|
| **ChatService** | `sendMessage()`, `createContext()`, `addMessage()`, `getMessageHistory()`, `getSuggestions()` |
| **PortfolioAdhaAiService** | `sendMessage()` (sync), `sendMessageStreaming()` (async), `handleAdhaResponse()` |
| **PortfolioChatGateway** | `sendStreamChunk()`, `handleSubscribeConversation()`, `sendToUser()` |

### Modèles d'IA ADHA disponibles

1. **Adha Crédit** - Spécialisé en gestion de crédits et analyse de risques
2. **Adha Prospection** - Analyse des opportunités de marché et ciblage client
3. **Adha Leasing** - Expert en contrats de leasing et gestion d'équipements
4. **Adha Invest** - Spécialisé en capital-investissement et valorisation
5. **Adha Analytics** - Analyse approfondie des données financières et prévisions

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide ou paramètres manquants |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 404  | Ressource non trouvée |
| 422  | Entité non traitable - Validation échouée |
| 429  | Trop de requêtes - Limite de taux dépassée |
| 500  | Erreur serveur interne |
| 503  | Kafka non disponible - Service IA temporairement indisponible |

---

## Streaming des Réponses IA (v2.0 - Janvier 2026)

### Vue d'ensemble

Le système de streaming permet au frontend de recevoir les réponses de l'IA ADHA **en temps réel, chunk par chunk**, offrant une expérience utilisateur fluide pour les analyses complexes.

### URLs de Connexion WebSocket

| Environnement | URL Base | Path WebSocket | URL Complète |
|---------------|----------|----------------|--------------|
| **Production** | `wss://api.wanzo.com` | `/portfolio/chat` | `wss://api.wanzo.com/portfolio/chat` |
| **Développement** | `ws://localhost:8000` | `/portfolio/chat` | `ws://localhost:8000/portfolio/chat` |
| **Direct (sans proxy)** | `ws://localhost:3005` | `/socket.io` | `ws://localhost:3005/socket.io` |

> **⚠️ Important**: En production et développement standard, passez TOUJOURS par l'API Gateway 
> avec le path `/portfolio/chat`. Le proxy réécrira automatiquement vers `/socket.io` du service.

### Architecture Streaming Complète

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           STREAMING FLOW                                  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Frontend (React)       API Gateway         Portfolio Service   ADHA AI   │
│  ═══════════════        ═══════════         ═════════════════   ════════  │
│                                                                           │
│  1. POST /portfolio/api/v1/chat/stream                                    │
│     ────────────────────► Proxy ────────────► ChatController              │
│                                                    │                      │
│  2. ◄─────────────────────────────────────────────┤                      │
│     { messageId, conversationId, wsInfo }         │                      │
│                                                    ▼                      │
│                                          PortfolioAdhaAiService           │
│                                                    │                      │
│                                                    │ portfolio.chat.message│
│                                                    └─────────────► Kafka  │
│                                                                      │    │
│  3. WebSocket.connect('/portfolio/chat')                             │    │
│     ─────────────────► WS Proxy ──────────► PortfolioChatGateway     │    │
│                        (→ /socket.io)                                │    │
│                                                                      ▼    │
│  4. emit('subscribe_conversation')                            ADHA AI Svc │
│     ─────────────────────────────────────► join(room)              │      │
│                                                                     │     │
│  5.                                     portfolio.chat.stream       │     │
│                           ◄────────────────────────────────── Kafka ◄┘    │
│                                       │                                   │
│                          PortfolioStreamingConsumer                       │
│                                       │                                   │
│                                       ▼                                   │
│                          PortfolioChatGateway.sendStreamChunk()           │
│                                       │                                   │
│  6. ◄═══ adha.stream.chunk ═══════════╯                                   │
│     ◄═══ adha.stream.chunk                                                │
│     ◄═══ adha.stream.chunk                                                │
│     ◄═══ adha.stream.end ────────► Sauvegarde DB                          │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Structure des Événements de Streaming

#### StreamChunkEvent (Interface TypeScript Backend)

```typescript
// Défini dans streaming.consumer.ts
interface StreamChunkEvent {
  id: string;                    // UUID unique du chunk
  requestMessageId: string;      // ID du message original de l'utilisateur
  conversationId: string;        // ID du contexte de chat
  type: 'chunk' | 'end' | 'error' | 'tool_call' | 'tool_result';
  content: string;               // Contenu du chunk
  chunkId: number;               // Numéro de séquence du chunk
  timestamp: string;             // ISO 8601 format
  userId: string;
  companyId: string;             // institutionId
  
  // Présents uniquement dans les messages 'end'
  totalChunks?: number;
  suggestedActions?: Array<{type: string; payload: any}>;  // Actions recommandées
  processingDetails?: {
    totalChunks?: number;
    contentLength?: number;
    aiModel?: string;
    tokensUsed?: number;
  };
  
  metadata?: Record<string, any>;
}
```

### Types de Chunks

| Type | Description | Utilisation |
|------|-------------|-------------|
| `chunk` | Fragment de texte de la réponse | Affichage progressif |
| `end` | Fin du stream avec contenu complet | Finalisation + actions suggérées |
| `error` | Erreur pendant le traitement | Notification utilisateur |
| `tool_call` | L'IA appelle une fonction d'analyse | Indicateur de traitement |
| `tool_result` | Résultat d'un appel de fonction | Données d'analyse |

### Exemple de Chunk de Contenu

```json
{
  "id": "chunk-uuid-123",
  "requestMessageId": "msg-456",
  "conversationId": "ctx123",
  "type": "chunk",
  "content": "Analyse du portefeuille PME en cours...",
  "chunkId": 1,
  "timestamp": "2026-01-09T12:00:01.123Z",
  "userId": "user-abc",
  "companyId": "inst-xyz",
  "metadata": {
    "source": "adha_ai_service",
    "streamVersion": "1.0.0",
    "institutionId": "inst-xyz",
    "portfolioId": "port456",
    "portfolioType": "traditional"
  }
}
```

### Exemple de Message de Fin (Analyse de Portefeuille)

```json
{
  "id": "end-uuid-456",
  "requestMessageId": "msg-456",
  "conversationId": "ctx123",
  "type": "end",
  "content": "Le portefeuille PME présente un encours total de 2.5M€ avec un taux de défaut de 3.2%. Les secteurs les plus performants sont le commerce (45%) et les services (30%). Je recommande de diversifier vers le secteur technologique pour réduire le risque sectoriel.",
  "chunkId": 12,
  "totalChunks": 11,
  "timestamp": "2026-01-09T12:00:08.456Z",
  "userId": "user-abc",
  "companyId": "inst-xyz",
  "suggestedActions": [
    "Augmenter l'exposition au secteur technologique",
    "Réviser les critères de scoring pour le commerce",
    "Planifier une revue trimestrielle du portefeuille"
  ],
  "processingDetails": {
    "totalChunks": 11,
    "contentLength": 425,
    "aiModel": "adha-1",
    "source": "portfolio_institution"
  },
  "metadata": {
    "source": "adha_ai_service",
    "streamVersion": "1.0.0",
    "streamComplete": true,
    "institutionId": "inst-xyz",
    "portfolioId": "port456",
    "portfolioType": "traditional"
  }
}
```

### Exemple de Message d'Erreur

```json
{
  "id": "error-uuid-789",
  "requestMessageId": "msg-456",
  "conversationId": "ctx123",
  "type": "error",
  "content": "Impossible d'accéder aux données du portefeuille",
  "chunkId": -1,
  "timestamp": "2026-01-09T12:00:02.000Z",
  "userId": "user-abc",
  "companyId": "inst-xyz",
  "metadata": {
    "source": "adha_ai_service",
    "streamVersion": "1.0.0",
    "error": true,
    "institutionId": "inst-xyz"
  }
}
```

### Événements WebSocket (Socket.IO)

Le backend utilise **Socket.IO** pour le streaming temps réel. Les événements sont émis sur le namespace `/` (racine).

#### Événements du Client → Serveur

| Événement | Payload | Description |
|-----------|---------|-------------|
| `subscribe_conversation` | `{ conversationId: string }` | S'abonner aux updates d'une conversation |
| `unsubscribe_conversation` | `{ conversationId: string }` | Se désabonner d'une conversation |

#### Événements du Serveur → Client

| Événement | Description | Quand |
|-----------|-------------|-------|
| `adha.stream.chunk` | Nouveau chunk de contenu | Pendant le streaming |
| `adha.stream.end` | Fin du stream, contenu complet | Fin du traitement |
| `adha.stream.error` | Erreur de traitement | En cas d'erreur |
| `adha.stream.tool` | Appel/résultat d'outil IA | Pendant le traitement |

### Intégration Frontend (React/TypeScript) avec Socket.IO

#### Installation des dépendances

```bash
# npm
npm install socket.io-client axios

# yarn
yarn add socket.io-client axios

# pnpm
pnpm add socket.io-client axios
```

#### Types TypeScript

```typescript
// types/chat.types.ts

/** Type de chunk de streaming */
export type StreamChunkType = 'chunk' | 'end' | 'error' | 'tool_call' | 'tool_result';

/** Chunk reçu via WebSocket */
export interface StreamingChunk {
  id: string;
  requestMessageId: string;
  conversationId: string;
  type: StreamChunkType;
  content: string;
  chunkId: number;
  totalChunks?: number;
  suggestedActions?: Array<{ type: string; payload: unknown }>;
  processingDetails?: {
    totalChunks?: number;
    contentLength?: number;
    aiModel?: string;
    tokensUsed?: number;
    processingTime?: number;
  };
  metadata?: Record<string, unknown>;
}

/** Réponse de l'endpoint POST /chat/stream */
export interface StreamingResponse {
  success: boolean;
  data: {
    messageId: string;
    conversationId: string;
    userMessageId: string;
  };
  websocket: {
    namespace: string;
    events: {
      subscribe: string;
      chunk: string;
      end: string;
      error: string;
      tool: string;
    };
  };
}

/** DTO pour envoyer un message */
export interface SendMessageDto {
  content: string;
  contextId?: string;
  metadata?: {
    title?: string;
    portfolioId?: string;
    portfolioType?: 'traditional' | 'investment' | 'leasing';
    clientId?: string;
    institutionId?: string;
    [key: string]: unknown;
  };
}
```

#### Service de Streaming Complet

```typescript
// services/portfolioChatStreamService.ts
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import type { StreamingChunk, StreamingResponse, SendMessageDto } from '../types/chat.types';

type ChunkCallback = (chunk: StreamingChunk) => void;

/**
 * Service de streaming pour le chat Portfolio Institution
 * Gère la connexion WebSocket et les appels API pour le streaming ADHA AI
 */
export class PortfolioChatStreamService {
  private socket: Socket | null = null;
  private baseUrl: string;
  private getToken: () => string;
  private chunkListeners: Set<ChunkCallback> = new Set();

  constructor(baseUrl: string, getToken: () => string) {
    this.baseUrl = baseUrl; // ex: 'https://api.wanzo.com' ou 'http://localhost:8000'
    this.getToken = getToken;
  }

  /**
   * ⚠️ ÉTAPE 1 : Connexion WebSocket via API Gateway
   * DOIT être appelé AVANT d'envoyer un message HTTP
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.baseUrl, {
        path: '/portfolio/chat', // ⚠️ Important: path via API Gateway (réécrit en /socket.io)
        transports: ['websocket', 'polling'],
        auth: {
          token: this.getToken(),
        },
        extraHeaders: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected to portfolio chat');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        reject(error);
      });

      // Écouter les événements de streaming
      this.socket.on('adha.stream.chunk', (data: StreamingChunk) => {
        this.notifyListeners(data);
      });

      this.socket.on('adha.stream.end', (data: StreamingChunk) => {
        this.notifyListeners(data);
      });

      this.socket.on('adha.stream.error', (data: StreamingChunk) => {
        this.notifyListeners(data);
      });

      this.socket.on('adha.stream.tool', (data: StreamingChunk) => {
        this.notifyListeners(data);
      });
    });
  }

  /**
   * ⚠️ ÉTAPE 2 : S'abonner à une conversation
   * DOIT être appelé AVANT d'envoyer le message HTTP
   */
  subscribeToConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected! Call connect() first.');
      return;
    }
    this.socket.emit('subscribe_conversation', { conversationId });
    console.log(`📡 Subscribed to conversation: ${conversationId}`);
  }

  /** Se désabonner d'une conversation */
  unsubscribeFromConversation(conversationId: string): void {
    this.socket?.emit('unsubscribe_conversation', { conversationId });
  }

  /**
   * ⚠️ ÉTAPE 3 : Envoyer un message en mode streaming
   * DOIT être appelé APRÈS connect() et subscribeToConversation()
   */
  async sendStreamingMessage(dto: SendMessageDto): Promise<StreamingResponse> {
    const response = await axios.post<StreamingResponse>(
      `${this.baseUrl}/portfolio/api/v1/chat/stream`,
      dto,
      {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  /** Ajouter un listener pour les chunks */
  onChunk(callback: ChunkCallback): () => void {
    this.chunkListeners.add(callback);
    return () => this.chunkListeners.delete(callback);
  }

  private notifyListeners(chunk: StreamingChunk): void {
    this.chunkListeners.forEach((cb) => cb(chunk));
  }

  /** Déconnecter le WebSocket */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  /** Vérifier si connecté */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton pour utilisation globale
let chatServiceInstance: PortfolioChatStreamService | null = null;

export const getChatService = (baseUrl: string, getToken: () => string): PortfolioChatStreamService => {
  if (!chatServiceInstance) {
    chatServiceInstance = new PortfolioChatStreamService(baseUrl, getToken);
  }
  return chatServiceInstance;
};
```

#### Hook React pour le Streaming Chat

```typescript
// hooks/usePortfolioChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioChatStreamService } from '../services/portfolioChatStreamService';
import type { StreamingChunk, SendMessageDto } from '../types/chat.types';

interface UseChatOptions {
  baseUrl: string;
  getToken: () => string;
  conversationId?: string;
}

interface UseChatReturn {
  /** Contenu accumulé pendant le streaming */
  streamingContent: string;
  /** Indique si un streaming est en cours */
  isStreaming: boolean;
  /** Indique si une erreur s'est produite */
  error: string | null;
  /** Dernier chunk reçu (pour métadonnées) */
  lastChunk: StreamingChunk | null;
  /** Actions suggérées (disponibles après 'end') */
  suggestedActions: Array<{ type: string; payload: unknown }>;
  /** Connecter le WebSocket (ÉTAPE 1) */
  connect: () => Promise<void>;
  /** S'abonner à une conversation (ÉTAPE 2) */
  subscribe: (conversationId: string) => void;
  /** Envoyer un message (ÉTAPE 3) */
  sendMessage: (dto: SendMessageDto) => Promise<void>;
  /** Réinitialiser l'état */
  reset: () => void;
  /** Déconnecter */
  disconnect: () => void;
}

export const usePortfolioChat = ({ baseUrl, getToken, conversationId }: UseChatOptions): UseChatReturn => {
  const serviceRef = useRef<PortfolioChatStreamService | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChunk, setLastChunk] = useState<StreamingChunk | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<Array<{ type: string; payload: unknown }>>([]);

  // Initialiser le service
  useEffect(() => {
    serviceRef.current = new PortfolioChatStreamService(baseUrl, getToken);
    
    return () => {
      serviceRef.current?.disconnect();
    };
  }, [baseUrl, getToken]);

  // Gérer les chunks reçus
  const handleChunk = useCallback((chunk: StreamingChunk) => {
    setLastChunk(chunk);

    switch (chunk.type) {
      case 'chunk':
        setStreamingContent((prev) => prev + chunk.content);
        setIsStreaming(true);
        break;

      case 'end':
        setStreamingContent(chunk.content); // Contenu complet
        setIsStreaming(false);
        if (chunk.suggestedActions) {
          setSuggestedActions(chunk.suggestedActions);
        }
        break;

      case 'error':
        setError(chunk.content);
        setIsStreaming(false);
        break;

      case 'tool_call':
        console.log('🔧 Tool call:', chunk.content);
        break;

      case 'tool_result':
        setStreamingContent((prev) => prev + chunk.content);
        break;
    }
  }, []);

  // Écouter les chunks
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    const unsubscribe = service.onChunk(handleChunk);
    return unsubscribe;
  }, [handleChunk]);

  const connect = useCallback(async () => {
    await serviceRef.current?.connect();
  }, []);

  const subscribe = useCallback((convId: string) => {
    serviceRef.current?.subscribeToConversation(convId);
  }, []);

  const sendMessage = useCallback(async (dto: SendMessageDto) => {
    setError(null);
    setStreamingContent('');
    setSuggestedActions([]);
    setIsStreaming(true);

    try {
      const response = await serviceRef.current?.sendStreamingMessage(dto);
      
      // Si nouvelle conversation créée, s'abonner
      if (response?.data.conversationId && !conversationId) {
        subscribe(response.data.conversationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
      setIsStreaming(false);
    }
  }, [conversationId, subscribe]);

  const reset = useCallback(() => {
    setStreamingContent('');
    setIsStreaming(false);
    setError(null);
    setLastChunk(null);
    setSuggestedActions([]);
  }, []);

  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
  }, []);

  return {
    streamingContent,
    isStreaming,
    error,
    lastChunk,
    suggestedActions,
    connect,
    subscribe,
    sendMessage,
    reset,
    disconnect,
  };
};
```

#### Composant React - Chat avec Streaming

```tsx
// components/PortfolioChat.tsx
import React, { useState, useEffect } from 'react';
import { usePortfolioChat } from '../hooks/usePortfolioChat';

interface PortfolioChatProps {
  conversationId?: string;
  portfolioId?: string;
  portfolioType?: 'traditional' | 'investment' | 'leasing';
}

export const PortfolioChat: React.FC<PortfolioChatProps> = ({
  conversationId: initialConversationId,
  portfolioId,
  portfolioType,
}) => {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [isConnected, setIsConnected] = useState(false);

  const {
    streamingContent,
    isStreaming,
    error,
    suggestedActions,
    connect,
    subscribe,
    sendMessage,
    reset,
  } = usePortfolioChat({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    getToken: () => localStorage.getItem('token') || '',
    conversationId,
  });

  // ⚠️ WORKFLOW CORRECT : Connexion au montage
  useEffect(() => {
    const initConnection = async () => {
      try {
        // ÉTAPE 1 : Connecter le WebSocket
        await connect();
        setIsConnected(true);
        
        // ÉTAPE 2 : S'abonner si conversation existante
        if (conversationId) {
          subscribe(conversationId);
        }
      } catch (err) {
        console.error('Failed to connect:', err);
      }
    };

    initConnection();
  }, [connect, subscribe, conversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    const message = input;
    setInput('');
    reset();

    // ÉTAPE 3 : Envoyer le message (WebSocket déjà connecté)
    await sendMessage({
      content: message,
      contextId: conversationId,
      metadata: {
        portfolioId,
        portfolioType,
      },
    });
  };

  const handleSuggestedAction = (action: { type: string; payload: unknown }) => {
    console.log('Action clicked:', action);
    // Implémenter la logique selon le type d'action
  };

  return (
    <div className="portfolio-chat">
      {/* Indicateur de connexion */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
      </div>

      {/* Zone de réponse */}
      <div className="chat-response">
        {isStreaming && (
          <div className="typing-indicator">
            <span>ADHA analyse...</span>
            <div className="dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        
        {streamingContent && (
          <div className="assistant-message">
            {streamingContent}
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
            <button onClick={reset}>Réessayer</button>
          </div>
        )}

        {/* Actions suggérées */}
        {suggestedActions.length > 0 && (
          <div className="suggested-actions">
            {suggestedActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedAction(action)}
                className="action-button"
              >
                {String(action.type)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question sur votre portefeuille..."
          disabled={!isConnected || isStreaming}
        />
        <button type="submit" disabled={!isConnected || isStreaming || !input.trim()}>
          {isStreaming ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
};
```

### Bonnes Pratiques

1. **Affichage progressif**: Utiliser le hook `usePortfolioChat` pour afficher le texte chunk par chunk
2. **Actions suggérées**: Afficher les `suggestedActions` comme boutons d'action rapide après `end`
3. **Indicateur visuel**: Montrer un indicateur "typing" ou animation pendant le streaming
4. **Gestion des erreurs**: Toujours gérer le type `error` et proposer un retry
5. **Timeout**: Implémenter un timeout de 120s (configurable)
6. **Reconnexion**: Gérer la reconnexion automatique en cas de perte de connexion WebSocket
7. **Cleanup**: Désabonner des conversations non actives pour économiser les ressources

### Configuration Avancée

#### Timeout et Retry côté Backend

```typescript
// Dans PortfolioAdhaAiService (adha-ai.service.ts)
// Timeout configuré à 120s pour les réponses sync
setTimeout(() => {
  // Fallback response si pas de réponse après 120s
}, 120000);
```

#### CORS configuré pour le Gateway WebSocket

```typescript
// Dans PortfolioChatGateway (chat.gateway.ts)
@WebSocketGateway({
  namespace: '/',
  path: '/socket.io',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8000',
      'https://wanzo.io',
      'https://*.wanzo.io',
    ],
    credentials: true,
  },
})
```
