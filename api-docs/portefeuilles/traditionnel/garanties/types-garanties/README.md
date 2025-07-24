# API des Types de Garanties - Portefeuille Traditionnel

Cette API permet de gérer les types de garanties disponibles pour les contrats de crédit dans le portefeuille traditionnel.

## Points d'accès

### Obtenir tous les types de garanties
```
GET /api/portfolio/traditional/guarantee-types
```

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page (par défaut: 1) |
| limit | number | Nombre d'éléments par page (par défaut: 10) |
| search | string | Terme de recherche (optionnel) |
| sortBy | string | Champ pour le tri (par défaut: 'name') |
| sortOrder | string | Ordre de tri ('asc' ou 'desc', par défaut: 'asc') |

#### Réponse
```json
{
  "success": true,
  "data": {
    "guaranteeTypes": [
      {
        "id": "gt-001",
        "name": "Hypothèque",
        "description": "Garantie sur un bien immobilier",
        "createdAt": "2023-02-10T08:15:00Z",
        "updatedAt": "2023-02-10T08:15:00Z"
      },
      {
        "id": "gt-002",
        "name": "Nantissement de matériel",
        "description": "Garantie sur du matériel professionnel",
        "createdAt": "2023-02-10T08:20:00Z",
        "updatedAt": "2023-02-10T08:20:00Z"
      },
      {
        "id": "gt-003",
        "name": "Caution personnelle",
        "description": "Engagement d'une personne physique à rembourser le crédit en cas de défaillance de l'emprunteur",
        "createdAt": "2023-02-10T08:25:00Z",
        "updatedAt": "2023-02-10T08:25:00Z"
      },
      // ...autres types de garanties
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

### Obtenir un type de garantie par ID
```
GET /api/portfolio/traditional/guarantee-types/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique du type de garantie |

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "gt-001",
    "name": "Hypothèque",
    "description": "Garantie sur un bien immobilier",
    "createdAt": "2023-02-10T08:15:00Z",
    "updatedAt": "2023-02-10T08:15:00Z",
    "requirements": [
      "Titre de propriété",
      "Évaluation du bien",
      "Assurance"
    ],
    "evaluationCriteria": [
      "Valeur marchande",
      "État du bien",
      "Emplacement"
    ],
    "coverageRatio": 150,
    "registrationProcess": "Enregistrement au registre foncier",
    "legalFramework": "Article 2414 et suivants du Code Civil"
  }
}
```

### Créer un nouveau type de garantie
```
POST /api/portfolio/traditional/guarantee-types
```

#### Corps de la requête
```json
{
  "name": "Gage sur stock",
  "description": "Garantie sur les stocks de marchandises d'une entreprise"
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "gt-004",
    "name": "Gage sur stock",
    "description": "Garantie sur les stocks de marchandises d'une entreprise",
    "createdAt": "2023-07-18T10:30:00Z",
    "updatedAt": "2023-07-18T10:30:00Z"
  }
}
```

### Mettre à jour un type de garantie
```
PUT /api/portfolio/traditional/guarantee-types/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique du type de garantie |

#### Corps de la requête
```json
{
  "name": "Gage sur stocks",
  "description": "Garantie sur les stocks de marchandises d'une entreprise avec contrôle périodique"
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "gt-004",
    "name": "Gage sur stocks",
    "description": "Garantie sur les stocks de marchandises d'une entreprise avec contrôle périodique",
    "updatedAt": "2023-07-18T11:45:00Z"
  }
}
```

### Supprimer un type de garantie
```
DELETE /api/portfolio/traditional/guarantee-types/:id
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| id | string | Identifiant unique du type de garantie |

#### Réponse
```json
{
  "success": true,
  "message": "Type de garantie supprimé avec succès"
}
```

## Modèles de données

### Type de garantie
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique du type de garantie |
| name | string | Nom du type de garantie |
| description | string | Description détaillée |
| requirements | array | Liste des documents requis (optionnel) |
| evaluationCriteria | array | Critères d'évaluation (optionnel) |
| coverageRatio | number | Ratio de couverture recommandé (optionnel) |
| registrationProcess | string | Processus d'enregistrement (optionnel) |
| legalFramework | string | Cadre juridique (optionnel) |
| createdAt | string | Date de création (format ISO) |
| updatedAt | string | Date de dernière modification (format ISO) |
