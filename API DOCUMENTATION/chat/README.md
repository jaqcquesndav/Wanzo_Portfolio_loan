# Chat API

> **Synchronisée avec le code source TypeScript** - Janvier 2026

Ce document décrit les endpoints pour la gestion des conversations et messages dans l'API Wanzo Portfolio Institution.

## Types de données

Les types principaux utilisés dans l'API de chat:

```typescript
interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  likes?: number;
  dislikes?: number;
  attachment?: {
    name: string;
    type: string;
    content: string;
  };
  error?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  isActive: boolean;
  model: AIModel;
  context: string[];
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  contextLength: number;
}
```

## Endpoints

### Envoyer un message

Envoie un message au système de chat.

#### Requête

```
POST /portfolio/api/v1/chat/messages
```

#### Corps de la requête

```json
{
  "content": "Bonjour, pouvez-vous me donner des informations sur le portefeuille PME?",
  "contextId": "ctx123",
  "metadata": {
    "portfolioId": "port456",
    "portfolioType": "traditional",
    "companyId": "comp789",
    "entityType": "portfolio",
    "entityId": "port456"
  }
}
```

#### Réponse

```json
{
  "id": "msg001",
  "content": "Bonjour, pouvez-vous me donner des informations sur le portefeuille PME?",
  "timestamp": "2025-07-25T12:00:00.000Z",
  "sender": "user",
  "contextId": "ctx123",
  "metadata": {
    "portfolioId": "port456",
    "portfolioType": "traditional"
  },
  "response": {
    "id": "msg002",
    "content": "Bonjour! Je serais ravi de vous aider. Le portefeuille PME contient actuellement 15 entreprises avec un encours total de 2.5M€. Souhaitez-vous des informations plus détaillées?",
    "timestamp": "2025-07-25T12:00:02.000Z",
    "sender": "assistant",
    "attachments": []
  }
}
```

### Récupérer l'historique des messages

Récupère l'historique des messages pour un contexte spécifique.

#### Requête

```
GET /portfolio/api/v1/chat/contexts/{contextId}/messages
```

#### Paramètres de chemin
- `contextId` : Identifiant unique du contexte de chat

#### Paramètres de requête
- `limit` (optionnel) : Nombre maximum de messages à récupérer
- `before` (optionnel) : Récupérer les messages avant cette date/ID
- `after` (optionnel) : Récupérer les messages après cette date/ID

#### Réponse

```json
{
  "messages": [
    {
      "id": "msg001",
      "content": "Bonjour, pouvez-vous me donner des informations sur le portefeuille PME?",
      "timestamp": "2025-07-25T12:00:00.000Z",
      "sender": "user",
      "contextId": "ctx123",
      "metadata": {
        "portfolioId": "port456",
        "portfolioType": "traditional"
      }
    },
    {
      "id": "msg002",
      "content": "Bonjour! Je serais ravi de vous aider. Le portefeuille PME contient actuellement 15 entreprises avec un encours total de 2.5M€. Souhaitez-vous des informations plus détaillées?",
      "timestamp": "2025-07-25T12:00:02.000Z",
      "sender": "assistant",
      "contextId": "ctx123"
    },
    {
      "id": "msg003",
      "content": "Oui, pouvez-vous me donner la répartition par secteur d'activité?",
      "timestamp": "2025-07-25T12:01:30.000Z",
      "sender": "user",
      "contextId": "ctx123"
    }
  ],
  "hasMore": true,
  "nextCursor": "msg004"
}
```

### Créer un nouveau contexte de chat

Crée un nouveau contexte de conversation.

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

## Implémentation technique

Les endpoints ci-dessus sont implémentés dans le module `chat.api.ts` qui fournit les fonctions suivantes:

- `sendMessage(message)`: Envoie un message au système de chat
- `getMessageHistory(contextId, params)`: Récupère l'historique des messages pour un contexte
- `createContext(data)`: Crée un nouveau contexte de chat
- `getContextById(id)`: Récupère un contexte de chat par son ID
- `getAllContexts(params)`: Récupère tous les contextes de chat
- `updateContext(id, updates)`: Met à jour un contexte de chat
- `deleteContext(id)`: Supprime un contexte de chat
- `getChatSuggestions(contextId, data)`: Récupère des suggestions de chat
- `generateChatReport(params)`: Génère un rapport basé sur les conversations
- `getPredefinedResponses(category)`: Récupère des réponses prédéfinies
- `rateMessage(messageId, rating)`: Évalue un message
- `addAttachment(messageId, file)`: Ajoute une pièce jointe à un message

Les modèles d'IA disponibles sont définis dans le module `chat.ts` et incluent:

1. Adha Crédit - Spécialisé en gestion de crédits et analyse de risques
2. Adha Prospection - Analyse des opportunités de marché et ciblage client
3. Adha Leasing - Expert en contrats de leasing et gestion d'équipements
4. Adha Invest - Spécialisé en capital-investissement et valorisation
5. Adha Analytics - Analyse approfondie des données financières et prévisions

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

## Streaming des Réponses IA (Nouveau - Janvier 2026)

### Vue d'ensemble

Le système de streaming permet au frontend de recevoir les réponses de l'IA ADHA en temps réel, chunk par chunk. Cela est particulièrement utile pour les analyses de portefeuille complexes qui peuvent prendre plusieurs secondes.

### Architecture Streaming

```
Frontend (WebSocket/SSE) ← Backend ← Kafka (portfolio.chat.stream) ← ADHA AI Service
```

**Topic Kafka utilisé**: `portfolio.chat.stream`

### Structure des Événements de Streaming

#### PortfolioStreamChunkEvent (Interface TypeScript)

```typescript
interface PortfolioStreamChunkEvent {
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
  suggestedActions?: string[];   // Actions recommandées basées sur l'analyse
  processingDetails?: {
    totalChunks: number;
    contentLength: number;
    aiModel: string;
    source: string;              // 'portfolio_institution'
  };
  
  metadata?: {
    source: string;              // 'adha_ai_service'
    streamVersion: string;       // '1.0.0'
    streamComplete?: boolean;    // true pour 'end'
    error?: boolean;             // true pour 'error'
    institutionId?: string;      // ID de l'institution
    portfolioId?: string;        // ID du portefeuille analysé
    portfolioType?: string;      // 'traditional', 'investment', 'leasing'
  };
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

### Événements Locaux (EventEmitter2)

Le backend émet des événements locaux via WebSocket :

| Événement | Description | Payload |
|-----------|-------------|---------|
| `portfolio.stream.chunk` | Nouveau chunk reçu | `{ requestMessageId, conversationId, institutionId, content, chunkId, accumulatedContent }` |
| `portfolio.stream.end` | Stream terminé | `{ requestMessageId, conversationId, institutionId, content, totalChunks, processingTime, suggestedActions }` |
| `portfolio.stream.error` | Erreur de streaming | `{ requestMessageId, conversationId, institutionId, error }` |
| `portfolio.stream.tool` | Appel/résultat d'outil | `{ requestMessageId, conversationId, institutionId, type, content }` |

### Intégration Frontend (Flutter/Dart)

#### Connexion WebSocket

```dart
class PortfolioStreamService {
  WebSocket? _socket;
  final StreamController<PortfolioStreamChunk> _chunkController = 
      StreamController<PortfolioStreamChunk>.broadcast();
  
  Stream<PortfolioStreamChunk> get chunkStream => _chunkController.stream;
  
  Future<void> connect(String institutionId) async {
    _socket = await WebSocket.connect(
      'wss://api.wanzo.com/ws/portfolio-chat/$institutionId'
    );
    
    _socket!.listen((data) {
      final chunk = PortfolioStreamChunk.fromJson(jsonDecode(data));
      _chunkController.add(chunk);
    });
  }
  
  void sendMessage(String contextId, String content, Map<String, dynamic> metadata) {
    _socket?.add(jsonEncode({
      'action': 'sendMessage',
      'contextId': contextId,
      'content': content,
      'metadata': metadata,
      'streaming': true,
    }));
  }
}
```

#### Modèle de Chunk (Dart)

```dart
class PortfolioStreamChunk {
  final String id;
  final String requestMessageId;
  final String conversationId;
  final String type; // 'chunk', 'end', 'error'
  final String content;
  final int chunkId;
  final String timestamp;
  final String userId;
  final String institutionId;
  final int? totalChunks;
  final List<String>? suggestedActions;
  final Map<String, dynamic>? processingDetails;
  final Map<String, dynamic>? metadata;
  
  PortfolioStreamChunk({
    required this.id,
    required this.requestMessageId,
    required this.conversationId,
    required this.type,
    required this.content,
    required this.chunkId,
    required this.timestamp,
    required this.userId,
    required this.institutionId,
    this.totalChunks,
    this.suggestedActions,
    this.processingDetails,
    this.metadata,
  });
  
  factory PortfolioStreamChunk.fromJson(Map<String, dynamic> json) {
    return PortfolioStreamChunk(
      id: json['id'],
      requestMessageId: json['requestMessageId'],
      conversationId: json['conversationId'],
      type: json['type'],
      content: json['content'],
      chunkId: json['chunkId'],
      timestamp: json['timestamp'],
      userId: json['userId'],
      institutionId: json['companyId'] ?? json['metadata']?['institutionId'],
      totalChunks: json['totalChunks'],
      suggestedActions: (json['suggestedActions'] as List?)?.cast<String>(),
      processingDetails: json['processingDetails'],
      metadata: json['metadata'],
    );
  }
}
```

#### Utilisation dans un BLoC

```dart
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final PortfolioStreamService _streamService;
  StreamSubscription? _chunkSubscription;
  StringBuffer _accumulatedContent = StringBuffer();
  
  ChatBloc(this._streamService) : super(ChatInitial()) {
    on<SendMessage>(_onSendMessage);
    
    _chunkSubscription = _streamService.chunkStream.listen(_handleChunk);
  }
  
  void _handleChunk(PortfolioStreamChunk chunk) {
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
          suggestedActions: chunk.suggestedActions ?? [],
          processingDetails: chunk.processingDetails,
        ));
        _accumulatedContent.clear();
        break;
        
      case 'error':
        emit(ChatError(message: chunk.content));
        _accumulatedContent.clear();
        break;
    }
  }
}
```

### Configuration du Streaming

Pour activer le streaming dans les requêtes API, ajoutez `streaming: true` :

```json
{
  "content": "Analysez la performance du portefeuille PME",
  "contextId": "ctx123",
  "metadata": {
    "portfolioId": "port456",
    "portfolioType": "traditional",
    "institutionId": "inst-xyz"
  },
  "streaming": true
}
```

### Bonnes Pratiques Frontend

1. **Affichage progressif**: Utiliser un `StreamBuilder` pour afficher le texte au fur et à mesure
2. **Actions suggérées**: Afficher les `suggestedActions` comme boutons d'action rapide
3. **Indicateur visuel**: Montrer un indicateur de "typing" pendant le streaming
4. **Gestion des erreurs**: Toujours gérer le type `error` pour informer l'utilisateur
5. **Timeout**: Implémenter un timeout de 45s pour les analyses complexes
6. **Retry**: Proposer un bouton "Réessayer" en cas d'erreur
