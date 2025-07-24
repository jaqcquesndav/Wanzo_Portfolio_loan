# Documentation du Dashboard Portefeuille d'Investissement

Cette section détaille les endpoints de l'API spécifiques au tableau de bord pour les portefeuilles d'investissement de la plateforme Wanzo Portfolio Institution. Cette documentation est destinée à l'utilisation par les équipes de développement backend et frontend.

## Structure du Dashboard d'Investissement

Le dashboard pour les portefeuilles d'investissement se concentre sur les métriques suivantes :
- Performance des investissements (rendement)
- Répartition par type d'actifs
- Analyse de volatilité et de risque
- Indicateurs clés de performance (KPIs)

## Types de Données Principaux

Les types de données principaux utilisés dans les API sont les suivants:

```typescript
type PortfolioType = 'traditional' | 'investment' | 'leasing';
type PortfolioStatus = 'active' | 'inactive' | 'pending' | 'archived';

interface InvestmentPortfolio {
  id: string;
  name: string;
  type: 'investment'; // Type spécifique 'investment'
  status: PortfolioStatus;
  target_amount: number;
  target_return: number;
  target_sectors: string[];
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  products: FinancialProduct[];
  investment_stage?: string;
  assets?: InvestmentAsset[];
  manager_id?: string;
  created_at: string;
  updated_at: string;
  metrics: {
    net_value: number;
    average_return: number;
    risk_portfolio: number;
    sharpe_ratio: number;
    volatility: number;
    alpha: number;
    beta: number;
    asset_allocation: Array<{ type: string; percentage: number }>;
    // Métriques spécifiques investissement
    nb_requests?: number;
    nb_transactions?: number;
    total_invested?: number;
    total_exited?: number;
    irr?: number;
    multiple?: number;
    avg_ticket?: number;
    nb_companies?: number;
  };
}

interface InvestmentAsset {
  id: string;
  name: string;
  companyId: string;
  type: 'share' | 'bond' | 'other';
  acquiredDate: string;
  initialValue: number;
  currentValue?: number;
  status: 'active' | 'exited' | 'written-off';
  created_at: string;
  updated_at: string;
}
```

## Endpoints spécifiques

### Récupération des KPIs du portefeuille d'investissement

Récupère les indicateurs clés de performance (KPIs) spécifiques aux portefeuilles d'investissement.

#### Requête

```
GET /dashboard/portfolio-type/investment/kpis
```

#### Réponse

```json
{
  "type": "investment",
  "count": 8,
  "totalValue": 3500000,
  "growth": 4.2,
  "avgRiskScore": 3.1,
  "performance": {
    "monthly": 1.2,
    "quarterly": 3.5,
    "yearly": 12.8
  },
  "topPortfolios": [
    {
      "id": "port-123",
      "name": "Portefeuille Tech",
      "value": 1200000,
      "growth": 5.2
    },
    {
      "id": "port-456",
      "name": "Portefeuille Énergies",
      "value": 950000,
      "growth": 3.8
    }
  ],
  "metrics": {
    "volatility": 8.5,
    "sharpeRatio": 1.2,
    "maxDrawdown": 12.5,
    "beta": 0.85
  }
}
```

### Récupération de tous les portefeuilles d'investissement

Récupère la liste de tous les portefeuilles d'investissement avec possibilité de filtrage.

#### Requête

```
GET /portfolios/investment
```

#### Paramètres de requête

| Paramètre   | Type   | Description | Requis |
|-------------|--------|-------------|--------|
| status      | string | Statut du portefeuille ('active', 'inactive', 'pending', 'archived') | Non |
| type        | string | Type d'actif ('equity', 'fixed_income', 'mixed', 'alternative') | Non |
| manager_id  | string | ID du gestionnaire du portefeuille | Non |

#### Réponse

```json
[
  {
    "id": "inv-123456",
    "name": "Portefeuille Tech",
    "type": "investment",
    "status": "active",
    "target_amount": 5000000,
    "target_return": 15,
    "target_sectors": ["technology", "healthcare"],
    "risk_profile": "aggressive",
    "products": [],
    "manager_id": "user-789",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-07-20T14:15:30Z",
    "metrics": {
      "net_value": 5300000,
      "average_return": 12.5,
      "risk_portfolio": 0.65,
      "sharpe_ratio": 1.2,
      "volatility": 0.12,
      "alpha": 0.03,
      "beta": 0.85,
      "asset_allocation": [
        { "type": "technology", "percentage": 60 },
        { "type": "healthcare", "percentage": 40 }
      ],
      "nb_companies": 5,
      "total_invested": 5000000,
      "irr": 12.5
    }
  }
]
```

### Récupération d'un portefeuille d'investissement spécifique

Récupère les détails d'un portefeuille d'investissement par son ID.

#### Requête

```
GET /portfolios/investment/:id
```

#### Réponse

```json
{
  "id": "inv-123456",
  "name": "Portefeuille Tech",
  "type": "investment",
  "status": "active",
  "target_amount": 5000000,
  "target_return": 15,
  "target_sectors": ["technology", "healthcare"],
  "risk_profile": "aggressive",
  "products": [],
  "assets": [
    {
      "id": "asset-789",
      "name": "Actions TechStart SA",
      "companyId": "comp-456",
      "type": "share",
      "acquiredDate": "2025-02-10T00:00:00Z",
      "initialValue": 1000000,
      "currentValue": 1200000,
      "status": "active",
      "created_at": "2025-02-10T10:30:00Z",
      "updated_at": "2025-07-20T14:15:30Z"
    }
  ],
  "manager_id": "user-789",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-07-20T14:15:30Z",
  "metrics": {
    "net_value": 5300000,
    "average_return": 12.5,
    "risk_portfolio": 0.65,
    "sharpe_ratio": 1.2,
    "volatility": 0.12,
    "alpha": 0.03,
    "beta": 0.85,
    "asset_allocation": [
      { "type": "technology", "percentage": 60 },
      { "type": "healthcare", "percentage": 40 }
    ],
    "nb_companies": 5,
    "total_invested": 5000000,
    "irr": 12.5
  }
}
```

### Récupération des performances d'un portefeuille

Récupère les données de performance pour un portefeuille d'investissement spécifique.

#### Requête

```
GET /portfolios/investment/:id/performance
```

#### Paramètres de requête

| Paramètre | Type   | Description | Requis |
|-----------|--------|-------------|--------|
| period    | string | Période d'analyse ('ytd', '1m', '3m', '6m', '1y', '3y', '5y', 'si') | Non |

#### Réponse

```json
{
  "period": "1y",
  "return_value": 12.5,
  "benchmark_return": 10.2,
  "risk_metrics": {
    "volatility": 0.12,
    "sharpe_ratio": 1.2,
    "max_drawdown": -0.15
  }
}
```

### Récupération des actifs d'un portefeuille

Récupère la liste des actifs appartenant à un portefeuille d'investissement.

#### Requête

```
GET /portfolios/investment/assets
```

#### Paramètres de requête

| Paramètre   | Type   | Description | Requis |
|-------------|--------|-------------|--------|
| portfolioId | string | ID du portefeuille | Oui |
| type        | string | Type d'actif ('share', 'bond', 'other') | Non |
| status      | string | Statut ('active', 'exited', 'written-off') | Non |

#### Réponse

```json
[
  {
    "id": "asset-789",
    "name": "Actions TechStart SA",
    "companyId": "comp-456",
    "type": "share",
    "acquiredDate": "2025-02-10T00:00:00Z",
    "initialValue": 1000000,
    "currentValue": 1200000,
    "status": "active",
    "created_at": "2025-02-10T10:30:00Z",
    "updated_at": "2025-07-20T14:15:30Z"
  }
]
```

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard d'investissement sont :

- `InvestmentPerformanceChart` - Affiche la performance des portefeuilles d'investissement
- `TopPortfoliosTable` - Liste des portefeuilles les plus performants
- `RiskMetricsCard` - Carte affichant les principales métriques de risque
- `PortfolioMetricsOverview` - Vue d'ensemble des KPIs du portefeuille

## Opérations CRUD sur les portefeuilles d'investissement

### Création d'un portefeuille d'investissement

#### Requête

```
POST /portfolios/investment
```

#### Corps de la requête

```json
{
  "name": "Nouveau Portefeuille Tech",
  "status": "active",
  "target_amount": 5000000,
  "target_return": 15,
  "target_sectors": ["technology", "healthcare"],
  "risk_profile": "aggressive",
  "products": [],
  "manager_id": "user-789"
}
```

#### Réponse

```json
{
  "id": "inv-123456",
  "name": "Nouveau Portefeuille Tech",
  "type": "investment",
  "status": "active",
  "target_amount": 5000000,
  "target_return": 15,
  "target_sectors": ["technology", "healthcare"],
  "risk_profile": "aggressive",
  "products": [],
  "manager_id": "user-789",
  "created_at": "2025-07-25T10:30:00Z",
  "updated_at": "2025-07-25T10:30:00Z",
  "metrics": {
    "net_value": 0,
    "average_return": 0,
    "risk_portfolio": 0,
    "sharpe_ratio": 0,
    "volatility": 0,
    "alpha": 0,
    "beta": 0,
    "asset_allocation": []
  }
}
```

### Mise à jour d'un portefeuille d'investissement

#### Requête

```
PUT /portfolios/investment/:id
```

#### Corps de la requête

```json
{
  "name": "Portefeuille Tech Modifié",
  "status": "active",
  "target_return": 18
}
```

#### Réponse

```json
{
  "id": "inv-123456",
  "name": "Portefeuille Tech Modifié",
  "type": "investment",
  "status": "active",
  "target_amount": 5000000,
  "target_return": 18,
  "target_sectors": ["technology", "healthcare"],
  "risk_profile": "aggressive",
  "products": [],
  "manager_id": "user-789",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-07-25T11:45:00Z",
  "metrics": {
    "net_value": 5300000,
    "average_return": 12.5,
    "risk_portfolio": 0.65,
    "sharpe_ratio": 1.2,
    "volatility": 0.12,
    "alpha": 0.03,
    "beta": 0.85,
    "asset_allocation": [
      { "type": "technology", "percentage": 60 },
      { "type": "healthcare", "percentage": 40 }
    ]
  }
}
```

### Suppression d'un portefeuille d'investissement

#### Requête

```
DELETE /portfolios/investment/:id
```

#### Réponse

```
204 No Content
```
