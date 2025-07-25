# Souscriptions d'Investissement

Ce document décrit les endpoints pour la gestion des souscriptions dans le cadre des portefeuilles d'investissement.

## Liste des souscriptions

Récupère la liste des souscriptions pour un portefeuille d'investissement spécifique.

**Endpoint** : GET /portfolios/investment/subscriptions

**Paramètres de requête** :
- portfolioId (obligatoire) : Identifiant unique du portefeuille d'investissement
- status (optionnel) : Filtre par statut (pending, approved, rejected, cancelled, completed)
- dateFrom (optionnel) : Filtre par date de souscription (début)
- dateTo (optionnel) : Filtre par date de souscription (fin)

**Réponse réussie** (200 OK) :

`````````json
[
  {
    "id": "SUB-1625473200000",
    "portfolio_id": "portfolio-123",
    "investor_id": "investor-456",
    "investor_name": "Investisseur Alpha",
    "amount": 2000000,
    "status": "completed",
    "subscription_date": "2025-07-05T10:00:00Z",
    "value_date": "2025-07-05T16:00:00Z",
    "payment_details": {
      "payment_method": "bank_transfer",
      "payment_reference": "REF-20250705-001",
      "payment_date": "2025-07-05T14:30:00Z"
    },
    "created_at": "2025-07-05T09:30:00Z",
    "updated_at": "2025-07-05T16:30:00Z"
  },
  {
    "id": "SUB-1625559600000",
    "portfolio_id": "portfolio-123",
    "investor_id": "investor-789",
    "investor_name": "Investisseur Beta",
    "amount": 5000000,
    "status": "pending",
    "subscription_date": "2025-07-08T11:30:00Z",
    "created_at": "2025-07-08T11:00:00Z",
    "updated_at": "2025-07-08T11:00:00Z"
  }
]
```

## Détails d'une souscription

Récupère les détails complets d'une souscription spécifique.

**Endpoint** : GET /portfolios/investment/subscriptions/{id}

**Paramètres de chemin** :
- id : Identifiant unique de la souscription

**Réponse réussie** (200 OK) :

`````````json
{
  "id": "SUB-1625473200000",
  "portfolio_id": "portfolio-123",
  "investor_id": "investor-456",
  "investor_name": "Investisseur Alpha",
  "amount": 2000000,
  "status": "completed",
  "subscription_date": "2025-07-05T10:00:00Z",
  "value_date": "2025-07-05T16:00:00Z",
  "payment_details": {
    "payment_method": "bank_transfer",
    "payment_reference": "REF-20250705-001",
    "payment_date": "2025-07-05T14:30:00Z"
  },
  "notes": "Souscription traitée par Marie K.",
  "created_at": "2025-07-05T09:30:00Z",
  "updated_at": "2025-07-05T16:30:00Z"
}
```

## Création d'une souscription

Crée une nouvelle souscription d'investissement.

**Endpoint** : POST /portfolios/investment/subscriptions

**Corps de la requête** :

`````````json
{
  "portfolio_id": "portfolio-123",
  "investor_id": "investor-456",
  "investor_name": "Investisseur Alpha",
  "amount": 2000000,
  "subscription_date": "2025-07-15T10:00:00Z"
}
```

**Réponse réussie** (201 Created) :

`````````json
{
  "id": "SUB-1626080400000",
  "portfolio_id": "portfolio-123",
  "investor_id": "investor-456",
  "investor_name": "Investisseur Alpha",
  "amount": 2000000,
  "status": "pending",
  "subscription_date": "2025-07-15T10:00:00Z",
  "created_at": "2025-07-15T09:30:00Z",
  "updated_at": "2025-07-15T09:30:00Z"
}
```

## Approbation d'une souscription

Approuve une souscription en attente.

**Endpoint** : POST /portfolios/investment/subscriptions/{id}/approve

**Paramètres de chemin** :
- id : Identifiant unique de la souscription

**Corps de la requête** : 
`````````json
{}
```

**Réponse réussie** (200 OK) :

`````````json
{
  "id": "SUB-1626080400000",
  "portfolio_id": "portfolio-123",
  "investor_id": "investor-456",
  "investor_name": "Investisseur Alpha",
  "amount": 2000000,
  "status": "approved",
  "subscription_date": "2025-07-15T10:00:00Z",
  "created_at": "2025-07-15T09:30:00Z",
  "updated_at": "2025-07-15T14:20:00Z"
}
```

## Rejet d'une souscription

Rejette une souscription en attente.

**Endpoint** : POST /portfolios/investment/subscriptions/{id}/reject

**Paramètres de chemin** :
- id : Identifiant unique de la souscription

**Corps de la requête** :

`````````json
{
  "reason": "Documents incomplets"
}
```

**Réponse réussie** (200 OK) :

`````````json
{
  "id": "SUB-1626080400000",
  "portfolio_id": "portfolio-123",
  "investor_id": "investor-456",
  "investor_name": "Investisseur Alpha",
  "amount": 2000000,
  "status": "rejected",
  "subscription_date": "2025-07-15T10:00:00Z",
  "notes": "Documents incomplets",
  "created_at": "2025-07-15T09:30:00Z",
  "updated_at": "2025-07-15T14:25:00Z"
}
```

## Annulation d'une souscription

Annule une souscription en attente ou approuvée.

**Endpoint** : POST /portfolios/investment/subscriptions/{id}/cancel

**Paramètres de chemin** :
- id : Identifiant unique de la souscription

**Corps de la requête** :

`````````json
{
  "reason": "Annulation demandée par l'investisseur"
}
```

**Réponse réussie** (200 OK) :

`````````json
{
  "id": "SUB-1626080400000",
  "portfolio_id": "portfolio-123",
  "investor_id": "investor-456",
  "investor_name": "Investisseur Alpha",
  "amount": 2000000,
  "status": "cancelled",
  "subscription_date": "2025-07-15T10:00:00Z",
  "notes": "Annulation demandée par l'investisseur",
  "created_at": "2025-07-15T09:30:00Z",
  "updated_at": "2025-07-15T16:10:00Z"
}
```

## Finalisation d'une souscription

Marque une souscription approuvée comme complétée après paiement.

**Endpoint** : POST /portfolios/investment/subscriptions/{id}/complete

**Paramètres de chemin** :
- id : Identifiant unique de la souscription

**Corps de la requête** :

`````````json
{
  "payment_method": "bank_transfer",
  "payment_reference": "REF-20250715-003",
  "payment_date": "2025-07-15T14:30:00Z",
  "value_date": "2025-07-15T16:00:00Z"
}
```

**Réponse réussie** (200 OK) :

`````````json
{
  "id": "SUB-1626080400000",
  "portfolio_id": "portfolio-123",
  "investor_id": "investor-456",
  "investor_name": "Investisseur Alpha",
  "amount": 2000000,
  "status": "completed",
  "subscription_date": "2025-07-15T10:00:00Z",
  "value_date": "2025-07-15T16:00:00Z",
  "payment_details": {
    "payment_method": "bank_transfer",
    "payment_reference": "REF-20250715-003",
    "payment_date": "2025-07-15T14:30:00Z"
  },
  "created_at": "2025-07-15T09:30:00Z",
  "updated_at": "2025-07-15T16:30:00Z"
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide ou paramètres manquants |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 404  | Ressource non trouvée |
| 409  | Conflit - État incompatible de la souscription |
| 422  | Entité non traitable - Validation échouée |
| 500  | Erreur serveur interne |

## Modèle de données

### InvestmentSubscription

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique de la souscription |
| portfolio_id | string | Identifiant du portefeuille d'investissement |
| investor_id | string | Identifiant de l'investisseur |
| investor_name | string | Nom de l'investisseur |
| amount | number | Montant de la souscription |
| status | string | Statut de la souscription (pending, approved, rejected, cancelled, completed) |
| subscription_date | string | Date de la souscription (format ISO) |
| value_date | string | Date de valeur (format ISO) - uniquement pour les souscriptions complétées |
| payment_details | object | Détails du paiement - uniquement pour les souscriptions complétées |
| payment_details.payment_method | string | Méthode de paiement utilisée |
| payment_details.payment_reference | string | Référence du paiement |
| payment_details.payment_date | string | Date du paiement (format ISO) |
| notes | string | Notes additionnelles sur la souscription |
| created_at | string | Date de création de l'enregistrement (format ISO) |
| updated_at | string | Date de dernière mise à jour (format ISO) |

