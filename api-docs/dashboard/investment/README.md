# Documentation du Dashboard Portefeuille d'Investissement

Cette section détaille les endpoints de l'API spécifiques au tableau de bord pour les portefeuilles d'investissement de la plateforme Wanzo Portfolio Institution.

## Structure du Dashboard d'Investissement

Le dashboard pour les portefeuilles d'investissement se concentre sur les métriques suivantes :
- Performance des investissements (rendement)
- Répartition par classe d'actifs
- Analyse de volatilité et de risque
- Comparaison avec les benchmarks du marché

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
  "assetAllocation": {
    "equities": 45,
    "bonds": 30,
    "alternatives": 15,
    "cash": 10
  },
  "riskMetrics": {
    "volatility": 8.5,
    "sharpeRatio": 1.2,
    "maxDrawdown": 12.5,
    "beta": 0.85
  }
}
```

### Performance par classe d'actifs

Récupère les données détaillées sur la performance par classe d'actifs.

#### Requête

```
GET /dashboard/portfolio-type/investment/asset-class-performance
```

#### Réponse

```json
{
  "timeRange": "YTD",
  "assetClasses": [
    {
      "name": "Equities",
      "allocation": 45,
      "performance": {
        "absolute": 8.5,
        "relativeToBenchmark": 1.2
      },
      "breakdown": [
        {
          "name": "Large Cap",
          "allocation": 25,
          "performance": 9.2
        },
        {
          "name": "Mid Cap",
          "allocation": 15,
          "performance": 7.5
        },
        {
          "name": "Small Cap",
          "allocation": 5,
          "performance": 6.8
        }
      ]
    },
    {
      "name": "Bonds",
      "allocation": 30,
      "performance": {
        "absolute": 2.1,
        "relativeToBenchmark": -0.3
      },
      "breakdown": [
        {
          "name": "Government",
          "allocation": 15,
          "performance": 1.5
        },
        {
          "name": "Corporate",
          "allocation": 10,
          "performance": 2.8
        },
        {
          "name": "High Yield",
          "allocation": 5,
          "performance": 3.5
        }
      ]
    }
  ]
}
```

### Comparaison avec les benchmarks

Récupère les données de comparaison avec les benchmarks de marché pertinents.

#### Requête

```
GET /dashboard/portfolio-type/investment/benchmark-comparison
```

#### Réponse

```json
{
  "benchmarks": [
    {
      "name": "CAC 40",
      "performance": {
        "1m": 0.8,
        "3m": 2.5,
        "ytd": 10.2,
        "1y": 15.5
      },
      "portfolioRelative": {
        "1m": 0.4,
        "3m": 1.0,
        "ytd": 2.6,
        "1y": 2.7
      }
    },
    {
      "name": "Euro Stoxx 50",
      "performance": {
        "1m": 0.6,
        "3m": 2.2,
        "ytd": 9.8,
        "1y": 14.2
      },
      "portfolioRelative": {
        "1m": 0.6,
        "3m": 1.3,
        "ytd": 3.0,
        "1y": 4.0
      }
    }
  ]
}
```

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard d'investissement sont :

- `PortfolioPerformanceChart` - Affiche la performance des portefeuilles d'investissement
- `AssetAllocationPieChart` - Montre la répartition des investissements par classe d'actifs
- `RiskMetricsCard` - Carte affichant les principales métriques de risque
- `BenchmarkComparisonTable` - Tableau comparatif avec les indices de référence
