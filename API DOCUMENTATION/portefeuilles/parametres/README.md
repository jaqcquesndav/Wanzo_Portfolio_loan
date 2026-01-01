# API des Paramètres - Portefeuille Traditionnel

> **Synchronisée avec le code source TypeScript** - Janvier 2026

Cette API permet de gérer les paramètres des portefeuilles traditionnels, incluant les configurations de risque, de produits financiers, de remboursements, de garanties, de provisionnement et **de conformité réglementaire BCC**.

## Architecture Frontend

Les paramètres du portefeuille sont gérés via le composant `PortfolioSettingsDisplay.tsx` qui organise la configuration en **5 onglets** :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Paramètres du Portefeuille                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Général] [Produits] [Comptes] [Paramètres BCC] [Surveillance BCC]         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Onglet actif :                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  • Général : Nom, statut, profil risque, objectifs                    │  │
│  │  • Produits : Liste des produits financiers (FinancialProductsList)   │  │
│  │  • Comptes : Comptes bancaires et Mobile Money (AccountsPanel)        │  │
│  │  • Paramètres BCC : Configuration seuils BCC (BCCParametersPanel)     │  │
│  │  • Surveillance BCC : Métriques temps réel (BCCSurveillancePanel)     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Composants UI

| Composant | Fichier Source | Description |
|-----------|----------------|-------------|
| `PortfolioSettingsDisplay` | `src/components/portfolio/traditional/PortfolioSettingsDisplay.tsx` | Container principal avec onglets |
| `BCCParametersPanel` | `src/components/portfolio/traditional/BCCParametersPanel.tsx` | Configuration des seuils BCC |
| `BCCSurveillancePanel` | `src/components/portfolio/traditional/BCCSurveillancePanel.tsx` | Dashboard métriques en temps réel |
| `AccountsPanel` | `src/components/portfolio/shared/AccountsPanel.tsx` | Gestion comptes bancaires/Mobile Money |
| `ProductList` | `src/components/portfolio/traditional/ProductList.tsx` | Liste des produits financiers |

### Hooks

| Hook | Fichier Source | Description |
|------|----------------|-------------|
| `useBCCCompliance` | `src/hooks/useBCCCompliance.ts` | Gestion conformité BCC (références, préférences, métriques) |
| `usePortfolioAccounts` | `src/hooks/usePortfolioAccounts.ts` | Gestion comptes bancaires et Mobile Money |

### Services API

| Service | Fichier Source | Description |
|---------|----------------|-------------|
| `portfolioSettingsApi` | `src/services/api/traditional/portfolio-settings.api.ts` | CRUD paramètres portefeuille |
| `bccComplianceApi` | `src/services/api/traditional/bccCompliance.api.ts` | Configuration et métriques BCC |

---

## Points d'accès - Paramètres Généraux

### Obtenir les paramètres d'un portefeuille
```
GET /api/portfolio/traditional/:portfolioId/settings
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |

#### Réponse
```json
{
  "success": true,
  "data": {
    "portfolio_id": "trad-001",
    "risk_profile_settings": {
      "max_risk_level": 5,
      "risk_assessment_frequency": "quarterly",
      "risk_thresholds": {
        "low": 2,
        "medium": 3,
        "high": 4
      }
    },
    "product_settings": {
      "interest_rate_ranges": {
        "min": 5,
        "max": 25,
        "default": 12
      },
      "term_ranges": {
        "min": 3,
        "max": 60,
        "default": 24
      },
      "allowed_currencies": ["CDF", "USD"],
      "max_loan_amount": 100000000,
      "min_loan_amount": 1000000,
      "enable_auto_approval": false,
      "auto_approval_threshold": 5000000
    },
    "repayment_settings": {
      "allow_early_repayment": true,
      "early_repayment_fee_percentage": 2,
      "late_payment_fee_percentage": 5,
      "grace_period_days": 5,
      "payment_reminder_days": [1, 3, 7],
      "default_payment_methods": ["bank_transfer", "mobile_money"]
    },
    "guarantee_settings": {
      "required_guarantee_percentage": 150,
      "allowed_guarantee_types": ["real_estate", "equipment", "inventory", "financial_assets"],
      "guarantee_valuation_frequency": "annually"
    },
    "provisioning_settings": {
      "provision_rates": {
        "days_30": 0.1,
        "days_60": 0.3,
        "days_90": 0.5,
        "days_180": 0.75,
        "days_360": 1.0
      },
      "enable_auto_provisioning": true
    },
    "created_at": "2025-01-15T08:30:00Z",
    "updated_at": "2025-07-20T14:15:00Z"
  }
}
```

### Mettre à jour les paramètres d'un portefeuille
```
PUT /api/portfolio/traditional/:portfolioId/settings
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |

#### Corps de la requête
Vous pouvez mettre à jour tout ou partie des paramètres:

```json
{
  "risk_profile_settings": {
    "max_risk_level": 4,
    "risk_assessment_frequency": "monthly"
  },
  "product_settings": {
    "interest_rate_ranges": {
      "max": 20
    },
    "allowed_currencies": ["CDF", "USD", "EUR"]
  }
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "portfolio_id": "trad-001",
    "risk_profile_settings": {
      "max_risk_level": 4,
      "risk_assessment_frequency": "monthly",
      "risk_thresholds": {
        "low": 2,
        "medium": 3,
        "high": 4
      }
    },
    "product_settings": {
      "interest_rate_ranges": {
        "min": 5,
        "max": 20,
        "default": 12
      },
      "term_ranges": {
        "min": 3,
        "max": 60,
        "default": 24
      },
      "allowed_currencies": ["CDF", "USD", "EUR"],
      "max_loan_amount": 100000000,
      "min_loan_amount": 1000000,
      "enable_auto_approval": false,
      "auto_approval_threshold": 5000000
    },
    "repayment_settings": {
      "allow_early_repayment": true,
      "early_repayment_fee_percentage": 2,
      "late_payment_fee_percentage": 5,
      "grace_period_days": 5,
      "payment_reminder_days": [1, 3, 7],
      "default_payment_methods": ["bank_transfer", "mobile_money"]
    },
    "guarantee_settings": {
      "required_guarantee_percentage": 150,
      "allowed_guarantee_types": ["real_estate", "equipment", "inventory", "financial_assets"],
      "guarantee_valuation_frequency": "annually"
    },
    "provisioning_settings": {
      "provision_rates": {
        "days_30": 0.1,
        "days_60": 0.3,
        "days_90": 0.5,
        "days_180": 0.75,
        "days_360": 1.0
      },
      "enable_auto_provisioning": true
    },
    "created_at": "2025-01-15T08:30:00Z",
    "updated_at": "2025-07-25T09:45:00Z"
  }
}
```

### Réinitialiser les paramètres d'un portefeuille
```
POST /api/portfolio/traditional/:portfolioId/settings/reset
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |

#### Corps de la requête
```json
{}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "portfolio_id": "trad-001",
    "risk_profile_settings": {
      "max_risk_level": 5,
      "risk_assessment_frequency": "quarterly",
      "risk_thresholds": {
        "low": 2,
        "medium": 3,
        "high": 4
      }
    },
    "product_settings": {
      "interest_rate_ranges": {
        "min": 5,
        "max": 25,
        "default": 12
      },
      "term_ranges": {
        "min": 3,
        "max": 60,
        "default": 24
      },
      "allowed_currencies": ["CDF", "USD"],
      "max_loan_amount": 100000000,
      "min_loan_amount": 1000000,
      "enable_auto_approval": false,
      "auto_approval_threshold": 5000000
    },
    "repayment_settings": {
      "allow_early_repayment": true,
      "early_repayment_fee_percentage": 2,
      "late_payment_fee_percentage": 5,
      "grace_period_days": 5,
      "payment_reminder_days": [1, 3, 7],
      "default_payment_methods": ["bank_transfer", "mobile_money"]
    },
    "guarantee_settings": {
      "required_guarantee_percentage": 150,
      "allowed_guarantee_types": ["real_estate", "equipment", "inventory", "financial_assets"],
      "guarantee_valuation_frequency": "annually"
    },
    "provisioning_settings": {
      "provision_rates": {
        "days_30": 0.1,
        "days_60": 0.3,
        "days_90": 0.5,
        "days_180": 0.75,
        "days_360": 1.0
      },
      "enable_auto_provisioning": true
    },
    "created_at": "2025-01-15T08:30:00Z",
    "updated_at": "2025-07-25T10:00:00Z"
  }
}
```

### Obtenir tous les produits financiers
```
GET /api/portfolio/traditional/:portfolioId/products
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |

#### Paramètres de requête
| Paramètre | Type | Description |
|-----------|------|-------------|
| page | number | Numéro de page (par défaut: 1) |
| limit | number | Nombre d'éléments par page (par défaut: 10) |
| status | string | Filtrer par statut ('active', 'inactive') |
| type | string | Filtrer par type (voir ProductType ci-dessous) |

> **ProductType** : `credit_personnel`, `credit_immobilier`, `credit_auto`, `credit_professionnel`, `microcredit`, `credit_consommation`

#### Réponse
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-001",
        "name": "Crédit PME",
        "type": "credit_professionnel",
        "description": "Crédit pour les petites et moyennes entreprises",
        "minAmount": 5000000,
        "maxAmount": 50000000,
        "duration": {
          "min": 6,
          "max": 36
        },
        "interestRate": {
          "type": "fixed",
          "value": 15
        },
        "requirements": ["Business plan", "États financiers", "Garanties"],
        "acceptedGuarantees": ["real_estate", "equipment"],
        "isPublic": true,
        "status": "active",
        "created_at": "2025-01-15T08:35:00Z",
        "updated_at": "2025-01-15T08:35:00Z"
      },
      {
        "id": "prod-002",
        "name": "Microcrédit Agricole",
        "type": "microcredit",
        "description": "Petit crédit pour agriculteurs",
        "minAmount": 500000,
        "maxAmount": 5000000,
        "duration": {
          "min": 3,
          "max": 24
        },
        "interestRate": {
          "type": "fixed",
          "value": 8
        },
        "requirements": ["Pièce d'identité"],
        "isPublic": true,
        "status": "active",
        "created_at": "2025-01-16T10:20:00Z",
        "updated_at": "2025-01-16T10:20:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Obtenir un produit financier par ID
```
GET /api/portfolio/traditional/:portfolioId/products/:productId
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |
| productId | string | Identifiant unique du produit financier |

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "prod-001",
    "name": "Crédit PME",
    "type": "credit_professionnel",
    "description": "Crédit pour les petites et moyennes entreprises",
    "minAmount": 5000000,
    "maxAmount": 50000000,
    "duration": {
      "min": 6,
      "max": 36
    },
    "interestRate": {
      "type": "fixed",
      "value": 15
    },
    "requirements": ["Business plan", "États financiers", "Garanties"],
    "acceptedGuarantees": ["real_estate", "equipment"],
    "isPublic": true,
    "status": "active",
    "created_at": "2025-01-15T08:35:00Z",
    "updated_at": "2025-01-15T08:35:00Z"
  }
}
```

### Créer un produit financier
```
POST /api/portfolio/traditional/:portfolioId/products
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |

#### Corps de la requête
```json
{
  "name": "Microcrédit Agricole",
  "type": "microcredit",
  "description": "Microcrédit destiné aux agriculteurs",
  "minAmount": 500000,
  "maxAmount": 5000000,
  "duration": {
    "min": 3,
    "max": 24
  },
  "interestRate": {
    "type": "fixed",
    "value": 12
  },
  "requirements": ["Carte professionnelle agricole", "Plan d'exploitation"],
  "acceptedGuarantees": ["equipment", "inventory"],
  "isPublic": true,
  "status": "active"
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "prod-003",
    "name": "Microcrédit Agricole",
    "type": "microcredit",
    "description": "Microcrédit destiné aux agriculteurs",
    "minAmount": 500000,
    "maxAmount": 5000000,
    "duration": {
      "min": 3,
      "max": 24
    },
    "interestRate": {
      "type": "fixed",
      "value": 12
    },
    "requirements": ["Carte professionnelle agricole", "Plan d'exploitation"],
    "acceptedGuarantees": ["equipment", "inventory"],
    "isPublic": true,
    "status": "active",
    "created_at": "2025-07-25T10:15:00Z",
    "updated_at": "2025-07-25T10:15:00Z"
  }
}
```

### Mettre à jour un produit financier
```
PUT /api/portfolio/traditional/:portfolioId/products/:productId
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |
| productId | string | Identifiant unique du produit financier |

#### Corps de la requête
```json
{
  "maxAmount": 8000000,
  "interestRate": {
    "value": 10
  },
  "status": "inactive"
}
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "id": "prod-003",
    "name": "Microcrédit Agricole",
    "type": "microcredit",
    "description": "Microcrédit destiné aux agriculteurs",
    "minAmount": 500000,
    "maxAmount": 8000000,
    "duration": {
      "min": 3,
      "max": 24
    },
    "interestRate": {
      "type": "fixed",
      "value": 10
    },
    "requirements": ["Carte professionnelle agricole", "Plan d'exploitation"],
    "acceptedGuarantees": ["equipment", "inventory"],
    "isPublic": true,
    "status": "inactive",
    "created_at": "2025-07-25T10:15:00Z",
    "updated_at": "2025-07-25T10:30:00Z"
  }
}
```

### Supprimer un produit financier
```
DELETE /api/portfolio/traditional/:portfolioId/products/:productId
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant unique du portefeuille traditionnel |
| productId | string | Identifiant unique du produit financier |

#### Réponse
```json
{
  "success": true,
  "message": "Le produit financier a été supprimé avec succès"
}
```

## Modèles de données

### Paramètres de portefeuille traditionnel
| Champ | Type | Description |
|-------|------|-------------|
| portfolio_id | string | Identifiant unique du portefeuille |
| risk_profile_settings | object | Paramètres de gestion des risques |
| risk_profile_settings.max_risk_level | number | Niveau de risque maximal acceptable (échelle numérique) |
| risk_profile_settings.risk_assessment_frequency | string | Fréquence d'évaluation ('monthly', 'quarterly', 'annually') |
| risk_profile_settings.risk_thresholds | object | Seuils pour différents niveaux de risque |
| product_settings | object | Paramètres des produits financiers |
| product_settings.interest_rate_ranges | object | Plages de taux d'intérêt |
| product_settings.term_ranges | object | Plages de durée en mois |
| product_settings.allowed_currencies | array | Liste des devises autorisées |
| product_settings.max_loan_amount | number | Montant maximum de prêt |
| product_settings.min_loan_amount | number | Montant minimum de prêt |
| product_settings.enable_auto_approval | boolean | Activer l'approbation automatique |
| product_settings.auto_approval_threshold | number | Seuil pour l'approbation automatique |
| repayment_settings | object | Paramètres des remboursements |
| repayment_settings.allow_early_repayment | boolean | Autoriser les remboursements anticipés |
| repayment_settings.early_repayment_fee_percentage | number | Frais pour remboursement anticipé (%) |
| repayment_settings.late_payment_fee_percentage | number | Frais pour paiement tardif (%) |
| repayment_settings.grace_period_days | number | Jours de grâce avant pénalités |
| repayment_settings.payment_reminder_days | array | Jours avant échéance pour rappels |
| repayment_settings.default_payment_methods | array | Méthodes de paiement par défaut |
| guarantee_settings | object | Paramètres des garanties |
| guarantee_settings.required_guarantee_percentage | number | Pourcentage de garantie requis |
| guarantee_settings.allowed_guarantee_types | array | Types de garanties autorisés |
| guarantee_settings.guarantee_valuation_frequency | string | Fréquence d'évaluation ('monthly', 'quarterly', 'annually') |
| provisioning_settings | object | Paramètres de provisionnement |
| provisioning_settings.provision_rates | object | Taux de provisionnement par âge |
| provisioning_settings.enable_auto_provisioning | boolean | Activer le provisionnement automatique |
| created_at | string | Date de création (format ISO) |
| updated_at | string | Date de dernière modification (format ISO) |

### Produit financier
| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique du produit |
| name | string | Nom du produit |
| type | ProductType | Type de produit (voir ci-dessous) |
| description | string | Description détaillée |
| minAmount | number | Montant minimum |
| maxAmount | number | Montant maximum |
| duration | object | Durée du produit |
| duration.min | number | Durée minimum en mois |
| duration.max | number | Durée maximum en mois |
| interestRate | object | Configuration du taux d'intérêt |
| interestRate.type | string | Type de taux ('fixed', 'variable') |
| interestRate.value | number | Valeur du taux (pour type 'fixed') |
| interestRate.min | number | Taux minimum (pour type 'variable') |
| interestRate.max | number | Taux maximum (pour type 'variable') |
| requirements | array | Liste des exigences documentaires |
| acceptedGuarantees | array | Types de garanties acceptées |
| isPublic | boolean | Indique si le produit est visible publiquement |
| status | string | Statut du produit ('active', 'inactive') |
| created_at | string | Date de création (format ISO) |
| updated_at | string | Date de dernière modification (format ISO) |

#### ProductType (6 valeurs)
| Valeur | Description |
|--------|-------------|
| `credit_personnel` | Crédit personnel non affecté |
| `credit_immobilier` | Crédit immobilier |
| `credit_auto` | Crédit automobile |
| `credit_professionnel` | Crédit professionnel PME |
| `microcredit` | Microcrédit |
| `credit_consommation` | Crédit à la consommation |

---

## Conformité BCC - Instruction 004 (RDC)

La conformité réglementaire BCC est intégrée dans les paramètres du portefeuille via deux onglets dédiés dans l'interface utilisateur.

### Base URL

```
/portfolio/api/v1/bcc
```

### 1. Récupérer la configuration BCC

```
GET /bcc/configuration
GET /bcc/configuration/{portfolioId}
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | (optionnel) Identifiant du portefeuille |

#### Réponse
```json
{
  "success": true,
  "data": {
    "bccReferences": {
      "maxNplRatio": 5,
      "maxWriteOffRatio": 2,
      "minRecoveryRate": 85,
      "minRoa": 3,
      "minPortfolioYield": 15,
      "minCollectionEfficiency": 90,
      "maxProcessingTime": 14
    },
    "managerPreferences": {
      "maxNplRatio": 3,
      "maxWriteOffRatio": 1,
      "minRecoveryRate": 90,
      "minRoa": 4,
      "minPortfolioYield": 18,
      "minCollectionEfficiency": 92,
      "maxProcessingTime": 10,
      "alertThresholds": {
        "nplWarningRatio": 2,
        "roaWarningLevel": 3.5,
        "efficiencyWarningLevel": 88
      }
    },
    "lastUpdated": "2026-01-15T10:30:00Z",
    "updatedBy": "manager@institution.cd"
  }
}
```

### 2. Récupérer les références officielles BCC

```
GET /bcc/references
```

Retourne les seuils officiels non modifiables de l'Instruction 004.

#### Réponse
```json
{
  "success": true,
  "data": {
    "maxNplRatio": 5,
    "maxWriteOffRatio": 2,
    "minRecoveryRate": 85,
    "minRoa": 3,
    "minPortfolioYield": 15,
    "minCollectionEfficiency": 90,
    "maxProcessingTime": 14
  }
}
```

| Champ | Description | Article BCC |
|-------|-------------|-------------|
| `maxNplRatio` | NPL Ratio maximum (%) | Article 2 |
| `maxWriteOffRatio` | Ratio d'abandon de créances maximum (%) | Article 2 |
| `minRecoveryRate` | Taux de récupération minimum (%) | Article 2 |
| `minRoa` | ROA minimum (%) | Article 4 |
| `minPortfolioYield` | Rendement portefeuille minimum (%) | Article 4 |
| `minCollectionEfficiency` | Efficacité de recouvrement minimum (%) | - |
| `maxProcessingTime` | Temps de traitement maximum (jours) | - |

### 3. Récupérer les métriques de conformité

```
GET /bcc/metrics/{portfolioId}
```

#### Paramètres de chemin
| Paramètre | Type | Description |
|-----------|------|-------------|
| portfolioId | string | Identifiant du portefeuille (requis) |

#### Réponse
```json
{
  "success": true,
  "data": {
    "qualityMetrics": {
      "nplRatio": 3.2,
      "writeOffRatio": 0.8,
      "par30": 2.5,
      "recoveryRate": 88.5
    },
    "profitabilityMetrics": {
      "roa": 4.2,
      "portfolioYield": 16.8,
      "netInterestMargin": 12.5,
      "costOfRisk": 2.1
    },
    "operationalMetrics": {
      "collectionEfficiency": 91.3,
      "avgProcessingTime": 8,
      "portfolioTurnover": 22.5
    },
    "calculatedAt": "2026-01-15T10:30:00Z",
    "portfolioId": "portfolio-123"
  }
}
```

### 4. Sauvegarder les préférences du gestionnaire

```
PUT /bcc/preferences
PUT /bcc/preferences/{portfolioId}
```

**Validation:** Les préférences doivent être plus strictes ou égales aux références BCC.

#### Corps de la requête
```json
{
  "maxNplRatio": 3,
  "maxWriteOffRatio": 1,
  "minRecoveryRate": 90,
  "minRoa": 4,
  "minPortfolioYield": 18,
  "minCollectionEfficiency": 92,
  "maxProcessingTime": 10,
  "alertThresholds": {
    "nplWarningRatio": 2,
    "roaWarningLevel": 3.5,
    "efficiencyWarningLevel": 88
  }
}
```

#### Réponse succès
```json
{
  "success": true,
  "message": "Préférences sauvegardées avec succès"
}
```

#### Réponse erreur (validation)
```json
{
  "success": false,
  "message": "Validation échouée",
  "errors": [
    "NPL maximum (6%) ne peut pas dépasser la référence BCC (5%)",
    "ROA minimum (2%) doit être supérieur ou égal à la référence BCC (3%)"
  ]
}
```

### 5. Réinitialiser les préférences

```
POST /bcc/preferences/reset
POST /bcc/preferences/{portfolioId}/reset
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "maxNplRatio": 3,
    "maxWriteOffRatio": 1,
    "minRecoveryRate": 90,
    "minRoa": 4,
    "minPortfolioYield": 18,
    "minCollectionEfficiency": 92,
    "maxProcessingTime": 10,
    "alertThresholds": {
      "nplWarningRatio": 2,
      "roaWarningLevel": 3.5,
      "efficiencyWarningLevel": 88
    }
  }
}
```

### Règles de validation BCC

#### Seuils maximums (doivent être ≤ BCC)
- `maxNplRatio` ≤ 5%
- `maxWriteOffRatio` ≤ 2%
- `maxProcessingTime` ≤ 14 jours

#### Seuils minimums (doivent être ≥ BCC)
- `minRecoveryRate` ≥ 85%
- `minRoa` ≥ 3%
- `minPortfolioYield` ≥ 15%
- `minCollectionEfficiency` ≥ 90%

### Statuts de conformité

| Statut | Badge | Description |
|--------|-------|-------------|
| `success` | ✅ Conforme | Métrique conforme BCC et gestionnaire |
| `warning` | ⚠️ Attention | Conforme BCC mais sous seuil gestionnaire |
| `danger` | ❌ Non-conforme | Non-conforme à l'Instruction BCC 004 |

### DTOs TypeScript

```typescript
// Interface des références officielles BCC (non modifiables)
interface BCCOfficialReferences {
  maxNplRatio: number;           // NPL < 5% (Article 2)
  maxWriteOffRatio: number;      // Abandon < 2% (Article 2)
  minRecoveryRate: number;       // Récupération > 85% (Article 2)
  minRoa: number;                // ROA > 3% (Article 4)
  minPortfolioYield: number;     // Rendement > 15% (Article 4)
  minCollectionEfficiency: number; // Recouvrement > 90%
  maxProcessingTime: number;        // Délai < 14 jours
}

// Interface des préférences du gestionnaire (modifiables)
interface ManagerPreferences {
  maxNplRatio: number;
  maxWriteOffRatio: number;
  minRecoveryRate: number;
  minRoa: number;
  minPortfolioYield: number;
  minCollectionEfficiency: number;
  maxProcessingTime: number;
  alertThresholds: {
    nplWarningRatio: number;
    roaWarningLevel: number;
    efficiencyWarningLevel: number;
  };
}

// Métriques calculées pour surveillance
interface BCCComplianceMetrics {
  qualityMetrics: {
    nplRatio: number;
    writeOffRatio: number;
    par30: number;
    recoveryRate: number;
  };
  profitabilityMetrics: {
    roa: number;
    portfolioYield: number;
    netInterestMargin: number;
    costOfRisk: number;
  };
  operationalMetrics: {
    collectionEfficiency: number;
    avgProcessingTime: number;
    portfolioTurnover: number;
  };
  calculatedAt: string;
  portfolioId: string;
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide ou validation échouée |
| 401 | Non authentifié |
| 403 | Non autorisé (permissions insuffisantes) |
| 404 | Portefeuille ou produit non trouvé |
| 500 | Erreur serveur |

---

## Voir aussi

- [Comptes Bancaires et Mobile Money](../comptes/README.md)
- [Produits Financiers](../produits/README.md)
- [Dashboard](../../dashboard/README.md)
