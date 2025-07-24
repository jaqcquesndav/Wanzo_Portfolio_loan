# Paramètres - Portefeuille Traditionnel

Ce document décrit les endpoints pour la gestion des paramètres dans les portefeuilles traditionnels.

## Récupération des paramètres

Récupère les paramètres d'un portefeuille traditionnel spécifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/settings`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "settings123",
    "portfolioId": "portfolio123",
    "loanLimits": {
      "minAmount": 5000.00,
      "maxAmount": 500000.00,
      "minTerm": 3,
      "maxTerm": 36
    },
    "interestRates": {
      "base": 8.5,
      "min": 5.0,
      "max": 15.0,
      "overdue": 12.0
    },
    "fees": {
      "applicationFee": {
        "percentage": 1.0,
        "fixed": 5000.00,
        "min": 5000.00,
        "max": 50000.00
      },
      "disbursementFee": {
        "percentage": 0.5,
        "fixed": 0.00,
        "min": 0.00,
        "max": null
      },
      "lateFee": {
        "percentage": 2.0,
        "fixed": 10000.00,
        "min": 10000.00,
        "max": null
      }
    },
    "approvalWorkflow": {
      "requiresSecondaryApproval": true,
      "thresholdForSecondaryApproval": 100000.00,
      "requiresCommitteeApproval": true,
      "thresholdForCommitteeApproval": 250000.00
    },
    "riskParameters": {
      "maxDebtToIncomeRatio": 0.4,
      "minCreditScore": 650,
      "requireCollateral": true,
      "collateralCoverageRatio": 1.5,
      "maxConcentrationPerSector": 30.0,
      "maxConcentrationPerClient": 10.0
    },
    "currency": "CDF",
    "updatedAt": "2025-07-01T10:00:00.000Z",
    "updatedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    }
  }
}
```

## Mise à jour des paramètres

Met à jour les paramètres d'un portefeuille traditionnel spécifique.

**Endpoint** : `PUT /portfolio_inst/portfolios/traditional/{portfolioId}/settings`

**Paramètres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Corps de la requête** :

```json
{
  "loanLimits": {
    "minAmount": 10000.00,
    "maxAmount": 600000.00,
    "minTerm": 6,
    "maxTerm": 48
  },
  "interestRates": {
    "base": 9.0,
    "min": 6.0,
    "max": 16.0,
    "overdue": 13.0
  },
  "fees": {
    "applicationFee": {
      "percentage": 1.5,
      "fixed": 5000.00,
      "min": 5000.00,
      "max": 60000.00
    },
    "disbursementFee": {
      "percentage": 0.75,
      "fixed": 0.00,
      "min": 0.00,
      "max": null
    },
    "lateFee": {
      "percentage": 2.5,
      "fixed": 15000.00,
      "min": 15000.00,
      "max": null
    }
  },
  "approvalWorkflow": {
    "requiresSecondaryApproval": true,
    "thresholdForSecondaryApproval": 150000.00,
    "requiresCommitteeApproval": true,
    "thresholdForCommitteeApproval": 300000.00
  },
  "riskParameters": {
    "maxDebtToIncomeRatio": 0.5,
    "minCreditScore": 600,
    "requireCollateral": true,
    "collateralCoverageRatio": 1.8,
    "maxConcentrationPerSector": 35.0,
    "maxConcentrationPerClient": 15.0
  }
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "settings123",
    "portfolioId": "portfolio123",
    "loanLimits": {
      "minAmount": 10000.00,
      "maxAmount": 600000.00,
      "minTerm": 6,
      "maxTerm": 48
    },
    "interestRates": {
      "base": 9.0,
      "min": 6.0,
      "max": 16.0,
      "overdue": 13.0
    },
    "fees": {
      "applicationFee": {
        "percentage": 1.5,
        "fixed": 5000.00,
        "min": 5000.00,
        "max": 60000.00
      },
      "disbursementFee": {
        "percentage": 0.75,
        "fixed": 0.00,
        "min": 0.00,
        "max": null
      },
      "lateFee": {
        "percentage": 2.5,
        "fixed": 15000.00,
        "min": 15000.00,
        "max": null
      }
    },
    "approvalWorkflow": {
      "requiresSecondaryApproval": true,
      "thresholdForSecondaryApproval": 150000.00,
      "requiresCommitteeApproval": true,
      "thresholdForCommitteeApproval": 300000.00
    },
    "riskParameters": {
      "maxDebtToIncomeRatio": 0.5,
      "minCreditScore": 600,
      "requireCollateral": true,
      "collateralCoverageRatio": 1.8,
      "maxConcentrationPerSector": 35.0,
      "maxConcentrationPerClient": 15.0
    },
    "currency": "CDF",
    "updatedAt": "2025-07-24T11:00:00.000Z",
    "updatedBy": {
      "id": "user123",
      "name": "Jean Dupont"
    }
  }
}
```
