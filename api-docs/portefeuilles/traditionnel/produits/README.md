# API des Produits Financiers

Cette API permet de gérer les produits financiers dans le portefeuille traditionnel.

## Points d'accès

### Obtenir tous les produits
```
GET /api/portfolio/traditional/products
```

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page (par défaut: 1) |
| limit | number | Nombre d'éléments par page (par défaut: 10) |
| search | string | Terme de recherche (optionnel) |
| status | string | Filtrer par statut (optionnel) |
| type | string | Filtrer par type de produit (optionnel) |
| category | string | Filtrer par catégorie (optionnel) |
| sortBy | string | Champ pour le tri (par défaut: 'createdAt') |
| sortOrder | string | Ordre de tri ('asc' ou 'desc', par défaut: 'desc') |

#### Réponse
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-123",
        "name": "Prêt Express",
        "type": "LOAN",
        "category": "SHORT_TERM",
        "interestRate": 5.5,
        "minAmount": 1000,
        "maxAmount": 50000,
        "minTerm": 3,
        "maxTerm": 36,
        "currency": "XOF",
        "status": "ACTIVE",
        "description": "Prêt à court terme pour les besoins urgents",
        "requirements": ["Pièce d'identité", "Justificatif de revenus"],
        "createdAt": "2023-03-15T10:30:00Z",
        "updatedAt": "2023-04-20T14:15:00Z"
      },
      // ...autres produits
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

### Obtenir un produit par ID
```
GET /api/portfolio/traditional/products/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique du produit |

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "prod-123",
    "name": "Prêt Express",
    "type": "LOAN",
    "category": "SHORT_TERM",
    "interestRate": 5.5,
    "minAmount": 1000,
    "maxAmount": 50000,
    "minTerm": 3,
    "maxTerm": 36,
    "currency": "XOF",
    "status": "ACTIVE",
    "description": "Prêt à court terme pour les besoins urgents",
    "requirements": ["Pièce d'identité", "Justificatif de revenus"],
    "createdAt": "2023-03-15T10:30:00Z",
    "updatedAt": "2023-04-20T14:15:00Z",
    "fees": [
      {
        "id": "fee-001",
        "name": "Frais de dossier",
        "type": "FIXED",
        "amount": 5000,
        "currency": "XOF"
      },
      {
        "id": "fee-002",
        "name": "Frais d'assurance",
        "type": "PERCENTAGE",
        "percentage": 1.2
      }
    ],
    "eligibilityCriteria": [
      {
        "id": "crit-001",
        "type": "MIN_INCOME",
        "value": 150000,
        "currency": "XOF"
      },
      {
        "id": "crit-002",
        "type": "MIN_CREDIT_SCORE",
        "value": 650
      }
    ]
  }
}
```

### Créer un nouveau produit
```
POST /api/portfolio/traditional/products
```

#### Corps de la requête
```json
{
  "name": "Crédit Investissement",
  "type": "LOAN",
  "category": "LONG_TERM",
  "interestRate": 8.75,
  "minAmount": 5000000,
  "maxAmount": 100000000,
  "minTerm": 12,
  "maxTerm": 120,
  "currency": "XOF",
  "description": "Crédit d'investissement pour les entreprises",
  "requirements": ["Business plan", "États financiers", "Garanties"],
  "fees": [
    {
      "name": "Frais de dossier",
      "type": "PERCENTAGE",
      "percentage": 1.5
    }
  ],
  "eligibilityCriteria": [
    {
      "type": "MIN_BUSINESS_AGE",
      "value": 2
    }
  ]
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "prod-456",
    "name": "Crédit Investissement",
    "type": "LOAN",
    "category": "LONG_TERM",
    "interestRate": 8.75,
    "minAmount": 5000000,
    "maxAmount": 100000000,
    "minTerm": 12,
    "maxTerm": 120,
    "currency": "XOF",
    "status": "ACTIVE",
    "description": "Crédit d'investissement pour les entreprises",
    "requirements": ["Business plan", "États financiers", "Garanties"],
    "createdAt": "2023-07-10T09:45:00Z",
    "updatedAt": "2023-07-10T09:45:00Z",
    "fees": [
      {
        "id": "fee-003",
        "name": "Frais de dossier",
        "type": "PERCENTAGE",
        "percentage": 1.5
      }
    ],
    "eligibilityCriteria": [
      {
        "id": "crit-003",
        "type": "MIN_BUSINESS_AGE",
        "value": 2
      }
    ]
  }
}
```

### Mettre à jour un produit
```
PUT /api/portfolio/traditional/products/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique du produit |

#### Corps de la requête
```json
{
  "name": "Prêt Express Plus",
  "interestRate": 5.25,
  "maxAmount": 60000,
  "status": "ACTIVE",
  "description": "Prêt à court terme pour les besoins urgents avec conditions améliorées"
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "prod-123",
    "name": "Prêt Express Plus",
    "type": "LOAN",
    "category": "SHORT_TERM",
    "interestRate": 5.25,
    "minAmount": 1000,
    "maxAmount": 60000,
    "minTerm": 3,
    "maxTerm": 36,
    "currency": "XOF",
    "status": "ACTIVE",
    "description": "Prêt à court terme pour les besoins urgents avec conditions améliorées",
    "requirements": ["Pièce d'identité", "Justificatif de revenus"],
    "updatedAt": "2023-07-15T11:20:00Z"
  }
}
```

### Supprimer un produit
```
DELETE /api/portfolio/traditional/products/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique du produit |

#### Réponse
```json
{
  "success": true,
  "message": "Produit supprimé avec succès"
}
```

### Obtenir les types de produits
```
GET /api/portfolio/traditional/product-types
```

#### Réponse
```json
{
  "success": true,
  "data": [
    {
      "id": "LOAN",
      "name": "Prêt",
      "description": "Produits de financement classiques"
    },
    {
      "id": "CREDIT_LINE",
      "name": "Ligne de crédit",
      "description": "Crédit renouvelable avec plafond prédéfini"
    },
    {
      "id": "LEASING",
      "name": "Leasing",
      "description": "Location avec option d'achat"
    },
    {
      "id": "OVERDRAFT",
      "name": "Découvert",
      "description": "Autorisation de dépassement du solde"
    }
  ]
}
```

### Obtenir les catégories de produits
```
GET /api/portfolio/traditional/product-categories
```

#### Réponse
```json
{
  "success": true,
  "data": [
    {
      "id": "SHORT_TERM",
      "name": "Court terme",
      "description": "Produits avec une durée inférieure à 12 mois"
    },
    {
      "id": "MEDIUM_TERM",
      "name": "Moyen terme",
      "description": "Produits avec une durée entre 12 et 60 mois"
    },
    {
      "id": "LONG_TERM",
      "name": "Long terme",
      "description": "Produits avec une durée supérieure à 60 mois"
    }
  ]
}
```

## Modèles de données

### Produit financier
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique du produit |
| name | string | Nom du produit |
| type | string | Type du produit (LOAN, CREDIT_LINE, LEASING, OVERDRAFT) |
| category | string | Catégorie du produit (SHORT_TERM, MEDIUM_TERM, LONG_TERM) |
| interestRate | number | Taux d'intérêt nominal (en pourcentage) |
| minAmount | number | Montant minimum du financement |
| maxAmount | number | Montant maximum du financement |
| minTerm | number | Durée minimum (en mois) |
| maxTerm | number | Durée maximum (en mois) |
| currency | string | Devise (code ISO) |
| status | string | Statut du produit (ACTIVE, INACTIVE, DRAFT) |
| description | string | Description détaillée du produit |
| requirements | array | Liste des documents requis |
| fees | array | Liste des frais associés au produit |
| eligibilityCriteria | array | Critères d'éligibilité |
| createdAt | string | Date de création (format ISO) |
| updatedAt | string | Date de dernière modification (format ISO) |

### Frais
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique des frais |
| name | string | Nom des frais |
| type | string | Type de frais (FIXED, PERCENTAGE) |
| amount | number | Montant (si type = FIXED) |
| percentage | number | Pourcentage (si type = PERCENTAGE) |
| currency | string | Devise (si type = FIXED) |

### Critère d'éligibilité
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique du critère |
| type | string | Type de critère (MIN_INCOME, MIN_CREDIT_SCORE, MIN_BUSINESS_AGE, etc.) |
| value | number | Valeur du critère |
| currency | string | Devise (si applicable) |
