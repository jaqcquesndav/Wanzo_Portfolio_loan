# Paramètres du Portefeuille d'Investissement

Ce document décrit les endpoints pour la gestion des paramètres des portefeuilles d'investissement, incluant les classes d'actifs, stratégies d'investissement, et les paramètres généraux.

## Récupérer les classes d'actifs

Récupère toutes les classes d'actifs disponibles pour les portefeuilles d'investissement.

**Endpoint** : GET /portfolios/investment/settings/asset-classes

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "ac-1",
    "name": "Actions",
    "description": "Titres de propriété d'entreprises cotées",
    "risk_level": 4,
    "expected_return": 8.5
  },
  {
    "id": "ac-2",
    "name": "Obligations",
    "description": "Titres de créance émis par des gouvernements ou des entreprises",
    "risk_level": 2,
    "expected_return": 3.5
  },
  {
    "id": "ac-3",
    "name": "Immobilier",
    "description": "Investissements dans des biens immobiliers ou des fonds immobiliers",
    "risk_level": 3,
    "expected_return": 6.0
  }
]
```

## Récupérer les stratégies d'investissement

Récupère toutes les stratégies d'investissement disponibles.

**Endpoint** : GET /portfolios/investment/settings/strategies

**Réponse réussie** (200 OK) :

```json
[
  {
    "id": "is-1",
    "name": "Conservatrice",
    "description": "Stratégie à faible risque privilégiant la préservation du capital",
    "target_allocation": {
      "ac-1": 20,
      "ac-2": 70,
      "ac-3": 10
    },
    "risk_profile": "conservative",
    "min_investment": 5000
  },
  {
    "id": "is-2",
    "name": "Équilibrée",
    "description": "Stratégie modérée visant un équilibre entre croissance et sécurité",
    "target_allocation": {
      "ac-1": 50,
      "ac-2": 30,
      "ac-3": 20
    },
    "risk_profile": "balanced",
    "min_investment": 10000
  },
  {
    "id": "is-3",
    "name": "Agressive",
    "description": "Stratégie à haut risque visant une croissance maximale",
    "target_allocation": {
      "ac-1": 80,
      "ac-2": 10,
      "ac-3": 10
    },
    "risk_profile": "aggressive",
    "min_investment": 20000
  }
]
```

## Récupérer tous les paramètres

Récupère tous les paramètres configurés pour les portefeuilles d'investissement.

**Endpoint** : GET /portfolios/investment/settings

**Réponse réussie** (200 OK) :

```json
{
  "asset_classes": [
    {
      "id": "ac-1",
      "name": "Actions",
      "description": "Titres de propriété d'entreprises cotées",
      "risk_level": 4,
      "expected_return": 8.5
    },
    {
      "id": "ac-2",
      "name": "Obligations",
      "description": "Titres de créance émis par des gouvernements ou des entreprises",
      "risk_level": 2,
      "expected_return": 3.5
    },
    {
      "id": "ac-3",
      "name": "Immobilier",
      "description": "Investissements dans des biens immobiliers ou des fonds immobiliers",
      "risk_level": 3,
      "expected_return": 6.0
    }
  ],
  "investment_strategies": [
    {
      "id": "is-1",
      "name": "Conservatrice",
      "description": "Stratégie à faible risque privilégiant la préservation du capital",
      "target_allocation": {
        "ac-1": 20,
        "ac-2": 70,
        "ac-3": 10
      },
      "risk_profile": "conservative",
      "min_investment": 5000
    },
    {
      "id": "is-2",
      "name": "Équilibrée",
      "description": "Stratégie modérée visant un équilibre entre croissance et sécurité",
      "target_allocation": {
        "ac-1": 50,
        "ac-2": 30,
        "ac-3": 20
      },
      "risk_profile": "balanced",
      "min_investment": 10000
    },
    {
      "id": "is-3",
      "name": "Agressive",
      "description": "Stratégie à haut risque visant une croissance maximale",
      "target_allocation": {
        "ac-1": 80,
        "ac-2": 10,
        "ac-3": 10
      },
      "risk_profile": "aggressive",
      "min_investment": 20000
    }
  ],
  "default_strategy_id": "is-2",
  "trading_hours": {
    "start": "09:00",
    "end": "17:30",
    "timezone": "UTC+1"
  },
  "fees": {
    "management_fee": 1.5,
    "performance_fee": 10,
    "entry_fee": 1,
    "exit_fee": 0.5
  }
}
```

## Mettre à jour les paramètres

Met à jour les paramètres des portefeuilles d'investissement.

**Endpoint** : PUT /portfolios/investment/settings

**Corps de la requête** :

```json
{
  "default_strategy_id": "is-3",
  "trading_hours": {
    "start": "08:30",
    "end": "16:30",
    "timezone": "UTC+1"
  },
  "fees": {
    "management_fee": 1.8,
    "performance_fee": 12,
    "entry_fee": 1.2,
    "exit_fee": 0.6
  }
}
```

**Réponse réussie** (200 OK) :

```json
{
  "asset_classes": [
    {
      "id": "ac-1",
      "name": "Actions",
      "description": "Titres de propriété d'entreprises cotées",
      "risk_level": 4,
      "expected_return": 8.5
    },
    {
      "id": "ac-2",
      "name": "Obligations",
      "description": "Titres de créance émis par des gouvernements ou des entreprises",
      "risk_level": 2,
      "expected_return": 3.5
    },
    {
      "id": "ac-3",
      "name": "Immobilier",
      "description": "Investissements dans des biens immobiliers ou des fonds immobiliers",
      "risk_level": 3,
      "expected_return": 6.0
    }
  ],
  "investment_strategies": [
    {
      "id": "is-1",
      "name": "Conservatrice",
      "description": "Stratégie à faible risque privilégiant la préservation du capital",
      "target_allocation": {
        "ac-1": 20,
        "ac-2": 70,
        "ac-3": 10
      },
      "risk_profile": "conservative",
      "min_investment": 5000
    },
    {
      "id": "is-2",
      "name": "Équilibrée",
      "description": "Stratégie modérée visant un équilibre entre croissance et sécurité",
      "target_allocation": {
        "ac-1": 50,
        "ac-2": 30,
        "ac-3": 20
      },
      "risk_profile": "balanced",
      "min_investment": 10000
    },
    {
      "id": "is-3",
      "name": "Agressive",
      "description": "Stratégie à haut risque visant une croissance maximale",
      "target_allocation": {
        "ac-1": 80,
        "ac-2": 10,
        "ac-3": 10
      },
      "risk_profile": "aggressive",
      "min_investment": 20000
    }
  ],
  "default_strategy_id": "is-3",
  "trading_hours": {
    "start": "08:30",
    "end": "16:30",
    "timezone": "UTC+1"
  },
  "fees": {
    "management_fee": 1.8,
    "performance_fee": 12,
    "entry_fee": 1.2,
    "exit_fee": 0.6
  }
}
```

## Implémentation technique

Les endpoints ci-dessus sont implémentés dans le module `portfolio-settings.api.ts` avec les fonctions suivantes:

- `getAssetClasses()`: Récupère les classes d'actifs
- `getInvestmentStrategies()`: Récupère les stratégies d'investissement
- `getPortfolioSettings()`: Récupère tous les paramètres
- `updatePortfolioSettings(settings)`: Met à jour les paramètres

En mode développement ou hors ligne, ces fonctions utilisent un mécanisme de stockage local (localStorage) pour persister les données.

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide ou paramètres manquants |
| 401  | Non autorisé - Authentification requise |
| 403  | Accès interdit - Droits insuffisants |
| 422  | Entité non traitable - Validation échouée |
| 500  | Erreur serveur interne |

## Modèle de données

### AssetClass

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique de la classe d'actif |
| name | string | Nom de la classe d'actif |
| description | string | Description de la classe d'actif |
| risk_level | number | Niveau de risque (1-5) |
| expected_return | number | Rendement attendu en pourcentage |

### InvestmentStrategy

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique de la stratégie |
| name | string | Nom de la stratégie |
| description | string | Description de la stratégie |
| target_allocation | object | Allocation cible par classe d'actif (en %) |
| risk_profile | string | Profil de risque (conservative, balanced, aggressive) |
| min_investment | number | Investissement minimum requis |

### PortfolioSettings

| Champ | Type | Description |
|-------|------|-------------|
| asset_classes | array | Liste des classes d'actifs disponibles |
| investment_strategies | array | Liste des stratégies d'investissement disponibles |
| default_strategy_id | string | Identifiant de la stratégie par défaut |
| trading_hours | object | Heures de négociation |
| trading_hours.start | string | Heure de début (format HH:MM) |
| trading_hours.end | string | Heure de fin (format HH:MM) |
| trading_hours.timezone | string | Fuseau horaire |
| fees | object | Structure des frais |
| fees.management_fee | number | Frais de gestion (%) |
| fees.performance_fee | number | Commission de performance (%) |
| fees.entry_fee | number | Frais d'entrée (%) |
| fees.exit_fee | number | Frais de sortie (%) |

