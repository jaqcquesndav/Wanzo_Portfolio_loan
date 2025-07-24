# Centrale de Risque

Ce document décrit les endpoints pour la gestion des données de la centrale de risque dans l'API Wanzo Portfolio Institution.

## Vérification d'un client

Vérifie les antécédents de crédit d'un client dans la centrale de risque.

**Endpoint** : `GET /portfolio_inst/risk/central-bank`

**Paramètres de requête** :
- `clientId` : Identifiant unique du client
- `clientType` (optionnel) : Type de client (individual, company)
- `identificationNumber` (optionnel) : Numéro d'identification (NRC, CIF, etc.)
- `fullCheck` (optionnel) : Effectuer une vérification complète (défaut : false)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "clientId": "client789",
    "clientName": "Entreprise ABC",
    "clientType": "company",
    "identificationNumber": "NRC12345",
    "taxId": "123456789",
    "creditStatus": "good_standing",
    "creditScore": 85,
    "riskLevel": "low",
    "outstandingLoans": [
      {
        "lenderId": "bank123",
        "lenderName": "Banque XYZ",
        "loanType": "term_loan",
        "originalAmount": 100000.00,
        "currency": "USD",
        "outstandingAmount": 60000.00,
        "startDate": "2024-10-15T00:00:00.000Z",
        "maturityDate": "2026-10-14T23:59:59.999Z",
        "status": "performing",
        "paymentStatus": "current",
        "lastPaymentDate": "2025-07-15T00:00:00.000Z"
      },
      {
        "lenderId": "bank456",
        "lenderName": "Banque ABC",
        "loanType": "credit_line",
        "originalAmount": 50000.00,
        "currency": "USD",
        "outstandingAmount": 35000.00,
        "startDate": "2025-01-10T00:00:00.000Z",
        "maturityDate": "2026-01-09T23:59:59.999Z",
        "status": "performing",
        "paymentStatus": "current",
        "lastPaymentDate": "2025-07-10T00:00:00.000Z"
      }
    ],
    "creditHistory": {
      "totalLoansCount": 5,
      "totalLoansAmount": 350000.00,
      "completedLoansCount": 3,
      "completedLoansAmount": 200000.00,
      "defaultedLoansCount": 0,
      "defaultedLoansAmount": 0.00,
      "restructuredLoansCount": 0,
      "restructuredLoansAmount": 0.00
    },
    "delinquencyHistory": [
      {
        "period": "2024-Q2",
        "maxDaysLate": 0,
        "totalPayments": 6,
        "latePayments": 0
      },
      {
        "period": "2024-Q3",
        "maxDaysLate": 5,
        "totalPayments": 6,
        "latePayments": 1
      },
      {
        "period": "2024-Q4",
        "maxDaysLate": 0,
        "totalPayments": 6,
        "latePayments": 0
      },
      {
        "period": "2025-Q1",
        "maxDaysLate": 0,
        "totalPayments": 6,
        "latePayments": 0
      },
      {
        "period": "2025-Q2",
        "maxDaysLate": 0,
        "totalPayments": 6,
        "latePayments": 0
      }
    ],
    "totalExposure": 95000.00,
    "availableCredit": 55000.00,
    "creditUtilization": 63.33,
    "bankruptcies": 0,
    "liens": 0,
    "judgments": 0,
    "lastUpdated": "2025-07-20T00:00:00.000Z"
  }
}
```

## Rapport de risque détaillé

Génère un rapport de risque détaillé pour un client.

**Endpoint** : `GET /portfolio_inst/risk/companies/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du client

**Paramètres de requête** :
- `includeRelatedParties` (optionnel) : Inclure les parties liées (défaut : false)
- `includeHistory` (optionnel) : Inclure l'historique complet (défaut : false)
- `format` (optionnel) : Format du rapport (summary, standard, detailed) (défaut : standard)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "client": {
      "id": "client789",
      "name": "Entreprise ABC",
      "type": "company",
      "registrationNumber": "NRC12345",
      "taxId": "123456789",
      "industry": "Manufacturing",
      "foundedYear": 2010,
      "employees": 85,
      "annualRevenue": 5000000.00,
      "addresses": [
        {
          "type": "headquarters",
          "address": "123 Avenue Principale, Kinshasa",
          "verified": true
        }
      ],
      "contacts": [
        {
          "name": "Jean Dupont",
          "title": "CEO",
          "phone": "+243810123456",
          "email": "jean.dupont@entrepriseabc.com"
        }
      ]
    },
    "creditProfile": {
      "creditScore": 85,
      "scoreCategory": "good",
      "scoreRange": "80-89",
      "scorePercentile": 75,
      "riskLevel": "low",
      "probabilityOfDefault": 2.5,
      "recommendedCreditLimit": 250000.00
    },
    "financialIndicators": {
      "liquidityRatio": 1.8,
      "debtToEquityRatio": 0.7,
      "profitMargin": 12.5,
      "returnOnAssets": 8.2,
      "returnOnEquity": 15.3,
      "assetTurnover": 1.2,
      "daysReceivable": 45,
      "daysPayable": 30,
      "daysInventory": 60,
      "cashFlowToDebt": 0.35
    },
    "creditExposure": {
      "currentExposure": {
        "totalAmount": 95000.00,
        "loanCount": 2,
        "maxLoanAmount": 60000.00,
        "averageLoanAmount": 47500.00,
        "weightedAverageInterestRate": 10.2,
        "weightedAverageMaturity": 18
      },
      "historicalExposure": {
        "totalLoansAmount": 350000.00,
        "totalLoansCount": 5,
        "maxHistoricalExposure": 150000.00,
        "averageExposure": 70000.00
      },
      "byLender": [
        {
          "lenderId": "bank123",
          "lenderName": "Banque XYZ",
          "exposure": 60000.00,
          "loanCount": 1
        },
        {
          "lenderId": "bank456",
          "lenderName": "Banque ABC",
          "exposure": 35000.00,
          "loanCount": 1
        }
      ],
      "byLoanType": [
        {
          "type": "term_loan",
          "exposure": 60000.00,
          "count": 1
        },
        {
          "type": "credit_line",
          "exposure": 35000.00,
          "count": 1
        }
      ]
    },
    "paymentHistory": {
      "paymentPattern": "consistent",
      "totalPaymentsCount": 30,
      "onTimePaymentsCount": 29,
      "onTimePaymentPercentage": 96.67,
      "latePaymentsCount": 1,
      "latePaymentBreakdown": {
        "1-30days": 1,
        "31-60days": 0,
        "61-90days": 0,
        "90+days": 0
      },
      "averageDaysLate": 5
    },
    "relatedParties": [
      {
        "id": "client456",
        "name": "Filiale XYZ",
        "relationship": "subsidiary",
        "creditScore": 80,
        "riskLevel": "low",
        "exposure": 75000.00
      },
      {
        "id": "ind123",
        "name": "Jean Dupont",
        "relationship": "key_executive",
        "creditScore": 90,
        "riskLevel": "very_low",
        "exposure": 25000.00
      }
    ],
    "industryComparison": {
      "industryAvgCreditScore": 75,
      "industryAvgDefaultRate": 5.0,
      "industryAvgDebtToEquity": 1.2,
      "industryAvgProfitMargin": 10.0,
      "scorePercentileInIndustry": 80,
      "defaultRatePercentileInIndustry": 20
    },
    "recommendations": {
      "creditDecision": "approve",
      "maximumExposure": 250000.00,
      "suggestedInterestRate": {
        "min": 9.5,
        "max": 11.0
      },
      "suggestedTenor": {
        "min": 12,
        "max": 36
      },
      "collateralRequirement": "minimal",
      "monitoringFrequency": "quarterly"
    },
    "alertsAndFlags": [
      {
        "type": "information",
        "description": "Le client a récemment augmenté son capital social"
      }
    ],
    "lastUpdated": "2025-07-20T00:00:00.000Z",
    "reportGeneratedAt": "2025-07-24T15:00:00.000Z"
  }
}
```

## Analyse de risque du portefeuille

Obtient une analyse de risque pour un portefeuille spécifique.

**Endpoint** : `GET /portfolio_inst/risk/portfolios/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique du portefeuille

**Paramètres de requête** :
- `detailLevel` (optionnel) : Niveau de détail (summary, detailed) (défaut : summary)
- `asOfDate` (optionnel) : Date de l'analyse (défaut : date actuelle)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "portfolioId": "portfolio123",
    "portfolioName": "Portefeuille PME 2025",
    "portfolioType": "traditional",
    "asOfDate": "2025-07-24T00:00:00.000Z",
    "summary": {
      "totalExposure": 5000000.00,
      "clientCount": 25,
      "loanCount": 35,
      "weightedAverageRiskScore": 3.2,
      "riskCategory": "medium",
      "performingExposure": 4200000.00,
      "performingPercentage": 84.0,
      "nonPerformingExposure": 800000.00,
      "nonPerformingPercentage": 16.0,
      "provisionsAmount": 400000.00,
      "provisionCoverageRatio": 50.0,
      "expectedLoss": 250000.00,
      "unexpectedLoss": 500000.00,
      "economicCapital": 750000.00,
      "riskAdjustedReturn": 8.5,
      "concentrationIndex": 0.15
    },
    "riskDistribution": {
      "byRiskCategory": [
        {
          "category": "very_low",
          "exposure": 500000.00,
          "percentage": 10.0,
          "clientCount": 2
        },
        {
          "category": "low",
          "exposure": 1500000.00,
          "percentage": 30.0,
          "clientCount": 8
        },
        {
          "category": "medium",
          "exposure": 2000000.00,
          "percentage": 40.0,
          "clientCount": 10
        },
        {
          "category": "high",
          "exposure": 800000.00,
          "percentage": 16.0,
          "clientCount": 4
        },
        {
          "category": "very_high",
          "exposure": 200000.00,
          "percentage": 4.0,
          "clientCount": 1
        }
      ],
      "byIndustry": [
        {
          "industry": "Agriculture",
          "exposure": 1500000.00,
          "percentage": 30.0,
          "averageRiskScore": 3.0,
          "nonPerformingPercentage": 10.0
        },
        {
          "industry": "Commerce",
          "exposure": 2000000.00,
          "percentage": 40.0,
          "averageRiskScore": 3.2,
          "nonPerformingPercentage": 15.0
        },
        {
          "industry": "Services",
          "exposure": 1500000.00,
          "percentage": 30.0,
          "averageRiskScore": 3.5,
          "nonPerformingPercentage": 20.0
        }
      ],
      "byRegion": [
        {
          "region": "Kinshasa",
          "exposure": 3000000.00,
          "percentage": 60.0,
          "averageRiskScore": 3.0,
          "nonPerformingPercentage": 12.0
        },
        {
          "region": "Lubumbashi",
          "exposure": 1500000.00,
          "percentage": 30.0,
          "averageRiskScore": 3.3,
          "nonPerformingPercentage": 18.0
        },
        {
          "region": "Autres",
          "exposure": 500000.00,
          "percentage": 10.0,
          "averageRiskScore": 4.0,
          "nonPerformingPercentage": 25.0
        }
      ],
      "byLoanSize": [
        {
          "range": "0-50000",
          "exposure": 1000000.00,
          "percentage": 20.0,
          "count": 15,
          "averageRiskScore": 3.5,
          "nonPerformingPercentage": 22.0
        },
        {
          "range": "50000-200000",
          "exposure": 2500000.00,
          "percentage": 50.0,
          "count": 15,
          "averageRiskScore": 3.2,
          "nonPerformingPercentage": 15.0
        },
        {
          "range": "200000+",
          "exposure": 1500000.00,
          "percentage": 30.0,
          "count": 5,
          "averageRiskScore": 2.8,
          "nonPerformingPercentage": 10.0
        }
      ]
    },
    "concentrationRisk": {
      "topExposures": [
        {
          "clientId": "client123",
          "clientName": "Entreprise XYZ",
          "exposure": 500000.00,
          "percentageOfPortfolio": 10.0,
          "riskScore": 2.5
        },
        {
          "clientId": "client456",
          "clientName": "Société ABC",
          "exposure": 400000.00,
          "percentageOfPortfolio": 8.0,
          "riskScore": 3.0
        },
        {
          "clientId": "client789",
          "clientName": "Entreprise DEF",
          "exposure": 350000.00,
          "percentageOfPortfolio": 7.0,
          "riskScore": 3.2
        }
      ],
      "herfindahlIndex": 0.05,
      "top5Concentration": 32.0,
      "top10Concentration": 55.0,
      "industryCreditRatio": {
        "Agriculture": 0.3,
        "Commerce": 0.4,
        "Services": 0.3
      }
    },
    "stressTests": [
      {
        "scenario": "base_case",
        "description": "Scénario de base",
        "expectedLoss": 250000.00,
        "nonPerformingRatio": 16.0,
        "provisioningNeeds": 0.00
      },
      {
        "scenario": "moderate_stress",
        "description": "Ralentissement économique modéré",
        "expectedLoss": 400000.00,
        "nonPerformingRatio": 25.0,
        "provisioningNeeds": 150000.00
      },
      {
        "scenario": "severe_stress",
        "description": "Récession économique sévère",
        "expectedLoss": 750000.00,
        "nonPerformingRatio": 40.0,
        "provisioningNeeds": 500000.00
      }
    ],
    "vintageAnalysis": [
      {
        "year": 2023,
        "exposure": 1000000.00,
        "nonPerformingRatio": 12.0,
        "cumulativeDefaultRate": 8.0
      },
      {
        "year": 2024,
        "exposure": 2000000.00,
        "nonPerformingRatio": 15.0,
        "cumulativeDefaultRate": 6.0
      },
      {
        "year": 2025,
        "exposure": 2000000.00,
        "nonPerformingRatio": 18.0,
        "cumulativeDefaultRate": 3.0
      }
    ],
    "recommendations": [
      {
        "type": "diversification",
        "description": "Réduire l'exposition au secteur du commerce",
        "impact": "medium",
        "potentialRiskReduction": 0.3
      },
      {
        "type": "monitoring",
        "description": "Augmenter la fréquence de suivi pour les clients du secteur des services",
        "impact": "high",
        "potentialRiskReduction": 0.5
      }
    ],
    "riskTrends": {
      "riskScoreTrend": [
        {
          "period": "2025-01",
          "averageRiskScore": 3.0
        },
        {
          "period": "2025-02",
          "averageRiskScore": 3.1
        },
        {
          "period": "2025-03",
          "averageRiskScore": 3.1
        },
        {
          "period": "2025-04",
          "averageRiskScore": 3.2
        },
        {
          "period": "2025-05",
          "averageRiskScore": 3.2
        },
        {
          "period": "2025-06",
          "averageRiskScore": 3.2
        },
        {
          "period": "2025-07",
          "averageRiskScore": 3.2
        }
      ],
      "nonPerformingTrend": [
        {
          "period": "2025-01",
          "nonPerformingRatio": 12.0
        },
        {
          "period": "2025-02",
          "nonPerformingRatio": 13.0
        },
        {
          "period": "2025-03",
          "nonPerformingRatio": 14.0
        },
        {
          "period": "2025-04",
          "nonPerformingRatio": 15.0
        },
        {
          "period": "2025-05",
          "nonPerformingRatio": 15.5
        },
        {
          "period": "2025-06",
          "nonPerformingRatio": 16.0
        },
        {
          "period": "2025-07",
          "nonPerformingRatio": 16.0
        }
      ]
    },
    "lastUpdated": "2025-07-24T15:00:00.000Z"
  }
}
```

## Création d'une entrée de risque

Crée une nouvelle entrée de risque dans le système.

**Endpoint** : `POST /portfolio_inst/risk/entries`

**Corps de la requête** :

```json
{
  "clientId": "client789",
  "portfolioId": "portfolio123",
  "riskType": "credit_risk",
  "riskLevel": "medium",
  "description": "Augmentation du ratio d'endettement",
  "impactAmount": 50000.00,
  "probability": 0.3,
  "mitigationStrategy": "Renforcement des garanties",
  "documents": [
    {
      "name": "Analyse financière",
      "type": "financial_analysis",
      "url": "https://example.com/documents/financial_analysis.pdf"
    }
  ],
  "notifyStakeholders": true
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "risk123",
    "clientId": "client789",
    "clientName": "Entreprise ABC",
    "portfolioId": "portfolio123",
    "portfolioName": "Portefeuille PME 2025",
    "riskType": "credit_risk",
    "riskLevel": "medium",
    "description": "Augmentation du ratio d'endettement",
    "impactAmount": 50000.00,
    "probability": 0.3,
    "expectedLoss": 15000.00,
    "mitigationStrategy": "Renforcement des garanties",
    "status": "active",
    "documents": [
      {
        "id": "doc123",
        "name": "Analyse financière",
        "type": "financial_analysis",
        "url": "https://example.com/documents/financial_analysis.pdf",
        "uploadedAt": "2025-07-24T15:00:00.000Z"
      }
    ],
    "createdBy": {
      "id": "user123",
      "name": "Jean Dupont"
    },
    "createdAt": "2025-07-24T15:00:00.000Z",
    "updatedAt": "2025-07-24T15:00:00.000Z"
  }
}
```

## Mise à jour d'une entrée de risque

Met à jour une entrée de risque existante.

**Endpoint** : `PUT /portfolio_inst/risk/entries/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'entrée de risque

**Corps de la requête** :

```json
{
  "riskLevel": "high",
  "description": "Augmentation significative du ratio d'endettement",
  "impactAmount": 75000.00,
  "probability": 0.4,
  "mitigationStrategy": "Renforcement des garanties et augmentation de la fréquence de suivi",
  "status": "escalated"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "risk123",
    "riskLevel": "high",
    "description": "Augmentation significative du ratio d'endettement",
    "impactAmount": 75000.00,
    "probability": 0.4,
    "expectedLoss": 30000.00,
    "mitigationStrategy": "Renforcement des garanties et augmentation de la fréquence de suivi",
    "status": "escalated",
    "updatedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    },
    "updatedAt": "2025-07-24T16:00:00.000Z"
  }
}
```

## Suppression d'une entrée de risque

Supprime une entrée de risque.

**Endpoint** : `DELETE /portfolio_inst/risk/entries/{id}`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'entrée de risque

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "message": "L'entrée de risque a été supprimée avec succès",
  "data": {
    "id": "risk123",
    "deletedAt": "2025-07-24T17:00:00.000Z",
    "deletedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    }
  }
}
```

## Calcul de score de crédit

Calcule un score de crédit pour un client spécifique.

**Endpoint** : `POST /portfolio_inst/risk/scoring`

**Corps de la requête** :

```json
{
  "clientId": "client789",
  "modelType": "business",
  "includeExternalData": true,
  "financialData": {
    "annualRevenue": 5000000.00,
    "netIncome": 500000.00,
    "totalAssets": 3000000.00,
    "totalLiabilities": 1500000.00,
    "currentAssets": 1200000.00,
    "currentLiabilities": 800000.00,
    "cashFlow": 700000.00,
    "equityRatio": 0.5,
    "debtServiceCoverageRatio": 1.8,
    "yearOfOperation": 10
  },
  "behavioralData": {
    "previousLoans": 5,
    "completedLoans": 3,
    "defaultedLoans": 0,
    "maxDaysLate": 5,
    "averageDaysLate": 1.2
  }
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "clientId": "client789",
    "clientName": "Entreprise ABC",
    "modelType": "business",
    "score": 85,
    "scoreRange": "80-89",
    "scoreCategory": "good",
    "riskLevel": "low",
    "probabilityOfDefault": 2.5,
    "recommendedCreditLimit": 250000.00,
    "recommendedInterestRate": {
      "min": 9.5,
      "max": 11.0
    },
    "scoreFactors": [
      {
        "factor": "financial_stability",
        "score": 40,
        "maxScore": 50,
        "impact": "positive",
        "description": "Bonne stabilité financière avec ratios solides"
      },
      {
        "factor": "payment_history",
        "score": 28,
        "maxScore": 30,
        "impact": "very_positive",
        "description": "Excellent historique de paiement"
      },
      {
        "factor": "business_characteristics",
        "score": 17,
        "maxScore": 20,
        "impact": "positive",
        "description": "Entreprise bien établie dans un secteur stable"
      }
    ],
    "improvementSuggestions": [
      {
        "area": "leverage",
        "suggestion": "Réduire légèrement le ratio d'endettement",
        "potentialScoreIncrease": 3
      }
    ],
    "scenarioAnalysis": [
      {
        "scenario": "improved_financials",
        "description": "Amélioration de 10% du revenu net",
        "projectedScore": 88
      },
      {
        "scenario": "increased_debt",
        "description": "Augmentation de 20% de l'endettement",
        "projectedScore": 80
      }
    ],
    "industryComparison": {
      "industryAvgScore": 75,
      "percentile": 80,
      "benchmarkName": "Manufacturing - Medium Size"
    },
    "calculatedAt": "2025-07-24T15:30:00.000Z",
    "validUntil": "2025-10-24T15:30:00.000Z"
  }
}
```

## Liste des alertes de risque

Récupère la liste des alertes de risque avec pagination et filtrage.

**Endpoint** : `GET /portfolio_inst/risk/alerts`

**Paramètres de requête** :
- `page` (optionnel) : Numéro de la page (défaut : 1)
- `limit` (optionnel) : Nombre d'alertes par page (défaut : 10, max : 100)
- `severity` (optionnel) : Filtre par niveau de sévérité (low, medium, high, critical)
- `status` (optionnel) : Filtre par statut (new, acknowledged, resolved, ignored)
- `portfolioId` (optionnel) : Filtre par portefeuille
- `clientId` (optionnel) : Filtre par client
- `dateFrom` (optionnel) : Filtre par date de création (début)
- `dateTo` (optionnel) : Filtre par date de création (fin)
- `sortBy` (optionnel) : Trier par (createdAt, severity, status)
- `sortOrder` (optionnel) : Ordre de tri (asc, desc)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "alert123",
      "type": "credit_deterioration",
      "severity": "high",
      "status": "new",
      "title": "Détérioration significative de la qualité de crédit",
      "description": "Le client Entreprise ABC a subi une dégradation significative de ses indicateurs financiers",
      "clientId": "client789",
      "clientName": "Entreprise ABC",
      "portfolioId": "portfolio123",
      "portfolioName": "Portefeuille PME 2025",
      "impactedAmount": 75000.00,
      "triggerThreshold": "ratio_change > 20%",
      "actualValue": "ratio_change = 25%",
      "requiredAction": "review_exposure",
      "dueDate": "2025-07-27T00:00:00.000Z",
      "createdAt": "2025-07-24T10:00:00.000Z"
    },
    {
      "id": "alert124",
      "type": "concentration_risk",
      "severity": "medium",
      "status": "acknowledged",
      "title": "Concentration de risque sectorielle élevée",
      "description": "La concentration dans le secteur du commerce dépasse le seuil de 35%",
      "clientId": null,
      "clientName": null,
      "portfolioId": "portfolio123",
      "portfolioName": "Portefeuille PME 2025",
      "impactedAmount": 2000000.00,
      "triggerThreshold": "sector_concentration > 35%",
      "actualValue": "sector_concentration = 40%",
      "requiredAction": "review_portfolio_allocation",
      "dueDate": "2025-08-15T00:00:00.000Z",
      "acknowledgedBy": {
        "id": "user123",
        "name": "Jean Dupont"
      },
      "acknowledgedAt": "2025-07-23T15:00:00.000Z",
      "createdAt": "2025-07-23T10:00:00.000Z"
    }
    // ... autres alertes
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

## Acquittement d'une alerte

Marque une alerte comme acquittée.

**Endpoint** : `PATCH /portfolio_inst/risk/alerts/{id}/acknowledge`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'alerte

**Corps de la requête** :

```json
{
  "notes": "Alerte examinée, une analyse de risque complète sera effectuée",
  "assignedTo": "user789"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "alert123",
    "status": "acknowledged",
    "notes": "Alerte examinée, une analyse de risque complète sera effectuée",
    "assignedTo": {
      "id": "user789",
      "name": "Pierre Durand"
    },
    "acknowledgedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    },
    "acknowledgedAt": "2025-07-24T16:00:00.000Z",
    "updatedAt": "2025-07-24T16:00:00.000Z"
  }
}
```

## Résolution d'une alerte

Marque une alerte comme résolue.

**Endpoint** : `PATCH /portfolio_inst/risk/alerts/{id}/resolve`

**Paramètres de chemin** :
- `id` : Identifiant unique de l'alerte

**Corps de la requête** :

```json
{
  "resolutionNotes": "Garanties renforcées et limites de crédit ajustées",
  "actionsTaken": [
    "Augmentation des garanties de 50000 USD",
    "Réduction de la limite de crédit de 25000 USD"
  ],
  "documents": [
    {
      "name": "Rapport d'analyse complémentaire",
      "type": "risk_analysis",
      "url": "https://example.com/documents/risk_analysis.pdf"
    }
  ]
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "alert123",
    "status": "resolved",
    "resolutionNotes": "Garanties renforcées et limites de crédit ajustées",
    "actionsTaken": [
      "Augmentation des garanties de 50000 USD",
      "Réduction de la limite de crédit de 25000 USD"
    ],
    "documents": [
      {
        "id": "doc124",
        "name": "Rapport d'analyse complémentaire",
        "type": "risk_analysis",
        "url": "https://example.com/documents/risk_analysis.pdf",
        "uploadedAt": "2025-07-24T17:00:00.000Z"
      }
    ],
    "resolvedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    },
    "resolvedAt": "2025-07-24T17:00:00.000Z",
    "updatedAt": "2025-07-24T17:00:00.000Z"
  }
}
```
