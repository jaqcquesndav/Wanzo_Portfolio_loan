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
interface InvestmentDashboardMetrics {
  assets: InvestmentAssetMetrics;
  performance: BasePerformanceMetrics;
  risk: InvestmentRiskMetrics;
  clients: BaseClientMetrics;
  benchmarkComparison?: {
    ytd: number;
    oneYear: number;
    threeYears: number;
    fiveYears: number;
  };
}

interface InvestmentAssetMetrics extends BaseAssetMetrics {
  distribution: {
    equities: number;
    bonds: number;
    alternatives: number;
    cash: number;
  };
  liquidity: number;
}

interface InvestmentRiskMetrics extends BaseRiskMetrics {
  volatility: number;
  var95: number;
  beta: number;
  maxDrawdown: number;
}

interface InvestmentPortfolio {
  id: string;
  name: string;
  type: 'investment';
  status: 'active' | 'inactive' | 'pending' | 'archived';
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
GET /dashboard/portfolio/{portfolioId}/performance?type=investment&period={period}
```

#### Paramètres de requête

| Paramètre   | Type   | Description | Requis |
|-------------|--------|-------------|--------|
| portfolioId | string | ID du portefeuille | Oui |
| type        | string | Type de portefeuille (doit être 'investment' ici) | Oui |
| period      | string | Période d'analyse ('daily', 'weekly', 'monthly', 'quarterly', 'yearly') | Oui |

#### Réponse

```json
{
  "id": "port-123",
  "name": "Portefeuille Tech",
  "type": "investment",
  "period": "monthly",
  "data": [
    { "date": "2025-01-01", "value": 1150000 },
    { "date": "2025-02-01", "value": 1180000 },
    { "date": "2025-03-01", "value": 1210000 },
    { "date": "2025-04-01", "value": 1240000 },
    { "date": "2025-05-01", "value": 1260000 },
    { "date": "2025-06-01", "value": 1300000 }
  ],
  "metrics": {
    "totalReturn": 13.2,
    "annualizedReturn": 24.5,
    "volatility": 8.5,
    "sharpeRatio": 1.2,
    "maxDrawdown": 3.2
  }
}
```

### Récupération des tendances de portefeuille

Récupère les données de tendance pour tous les portefeuilles, y compris le type investment.

#### Requête

```
GET /dashboard/trends?period={period}
```

#### Paramètres de requête

| Paramètre | Type   | Description | Requis |
|-----------|--------|-------------|--------|
| period    | string | Période d'analyse ('daily', 'weekly', 'monthly', 'quarterly', 'yearly') | Oui |

#### Réponse

```json
{
  "period": "monthly",
  "trends": {
    "traditional": {
      "growth": 4.2,
      "data": [/* ... */]
    },
    "investment": {
      "growth": 7.5,
      "data": [
        { "date": "2025-01-01", "value": 3250000 },
        { "date": "2025-02-01", "value": 3320000 },
        { "date": "2025-03-01", "value": 3370000 },
        { "date": "2025-04-01", "value": 3430000 },
        { "date": "2025-05-01", "value": 3470000 },
        { "date": "2025-06-01", "value": 3500000 }
      ]
    },
    "leasing": {
      "growth": 3.5,
      "data": [/* ... */]
    }
  }
}
```

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard d'investissement sont :

- `PortfolioPerformanceChart` - Affiche la performance des portefeuilles d'investissement
- `AssetAllocationPieChart` - Montre la répartition des actifs par type
- `VolatilityChart` - Montre l'évolution de la volatilité sur une période
- `BenchmarkComparisonChart` - Compare la performance avec les indices de référence

Ces composants utilisent les données fournies par les endpoints API décrits ci-dessus.

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
