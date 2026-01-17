# Centrale de Risque - Documentation API Complète

> **Synchronisée avec le code source** - Janvier 2026

Ce document décrit les endpoints pour la gestion et l'évaluation des risques dans l'API Wanzo Portfolio Institution, basés sur les contrôleurs `RiskController` et `CentraleRisqueController`.

## 🔗 Base URL

**Développement :** `http://localhost:8000/portfolio/api/v1`  
**Production :** `https://api.wanzo.com/portfolio/api/v1`

---

## 📡 Endpoints d'Évaluation des Risques

> **Controller**: `risk.controller.ts` - Préfixe: `/risk`

### 1. Récupération de tous les risques

Récupère tous les risques avec filtrage optionnel par entreprise.

```http
GET /risk
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `companyId` | string | Non | Filtre par identifiant de l'entreprise |

**Réponse (200 OK) :**

```json
{
  "creditRisks": [
    {
      "id": "credit-risk-uuid",
      "companyId": "company-456",
      "companyName": "ABC Corp",
      "sector": "Manufacturing",
      "institution": "Rawbank",
      "encours": 50000000.00,
      "statut": "active",
      "coteCredit": "B+",
      "incidents": 0,
      "creditScore": 72,
      "debtRatio": 0.45,
      "lastUpdated": "2026-01-17T08:00:00.000Z"
    }
  ],
  "leasingRisks": [],
  "investmentRisks": []
}
```

### 2. Récupération d'un risque spécifique

Récupère les détails d'une entrée de risque par son identifiant.

```http
GET /risk/:id
```

**Paramètres de chemin :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | Oui | Identifiant unique de l'entrée de risque |

**Réponse (200 OK) :**

```json
{
  "id": "risk-entry-uuid",
  "companyId": "company-456",
  "companyName": "ABC Corp",
  "institution": "Rawbank",
  "institutionId": "inst-uuid",
  "sector": "Manufacturing",
  "riskType": "credit",
  "amount": 50000000.00,
  "currency": "CDF",
  "status": "active",
  "creditScore": 72,
  "riskScore": 7.2,
  "category": "medium",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2026-01-01T00:00:00.000Z",
  "collateral": {
    "type": "immobilier",
    "value": 80000000.00,
    "description": "Terrain à Gombe, Kinshasa"
  },
  "guarantees": [
    {
      "type": "caution_bancaire",
      "amount": 25000000.00,
      "provider": "Rawbank"
    }
  ],
  "paymentHistory": [
    {
      "date": "2025-02-15",
      "amount": 4500000.00,
      "status": "paid",
      "daysLate": 0
    }
  ],
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-15T14:30:00.000Z"
}
```

### 3. Risque crédit d'une entreprise

Récupère l'évaluation du risque crédit pour une entreprise spécifique.

```http
GET /risk/credit/:companyId
```

**Paramètres de chemin :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `companyId` | string | Oui | Identifiant unique de l'entreprise |

**Réponse (200 OK) :**

```json
{
  "companyId": "company-456",
  "creditRisks": [
    {
      "id": "credit-risk-uuid",
      "companyId": "company-456",
      "companyName": "ABC Corp",
      "sector": "Manufacturing",
      "institution": "Rawbank",
      "encours": 50000000.00,
      "statut": "active",
      "coteCredit": "B+",
      "incidents": 0,
      "creditScore": 72,
      "debtRatio": 0.45
    }
  ],
  "totalCount": 1
}
```

### 4. Risque leasing d'une entreprise

Récupère l'évaluation du risque leasing pour une entreprise spécifique.

```http
GET /risk/leasing/:companyId
```

**Paramètres de chemin :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `companyId` | string | Oui | Identifiant unique de l'entreprise |

**Réponse (200 OK) :**

```json
{
  "companyId": "company-456",
  "leasingRisks": [
    {
      "id": "leasing-risk-uuid",
      "companyId": "company-456",
      "companyName": "ABC Corp",
      "assetType": "Industrial Equipment",
      "assetValue": 40000000.00,
      "residualValue": 12000000.00,
      "leasingStatus": "active"
    }
  ],
  "totalCount": 1
}
```

---

## 📡 Endpoints de la Centrale des Risques

> **Controller**: `centrale-risque.controller.ts` - Préfixe: `/centrale-risque`

### 1. Entrées de Risque (Risk Entries)

#### 1.1 Liste des entrées de risque

```http
GET /centrale-risque/risk-entries
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `companyId` | string | Non | Filtrer par ID entreprise |
| `institutionId` | string | Non | Filtrer par ID institution |
| `riskType` | string | Non | Type de risque (`credit`, `leasing`, `investment`) |
| `status` | string | Non | Statut (`active`, `closed`, `defaulted`, `restructured`) |
| `category` | string | Non | Catégorie (`low`, `medium`, `high`, `very_high`) |
| `minCreditScore` | number | Non | Score minimum |
| `maxCreditScore` | number | Non | Score maximum |
| `page` | number | Non | Page (défaut: 1) |
| `limit` | number | Non | Limite (défaut: 20) |

**Réponse (200 OK) :**

```json
{
  "data": [
    {
      "id": "risk-entry-uuid",
      "companyId": "company-uuid",
      "companyName": "Entreprise ABC",
      "institution": "Rawbank",
      "institutionId": "institution-uuid",
      "sector": "Manufacturing",
      "riskType": "credit",
      "amount": 50000000,
      "currency": "CDF",
      "status": "active",
      "category": "medium",
      "creditScore": 72,
      "riskScore": 7.2,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2026-01-01T00:00:00.000Z",
      "collateral": {
        "type": "immobilier",
        "value": 80000000,
        "description": "Terrain à Gombe"
      },
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### 1.2 Détail d'une entrée de risque

```http
GET /centrale-risque/risk-entries/:id
```

#### 1.3 Créer une entrée de risque

```http
POST /centrale-risque/risk-entries
```

**Corps de la requête :**

```json
{
  "entityId": "company-uuid",
  "entityType": "corporate",
  "entityName": "Entreprise ABC",
  "sector": "Manufacturing",
  "reportingInstitutionId": "institution-uuid",
  "creditId": "credit-uuid",
  "category": "medium",
  "riskType": "credit",
  "amount": 50000000,
  "currency": "CDF",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2026-01-01T00:00:00.000Z",
  "creditScore": 72,
  "collateral": [
    {
      "type": "immobilier",
      "value": 80000000,
      "description": "Terrain à Gombe"
    }
  ],
  "guarantees": [
    {
      "type": "caution_bancaire",
      "provider": "Rawbank",
      "amount": 25000000
    }
  ]
}
```

**Réponse (201 Created) :**

```json
{
  "id": "risk-entry-uuid",
  "entityId": "company-uuid",
  "status": "active",
  "createdAt": "2026-01-17T10:00:00.000Z"
}
```

#### 1.4 Mettre à jour une entrée de risque

```http
PUT /centrale-risque/risk-entries/:id
```

**Corps de la requête :** Champs partiels de `CreateRiskEntryDto`

#### 1.5 Supprimer une entrée de risque

```http
DELETE /centrale-risque/risk-entries/:id
```

---

### 2. Incidents de Paiement

#### 2.1 Liste des incidents

```http
GET /centrale-risque/incidents
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `riskEntryId` | string | Non | Filtrer par entrée de risque |
| `type` | string | Non | Type (`cheque`, `effet`, `retard`, `autre`) |
| `status` | string | Non | Statut (`pending`, `resolved`, `escalated`) |
| `minSeverity` | number | Non | Sévérité minimum (1-10) |
| `maxSeverity` | number | Non | Sévérité maximum (1-10) |
| `incidentDateFrom` | string | Non | Date début (ISO 8601) |
| `incidentDateTo` | string | Non | Date fin (ISO 8601) |
| `minAmount` | number | Non | Montant minimum |
| `page` | number | Non | Page (défaut: 1) |
| `limit` | number | Non | Limite (défaut: 20) |

**Réponse (200 OK) :**

```json
{
  "data": [
    {
      "id": "incident-uuid",
      "riskEntryId": "risk-entry-uuid",
      "companyId": "company-uuid",
      "companyName": "Entreprise ABC",
      "type": "retard",
      "description": "Retard de paiement échéance janvier",
      "amount": 5000000,
      "daysOverdue": 15,
      "incidentDate": "2026-01-15T00:00:00.000Z",
      "severity": 5,
      "status": "pending",
      "institution": "Rawbank",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-01-15T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

#### 2.2 Détail d'un incident

```http
GET /centrale-risque/incidents/:id
```

#### 2.3 Créer un incident

```http
POST /centrale-risque/incidents
```

**Corps de la requête :**

```json
{
  "riskEntryId": "risk-entry-uuid",
  "type": "cheque",
  "description": "Chèque impayé - insuffisance de provision",
  "amount": 2500000,
  "daysOverdue": 0,
  "incidentDate": "2026-02-01T00:00:00.000Z",
  "severity": 7,
  "status": "pending"
}
```

#### 2.4 Mettre à jour un incident

```http
PUT /centrale-risque/incidents/:id
```

**Corps de la requête (résolution) :**

```json
{
  "status": "resolved",
  "resolvedDate": "2026-02-10T00:00:00.000Z",
  "resolution": {
    "date": "2026-02-10T00:00:00.000Z",
    "method": "Paiement régularisé avec pénalités",
    "notes": "Client a effectué le paiement avec 10 jours de retard"
  }
}
```

#### 2.5 Supprimer un incident

```http
DELETE /centrale-risque/incidents/:id
```

---

### 3. Alertes de Risque

#### 3.1 Liste des alertes

```http
GET /centrale-risque/alerts
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `riskEntryId` | string | Non | Filtrer par entrée de risque |
| `type` | string | Non | Type d'alerte (voir enum ci-dessous) |
| `severity` | string | Non | Sévérité (`low`, `medium`, `high`, `critical`) |
| `status` | string | Non | Statut (`active`, `acknowledged`, `resolved`, `dismissed`) |
| `unacknowledged` | boolean | Non | Filtrer les non acquittées |
| `triggeredAtFrom` | string | Non | Date début |
| `triggeredAtTo` | string | Non | Date fin |
| `page` | number | Non | Page (défaut: 1) |
| `limit` | number | Non | Limite (défaut: 20) |

**Types d'alertes disponibles :**

| Type | Description |
|------|-------------|
| `credit_score_drop` | Baisse du score de crédit |
| `payment_delay` | Retard de paiement |
| `exposure_limit` | Limite d'exposition atteinte |
| `new_incident` | Nouvel incident de paiement |
| `risk_increase` | Augmentation du niveau de risque |
| `classification_change` | Changement de classification OHADA/BCC |
| `payment_missed` | Échéance manquée |
| `provisioning_required` | Provisionnement requis |

**Réponse (200 OK) :**

```json
{
  "data": [
    {
      "id": "alert-uuid",
      "riskEntryId": "risk-entry-uuid",
      "companyId": "company-uuid",
      "companyName": "Entreprise ABC",
      "type": "classification_change",
      "severity": "high",
      "message": "Contrat CTR-20260001 passé de WATCH à SUBSTANDARD (45 jours de retard)",
      "status": "active",
      "triggeredAt": "2026-01-17T06:00:00.000Z",
      "acknowledgedAt": null,
      "acknowledgedBy": null,
      "metadata": {
        "previousValue": "watch",
        "currentValue": "substandard",
        "threshold": 30,
        "resolution": null
      },
      "createdAt": "2026-01-17T06:00:00.000Z",
      "updatedAt": "2026-01-17T06:00:00.000Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### 3.2 Détail d'une alerte

```http
GET /centrale-risque/alerts/:id
```

#### 3.3 Créer une alerte

```http
POST /centrale-risque/alerts
```

**Corps de la requête :**

```json
{
  "riskEntryId": "risk-entry-uuid",
  "type": "payment_delay",
  "severity": "medium",
  "message": "L'entreprise a un retard de 15 jours sur l'échéance de janvier",
  "triggeredAt": "2026-01-15T08:00:00.000Z",
  "metadata": {
    "daysOverdue": 15,
    "currentValue": 15,
    "threshold": 0
  },
  "status": "active"
}
```

#### 3.4 Mettre à jour une alerte

```http
PUT /centrale-risque/alerts/:id
```

#### 3.5 Acquitter une alerte

```http
PUT /centrale-risque/alerts/:id/acknowledge
```

**Corps de la requête :**

```json
{
  "userId": "user-uuid",
  "notes": "Alerte traitée - contact client effectué, plan de régularisation en cours"
}
```

**Réponse (200 OK) :**

```json
{
  "id": "alert-uuid",
  "status": "acknowledged",
  "acknowledgedAt": "2026-01-17T10:30:00.000Z",
  "acknowledgedBy": "user-uuid"
}
```

#### 3.6 Supprimer une alerte

```http
DELETE /centrale-risque/alerts/:id
```

---

### 4. Rapports et Statistiques

#### 4.1 Statistiques globales

```http
GET /centrale-risque/stats
```

**Réponse (200 OK) :**

```json
{
  "totalRiskEntries": 1250,
  "activeEntries": 980,
  "closedEntries": 225,
  "defaultedEntries": 45,
  "totalExposure": 25000000000,
  "averageCreditScore": 68.5,
  "riskDistribution": {
    "low": 320,
    "medium": 480,
    "high": 180,
    "very_high": 20
  },
  "incidentStats": {
    "total": 156,
    "pending": 23,
    "resolved": 128,
    "escalated": 5
  },
  "alertStats": {
    "total": 89,
    "unacknowledged": 12,
    "critical": 3
  },
  "lastUpdated": "2026-01-17T12:00:00.000Z"
}
```

#### 4.2 Résumé de risque d'une entité

```http
GET /centrale-risque/entity/:entityId/summary
```

**Réponse (200 OK) :**

```json
{
  "entityId": "company-uuid",
  "entityName": "Entreprise ABC",
  "entityType": "corporate",
  "sector": "Manufacturing",
  "creditScore": 72,
  "totalCredits": 5,
  "activeCredits": 3,
  "totalExposure": 150000000,
  "totalOutstanding": 85000000,
  "currency": "CDF",
  "totalIncidents": 2,
  "activeIncidents": 0,
  "activeAlerts": 1,
  "riskLevel": "medium",
  "lastUpdated": "2026-01-17T10:30:00.000Z"
}
```

#### 4.3 Générer un rapport de risque

```http
POST /centrale-risque/reports
```

**Corps de la requête :**

```json
{
  "entityId": "company-uuid",
  "entityType": "corporate",
  "reportType": "detailed",
  "format": "json",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2026-01-17T00:00:00.000Z",
  "includeClosedCredits": true,
  "includeIncidents": true
}
```

**Types de rapport :**

| Type | Description |
|------|-------------|
| `summary` | Résumé global |
| `detailed` | Rapport détaillé |
| `credit_history` | Historique de crédit |
| `incidents` | Incidents de paiement |
| `exposure` | Exposition au risque |
| `bcc_report` | Rapport pour la BCC |

**Formats disponibles :**

| Format | Description |
|--------|-------------|
| `json` | Format JSON |
| `pdf` | Document PDF |
| `excel` | Fichier Excel |
| `csv` | Fichier CSV |

---

### 5. Endpoints Legacy (Compatibilité)

Ces endpoints sont maintenus pour la rétro-compatibilité :

```http
GET /centrale-risque/credit-risks
GET /centrale-risque/credit-risks/:id
GET /centrale-risque/payment-incidents
GET /centrale-risque/credit-score-history
GET /centrale-risque/collaterals
GET /centrale-risque/company-loans
GET /centrale-risque/financial-transactions
```

---

## 📊 Modèles de Données

### Enums

```typescript
// Types de risque
enum RiskType {
  CREDIT = 'credit',
  LEASING = 'leasing',
  INVESTMENT = 'investment'
}

// Catégories de risque
enum RiskCategory {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

// Statuts d'entrée de risque
enum RiskEntryStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DEFAULTED = 'defaulted',
  RESTRUCTURED = 'restructured'
}

// Types d'incident
enum IncidentType {
  CHEQUE = 'cheque',      // Chèque impayé
  EFFET = 'effet',        // Effet impayé
  RETARD = 'retard',      // Retard de paiement
  AUTRE = 'autre'         // Autre type
}

// Statuts d'incident
enum IncidentStatus {
  PENDING = 'pending',      // En attente
  RESOLVED = 'resolved',    // Résolu
  ESCALATED = 'escalated'   // Escaladé
}

// Types d'alerte
enum AlertType {
  CREDIT_SCORE_DROP = 'credit_score_drop',
  PAYMENT_DELAY = 'payment_delay',
  EXPOSURE_LIMIT = 'exposure_limit',
  NEW_INCIDENT = 'new_incident',
  RISK_INCREASE = 'risk_increase',
  CLASSIFICATION_CHANGE = 'classification_change',
  PAYMENT_MISSED = 'payment_missed',
  PROVISIONING_REQUIRED = 'provisioning_required'
}

// Sévérités d'alerte
enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Statuts d'alerte
enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}
```

### Interfaces

```typescript
// Collatéral
interface Collateral {
  type: string;
  value: number;
  description: string;
}

// Garantie
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

// Résolution d'incident
interface IncidentResolution {
  date: string;
  method: string;
  notes: string;
}

// Métadonnées d'alerte
interface AlertMetadata {
  previousValue?: number | string;
  currentValue?: number | string;
  threshold?: number;
  details?: Record<string, unknown>;
  resolution?: string;
}
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
- Alertes `classification_change` générées automatiquement par le système

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

## 🔗 Voir aussi

- [Statistiques de Risque OHADA/BCC](./risk-statistics.md)
- [README Centrale des Risques](./README.md)

---

*Documentation mise à jour le 17 janvier 2026 - Conforme aux contrôleurs `risk.controller.ts` et `centrale-risque.controller.ts`*
