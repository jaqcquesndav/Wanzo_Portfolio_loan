# Marché d'Investissement

Ce document décrit les endpoints pour la gestion du marché d'investissement, y compris les titres disponibles, les opérations sur les titres et les informations de marché.

## Liste des titres disponibles

Récupère la liste des titres disponibles sur le marché d'investissement.

**Endpoint** : `GET /portfolios/investment/market/securities`

**Paramètres de requête** :
- `type` (optionnel) : Filtre par type de titre (actions, obligations, parts_sociales, autre)
- `sector` (optionnel) : Filtre par secteur
- `country` (optionnel) : Filtre par pays
- `risk` (optionnel) : Filtre par niveau de risque (faible, modéré, élevé)
- `listed` (optionnel) : Filtre par statut de cotation (true/false)
- `search` (optionnel) : Recherche textuelle (nom, description, companyName)

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "MS-00001",
    "name": "Actions Société Tech",
    "companyId": "C-00001",
    "companyName": "Tech Innovations Inc.",
    "type": "actions",
    "unitPrice": 150.75,
    "availableUnits": 10000,
    "totalValue": 1507500,
    "currency": "EUR",
    "sector": "Technologie",
    "country": "France",
    "reference": "TECH-FR-001",
    "issuer": "Tech Innovations Inc.",
    "listed": true,
    "marketCap": 2500000000,
    "enterpriseValue": 3000000000,
    "creationDate": "2010-05-15",
    "description": "Entreprise spécialisée dans les solutions technologiques innovantes",
    "lastValuationDate": "2025-07-01",
    "risk": "modéré",
    "expectedReturn": 7.5,
    "valuation": {
      "ebitdaMultiple": 8.5,
      "peRatio": 12.3,
      "priceToBookRatio": 2.1
    },
    "financialMetrics": {
      "revenue": 450000000,
      "ebitda": 85000000,
      "netIncome": 60000000,
      "debt": 250000000
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2025-07-01T14:45:00Z"
  },
  {
    "id": "MS-00002",
    "name": "Obligations État 2030",
    "companyId": "C-00002",
    "companyName": "République Française",
    "type": "obligations",
    "unitPrice": 98.5,
    "availableUnits": 50000,
    "totalValue": 4925000,
    "currency": "EUR",
    "sector": "Gouvernement",
    "country": "France",
    "reference": "OAT-FR-2030",
    "issuer": "Trésor Public Français",
    "listed": true,
    "description": "Obligations d'État à échéance 2030 avec coupon annuel de 2.5%",
    "lastValuationDate": "2025-07-01",
    "risk": "faible",
    "expectedReturn": 2.5,
    "created_at": "2024-02-10T09:15:00Z",
    "updated_at": "2025-07-01T14:45:00Z"
  }
]
```
## Détails d'un titre

Récupère les détails complets d'un titre spécifique.

**Endpoint** : `GET /portfolios/investment/market/securities/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du titre

**Réponse réussie** (200 OK) :

```json
{
  "id": "MS-00001",
  "name": "Actions Société Tech",
  "companyId": "C-00001",
  "companyName": "Tech Innovations Inc.",
  "type": "actions",
  "unitPrice": 150.75,
  "availableUnits": 10000,
  "totalValue": 1507500,
  "currency": "EUR",
  "sector": "Technologie",
  "country": "France",
  "reference": "TECH-FR-001",
  "issuer": "Tech Innovations Inc.",
  "listed": true,
  "marketCap": 2500000000,
  "enterpriseValue": 3000000000,
  "creationDate": "2010-05-15",
  "description": "Entreprise spécialisée dans les solutions technologiques innovantes",
  "lastValuationDate": "2025-07-01",
  "risk": "modéré",
  "expectedReturn": 7.5,
  "valuation": {
    "ebitdaMultiple": 8.5,
    "peRatio": 12.3,
    "priceToBookRatio": 2.1
  },
  "financialMetrics": {
    "revenue": 450000000,
    "ebitda": 85000000,
    "netIncome": 60000000,
    "debt": 250000000
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2025-07-01T14:45:00Z"
}
```
## Titres par entreprise

Récupère la liste des titres associés à une entreprise spécifique.

**Endpoint** : `GET /portfolios/investment/market/companies/{companyId}/securities`

**Paramètres de chemin** :
- `companyId` : Identifiant unique de l'entreprise

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "MS-00001",
    "name": "Actions Société Tech",
    "companyId": "C-00001",
    "companyName": "Tech Innovations Inc.",
    "type": "actions",
    "unitPrice": 150.75,
    "availableUnits": 10000,
    "totalValue": 1507500,
    "currency": "EUR",
    "sector": "Technologie",
    "country": "France",
    "reference": "TECH-FR-001",
    "issuer": "Tech Innovations Inc.",
    "listed": true,
    "marketCap": 2500000000,
    "enterpriseValue": 3000000000,
    "creationDate": "2010-05-15",
    "description": "Entreprise spécialisée dans les solutions technologiques innovantes",
    "lastValuationDate": "2025-07-01",
    "risk": "modéré",
    "expectedReturn": 7.5,
    "valuation": {
      "ebitdaMultiple": 8.5,
      "peRatio": 12.3,
      "priceToBookRatio": 2.1
    },
    "financialMetrics": {
      "revenue": 450000000,
      "ebitda": 85000000,
      "netIncome": 60000000,
      "debt": 250000000
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2025-07-01T14:45:00Z"
  }
]
```

## Créer un nouveau titre

Ajoute un nouveau titre au marché.

**Endpoint** : `POST /portfolios/investment/market/securities`

**Corps de la requête** :

```json
{
  "name": "Nouveau Titre",
  "companyId": "C-00010",
  "companyName": "Nouvelle Entreprise",
  "type": "actions",
  "unitPrice": 75.50,
  "availableUnits": 5000,
  "totalValue": 377500,
  "currency": "EUR",
  "sector": "Finance",
  "country": "Bénin",
  "reference": "FIN-BJ-001",
  "issuer": "Nouvelle Entreprise",
  "listed": false,
  "creationDate": "2020-10-01",
  "description": "Société financière en forte croissance",
  "risk": "modéré",
  "expectedReturn": 9.0
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "message": "Titre créé avec succès",
  "data": {
    "id": "MS-00010",
    "name": "Nouveau Titre",
    "companyId": "C-00010",
    "companyName": "Nouvelle Entreprise",
    "type": "actions",
    "unitPrice": 75.50,
    "availableUnits": 5000,
    "totalValue": 377500,
    "currency": "EUR",
    "sector": "Finance",
    "country": "Bénin",
    "reference": "FIN-BJ-001",
    "issuer": "Nouvelle Entreprise",
    "listed": false,
    "creationDate": "2020-10-01",
    "description": "Société financière en forte croissance",
    "risk": "modéré",
    "expectedReturn": 9.0,
    "created_at": "2025-07-02T11:20:00Z",
    "updated_at": "2025-07-02T11:20:00Z"
  }
}
```

## Mettre à jour un titre

Met à jour les informations d'un titre existant.

**Endpoint** : `PUT /portfolios/investment/market/securities/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du titre

**Corps de la requête** :

```json
{
  "name": "Titre Mis à Jour",
  "unitPrice": 80.25,
  "availableUnits": 4500,
  "totalValue": 361125,
  "description": "Description mise à jour du titre",
  "risk": "élevé",
  "expectedReturn": 10.5
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Titre mis à jour avec succès",
  "data": {
    "id": "MS-00010",
    "name": "Titre Mis à Jour",
    "companyId": "C-00010",
    "companyName": "Nouvelle Entreprise",
    "type": "actions",
    "unitPrice": 80.25,
    "availableUnits": 4500,
    "totalValue": 361125,
    "currency": "EUR",
    "sector": "Finance",
    "country": "Bénin",
    "reference": "FIN-BJ-001",
    "issuer": "Nouvelle Entreprise",
    "listed": false,
    "creationDate": "2020-10-01",
    "description": "Description mise à jour du titre",
    "risk": "élevé",
    "expectedReturn": 10.5,
    "created_at": "2025-07-02T11:20:00Z",
    "updated_at": "2025-07-02T15:45:00Z"
  }
}
```

## Supprimer un titre

Supprime un titre du marché.

**Endpoint** : `DELETE /portfolios/investment/market/securities/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du titre

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "Titre supprimé avec succès"
}
```

## Recherche de titres

Recherche des titres selon des critères spécifiques.

**Endpoint** : `GET /portfolios/investment/market/search`

**Paramètres de requête** :
- `query` (obligatoire) : Terme de recherche
- `type` (optionnel) : Type de titre
- `minPrice` (optionnel) : Prix unitaire minimum
- `maxPrice` (optionnel) : Prix unitaire maximum
- `sector` (optionnel) : Secteur d'activité
- `risk` (optionnel) : Niveau de risque
- `page` (optionnel, défaut: 1) : Numéro de page
- `limit` (optionnel, défaut: 20) : Nombre d'éléments par page

**Réponse réussie** (200 OK) :

```json
{
  "data": [
    {
      "id": "MS-00001",
      "name": "Actions Société Tech",
      "companyName": "Tech Innovations Inc.",
      "type": "actions",
      "unitPrice": 150.75,
      "sector": "Technologie",
      "country": "France",
      "risk": "modéré",
      "expectedReturn": 7.5
    },
    {
      "id": "MS-00003",
      "name": "Actions TechPlus",
      "companyName": "TechPlus SA",
      "type": "actions",
      "unitPrice": 85.30,
      "sector": "Technologie",
      "country": "Sénégal",
      "risk": "modéré",
      "expectedReturn": 8.2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

## Valorisation d'un titre

Enregistre une nouvelle valorisation pour un titre.

**Endpoint** : `POST /portfolios/investment/market/securities/{securityId}/valuation`

**Paramètres de chemin** :
- `securityId` : Identifiant unique du titre

**Corps de la requête** :

```json
{
  "valuation_date": "2025-07-31T00:00:00Z",
  "new_price": 6000,
  "previous_price": 5750,
  "valuation_method": "mark_to_market",
  "valuation_details": {
    "ebitda": 5500000,
    "ebitdaMultiple": 9.0,
    "priceToBookRatio": 2.2
  },
  "financial_updates": {
    "revenue": 16000000,
    "ebitda": 5500000,
    "netIncome": 3300000,
    "debt": 9500000,
    "cash": 8000000
  },
  "currency": "XOF",
  "notes": "Valorisation mensuelle basée sur les résultats financiers du Q2 2025",
  "documents": [
    {
      "type": "valuation_report",
      "file_id": "file-131",
      "name": "Rapport_Valorisation_Juil2025.pdf"
    }
  ]
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "message": "Valorisation du titre enregistrée avec succès",
  "data": {
    "valuation_id": "val-123",
    "security_id": "sec-123",
    "previous_price": 5750,
    "new_price": 6000,
    "change_percentage": 4.35,
    "updated_at": "2025-07-31T10:00:00Z"
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide ou paramètres manquants |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 404  | Ressource non trouvée |
| 409  | Conflit - La ressource existe déjà |
| 422  | Entité non traitable - Validation échouée |
| 500  | Erreur serveur interne |

## Modèle de données

### MarketSecurity

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique du titre |
| name | string | Nom du titre |
| companyId | string | Identifiant de l'entreprise émettrice |
| companyName | string | Nom de l'entreprise émettrice |
| type | string | Type de titre (actions, obligations, parts_sociales, autre) |
| investmentEntryType | string | Type d'entrée d'investissement (ipo, private_equity, etc.) |
| unitPrice | number | Prix unitaire du titre |
| availableUnits | number | Nombre d'unités disponibles |
| totalValue | number | Valeur totale (unitPrice * availableUnits) |
| currency | string | Devise (code ISO) |
| sector | string | Secteur d'activité |
| country | string | Pays d'origine |
| reference | string | Référence unique du titre |
| issuer | string | Émetteur du titre |
| listed | boolean | Indique si le titre est coté en bourse |
| marketCap | number | Capitalisation boursière (pour les actions cotées) |
| enterpriseValue | number | Valeur d'entreprise |
| creationDate | string | Date de création de l'entreprise (format ISO) |
| description | string | Description détaillée |
| lastValuationDate | string | Date de dernière évaluation (format ISO) |
| risk | string | Niveau de risque (faible, modéré, élevé) |
| expectedReturn | number | Rendement attendu en pourcentage |
| valuation | object | Ratios d'évaluation |
| financialMetrics | object | Métriques financières |
| created_at | string | Date de création de l'enregistrement (format ISO) |
| updated_at | string | Date de dernière mise à jour (format ISO) |
