# Param�tres - Portefeuille Traditionnel

Ce document d�crit les endpoints pour la gestion des param�tres dans les portefeuilles traditionnels.

## R�cup�ration des param�tres

R�cup�re les param�tres d'un portefeuille traditionnel sp�cifique.

**Endpoint** : `GET /portfolio_inst/portfolios/traditional/{portfolioId}/settings`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**R�ponse r�ussie** (200 OK) :

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

## Mise � jour des param�tres

Met � jour les param�tres d'un portefeuille traditionnel sp�cifique.

**Endpoint** : `PUT /portfolio_inst/portfolios/traditional/{portfolioId}/settings`

**Param�tres de chemin** :
- `portfolioId` : Identifiant unique du portefeuille

**Corps de la requ�te** :

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

**R�ponse r�ussie** (200 OK) :

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
