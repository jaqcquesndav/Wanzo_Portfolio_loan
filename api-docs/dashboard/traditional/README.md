# Documentation du Dashboard Portefeuille Traditionnel

Cette section détaille les endpoints de l'API spécifiques au tableau de bord pour les portefeuilles traditionnels (crédit classique) de la plateforme Wanzo Portfolio Institution.

## Structure du Dashboard Traditionnel

Le dashboard pour les portefeuilles traditionnels se concentre sur les métriques suivantes :
- Performance des crédits accordés
- Répartition par secteur d'activité
- Analyse des risques et retards de paiement
- Prévisions de remboursement

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
      "amountDue": 15000,
      "lastPaymentDate": "2025-06-01T00:00:00Z"
    }
  ]
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

## Composants UI associés

Les principaux composants UI utilisés pour afficher les données du dashboard traditionnel sont :

- `PortfolioPerformanceChart` - Affiche la performance des portefeuilles traditionnels
- `SectorDistributionChart` - Montre la répartition des crédits par secteur
- `PaymentDelayIndicator` - Indicateur visuel des retards de paiement
- `RepaymentForecastTable` - Tableau des prévisions de remboursement
