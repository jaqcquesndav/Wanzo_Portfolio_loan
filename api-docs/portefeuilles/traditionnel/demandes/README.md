# Demandes de Financement - Portefeuille Traditionnel

Ce document décrit les endpoints pour la gestion des demandes de financement dans les portefeuilles traditionnels.

## Liste des demandes de financement

Récupère la liste des demandes de financement pour un portefeuille traditionnel spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/requests`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre de demandes par page (défaut : 10, max : 100)
- `status` (optionnel) : Filtre par statut (pending, approved, rejected, cancelled)
- `clientId` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de création (début)
- `dateTo` (optionnel) : Filtre par date de création (fin)
- `search` (optionnel) : Recherche textuelle (référence, nom du client)
- `sortBy` (optionnel) : Trier par (createdAt, amount, status)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "request123",
      "reference": "REQ-2025-001",
      "portfolioId": "portfolio123",
      "client": {
        "id": "client789",
        "name": "Entreprise ABC",
        "type": "business"
      },
      "amount": 50000.00,
      "currency": "CDF",
      "term": 12,
      "interestRate": 8.5,
      "purpose": "Fonds de roulement",
      "status": "pending",
      "submittedBy": {
        "id": "user456",
        "name": "Jean Dupont"
      },
      "createdAt": "2025-07-20T08:00:00.000Z",
      "updatedAt": "2025-07-20T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

## Détails d'une demande de financement

Récupère les détails d'une demande de financement spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/requests/{requestId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `requestId` : Identifiant unique de la demande

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "request123",
    "reference": "REQ-2025-001",
    "portfolioId": "portfolio123",
    "client": {
      "id": "client789",
      "name": "Entreprise ABC",
      "type": "business",
      "contact": {
        "name": "Michel Dupont",
        "email": "michel.dupont@abc.com",
        "phone": "+243810123456"
      }
    },
    "amount": 50000.00,
    "currency": "CDF",
    "term": 12,
    "interestRate": 8.5,
    "purpose": "Fonds de roulement",
    "description": "Financement pour l'achat de stock supplémentaire",
    "status": "pending",
    "submittedBy": {
      "id": "user456",
      "name": "Jean Dupont"
    },
    "documents": [
      {
        "id": "doc123",
        "type": "business_plan",
        "name": "Plan d'affaires",
        "url": "https://example.com/documents/doc123.pdf",
        "uploadedAt": "2025-07-20T07:45:00.000Z"
      },
      {
        "id": "doc456",
        "type": "financial_statement",
        "name": "États financiers",
        "url": "https://example.com/documents/doc456.pdf",
        "uploadedAt": "2025-07-20T07:50:00.000Z"
      }
    ],
    "timeline": [
      {
        "action": "created",
        "timestamp": "2025-07-20T08:00:00.000Z",
        "user": {
          "id": "user456",
          "name": "Jean Dupont"
        }
      }
    ],
    "createdAt": "2025-07-20T08:00:00.000Z",
    "updatedAt": "2025-07-20T08:00:00.000Z"
  }
}
```

## Création d'une demande de financement

Crée une nouvelle demande de financement pour un portefeuille traditionnel.

**Endpoint** : `POST /portfolio_inst/portfolios/traditional/{portfolioId}/requests`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Corps de la requête** :

```json
{
  "clientId": "client789",
  "amount": 50000.00,
  "currency": "CDF",
  "term": 12,
  "interestRate": 8.5,
  "purpose": "Fonds de roulement",
  "description": "Financement pour l'achat de stock supplémentaire",
  "documents": [
    {
      "type": "business_plan",
      "name": "Plan d'affaires",
      "content": "base64_encoded_content"
    },
    {
      "type": "financial_statement",
      "name": "États financiers",
      "content": "base64_encoded_content"
    }
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "request123",
    "reference": "REQ-2025-001",
    "portfolioId": "portfolio123",
    "client": {
      "id": "client789",
      "name": "Entreprise ABC",
      "type": "business"
    },
    "amount": 50000.00,
    "currency": "CDF",
    "term": 12,
    "interestRate": 8.5,
    "purpose": "Fonds de roulement",
    "description": "Financement pour l'achat de stock supplémentaire",
    "status": "pending",
    "submittedBy": {
      "id": "user456",
      "name": "Jean Dupont"
    },
    "documents": [
      {
        "id": "doc123",
        "type": "business_plan",
        "name": "Plan d'affaires",
        "url": "https://example.com/documents/doc123.pdf",
        "uploadedAt": "2025-07-24T11:00:00.000Z"
      },
      {
        "id": "doc456",
        "type": "financial_statement",
        "name": "États financiers",
        "url": "https://example.com/documents/doc456.pdf",
        "uploadedAt": "2025-07-24T11:00:00.000Z"
      }
    ],
    "createdAt": "2025-07-24T11:00:00.000Z",
    "updatedAt": "2025-07-24T11:00:00.000Z"
  }
}
```

## Mise à jour d'une demande de financement

Met à jour une demande de financement existante.

**Endpoint** : `PUT /portfolio_inst/portfolios/traditional/{portfolioId}/requests/{requestId}`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "amount": 60000.00,
  "term": 18,
  "interestRate": 9.0,
  "purpose": "Fonds de roulement et investissements",
  "description": "Financement pour l'achat de stock supplémentaire et rénovation de local"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "request123",
    "reference": "REQ-2025-001",
    "amount": 60000.00,
    "term": 18,
    "interestRate": 9.0,
    "purpose": "Fonds de roulement et investissements",
    "description": "Financement pour l'achat de stock supplémentaire et rénovation de local",
    "updatedAt": "2025-07-24T11:30:00.000Z",
    "updatedBy": {
      "id": "user456",
      "name": "Jean Dupont"
    }
  }
}
```

## Approbation d'une demande de financement

Approuve une demande de financement.

**Endpoint** : `POST /portfolio_inst/portfolios/traditional/{portfolioId}/requests/{requestId}/approve`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "notes": "Demande approuvée après vérification des documents",
  "approvedAmount": 50000.00,
  "approvedTerm": 12,
  "approvedInterestRate": 8.5,
  "conditions": [
    "Garantie immobilière requise",
    "Premier décaissement après signature du contrat"
  ]
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "request123",
    "reference": "REQ-2025-001",
    "status": "approved",
    "approvedAmount": 50000.00,
    "approvedTerm": 12,
    "approvedInterestRate": 8.5,
    "approvedBy": {
      "id": "user456",
      "name": "Jean Dupont"
    },
    "approvedAt": "2025-07-24T14:00:00.000Z",
    "notes": "Demande approuvée après vérification des documents",
    "conditions": [
      "Garantie immobilière requise",
      "Premier décaissement après signature du contrat"
    ],
    "timeline": [
      {
        "action": "created",
        "timestamp": "2025-07-20T08:00:00.000Z",
        "user": {
          "id": "user456",
          "name": "Jean Dupont"
        }
      },
      {
        "action": "approved",
        "timestamp": "2025-07-24T14:00:00.000Z",
        "user": {
          "id": "user456",
          "name": "Jean Dupont"
        },
        "notes": "Demande approuvée après vérification des documents"
      }
    ]
  }
}
```

## Rejet d'une demande de financement

Rejette une demande de financement.

**Endpoint** : `POST /portfolio_inst/portfolios/traditional/{portfolioId}/requests/{requestId}/reject`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "reason": "Documentation insuffisante",
  "notes": "Les états financiers fournis ne démontrent pas une capacité de remboursement suffisante"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "request123",
    "reference": "REQ-2025-001",
    "status": "rejected",
    "rejectedBy": {
      "id": "user456",
      "name": "Jean Dupont"
    },
    "rejectedAt": "2025-07-24T14:30:00.000Z",
    "reason": "Documentation insuffisante",
    "notes": "Les états financiers fournis ne démontrent pas une capacité de remboursement suffisante",
    "timeline": [
      {
        "action": "created",
        "timestamp": "2025-07-20T08:00:00.000Z",
        "user": {
          "id": "user456",
          "name": "Jean Dupont"
        }
      },
      {
        "action": "rejected",
        "timestamp": "2025-07-24T14:30:00.000Z",
        "user": {
          "id": "user456",
          "name": "Jean Dupont"
        },
        "reason": "Documentation insuffisante",
        "notes": "Les états financiers fournis ne démontrent pas une capacité de remboursement suffisante"
      }
    ]
  }
}
```

## Annulation d'une demande de financement

Annule une demande de financement.

**Endpoint** : `POST /portfolio_inst/portfolios/traditional/{portfolioId}/requests/{requestId}/cancel`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "reason": "Annulation à la demande du client",
  "notes": "Le client a trouvé une autre source de financement"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "request123",
    "reference": "REQ-2025-001",
    "status": "cancelled",
    "cancelledBy": {
      "id": "user456",
      "name": "Jean Dupont"
    },
    "cancelledAt": "2025-07-24T15:00:00.000Z",
    "reason": "Annulation à la demande du client",
    "notes": "Le client a trouvé une autre source de financement",
    "timeline": [
      {
        "action": "created",
        "timestamp": "2025-07-20T08:00:00.000Z",
        "user": {
          "id": "user456",
          "name": "Jean Dupont"
        }
      },
      {
        "action": "cancelled",
        "timestamp": "2025-07-24T15:00:00.000Z",
        "user": {
          "id": "user456",
          "name": "Jean Dupont"
        },
        "reason": "Annulation à la demande du client",
        "notes": "Le client a trouvé une autre source de financement"
      }
    ]
  }
}
```

## Ajout d'un document à une demande

Ajoute un nouveau document à une demande de financement existante.

**Endpoint** : `POST /portfolio_inst/portfolios/traditional/{portfolioId}/requests/{requestId}/documents`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille
- `requestId` : Identifiant unique de la demande

**Corps de la requête** :

```json
{
  "type": "collateral_assessment",
  "name": "Évaluation de la garantie",
  "content": "base64_encoded_content",
  "notes": "Rapport d'évaluation de la propriété offerte en garantie"
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "doc789",
    "requestId": "request123",
    "type": "collateral_assessment",
    "name": "Évaluation de la garantie",
    "url": "https://example.com/documents/doc789.pdf",
    "notes": "Rapport d'évaluation de la propriété offerte en garantie",
    "uploadedBy": {
      "id": "user456",
      "name": "Jean Dupont"
    },
    "uploadedAt": "2025-07-24T15:30:00.000Z"
  }
}
```

## Erreurs spécifiques

| Code HTTP | Code d'erreur               | Description                                       |
|-----------|-----------------------------|-------------------------------------------------|
| 400       | INVALID_REQUEST_DATA        | Données de demande invalides                     |
| 404       | REQUEST_NOT_FOUND           | Demande de financement non trouvée               |
| 404       | PORTFOLIO_NOT_FOUND         | Portefeuille non trouvé                          |
| 403       | INSUFFICIENT_PERMISSIONS    | Permissions insuffisantes                        |
| 409       | INVALID_STATUS_CHANGE       | Changement de statut invalide                    |
| 400       | DOCUMENT_UPLOAD_FAILED      | Échec du téléchargement du document              |
