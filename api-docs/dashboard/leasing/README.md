# Documentation du Dashboard Portefeuille de Leasing

Cette section détaille les endpoints de l'API spécifiques au tableau de bord pour les portefeuilles de leasing de la plateforme Wanzo Portfolio Institution.

## Structure du Dashboard de Leasing

Le dashboard pour les portefeuilles de leasing se concentre sur les métriques suivantes :
- Performance des contrats de leasing
- Répartition par type d'équipement
- Suivi de l'état des actifs et maintenance
- Analyse des taux de défaut et des valeurs résiduelles

## Types de Données Principaux

Les types de données principaux utilisés dans les API sont les suivants:

```typescript
interface LeasingDashboardMetrics {
  assets: LeasingAssetMetrics;
  performance: BasePerformanceMetrics;
  risk: LeasingRiskMetrics;
  clients: BaseClientMetrics;
  equipmentStatus?: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

interface LeasingAssetMetrics extends BaseAssetMetrics {
  distribution: {
    vehicles: number;
    machinery: number;
    it: number;
    office: number;
  };
  residualValue: number;
  utilizationRate: number;
}

interface LeasingRiskMetrics extends BaseRiskMetrics {
  maintenanceRisk: number;
  defaultRate: number;
  assetDepreciation: number;
}
```

## Endpoints spécifiques

### Récupération des KPIs du portefeuille de leasing

Récupère les indicateurs clés de performance (KPIs) spécifiques aux portefeuilles de leasing.

#### Requête

```
GET /dashboard/portfolio-type/leasing/kpis
```

#### Réponse

```json
{
  "type": "leasing",
  "count": 5,
  "totalValue": 1200000,
  "growth": 3.5,
  "avgRiskScore": 2.2,
  "performance": {
    "monthly": 0.5,
    "quarterly": 1.8,
    "yearly": 5.5
  },
  "topPortfolios": [
    {
      "id": "port-789",
      "name": "Flotte Véhicules XYZ",
      "value": 450000,
      "growth": 2.1
    },
    {
      "id": "port-012",
      "name": "Équipement Industriel ABC",
      "value": 350000,
      "growth": 1.5
    }
  ],
  "metrics": {
    "maintenanceRisk": 8.2,
    "defaultRate": 4.3,
    "assetDepreciation": 12.7,
    "utilizationRate": 82.5
  }
}
```

### Récupération des données de performance pour un portefeuille

Récupère les données de performance pour un portefeuille de leasing spécifique.

#### Requête

```
GET /dashboard/portfolio/{portfolioId}/performance?type=leasing&period={period}
```

#### Paramètres de requête

| Paramètre   | Type   | Description | Requis |
|-------------|--------|-------------|--------|
| portfolioId | string | ID du portefeuille | Oui |
| type        | string | Type de portefeuille (doit être 'leasing' ici) | Oui |
| period      | string | Période d'analyse ('daily', 'weekly', 'monthly', 'quarterly', 'yearly') | Oui |

#### Réponse

```json
{
  "id": "port-789",
  "name": "Flotte Véhicules XYZ",
  "type": "leasing",
  "period": "monthly",
  "data": [
    { "date": "2025-01-01", "value": 425000 },
    { "date": "2025-02-01", "value": 430000 },
    { "date": "2025-03-01", "value": 435000 },
    { "date": "2025-04-01", "value": 440000 },
    { "date": "2025-05-01", "value": 445000 },
    { "date": "2025-06-01", "value": 450000 }
  ],
  "metrics": {
    "totalReturn": 5.8,
    "annualizedReturn": 12.1,
    "volatility": 2.1,
    "sharpeRatio": 1.8,
    "maxDrawdown": 0.5
  }
}
```

### Récupération des tendances de portefeuille

Récupère les données de tendance pour tous les portefeuilles, y compris le type leasing.

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
      "data": [/* ... */]
    },
    "leasing": {
      "growth": 3.5,
      "data": [
        { "date": "2025-01-01", "value": 1150000 },
        { "date": "2025-02-01", "value": 1160000 },
        { "date": "2025-03-01", "value": 1170000 },
        { "date": "2025-04-01", "value": 1180000 },
        { "date": "2025-05-01", "value": 1190000 },
        { "date": "2025-06-01", "value": 1200000 }
      ]
    }
  }
}
```

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard de leasing sont :

- `PortfolioPerformanceChart` - Affiche la performance des portefeuilles de leasing
- `EquipmentDistributionPieChart` - Montre la répartition des équipements par type
- `EquipmentStatusGauge` - Jauge indiquant l'état général des équipements

Ces composants utilisent les données fournies par les endpoints API décrits ci-dessus.

#### Réponse

```json
{
  "upcomingEnds": {
    "next30Days": 5,
    "next90Days": 12,
    "next180Days": 20,
    "estimatedResidualValue": 250000
  },
  "endOptions": {
    "renewalProbability": 65,
    "purchaseProbability": 20,
    "returnProbability": 15
  },
  "contractsEndingDetail": [
    {
      "contractId": "lease-12345",
      "clientName": "Société ABC",
      "equipment": "Flotte véhicules",
      "endDate": "2025-08-30T00:00:00Z",
      "residualValue": 45000,
      "clientIntention": "renewal",
      "renewalOffer": {
        "prepared": true,
        "offerAmount": 3500,
        "offerDuration": 24
      }
    },
    {
      "contractId": "lease-12346",
      "clientName": "Entreprise XYZ",
      "equipment": "Machines de production",
      "endDate": "2025-09-15T00:00:00Z",
      "residualValue": 35000,
      "clientIntention": "purchase",
      "purchaseOffer": {
        "prepared": true,
        "offerAmount": 32000
      }
    }
  ]
}
```

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard de leasing sont :

- `PortfolioPerformanceChart` - Affiche la performance des portefeuilles de leasing
- `EquipmentDistributionPieChart` - Montre la répartition des équipements par type
- `MaintenanceScheduleCalendar` - Calendrier des maintenances prévues
- `ContractEndTable` - Tableau des contrats arrivant à échéance
- `EquipmentStatusGauge` - Jauge indiquant l'état général des équipements
