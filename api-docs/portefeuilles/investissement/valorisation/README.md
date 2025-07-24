# API de Valorisation - Portefeuille d'Investissement

Cette API permet de gérer la valorisation des actifs dans un portefeuille d'investissement.

## Points d'accès

### Obtenir la valorisation actuelle
```
GET /api/portfolio/investment/valuation
```

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant du portefeuille (optionnel) |
| currency | string | Devise pour la conversion (par défaut: devise du portefeuille) |
| includeDetails | boolean | Inclure les détails par actif (par défaut: false) |

#### Réponse
```json
{
  "success": true,
  "data": {
    "portfolioId": "port-inv-001",
    "portfolioName": "Portefeuille Actions & Obligations",
    "asOfDate": "2023-07-24T16:30:00Z",
    "baseCurrency": "XOF",
    "totalValue": 125000000,
    "initialInvestment": 100000000,
    "profitLoss": 25000000,
    "profitLossPercentage": 25.0,
    "assetAllocation": {
      "STOCK": {
        "value": 62500000,
        "percentage": 50.0,
        "profitLoss": 15000000,
        "profitLossPercentage": 31.6
      },
      "BOND": {
        "value": 37500000,
        "percentage": 30.0,
        "profitLoss": 7500000,
        "profitLossPercentage": 25.0
      },
      "ETF": {
        "value": 18750000,
        "percentage": 15.0,
        "profitLoss": 1875000,
        "profitLossPercentage": 11.1
      },
      "FUND": {
        "value": 6250000,
        "percentage": 5.0,
        "profitLoss": 625000,
        "profitLossPercentage": 11.1
      }
    },
    "sectorAllocation": {
      "Finance": {
        "value": 31250000,
        "percentage": 25.0
      },
      "Technologie": {
        "value": 25000000,
        "percentage": 20.0
      },
      "Gouvernement": {
        "value": 37500000,
        "percentage": 30.0
      },
      "Global": {
        "value": 18750000,
        "percentage": 15.0
      },
      "Consommation": {
        "value": 12500000,
        "percentage": 10.0
      }
    },
    "geographicAllocation": {
      "UEMOA": {
        "value": 62500000,
        "percentage": 50.0
      },
      "Europe": {
        "value": 31250000,
        "percentage": 25.0
      },
      "Amérique du Nord": {
        "value": 18750000,
        "percentage": 15.0
      },
      "Asie": {
        "value": 12500000,
        "percentage": 10.0
      }
    },
    "assets": [
      // Uniquement présent si includeDetails=true
      {
        "id": "asset-001",
        "name": "Actions Société Générale",
        "type": "STOCK",
        "value": 25000000,
        "percentage": 20.0,
        "profitLoss": 5000000,
        "profitLossPercentage": 25.0
      },
      // ...autres actifs
    ]
  }
}
```

### Obtenir l'historique de valorisation
```
GET /api/portfolio/investment/valuation/history
```

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant du portefeuille (optionnel) |
| period | string | Période ('1w', '1m', '3m', '6m', '1y', '5y', 'ytd', 'all', par défaut: '1m') |
| interval | string | Intervalle ('1d', '1w', '1m', par défaut dépend de la période) |
| currency | string | Devise pour la conversion (par défaut: devise du portefeuille) |

#### Réponse
```json
{
  "success": true,
  "data": {
    "portfolioId": "port-inv-001",
    "portfolioName": "Portefeuille Actions & Obligations",
    "period": "1m",
    "interval": "1d",
    "baseCurrency": "XOF",
    "history": [
      {
        "date": "2023-06-24T00:00:00Z",
        "value": 115000000,
        "dailyChange": 1250000,
        "dailyChangePercentage": 1.1
      },
      {
        "date": "2023-06-25T00:00:00Z",
        "value": 116500000,
        "dailyChange": 1500000,
        "dailyChangePercentage": 1.3
      },
      // ...autres jours
      {
        "date": "2023-07-23T00:00:00Z",
        "value": 123750000,
        "dailyChange": 500000,
        "dailyChangePercentage": 0.41
      },
      {
        "date": "2023-07-24T00:00:00Z",
        "value": 125000000,
        "dailyChange": 1250000,
        "dailyChangePercentage": 1.01
      }
    ],
    "summary": {
      "startValue": 115000000,
      "endValue": 125000000,
      "absoluteChange": 10000000,
      "percentageChange": 8.7,
      "highValue": 125000000,
      "highDate": "2023-07-24T00:00:00Z",
      "lowValue": 114500000,
      "lowDate": "2023-06-28T00:00:00Z",
      "volatility": 1.2
    }
  }
}
```

### Ajouter une valorisation manuelle
```
POST /api/portfolio/investment/valuation/manual
```

#### Corps de la requête
```json
{
  "portfolioId": "port-inv-001",
  "asOfDate": "2023-07-24T16:30:00Z",
  "assetValues": [
    {
      "assetId": "asset-001",
      "price": 28.50,
      "value": 25000000
    },
    {
      "assetId": "asset-002",
      "price": 10300,
      "value": 37500000
    },
    // ...autres actifs
  ],
  "notes": "Valorisation manuelle suite à l'indisponibilité des prix de marché"
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "val-manual-001",
    "portfolioId": "port-inv-001",
    "asOfDate": "2023-07-24T16:30:00Z",
    "totalValue": 125000000,
    "isManual": true,
    "notes": "Valorisation manuelle suite à l'indisponibilité des prix de marché",
    "createdAt": "2023-07-24T16:35:00Z"
  }
}
```

### Obtenir les métriques de performance
```
GET /api/portfolio/investment/valuation/performance
```

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant du portefeuille (optionnel) |
| period | string | Période ('1m', '3m', '6m', '1y', '3y', '5y', 'ytd', 'all', par défaut: '1y') |
| benchmark | string | Indice de référence (optionnel) |
| currency | string | Devise pour la conversion (par défaut: devise du portefeuille) |

#### Réponse
```json
{
  "success": true,
  "data": {
    "portfolioId": "port-inv-001",
    "portfolioName": "Portefeuille Actions & Obligations",
    "period": "1y",
    "baseCurrency": "XOF",
    "metrics": {
      "totalReturn": 18.5,
      "annualizedReturn": 18.5,
      "volatility": 12.8,
      "sharpeRatio": 1.32,
      "maxDrawdown": 8.7,
      "alpha": 2.3,
      "beta": 0.85,
      "informationRatio": 0.76,
      "trackingError": 3.2
    },
    "periodReturns": {
      "1d": 1.01,
      "1w": 1.75,
      "1m": 8.7,
      "3m": 11.2,
      "6m": 15.3,
      "ytd": 16.7,
      "1y": 18.5,
      "3y": null,
      "5y": null,
      "inception": 25.0
    },
    "benchmark": {
      "name": "BRVM Composite",
      "returns": {
        "1d": 0.8,
        "1w": 1.2,
        "1m": 7.1,
        "3m": 9.8,
        "6m": 13.2,
        "ytd": 14.5,
        "1y": 15.7
      },
      "outperformance": {
        "1d": 0.21,
        "1w": 0.55,
        "1m": 1.6,
        "3m": 1.4,
        "6m": 2.1,
        "ytd": 2.2,
        "1y": 2.8
      }
    },
    "monthlyReturns": {
      "2023": {
        "1": 1.5,
        "2": 1.8,
        "3": 0.9,
        "4": 1.2,
        "5": 1.7,
        "6": 2.1,
        "7": 1.5
      },
      "2022": {
        "1": 0.8,
        "2": -0.5,
        "3": 1.1,
        "4": 1.3,
        "5": 0.7,
        "6": -0.2,
        "7": 0.9,
        "8": 1.1,
        "9": -0.8,
        "10": 1.2,
        "11": 1.5,
        "12": 0.9
      }
    }
  }
}
```

### Obtenir les prévisions de valorisation
```
GET /api/portfolio/investment/valuation/forecast
```

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant du portefeuille (optionnel) |
| horizon | string | Horizon de prévision ('1y', '3y', '5y', '10y', par défaut: '5y') |
| scenarios | string | Scénarios ('optimistic', 'base', 'pessimistic', 'all', par défaut: 'all') |
| includeContributions | boolean | Inclure les contributions planifiées (par défaut: false) |

#### Réponse
```json
{
  "success": true,
  "data": {
    "portfolioId": "port-inv-001",
    "portfolioName": "Portefeuille Actions & Obligations",
    "currentValue": 125000000,
    "horizon": "5y",
    "forecastDate": "2028-07-24T00:00:00Z",
    "baseCurrency": "XOF",
    "scenarios": {
      "optimistic": {
        "expectedReturn": 12.0,
        "volatility": 14.0,
        "finalValue": 220312500,
        "valueGrowth": 95312500,
        "annualizedReturn": 12.0,
        "probability": 25,
        "yearlyProjections": [
          {
            "year": 1,
            "expectedValue": 140000000
          },
          {
            "year": 2,
            "expectedValue": 156800000
          },
          {
            "year": 3,
            "expectedValue": 175616000
          },
          {
            "year": 4,
            "expectedValue": 196689920
          },
          {
            "year": 5,
            "expectedValue": 220312500
          }
        ]
      },
      "base": {
        "expectedReturn": 8.0,
        "volatility": 12.0,
        "finalValue": 183898438,
        "valueGrowth": 58898438,
        "annualizedReturn": 8.0,
        "probability": 50,
        "yearlyProjections": [
          {
            "year": 1,
            "expectedValue": 135000000
          },
          {
            "year": 2,
            "expectedValue": 145800000
          },
          {
            "year": 3,
            "expectedValue": 157464000
          },
          {
            "year": 4,
            "expectedValue": 170061120
          },
          {
            "year": 5,
            "expectedValue": 183898438
          }
        ]
      },
      "pessimistic": {
        "expectedReturn": 4.0,
        "volatility": 10.0,
        "finalValue": 152103271,
        "valueGrowth": 27103271,
        "annualizedReturn": 4.0,
        "probability": 25,
        "yearlyProjections": [
          {
            "year": 1,
            "expectedValue": 130000000
          },
          {
            "year": 2,
            "expectedValue": 135200000
          },
          {
            "year": 3,
            "expectedValue": 140608000
          },
          {
            "year": 4,
            "expectedValue": 146232320
          },
          {
            "year": 5,
            "expectedValue": 152103271
          }
        ]
      }
    }
  }
}
```

## Modèles de données

### Valorisation
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique de la valorisation |
| portfolioId | string | Identifiant du portefeuille |
| asOfDate | string | Date de valorisation (format ISO) |
| totalValue | number | Valeur totale du portefeuille |
| initialInvestment | number | Investissement initial |
| profitLoss | number | Gain/perte absolue |
| profitLossPercentage | number | Gain/perte en pourcentage |
| assetAllocation | object | Répartition par type d'actif |
| sectorAllocation | object | Répartition par secteur |
| geographicAllocation | object | Répartition géographique |
| isManual | boolean | Si la valorisation est manuelle |
| notes | string | Notes sur la valorisation (optionnel) |
| createdAt | string | Date de création (format ISO) |

### Historique de valorisation
| Champ | Type | Description |
|-------|------|-------------|
| date | string | Date (format ISO) |
| value | number | Valeur du portefeuille |
| dailyChange | number | Variation quotidienne absolue |
| dailyChangePercentage | number | Variation quotidienne en pourcentage |

### Métriques de performance
| Champ | Type | Description |
|-------|------|-------------|
| totalReturn | number | Rendement total sur la période |
| annualizedReturn | number | Rendement annualisé |
| volatility | number | Volatilité (écart-type annualisé) |
| sharpeRatio | number | Ratio de Sharpe |
| maxDrawdown | number | Baisse maximale |
| alpha | number | Alpha (vs benchmark) |
| beta | number | Bêta (vs benchmark) |
| informationRatio | number | Ratio d'information |
| trackingError | number | Erreur de suivi |

### Prévision
| Champ | Type | Description |
|-------|------|-------------|
| expectedReturn | number | Rendement attendu (%) |
| volatility | number | Volatilité attendue (%) |
| finalValue | number | Valeur finale projetée |
| valueGrowth | number | Croissance absolue projetée |
| annualizedReturn | number | Rendement annualisé projeté |
| probability | number | Probabilité du scénario (%) |
| yearlyProjections | array | Projections annuelles |
