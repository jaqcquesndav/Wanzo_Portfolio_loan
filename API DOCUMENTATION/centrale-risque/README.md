# Centrale des Risques

Cette API permet de gérer les données de la Centrale des Risques, incluant les profils de risque des entreprises, les incidents de paiement, les alertes et les statistiques globales.

**Route UI**: `/app/:portfolioType/central-risque`  
**Page**: `src/pages/CentralRisque.tsx`  
**Label Navigation**: "Centrale des Risques"

## Entités et DTOs

### CompanyRiskProfile (Profil de risque d'une entreprise)

```typescript
interface CompanyRiskProfile {
  companyId: string;
  companyName: string;
  creditScore: number;                    // Score de crédit (0-100)
  riskCategory: RiskCategory;
  financialHealth: FinancialHealth;       // Indicateurs de santé financière
  creditHistory: CreditHistory;           // Historique de crédit
  defaultProbability: number;             // Probabilité de défaut (0-1)
  recommendedActions: string[];           // Actions recommandées
  lastUpdate: string;                     // ISO 8601
}
```

### PaymentIncident (Incident de paiement)

```typescript
interface PaymentIncident {
  id: string;
  companyId: string;
  type: IncidentType;
  amount: number;
  date: string;                          // ISO 8601
  status: IncidentStatus;
  description: string;
  institution: string;                   // Institution rapportant l'incident
  resolution?: {
    date: string;
    method: string;
    notes: string;
  };
}
```

### CentralRiskEntry (Entrée de risque)

```typescript
interface CentralRiskEntry {
  id: string;
  companyId: string;
  companyName: string;
  institution: string;
  sector: string;
  riskType: RiskType;
  amount: number;
  currency: string;                      // Code ISO 4217
  status: RiskEntryStatus;
  startDate: string;                     // ISO 8601
  endDate?: string;
  creditScore: number;
  collateral?: Collateral;               // Garantie/Sûreté
  guarantees?: Guarantee[];              // Garanties supplémentaires
  paymentHistory: PaymentHistoryItem[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastModifiedBy: string;
  };
}
```

### Enums et Types

```typescript
// Catégories de risque (4 valeurs)
type RiskCategory = 'low' | 'medium' | 'high' | 'very_high';

// Types d'incidents (4 valeurs)
type IncidentType = 'cheque' | 'effet' | 'retard' | 'autre';

// Statuts d'incident (3 valeurs)
type IncidentStatus = 'pending' | 'resolved' | 'escalated';

// Types de risque (3 valeurs)
type RiskType = 'credit' | 'leasing' | 'investment';

// Statuts d'entrée de risque (4 valeurs)
type RiskEntryStatus = 'active' | 'closed' | 'defaulted' | 'restructured';

// Types d'alertes (4 valeurs)
type AlertType = 'credit_score_drop' | 'payment_delay' | 'exposure_limit' | 'new_incident';

// Sévérités d'alerte (4 valeurs)
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
```

### Types imbriqués

```typescript
// Santé financière
interface FinancialHealth {
  solvabilite: number;          // Ratio de solvabilité
  liquidite: number;            // Ratio de liquidité
  rentabilite: number;          // Ratio de rentabilité
  endettement: number;          // Ratio d'endettement
  scoreGlobal: number;          // Score global (0-100)
}

// Historique de crédit
interface CreditHistory {
  encoursTotalActuel: number;       // Encours total actuel
  encoursTotalHistorique: number;   // Encours total historique
  repartitionParType: {
    creditsBancaires: number;
    creditsBail: number;
    lignesDeCredit: number;
    autres: number;
  };
  incidents: {
    total: number;
    cheques: number;
    effets: number;
    retards: number;
  };
}

// Garantie/Sûreté
interface Collateral {
  type: string;
  value: number;
  description: string;
}

// Garantie supplémentaire
interface Guarantee {
  type: string;
  amount: number;
  provider: string;
}

// Historique de paiement
interface PaymentHistoryItem {
  date: string;
  amount: number;
  status: 'paid' | 'late' | 'missed';
  daysLate?: number;
}

// Alerte de risque
interface RiskAlert {
  id: string;
  companyId: string;
  companyName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  metadata: {
    previousValue?: number;
    currentValue?: number;
    threshold?: number;
    details?: Record<string, unknown>;
  };
}

// Statistiques de la centrale
interface CentralRiskStatistics {
  totalEntries: number;
  activeEntries: number;
  defaultedEntries: number;
  totalExposure: number;
  averageCreditScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    very_high: number;
  };
  sectorDistribution: SectorDistribution[];
  institutionDistribution: InstitutionDistribution[];
  trends: RiskTrends;
}
```

## Points d'accès

### Profil de risque d'une entreprise

**Endpoint** : `GET /risk/central/company/{companyId}`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "companyId": "COMP-001",
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
      "encoursTotalHistorique": 450000000,
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
    "defaultProbability": 0.08,
    "recommendedActions": [
      "Surveillance rapprochée des flux de trésorerie",
      "Renforcement des garanties"
    ],
    "lastUpdate": "2025-02-01T10:30:00.000Z"
  }
}
```

### Incidents de paiement d'une entreprise

**Endpoint** : `GET /risk/central/company/{companyId}/incidents`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `type` | IncidentType | Non | Filtrer par type d'incident |
| `status` | IncidentStatus | Non | Filtrer par statut |
| `dateFrom` | string | Non | Date de début (ISO 8601) |
| `dateTo` | string | Non | Date de fin (ISO 8601) |
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Éléments par page (défaut: 10) |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "INC-001",
      "companyId": "COMP-001",
      "type": "retard",
      "amount": 5000000,
      "date": "2025-01-15T00:00:00.000Z",
      "status": "resolved",
      "description": "Retard de paiement échéance janvier",
      "institution": "Rawbank",
      "resolution": {
        "date": "2025-01-25T00:00:00.000Z",
        "method": "Paiement régularisé",
        "notes": "Paiement effectué avec pénalités"
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Créer une entrée de risque

**Endpoint** : `POST /risk/central/entries`

**Corps de la requête** :

```json
{
  "companyId": "COMP-001",
  "companyName": "Entreprise ABC",
  "institution": "Rawbank",
  "sector": "Commerce",
  "riskType": "credit",
  "amount": 50000000,
  "currency": "CDF",
  "status": "active",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2026-01-01T00:00:00.000Z",
  "creditScore": 72,
  "collateral": {
    "type": "immobilier",
    "value": 80000000,
    "description": "Terrain à Gombe"
  }
}
```

**Réponse réussie** (201 Created) :

```json
{
  "success": true,
  "data": {
    "id": "CRE-00001",
    "status": "created"
  }
}
```

### Mettre à jour une entrée de risque

**Endpoint** : `PUT /risk/central/entries/{id}`

**Corps de la requête** : Champs partiels de `CentralRiskEntry`

### Signaler un incident

**Endpoint** : `POST /risk/central/incidents`

**Corps de la requête** :

```json
{
  "companyId": "COMP-001",
  "type": "cheque",
  "amount": 2500000,
  "date": "2025-02-01T00:00:00.000Z",
  "description": "Chèque impayé - insuffisance de provision",
  "institution": "Equity Bank"
}
```

### Résoudre un incident

**Endpoint** : `PUT /risk/central/incidents/{id}/resolve`

**Corps de la requête** :

```json
{
  "method": "Régularisation par paiement",
  "notes": "Provision reconstituée et chèque représenté"
}
```

### Statistiques de la centrale

**Endpoint** : `GET /risk/central/statistics`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `sector` | string | Non | Filtrer par secteur |
| `institution` | string | Non | Filtrer par institution |
| `period` | string | Non | Période (month, quarter, year) |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "totalEntries": 1250,
    "activeEntries": 980,
    "defaultedEntries": 45,
    "totalExposure": 25000000000,
    "averageCreditScore": 68.5,
    "riskDistribution": {
      "low": 320,
      "medium": 480,
      "high": 180,
      "very_high": 20
    },
    "sectorDistribution": [
      {
        "sector": "Commerce",
        "count": 450,
        "exposure": 8500000000,
        "averageScore": 70.2
      },
      {
        "sector": "Industrie",
        "count": 280,
        "exposure": 9200000000,
        "averageScore": 65.8
      }
    ],
    "institutionDistribution": [
      {
        "institution": "Rawbank",
        "count": 320,
        "exposure": 7500000000,
        "averageScore": 71.5
      }
    ],
    "trends": {
      "period": "2025-Q1",
      "newEntries": 85,
      "closedEntries": 42,
      "defaultRate": 0.036,
      "recoveryRate": 0.72
    }
  }
}
```

### Recherche d'entreprises à risque

**Endpoint** : `GET /risk/central/search`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `query` | string | Non | Recherche textuelle |
| `riskCategory` | RiskCategory | Non | Filtrer par catégorie |
| `sector` | string | Non | Filtrer par secteur |
| `institution` | string | Non | Filtrer par institution |
| `minCreditScore` | number | Non | Score minimum |
| `maxCreditScore` | number | Non | Score maximum |
| `minExposure` | number | Non | Exposition minimum |
| `maxExposure` | number | Non | Exposition maximum |
| `status` | RiskEntryStatus | Non | Filtrer par statut |
| `page` | number | Non | Numéro de page |
| `limit` | number | Non | Éléments par page |
| `sortBy` | string | Non | Champ de tri |
| `sortOrder` | string | Non | Ordre (asc, desc) |

### Alertes de risque

**Endpoint** : `GET /risk/central/alerts`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `severity` | AlertSeverity | Non | Filtrer par sévérité |
| `type` | AlertType | Non | Filtrer par type |
| `acknowledged` | boolean | Non | Filtrer par état d'acquittement |
| `companyId` | string | Non | Filtrer par entreprise |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "ALERT-001",
      "companyId": "COMP-001",
      "companyName": "Entreprise ABC",
      "type": "credit_score_drop",
      "severity": "high",
      "message": "Score de crédit passé de 78 à 65 (-13 points)",
      "triggeredAt": "2025-02-01T08:00:00.000Z",
      "metadata": {
        "previousValue": 78,
        "currentValue": 65,
        "threshold": 10
      }
    }
  ]
}
```

### Acquitter une alerte

**Endpoint** : `PUT /risk/central/alerts/{id}/acknowledge`

## Configuration des seuils

**Endpoint** : `GET /risk/central/thresholds`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "creditScore": {
      "low": 70,
      "medium": 50,
      "high": 30
    },
    "exposureLimit": 100000000,
    "paymentDelayDays": 30,
    "defaultProbability": 0.15
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 404 | Entreprise ou entrée non trouvée |
| 409 | Conflit (incident déjà signalé) |
| 422 | Opération non autorisée |

## Règles métier

1. **Score de crédit** : 
   - 70-100 : Risque faible (low)
   - 50-69 : Risque moyen (medium)
   - 30-49 : Risque élevé (high)
   - 0-29 : Risque très élevé (very_high)

2. **Incidents** :
   - Un incident non résolu après 90 jours passe automatiquement en "escalated"
   - Les incidents résolus sont conservés 5 ans dans l'historique

3. **Alertes** :
   - Les alertes critiques génèrent une notification immédiate
   - Les alertes non acquittées après 48h sont escaladées

4. **Mise à jour** :
   - Les profils de risque sont recalculés quotidiennement
   - Le score est recalculé automatiquement après chaque incident
