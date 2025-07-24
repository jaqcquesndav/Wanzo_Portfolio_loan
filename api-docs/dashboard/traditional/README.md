# Documentation du Dashboard Portefeuille Traditionnel

Cette section détaille les endpoints de l'API spécifiques au tableau de bord pour les portefeuilles traditionnels (crédit classique) de la plateforme Wanzo Portfolio Institution. Cette documentation est destinée à l'utilisation par les équipes de développement backend et frontend.

## Structure du Dashboard Traditionnel

Le dashboard pour les portefeuilles traditionnels se concentre sur les métriques suivantes :
- Performance des crédits accordés
- Répartition par secteur d'activité
- Analyse des risques et retards de paiement
- Prévisions de remboursement

## Types de Données Principaux

Les types de données principaux utilisés dans les API sont les suivants:

```typescript
type PortfolioType = 'traditional' | 'investment' | 'leasing';
type PortfolioStatus = 'active' | 'inactive' | 'pending' | 'archived';

interface TraditionalPortfolio {
  id: string;
  name: string;
  type: 'traditional'; // Type spécifique 'traditional'
  status: PortfolioStatus;
  description: string;
  manager_id: string;
  institution_id: string;
  target_amount: number;
  target_return: number;
  target_sectors: string[];
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  products: FinancialProduct[];
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
    // Métriques spécifiques au crédit traditionnel
    nb_credits?: number;
    total_credits?: number;
    avg_credit?: number;
    nb_clients?: number;
    taux_rotation?: number;
    taux_provision?: number;
    taux_recouvrement?: number;
    balance_AGE?: {
      total: number;
      echeance_0_30: number;
      echeance_31_60: number;
      echeance_61_90: number;
      echeance_91_plus: number;
    };
    taux_impayes?: number;
    taux_couverture?: number;
  };
}

interface FinancialProduct {
  id: string;
  name: string;
  type: 'credit' | 'savings' | 'investment';
  description: string;
  minAmount: number;
  maxAmount: number;
  duration: {
    min: number;
    max: number;
  };
  interestRate: {
    type: 'fixed' | 'variable';
    value?: number;
    min?: number;
    max?: number;
  };
  requirements: string[];
  acceptedGuarantees?: string[];
  isPublic: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

## Endpoints spécifiques

### Récupération des KPIs du portefeuille traditionnel

Récupère les indicateurs clés de performance (KPIs) spécifiques aux portefeuilles traditionnels.

#### Requête

```
GET /dashboard/portfolio-type/traditional/kpis
```

#### Réponse

```json
{
  "type": "traditional",
  "count": 12,
  "totalValue": 5000000,
  "growth": 2.8,
  "avgRiskScore": 2.4,
  "performance": {
    "monthly": 0.8,
    "quarterly": 2.1,
    "yearly": 7.5
  },
  "sectorDistribution": {
    "retail": 25,
    "manufacturing": 30,
    "services": 20,
    "agriculture": 15,
    "other": 10
  },
  "paymentStatus": {
    "onTime": 82,
    "late30Days": 12,
    "late60Days": 4,
    "late90Days": 2
  }
}
```

### Analyse des retards de paiement

Récupère les données détaillées sur les retards de paiement pour les portefeuilles traditionnels.

#### Requête

```
GET /dashboard/portfolio-type/traditional/payment-delays
```

#### Réponse

```json
{
  "summary": {
    "totalContracts": 145,
    "contractsWithDelays": 26,
    "delayPercentage": 17.9,
    "averageDelayDays": 24
  },
  "byTimeRange": [
    {
      "period": "Q1 2025",
      "delayPercentage": 15.2,
      "averageDelayDays": 22
    },
    {
      "period": "Q2 2025",
      "delayPercentage": 16.8,
      "averageDelayDays": 23
    },
    {
      "period": "Q3 2025",
      "delayPercentage": 17.9,
      "averageDelayDays": 24
    }
  ],
  "topDelayedContracts": [
    {
      "contractId": "contract-12345",
      "clientName": "Société ABC",
      "delayDays": 65,
      "amountDue": 25000,
      "lastPaymentDate": "2025-05-15T00:00:00Z"
    },
    {
      "contractId": "contract-12346",
      "clientName": "Entreprise XYZ",
      "delayDays": 45,
      "amountDue": 18000,
      "lastPaymentDate": "2025-06-01T00:00:00Z"
    }
  ]
}
```

### Récupération de tous les portefeuilles traditionnels

Récupère la liste de tous les portefeuilles traditionnels avec possibilité de filtrage.

#### Requête

```
GET /portfolios/traditional
```

#### Paramètres de requête

| Paramètre   | Type   | Description | Requis |
|-------------|--------|-------------|--------|
| status      | string | Statut du portefeuille ('active', 'inactive', 'pending', 'archived') | Non |
| riskProfile | string | Profil de risque ('conservative', 'moderate', 'aggressive') | Non |
| minAmount   | number | Montant minimum | Non |
| sector      | string | Secteur d'activité | Non |

#### Réponse

```json
[
  {
    "id": "trad-123456",
    "name": "Portefeuille PME",
    "type": "traditional",
    "status": "active",
    "description": "Portefeuille de crédits pour les petites et moyennes entreprises",
    "manager_id": "user-789",
    "institution_id": "inst-123",
    "target_amount": 10000000,
    "target_return": 8,
    "target_sectors": ["retail", "manufacturing", "services"],
    "risk_profile": "moderate",
    "products": [
      {
        "id": "prod-123",
        "name": "Crédit PME Expansion",
        "type": "credit",
        "description": "Crédit pour l'expansion des PME",
        "minAmount": 500000,
        "maxAmount": 5000000,
        "duration": {
          "min": 12,
          "max": 60
        },
        "interestRate": {
          "type": "fixed",
          "value": 8.5
        },
        "requirements": ["2 ans d'activité", "Bilan financier"],
        "acceptedGuarantees": ["Équipement", "Immobilier"],
        "isPublic": true,
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-07-20T14:15:30Z",
    "metrics": {
      "net_value": 9800000,
      "average_return": 7.8,
      "risk_portfolio": 0.5,
      "sharpe_ratio": 0.9,
      "volatility": 0.05,
      "alpha": 0.01,
      "beta": 0.6,
      "asset_allocation": [
        { "type": "retail", "percentage": 30 },
        { "type": "manufacturing", "percentage": 45 },
        { "type": "services", "percentage": 25 }
      ],
      "nb_credits": 28,
      "total_credits": 9800000,
      "avg_credit": 350000,
      "nb_clients": 22,
      "taux_rotation": 1.2,
      "taux_provision": 2.5,
      "taux_recouvrement": 97.8,
      "balance_AGE": {
        "total": 9800000,
        "echeance_0_30": 8900000,
        "echeance_31_60": 600000,
        "echeance_61_90": 200000,
        "echeance_91_plus": 100000
      },
      "taux_impayes": 3.1,
      "taux_couverture": 120
    }
  }
]
```

### Récupération d'un portefeuille traditionnel spécifique

Récupère les détails d'un portefeuille traditionnel par son ID.

#### Requête

```
GET /portfolios/traditional/:id
```

#### Réponse

```json
{
  "id": "trad-123456",
  "name": "Portefeuille PME",
  "type": "traditional",
  "status": "active",
  "description": "Portefeuille de crédits pour les petites et moyennes entreprises",
  "manager_id": "user-789",
  "institution_id": "inst-123",
  "target_amount": 10000000,
  "target_return": 8,
  "target_sectors": ["retail", "manufacturing", "services"],
  "risk_profile": "moderate",
  "products": [
    {
      "id": "prod-123",
      "name": "Crédit PME Expansion",
      "type": "credit",
      "description": "Crédit pour l'expansion des PME",
      "minAmount": 500000,
      "maxAmount": 5000000,
      "duration": {
        "min": 12,
        "max": 60
      },
      "interestRate": {
        "type": "fixed",
        "value": 8.5
      },
      "requirements": ["2 ans d'activité", "Bilan financier"],
      "acceptedGuarantees": ["Équipement", "Immobilier"],
      "isPublic": true,
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-07-20T14:15:30Z",
  "metrics": {
    "net_value": 9800000,
    "average_return": 7.8,
    "risk_portfolio": 0.5,
    "sharpe_ratio": 0.9,
    "volatility": 0.05,
    "alpha": 0.01,
    "beta": 0.6,
    "asset_allocation": [
      { "type": "retail", "percentage": 30 },
      { "type": "manufacturing", "percentage": 45 },
      { "type": "services", "percentage": 25 }
    ],
    "nb_credits": 28,
    "total_credits": 9800000,
    "avg_credit": 350000,
    "nb_clients": 22,
    "taux_rotation": 1.2,
    "taux_provision": 2.5,
    "taux_recouvrement": 97.8
  }
}
```
      "contractId": "contract-12346",
      "clientName": "Entreprise XYZ",
      "delayDays": 45,
      "amountDue": 18000,
      "lastPaymentDate": "2025-06-01T00:00:00Z"
    }
  ]
}
```

### Récupération des métriques du tableau de bord

Récupère des métriques détaillées pour le dashboard du portefeuille traditionnel.

#### Requête

```
GET /dashboard/portfolio-type/traditional/kpis
```

#### Réponse

```json
{
  "type": "traditional",
  "count": 12,
  "totalValue": 10000000,
  "growth": 10.2,
  "avgRiskScore": 2.4,
  "performance": {
    "monthly": 0.8,
    "quarterly": 2.1,
    "yearly": 7.5
  },
  "sectorDistribution": {
    "retail": 25,
    "manufacturing": 30,
    "services": 20,
    "agriculture": 15,
    "other": 10
  },
  "paymentStatus": {
    "onTime": 82,
    "late30Days": 12,
    "late60Days": 4,
    "late90Days": 2
  },
  "metrics": {
    "net_value": 9800000,
    "average_return": 7.8,
    "risk_portfolio": 0.5,
    "sharpe_ratio": 0.9,
    "volatility": 0.05,
    "alpha": 0.01,
    "beta": 0.6,
    "nb_credits": 28,
    "total_credits": 9800000,
    "avg_credit": 350000,
    "nb_clients": 22,
    "taux_rotation": 1.2,
    "taux_provision": 2.5,
    "taux_recouvrement": 97.8,
    "taux_impayes": 3.1,
    "taux_couverture": 120
  }
}
```

### Prévisions de remboursement

Récupère les prévisions de remboursement pour les portefeuilles traditionnels.

#### Requête

```
GET /dashboard/portfolio-type/traditional/repayment-forecast
```

#### Réponse

```json
{
  "monthly": [
    {
      "month": "Août 2025",
      "principal": 125000,
      "interest": 35000,
      "total": 160000
    },
    {
      "month": "Septembre 2025",
      "principal": 130000,
      "interest": 33000,
      "total": 163000
    }
  ],
  "quarterly": [
    {
      "quarter": "Q3 2025",
      "principal": 380000,
      "interest": 102000,
      "total": 482000
    },
    {
      "quarter": "Q4 2025",
      "principal": 390000,
      "interest": 98000,
      "total": 488000
    }
  ],
  "annual": {
    "year": "2025",
    "principal": 1520000,
    "interest": 410000,
    "total": 1930000
  }
}
```

## Typescripts Types

```typescript
// Types principaux utilisés dans le dashboard traditionnel
interface TraditionalDashboardMetrics {
  assets: {
    total: number;
    change: number;
    distribution: {
      credit: number;
      microfinance: number;
      treasury: number;
    };
    creditUtilization: number;
  };
  performance: {
    global: number;
    change: number;
    monthly: Array<{
      month: string;
      value: number;
      benchmark: number;
    }>;
  };
  risk: {
    level: string;
    sharpeRatio: number;
    delinquencyRate: number;
    provisionRate: number;
    concentrationRisk: number;
  };
  clients: {
    active: number;
    change: number;
    newThisMonth: number;
    churnRate: number;
  };
  paymentStatus?: {
    onTime: number;
    late30Days: number;
    late60Days: number;
    late90Days: number;
  };
}
```

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard traditionnel sont :

- `PortfolioPerformanceChart` - Affiche la performance des portefeuilles traditionnels
- `SectorDistributionChart` - Montre la répartition des crédits par secteur
- `PaymentDelayIndicator` - Indicateur visuel des retards de paiement
- `RepaymentForecastTable` - Tableau des prévisions de remboursement
