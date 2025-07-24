# Chat

Ce document décrit les endpoints pour la gestion des conversations et messages dans l'API Wanzo Portfolio Institution.

## Liste des conversations

Récupère la liste des conversations avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/messages`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de conversations par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (active, archived)
- `search` (optionnel) : Recherche textuelle (sujet, participants)
- `participantId` (optionnel) : Filtre par participant
- `sortBy` (optionnel) : Trier par (updatedAt, createdAt)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "conv123",
      "subject": "Demande d'information sur le portefeuille PME",
      "status": "active",
      "unreadCount": 2,
      "lastMessage": {
        "content": "Pouvez-vous me fournir les derniers rapports ?",
        "sentAt": "2025-07-23T14:30:00.000Z",
        "sender": {
          "id": "user456",
          "name": "Marie Martin"
        }
      },
      "participants": [
        {
          "id": "user123",
          "name": "Jean Dupont",
          "role": "portfolio_manager"
        },
        {
          "id": "user456",
          "name": "Marie Martin",
          "role": "client_rep"
        }
      ],
      "createdAt": "2025-07-20T10:00:00.000Z",
      "updatedAt": "2025-07-23T14:30:00.000Z"
    },
    {
      "id": "conv124",
      "subject": "Questions sur le contrat de crédit CTR-2025-002",
      "status": "active",
      "unreadCount": 0,
      "lastMessage": {
        "content": "Merci pour ces précisions.",
        "sentAt": "2025-07-22T09:15:00.000Z",
        "sender": {
          "id": "user789",
          "name": "Pierre Durand"
        }
      },
      "participants": [
        {
          "id": "user123",
          "name": "Jean Dupont",
          "role": "portfolio_manager"
        },
        {
          "id": "user789",
          "name": "Pierre Durand",
          "role": "credit_analyst"
        }
      ],
      "createdAt": "2025-07-21T16:00:00.000Z",
      "updatedAt": "2025-07-22T09:15:00.000Z"
    }
    // ... autres conversations
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

## Détails d'une conversation

Récupère les détails d'une conversation spécifique avec ses messages.

**Endpoint** : `GET /portfolio_inst/messages/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de la conversation

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page pour les messages (défaut : 1)
- `limit` (optionnel) : Nombre de messages par page (défaut : 50, max : 100)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "conv123",
    "subject": "Demande d'information sur le portefeuille PME",
    "status": "active",
    "participants": [
      {
        "id": "user123",
        "name": "Jean Dupont",
        "email": "jean.dupont@exemple.com",
        "role": "portfolio_manager",
        "avatar": "https://example.com/avatars/jean.jpg"
      },
      {
        "id": "user456",
        "name": "Marie Martin",
        "email": "marie.martin@banquecommerciale.com",
        "role": "client_rep",
        "avatar": "https://example.com/avatars/marie.jpg"
      }
    ],
    "relatedEntities": [
      {
        "type": "portfolio",
        "id": "portfolio123",
        "name": "Portefeuille PME 2025"
      }
    ],
    "messages": [
      {
        "id": "msg789",
        "content": "Bonjour Jean, pouvez-vous me fournir des informations sur le portefeuille PME 2025 ? Merci.",
        "attachments": [],
        "sentAt": "2025-07-20T10:00:00.000Z",
        "readAt": "2025-07-20T10:15:00.000Z",
        "sender": {
          "id": "user456",
          "name": "Marie Martin"
        }
      },
      {
        "id": "msg790",
        "content": "Bonjour Marie, bien sûr. Quelles informations spécifiques recherchez-vous ?",
        "attachments": [],
        "sentAt": "2025-07-20T10:30:00.000Z",
        "readAt": "2025-07-20T11:00:00.000Z",
        "sender": {
          "id": "user123",
          "name": "Jean Dupont"
        }
      },
      {
        "id": "msg791",
        "content": "J'aimerais avoir les derniers rapports sur la performance du portefeuille, ainsi que des détails sur les nouveaux crédits accordés ce trimestre.",
        "attachments": [],
        "sentAt": "2025-07-23T14:00:00.000Z",
        "readAt": "2025-07-23T14:15:00.000Z",
        "sender": {
          "id": "user456",
          "name": "Marie Martin"
        }
      },
      {
        "id": "msg792",
        "content": "Pouvez-vous me fournir les derniers rapports ?",
        "attachments": [],
        "sentAt": "2025-07-23T14:30:00.000Z",
        "readAt": null,
        "sender": {
          "id": "user456",
          "name": "Marie Martin"
        }
      }
    ],
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-23T14:30:00.000Z"
  }
}
```

## Création d'une conversation

Crée une nouvelle conversation.

**Endpoint** : `POST /portfolio_inst/messages`

**Corps de la requête** :

```json
{
  "subject": "Discussion sur le nouveau contrat de leasing",
  "initialMessage": "Bonjour, j'aimerais discuter des détails du nouveau contrat de leasing pour l'entreprise XYZ.",
  "participants": ["user789", "user456"],
  "relatedEntities": [
    {
      "type": "contract",
      "id": "lease123"
    },
    {
      "type": "portfolio",
      "id": "portfolio456"
    }
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "conv125",
    "subject": "Discussion sur le nouveau contrat de leasing",
    "status": "active",
    "participants": [
      {
        "id": "user123",
        "name": "Jean Dupont",
        "role": "portfolio_manager"
      },
      {
        "id": "user789",
        "name": "Pierre Durand",
        "role": "credit_analyst"
      },
      {
        "id": "user456",
        "name": "Marie Martin",
        "role": "client_rep"
      }
    ],
    "relatedEntities": [
      {
        "type": "contract",
        "id": "lease123",
        "name": "Contrat de leasing - Entreprise XYZ"
      },
      {
        "type": "portfolio",
        "id": "portfolio456",
        "name": "Portefeuille Leasing 2025"
      }
    ],
    "messages": [
      {
        "id": "msg793",
        "content": "Bonjour, j'aimerais discuter des détails du nouveau contrat de leasing pour l'entreprise XYZ.",
        "attachments": [],
        "sentAt": "2025-07-24T15:00:00.000Z",
        "readAt": null,
        "sender": {
          "id": "user123",
          "name": "Jean Dupont"
        }
      }
    ],
    "createdAt": "2025-07-24T15:00:00.000Z",
    "updatedAt": "2025-07-24T15:00:00.000Z"
  }
}
```

## Envoi d'un message

Ajoute un nouveau message à une conversation existante.

**Endpoint** : `POST /portfolio_inst/messages/{id}/reply`

**Paramètres de chemin** :
- `id` : Identifiant unique de la conversation

**Corps de la requête** :

```json
{
  "content": "Voici les rapports demandés. N'hésitez pas si vous avez des questions.",
  "attachments": [
    {
      "name": "Rapport_Performance_Q2_2025.pdf",
      "url": "https://example.com/documents/rapport_q2_2025.pdf",
      "type": "application/pdf",
      "size": 2048000
    }
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "msg794",
    "content": "Voici les rapports demandés. N'hésitez pas si vous avez des questions.",
    "attachments": [
      {
        "id": "att123",
        "name": "Rapport_Performance_Q2_2025.pdf",
        "url": "https://example.com/documents/rapport_q2_2025.pdf",
        "type": "application/pdf",
        "size": 2048000,
        "uploadedAt": "2025-07-24T15:30:00.000Z"
      }
    ],
    "sentAt": "2025-07-24T15:30:00.000Z",
    "readAt": null,
    "sender": {
      "id": "user123",
      "name": "Jean Dupont"
    },
    "conversation": {
      "id": "conv123",
      "subject": "Demande d'information sur le portefeuille PME"
    }
  }
}
```

## Marquer un message comme lu

Marque un message ou tous les messages d'une conversation comme lus.

**Endpoint** : `PATCH /portfolio_inst/messages/{id}/read`

**Paramètres de chemin** :
- `id` : Identifiant unique de la conversation

**Corps de la requête** :

```json
{
  "messageId": "msg792",
  "markAllAsRead": false
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "msg792",
    "readAt": "2025-07-24T16:00:00.000Z",
    "conversation": {
      "id": "conv123",
      "unreadCount": 1
    }
  }
}
```

## Archiver une conversation

Archive une conversation.

**Endpoint** : `PATCH /portfolio_inst/messages/{id}/archive`

**Paramètres de chemin** :
- `id` : Identifiant unique de la conversation

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "conv123",
    "status": "archived",
    "archivedAt": "2025-07-24T16:30:00.000Z",
    "archivedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    }
  }
}
```

## Réactiver une conversation

Réactive une conversation archivée.

**Endpoint** : `PATCH /portfolio_inst/messages/{id}/activate`

**Paramètres de chemin** :
- `id` : Identifiant unique de la conversation

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "conv123",
    "status": "active",
    "activatedAt": "2025-07-24T17:00:00.000Z",
    "activatedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    }
  }
}
```

## Ajouter des participants à une conversation

Ajoute de nouveaux participants à une conversation existante.

**Endpoint** : `POST /portfolio_inst/messages/{id}/participants`

**Paramètres de chemin** :
- `id` : Identifiant unique de la conversation

**Corps de la requête** :

```json
{
  "participants": ["user789", "user101"]
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "conv123",
    "participants": [
      {
        "id": "user123",
        "name": "Jean Dupont",
        "role": "portfolio_manager"
      },
      {
        "id": "user456",
        "name": "Marie Martin",
        "role": "client_rep"
      },
      {
        "id": "user789",
        "name": "Pierre Durand",
        "role": "credit_analyst"
      },
      {
        "id": "user101",
        "name": "Sophie Legrand",
        "role": "risk_manager"
      }
    ],
    "updatedAt": "2025-07-24T17:30:00.000Z"
  }
}
```

## Retirer des participants d'une conversation

Retire des participants d'une conversation existante.

**Endpoint** : `DELETE /portfolio_inst/messages/{id}/participants`

**Paramètres de chemin** :
- `id` : Identifiant unique de la conversation

**Corps de la requête** :

```json
{
  "participants": ["user101"]
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "conv123",
    "participants": [
      {
        "id": "user123",
        "name": "Jean Dupont",
        "role": "portfolio_manager"
      },
      {
        "id": "user456",
        "name": "Marie Martin",
        "role": "client_rep"
      },
      {
        "id": "user789",
        "name": "Pierre Durand",
        "role": "credit_analyst"
      }
    ],
    "updatedAt": "2025-07-24T18:00:00.000Z"
  }
}
```

## Téléchargement d'une pièce jointe

Génère une URL signée pour télécharger une pièce jointe.

**Endpoint** : `GET /portfolio_inst/messages/attachments/{id}/download`

**Paramètres de chemin** :
- `id` : Identifiant unique de la pièce jointe

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://example.com/signed-url/attachment.pdf?token=abc123",
    "expiresAt": "2025-07-24T19:00:00.000Z"
  }
}
```

## Erreurs spécifiques

| Code HTTP | Code d'erreur                | Description                                         |
|-----------|-----------------------------|-----------------------------------------------------|
| 400       | INVALID_MESSAGE_DATA        | Données de message invalides                         |
| 404       | CONVERSATION_NOT_FOUND      | Conversation non trouvée                             |
| 404       | MESSAGE_NOT_FOUND           | Message non trouvé                                   |
| 404       | ATTACHMENT_NOT_FOUND        | Pièce jointe non trouvée                            |
| 403       | NOT_CONVERSATION_PARTICIPANT| L'utilisateur n'est pas participant à la conversation|
| 400       | EMPTY_MESSAGE               | Le message ne peut pas être vide                     |
| 400       | ATTACHMENT_TOO_LARGE        | Pièce jointe trop volumineuse                        |
| 403       | INSUFFICIENT_PERMISSIONS    | Permissions insuffisantes                            |
