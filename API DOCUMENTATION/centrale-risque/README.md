# Centrale des Risques

> **Synchronisée avec le code source** - Janvier 2026

Cette API permet de gérer les données de la Centrale des Risques, incluant les profils de risque, les incidents de paiement, les engagements, les alertes et les statistiques globales.

## 🔗 Base URL

**Développement :** `http://localhost:8000/portfolio/api/v1`  
**Production :** `https://api.wanzo.com/portfolio/api/v1`

**Route UI**: `/app/:portfolioType/central-risque`  
**Fichiers sources**: 
- `services/api/shared/centrale-risque.api.ts`
- `services/api/shared/risk.api.ts`

---

## 📡 Endpoints

### 1. Profil de Risque Entreprise

#### 1.1 Récupérer le profil de risque d'une entreprise

```http
GET /risk/central/company/{companyId}
```

**Description**: Recherche les informations complètes de risque pour une entreprise.

**Paramètres de chemin :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `companyId` | string | Oui | Identifiant unique de l'entreprise |

**Réponse (200 OK) :**

```json
{
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "creditScore": 72,
  "riskCategory": "medium",
  "financialHealth": {
    "solvabilite": 0.65,
    "liquidite": 1.2,
    "rentabilite": 0.08,
    "endettement": 0.45,
    "scoreGlobal": 68
  },
  "creditHistory": {
    "encoursTotalActuel": 150000000,
    "encoursTotalHistorique": 350000000,
    "repartitionParType": {
      "creditsBancaires": 100000000,
      "creditsBail": 30000000,
      "lignesDeCredit": 20000000,
      "autres": 0
    },
    "incidents": {
      "total": 2,
      "cheques": 0,
      "effets": 1,
      "retards": 1
    }
  },
  "defaultProbability": 0.12,
  "recommendedActions": [
    "Surveiller les flux de trésorerie",
    "Demander garantie supplémentaire",
    "Révision trimestrielle"
  ],
  "lastUpdate": "2026-01-09T10:30:00.000Z"
}
```

#### 1.2 Rapport de risque complet

```http
GET /risk/central/company/{companyId}/full-report
```

**Description**: Génère un rapport de risque détaillé avec analyse financière complète.

**Réponse (200 OK) :**

```json
{
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "generateDate": "2026-01-09T12:00:00.000Z",
  "creditScore": 72,
  "riskCategory": "medium",
  "financialAnalysis": {
    "balanceSheet": {
      "totalAssets": 500000000,
      "totalLiabilities": 300000000,
      "equity": 200000000
    },
    "incomeStatement": {
      "revenue": 120000000,
      "netIncome": 15000000
    },
    "cashFlow": {
      "operatingCashFlow": 20000000,
      "investingCashFlow": -5000000,
      "financingCashFlow": -8000000
    },
    "keyRatios": {
      "currentRatio": 1.5,
      "debtToEquity": 1.5,
      "returnOnEquity": 0.075,
      "interestCoverage": 3.2
    },
    "trends": {
      "revenue": [
        {"year": "2023", "value": 100000000},
        {"year": "2024", "value": 110000000},
        {"year": "2025", "value": 120000000}
      ]
    }
  },
  "creditHistory": {
    "engagements": [
      {
        "institution": "Rawbank",
        "type": "credit",
        "amount": 100000000,
        "startDate": "2024-01-15",
        "status": "actif"
      }
    ],
    "incidents": [
      {
        "type": "retard",
        "date": "2025-06-15",
        "amount": 5000000,
        "status": "régularisé"
      }
    ]
  },
  "marketAnalysis": {
    "sectorRisk": 0.35,
    "sectorTrend": "stable",
    "competitivePosition": "leader_regional",
    "marketShareTrend": "croissant"
  },
  "managementAssessment": {
    "experienceScore": 85,
    "stabilityScore": 78,
    "complianceScore": 92,
    "observations": [
      "Direction expérimentée avec 15+ ans",
      "Succession bien planifiée"
    ]
  },
  "recommendation": {
    "maxExposure": 200000000,
    "suggestedCollateral": ["hypothèque", "nantissement fonds commerce"],
    "monitoringFrequency": "trimestriel",
    "additionalConditions": [
      "Ratio d'endettement < 60%",
      "Reporting financier mensuel"
    ]
  }
}
```

#### 1.3 Historique des risques

```http
GET /risk/central/company/{companyId}/history
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `startDate` | string | Non | Date de début (ISO 8601) |
| `endDate` | string | Non | Date de fin (ISO 8601) |

**Réponse (200 OK) :**

```json
{
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "history": [
    {
      "date": "2026-01-01",
      "creditScore": 72,
      "riskCategory": "medium",
      "significantChanges": [
        {
          "type": "score_update",
          "description": "Amélioration du ratio de liquidité",
          "impact": "positive"
        }
      ]
    },
    {
      "date": "2025-10-01",
      "creditScore": 68,
      "riskCategory": "medium"
    }
  ],
  "trend": "improving",
  "volatility": 0.15
}
```

---

### 2. Incidents de Paiement

#### 2.1 Liste des incidents d'une entreprise

```http
GET /risk/central/company/{companyId}/incidents
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `period` | string | Non | Période de filtrage (ex: `12m`, `6m`, `3m`) |

**Réponse (200 OK) :**

```json
{
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "incidents": [
    {
      "id": "incident-uuid-1",
      "type": "retard",
      "date": "2025-12-15T00:00:00.000Z",
      "amount": 5000000,
      "days": 15,
      "institution": "Rawbank",
      "description": "Retard de paiement échéance décembre",
      "status": "régularisé",
      "regularisationDate": "2025-12-30T00:00:00.000Z"
    },
    {
      "id": "incident-uuid-2",
      "type": "effet",
      "date": "2025-06-01T00:00:00.000Z",
      "amount": 2500000,
      "institution": "TMB",
      "description": "Effet impayé",
      "status": "ouvert"
    }
  ],
  "summary": {
    "totalIncidents": 2,
    "totalAmount": 7500000,
    "byType": {
      "retard": 1,
      "effet": 1
    },
    "byStatus": {
      "régularisé": 1,
      "ouvert": 1
    },
    "averageDaysLate": 15
  }
}
```

---

### 3. Engagements d'une Entreprise

#### 3.1 Liste des engagements

```http
GET /risk/central/company/{companyId}/engagements
```

**Réponse (200 OK) :**

```json
{
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "totalEngagement": 150000000,
  "engagements": [
    {
      "id": "engagement-uuid-1",
      "institution": "Rawbank",
      "type": "credit",
      "startDate": "2024-01-15",
      "endDate": "2027-01-15",
      "initialAmount": 100000000,
      "currentAmount": 75000000,
      "currency": "CDF",
      "status": "actif",
      "paymentStatus": "normal"
    },
    {
      "id": "engagement-uuid-2",
      "institution": "TMB",
      "type": "leasing",
      "startDate": "2024-06-01",
      "endDate": "2028-06-01",
      "initialAmount": 50000000,
      "currentAmount": 45000000,
      "currency": "CDF",
      "status": "actif",
      "paymentStatus": "retard",
      "daysLate": 8
    }
  ],
  "summary": {
    "byType": {
      "credit": 75000000,
      "leasing": 45000000,
      "ligne_credit": 30000000
    },
    "byStatus": {
      "actif": 150000000,
      "cloture": 0
    },
    "byPaymentStatus": {
      "normal": 105000000,
      "retard": 45000000
    }
  }
}
```

---

### 4. Entrées de Risque

#### 4.1 Créer une entrée de risque

```http
POST /risk/central/entries
```

**Corps de la requête :**

```json
{
  "companyId": "company-uuid",
  "type": "incident_paiement",
  "date": "2026-01-09",
  "amount": 5000000,
  "description": "Retard de paiement sur échéance janvier",
  "severity": "medium",
  "source": "Rawbank",
  "attachmentUrls": [
    "https://storage.wanzo.com/docs/preuve-incident.pdf"
  ]
}
```

**Types disponibles**: `incident_paiement`, `credit`, `defaut`, `alerte`, `autre`

**Réponse (201 Created) :**

```json
{
  "id": "entry-uuid",
  "companyId": "company-uuid",
  "type": "incident_paiement",
  "date": "2026-01-09",
  "amount": 5000000,
  "description": "Retard de paiement sur échéance janvier",
  "severity": "medium",
  "source": "Rawbank",
  "attachmentUrls": ["https://storage.wanzo.com/docs/preuve-incident.pdf"],
  "created_at": "2026-01-09T10:30:00.000Z"
}
```

#### 4.2 Mettre à jour une entrée de risque

```http
PUT /risk/central/entries/{id}
```

**Corps de la requête :**

```json
{
  "status": "resolved",
  "resolution": "Paiement régularisé le 15 janvier 2026",
  "severity": "low"
}
```

**Réponse (200 OK) :**

```json
{
  "id": "entry-uuid",
  "companyId": "company-uuid",
  "type": "incident_paiement",
  "date": "2026-01-09",
  "amount": 5000000,
  "description": "Retard de paiement sur échéance janvier",
  "severity": "low",
  "status": "resolved",
  "resolution": "Paiement régularisé le 15 janvier 2026",
  "source": "Rawbank",
  "attachmentUrls": ["https://storage.wanzo.com/docs/preuve-incident.pdf"],
  "created_at": "2026-01-09T10:30:00.000Z",
  "updated_at": "2026-01-15T14:00:00.000Z"
}
```

---

### 5. Alertes de Risque

#### 5.1 Liste des alertes actives

```http
GET /risk/central/alerts
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `severity` | string | Non | Filtrer par sévérité (`low`, `medium`, `high`) |
| `type` | string | Non | Type d'alerte (`market`, `credit`, `operational`, `compliance`, `liquidity`) |
| `page` | number | Non | Page (défaut: 1) |
| `limit` | number | Non | Limite par page (défaut: 20) |

**Réponse (200 OK) :**

```json
{
  "data": [
    {
      "id": "alert-uuid-1",
      "type": "credit",
      "severity": "high",
      "title": "Risque de défaut détecté",
      "description": "Le score de crédit de l'entreprise XYZ est passé sous le seuil critique",
      "affectedEntities": [
        {
          "id": "company-xyz",
          "type": "company",
          "name": "Entreprise XYZ"
        }
      ],
      "createdAt": "2026-01-08T14:30:00.000Z",
      "status": "new"
    },
    {
      "id": "alert-uuid-2",
      "type": "market",
      "severity": "medium",
      "title": "Volatilité sectorielle",
      "description": "Le secteur agriculture présente une volatilité accrue",
      "affectedEntities": [
        {
          "id": "sector-agri",
          "type": "sector",
          "name": "Agriculture"
        }
      ],
      "createdAt": "2026-01-07T09:15:00.000Z",
      "status": "acknowledged"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 6. Statistiques Globales

#### 6.1 Statistiques de risque

```http
GET /risk/central/statistics
```

**Réponse (200 OK) :**

```json
{
  "totalCompanies": 1250,
  "riskDistribution": {
    "low": 520,
    "medium": 480,
    "high": 200,
    "very_high": 50
  },
  "sectorRiskHeatmap": [
    {
      "sector": "Commerce",
      "riskScore": 45,
      "exposure": 5000000000,
      "companies": 350
    },
    {
      "sector": "Agriculture",
      "riskScore": 62,
      "exposure": 3500000000,
      "companies": 280
    },
    {
      "sector": "Services",
      "riskScore": 38,
      "exposure": 4200000000,
      "companies": 320
    }
  ],
  "defaultRates": {
    "overall": 0.036,
    "byCompanySize": {
      "micro": 0.058,
      "small": 0.042,
      "medium": 0.028,
      "large": 0.015
    },
    "bySector": {
      "Commerce": 0.032,
      "Agriculture": 0.055,
      "Services": 0.028,
      "Industrie": 0.038
    }
  },
  "trends": {
    "period": "12_months",
    "defaultRate": [
      {"date": "2025-01", "value": 0.040},
      {"date": "2025-06", "value": 0.038},
      {"date": "2025-12", "value": 0.036}
    ],
    "riskDistribution": [
      {
        "date": "2025-01",
        "low": 480,
        "medium": 500,
        "high": 220,
        "very_high": 50
      },
      {
        "date": "2026-01",
        "low": 520,
        "medium": 480,
        "high": 200,
        "very_high": 50
      }
    ]
  }
}
```

---

### 7. API Risque par Type (risk.api.ts)

#### 7.1 Risque Crédit

```http
GET /risk/credit/{companyId}
```

**Réponse**: Données de risque crédit spécifiques (CreditRiskEntry)

#### 7.2 Risque Leasing

```http
GET /risk/leasing/{companyId}
```

**Réponse**: Données de risque leasing spécifiques (LeasingRiskEntry)

#### 7.3 Risque Investissement

```http
GET /risk/investment/{companyId}
```

**Réponse**: Données de risque investissement spécifiques (InvestmentRiskEntry)

#### 7.4 Soumettre une entrée de risque

```http
POST /risk/{type}
```

**Paramètres de chemin :**
- `type`: `credit`, `leasing`, ou `investment`

**Corps**: Données de l'entrée selon le type

#### 7.5 Mettre à jour une entrée de risque

```http
PUT /risk/{type}/{id}
```

#### 7.6 Résumé des risques

```http
GET /risk/summary
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `portfolioId` | string | Non | Filtrer par portefeuille |
| `fromDate` | string | Non | Date de début |
| `toDate` | string | Non | Date de fin |
| `riskLevel` | string | Non | Niveau de risque (`low`, `medium`, `high`, `critical`) |

**Réponse (200 OK) :**

```json
{
  "totalEntries": 450,
  "riskDistribution": {
    "low": 180,
    "medium": 150,
    "high": 90,
    "critical": 30
  },
  "topRiskyCompanies": [
    {
      "companyId": "company-xyz",
      "companyName": "Entreprise XYZ",
      "riskScore": 28,
      "riskLevel": "critical"
    },
    {
      "companyId": "company-abc",
      "companyName": "Entreprise ABC",
      "riskScore": 42,
      "riskLevel": "high"
    }
  ]
}
```

---

## 📊 Modèles de Données

### Enums

```typescript
// Catégories de risque
type RiskCategory = 'low' | 'medium' | 'high' | 'very_high';

// Types d'entrée de risque
type RiskEntryType = 'incident_paiement' | 'credit' | 'defaut' | 'alerte' | 'autre';

// Sévérités
type Severity = 'low' | 'medium' | 'high';

// Types d'incident
type IncidentType = 'cheque' | 'effet' | 'retard' | 'defaut';

// Statuts d'incident
type IncidentStatus = 'ouvert' | 'régularisé';

// Types d'engagement
type EngagementType = 'credit' | 'leasing' | 'ligne_credit' | 'garantie' | 'autre';

// Statuts d'engagement
type EngagementStatus = 'actif' | 'cloture' | 'en_defaut';

// Statuts de paiement
type PaymentStatus = 'normal' | 'retard' | 'defaut';

// Types d'alerte
type AlertType = 'market' | 'credit' | 'operational' | 'compliance' | 'liquidity';

// Statuts d'alerte
type AlertStatus = 'new' | 'acknowledged' | 'in_progress' | 'resolved';

// Statuts d'entrée de risque
type RiskEntryStatus = 'active' | 'resolved' | 'false_positive';

// Niveaux de risque (risk.api.ts)
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Impact des changements
type ChangeImpact = 'positive' | 'negative' | 'neutral';

// Tendances
type RiskTrend = 'improving' | 'stable' | 'deteriorating';
```

### Règles Métier

**Score de crédit :**
- 70-100 : Risque faible (`low`)
- 50-69 : Risque moyen (`medium`)
- 30-49 : Risque élevé (`high`)
- 0-29 : Risque très élevé (`very_high`)

**Incidents :**
- Non résolu après 90 jours → escalade automatique
- Historique conservé 5 ans

**Alertes :**
- Critiques → notification immédiate
- Non acquittées après 48h → escalade

---

## ❌ Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Accès non autorisé |
| 404 | Ressource non trouvée |
| 409 | Conflit (doublon) |
| 422 | Entité non traitable |
| 500 | Erreur serveur |

---

## 🔄 Correspondance Ancienne API

Pour la migration depuis l'ancienne API `/centrale-risque/*` :

| Ancien Endpoint | Nouvel Endpoint |
|-----------------|-----------------|
| `GET /centrale-risque/risk-entries` | `GET /risk/central/company/{id}` |
| `GET /centrale-risque/incidents` | `GET /risk/central/company/{id}/incidents` |
| `POST /centrale-risque/risk-entries` | `POST /risk/central/entries` |
| `GET /centrale-risque/stats` | `GET /risk/central/statistics` |
| `GET /centrale-risque/alerts` | `GET /risk/central/alerts` |
