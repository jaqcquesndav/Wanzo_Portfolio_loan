# Chat API - Portfolio Institution Service

> **Synchronisée avec le code source TypeScript** - Janvier 2026  
> **Version**: 2.0 (Streaming WebSocket + Mode Synchrone)

Ce document décrit l'architecture complète et les endpoints pour la gestion des conversations avec l'assistant IA ADHA dans l'API Wanzo Portfolio Institution.

## Architecture Globale

```
┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────┐
│    Frontend     │      │   Portfolio Service     │      │  ADHA AI Svc    │
│   (Flutter)     │      │   (NestJS)              │      │                 │
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
1. POST /chat/stream → Reçoit messageId
2. WebSocket.connect('wss://api.wanzo.com/socket.io')
3. WebSocket.emit('subscribe_conversation', { conversationId })
4. WebSocket.on('adha.stream.chunk') → Afficher chunk progressif
5. WebSocket.on('adha.stream.end') → Finaliser affichage
```

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

### Architecture Streaming Complète

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           STREAMING FLOW                                  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Frontend (Flutter)           Portfolio Service            ADHA AI        │
│  ══════════════════           ═════════════════            ════════       │
│                                                                           │
│  1. POST /chat/stream ─────────► ChatController                           │
│                                       │                                   │
│  2. ◄─── { messageId, wsInfo }        │                                   │
│                                       ▼                                   │
│                              PortfolioAdhaAiService                       │
│                                       │                                   │
│                                       │   portfolio.chat.message          │
│                                       └──────────────────────────► Kafka  │
│                                                                     │     │
│  3. WebSocket.connect()                                             │     │
│     ────────────────────► PortfolioChatGateway                      │     │
│                                                                     │     │
│  4. emit('subscribe_conversation')                                  │     │
│     ────────────────────► join(room)                                │     │
│                                                                     ▼     │
│                                                              ADHA AI Svc  │
│                                                                     │     │
│  5.                                     portfolio.chat.stream       │     │
│                           ◄──────────────────────────────────── Kafka     │
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

### Intégration Frontend (Flutter/Dart) avec Socket.IO

#### Installation des dépendances

```yaml
# pubspec.yaml
dependencies:
  socket_io_client: ^2.0.0
  http: ^1.1.0
```

#### Service de Streaming Complet

```dart
import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;
import 'dart:convert';

class PortfolioChatStreamService {
  IO.Socket? _socket;
  final String baseUrl;
  final String Function() getToken; // Getter pour le JWT
  
  final StreamController<StreamingChunk> _chunkController = 
      StreamController<StreamingChunk>.broadcast();
  
  Stream<StreamingChunk> get chunkStream => _chunkController.stream;
  
  PortfolioChatStreamService({
    required this.baseUrl,
    required this.getToken,
  });
  
  /// Connexion WebSocket avec authentification JWT
  Future<void> connect() async {
    _socket = IO.io(
      baseUrl, // ex: 'https://api.wanzo.com'
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .setPath('/socket.io')
        .setExtraHeaders({'Authorization': 'Bearer ${getToken()}'})
        .setQuery({'token': getToken()})
        .enableAutoConnect()
        .build(),
    );
    
    _socket!.onConnect((_) {
      print('✅ WebSocket connected');
    });
    
    _socket!.onDisconnect((_) {
      print('❌ WebSocket disconnected');
    });
    
    // Écouter les événements de streaming
    _socket!.on('adha.stream.chunk', (data) {
      _chunkController.add(StreamingChunk.fromJson(data));
    });
    
    _socket!.on('adha.stream.end', (data) {
      _chunkController.add(StreamingChunk.fromJson(data));
    });
    
    _socket!.on('adha.stream.error', (data) {
      _chunkController.add(StreamingChunk.fromJson(data));
    });
    
    _socket!.on('adha.stream.tool', (data) {
      _chunkController.add(StreamingChunk.fromJson(data));
    });
  }
  
  /// S'abonner aux updates d'une conversation
  void subscribeToConversation(String conversationId) {
    _socket?.emit('subscribe_conversation', {'conversationId': conversationId});
  }
  
  /// Se désabonner d'une conversation
  void unsubscribeFromConversation(String conversationId) {
    _socket?.emit('unsubscribe_conversation', {'conversationId': conversationId});
  }
  
  /// Envoyer un message en mode streaming
  Future<StreamingResponse> sendStreamingMessage({
    required String content,
    String? contextId,
    Map<String, dynamic>? metadata,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/portfolio/api/v1/chat/stream'),
      headers: {
        'Authorization': 'Bearer ${getToken()}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'content': content,
        'contextId': contextId,
        'metadata': metadata,
      }),
    );
    
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      final streamResponse = StreamingResponse.fromJson(data);
      
      // Auto-subscribe à la conversation
      subscribeToConversation(streamResponse.conversationId);
      
      return streamResponse;
    } else {
      throw Exception('Failed to send message: ${response.body}');
    }
  }
  
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
  }
  
  void dispose() {
    disconnect();
    _chunkController.close();
  }
}

/// Réponse de l'endpoint /chat/stream
class StreamingResponse {
  final String messageId;
  final String conversationId;
  final String userMessageId;
  
  StreamingResponse({
    required this.messageId,
    required this.conversationId,
    required this.userMessageId,
  });
  
  factory StreamingResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    return StreamingResponse(
      messageId: data['messageId'],
      conversationId: data['conversationId'],
      userMessageId: data['userMessageId'],
    );
  }
}

/// Chunk de streaming reçu via WebSocket
class StreamingChunk {
  final String requestMessageId;
  final String conversationId;
  final String type; // 'chunk', 'end', 'error', 'tool_call', 'tool_result'
  final String content;
  final int chunkId;
  final int? totalChunks;
  final List<Map<String, dynamic>>? suggestedActions;
  final Map<String, dynamic>? processingDetails;
  final Map<String, dynamic>? metadata;
  
  StreamingChunk({
    required this.requestMessageId,
    required this.conversationId,
    required this.type,
    required this.content,
    required this.chunkId,
    this.totalChunks,
    this.suggestedActions,
    this.processingDetails,
    this.metadata,
  });
  
  factory StreamingChunk.fromJson(Map<String, dynamic> json) {
    return StreamingChunk(
      requestMessageId: json['requestMessageId'],
      conversationId: json['conversationId'],
      type: json['type'],
      content: json['content'] ?? '',
      chunkId: json['chunkId'] ?? 0,
      totalChunks: json['totalChunks'],
      suggestedActions: json['suggestedActions'] != null
          ? List<Map<String, dynamic>>.from(json['suggestedActions'])
          : null,
      processingDetails: json['processingDetails'],
      metadata: json['metadata'],
    );
  }
  
  bool get isChunk => type == 'chunk';
  bool get isEnd => type == 'end';
  bool get isError => type == 'error';
  bool get isToolCall => type == 'tool_call';
  bool get isToolResult => type == 'tool_result';
}
```

#### Utilisation dans un BLoC (Flutter Bloc Pattern)

```dart
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final PortfolioChatStreamService _streamService;
  StreamSubscription? _chunkSubscription;
  final StringBuffer _accumulatedContent = StringBuffer();
  
  ChatBloc(this._streamService) : super(ChatInitial()) {
    on<InitializeChat>(_onInitializeChat);
    on<SendMessage>(_onSendMessage);
    on<ProcessChunk>(_onProcessChunk);
  }
  
  Future<void> _onInitializeChat(InitializeChat event, Emitter<ChatState> emit) async {
    await _streamService.connect();
    
    _chunkSubscription = _streamService.chunkStream.listen((chunk) {
      add(ProcessChunk(chunk));
    });
  }
  
  Future<void> _onSendMessage(SendMessage event, Emitter<ChatState> emit) async {
    emit(ChatSending());
    _accumulatedContent.clear();
    
    try {
      final response = await _streamService.sendStreamingMessage(
        content: event.content,
        contextId: event.contextId,
        metadata: event.metadata,
      );
      
      emit(ChatWaitingForStream(
        messageId: response.messageId,
        conversationId: response.conversationId,
      ));
    } catch (e) {
      emit(ChatError(message: e.toString()));
    }
  }
  
  void _onProcessChunk(ProcessChunk event, Emitter<ChatState> emit) {
    final chunk = event.chunk;
    
    switch (chunk.type) {
      case 'chunk':
        _accumulatedContent.write(chunk.content);
        emit(ChatStreaming(
          content: _accumulatedContent.toString(),
          chunkId: chunk.chunkId,
        ));
        break;
        
      case 'end':
        emit(ChatMessageReceived(
          content: chunk.content,
          totalChunks: chunk.totalChunks ?? 0,
          suggestedActions: chunk.suggestedActions ?? [],
          processingDetails: chunk.processingDetails,
        ));
        _accumulatedContent.clear();
        break;
        
      case 'error':
        emit(ChatError(message: chunk.content));
        _accumulatedContent.clear();
        break;
        
      case 'tool_call':
        emit(ChatToolProcessing(toolName: chunk.content));
        break;
        
      case 'tool_result':
        _accumulatedContent.write(chunk.content);
        emit(ChatStreaming(
          content: _accumulatedContent.toString(),
          chunkId: chunk.chunkId,
        ));
        break;
    }
  }
  
  @override
  Future<void> close() {
    _chunkSubscription?.cancel();
    _streamService.dispose();
    return super.close();
  }
}
```

### Bonnes Pratiques

1. **Affichage progressif**: Utiliser un `StreamBuilder` ou BLoC pour afficher le texte chunk par chunk
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
