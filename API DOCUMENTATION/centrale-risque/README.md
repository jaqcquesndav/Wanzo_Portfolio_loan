# Centrale des Risques

> **Synchronisée avec le code source** - Janvier 2026

Cette API permet de gérer les données de la Centrale des Risques, incluant les entrées de risque, les incidents de paiement, les alertes et les statistiques globales.

## 🔗 Base URL

**Développement :** `http://localhost:8000/portfolio/api/v1/centrale-risque`  
**Production :** `https://api.wanzo.com/portfolio/api/v1/centrale-risque`

**Route UI**: `/app/:portfolioType/central-risque`  
**Controller**: `centrale-risque.controller.ts`

---

## 📡 Endpoints

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
      "institutionId": "institution-uuid",
      "institutionName": "Rawbank",
      "riskType": "credit",
      "amount": 50000000,
      "currency": "CDF",
      "status": "active",
      "creditScore": 72,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2026-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z"
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

**Réponse (200 OK) :** Même structure que ci-dessus (objet unique)

#### 1.3 Créer une entrée de risque

```http
POST /centrale-risque/risk-entries
```

**Corps de la requête :**

```json
{
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "institutionId": "institution-uuid",
  "institutionName": "Rawbank",
  "riskType": "credit",
  "amount": 50000000,
  "currency": "CDF",
  "status": "active",
  "creditScore": 72,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2026-01-01T00:00:00.000Z",
  "collateral": {
    "type": "immobilier",
    "value": 80000000,
    "description": "Terrain à Gombe"
  }
}
```

**Réponse (201 Created) :** Entrée créée avec ID

#### 1.4 Mettre à jour une entrée de risque

```http
PUT /centrale-risque/risk-entries/:id
```

**Corps de la requête :** Champs partiels de l'entrée

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
| `companyId` | string | Non | Filtrer par entreprise |
| `type` | string | Non | Type (`cheque`, `effet`, `retard`, `autre`) |
| `status` | string | Non | Statut (`pending`, `resolved`, `escalated`) |
| `severity` | string | Non | Sévérité (`low`, `medium`, `high`, `critical`) |
| `dateFrom` | string | Non | Date début (ISO 8601) |
| `dateTo` | string | Non | Date fin (ISO 8601) |

**Réponse (200 OK) :**

```json
{
  "data": [
    {
      "id": "incident-uuid",
      "companyId": "company-uuid",
      "companyName": "Entreprise ABC",
      "type": "retard",
      "severity": "medium",
      "amount": 5000000,
      "currency": "CDF",
      "description": "Retard de paiement échéance janvier",
      "incidentDate": "2025-01-15T00:00:00.000Z",
      "status": "resolved",
      "reportedBy": "institution-uuid",
      "reportedByName": "Rawbank",
      "resolution": {
        "resolvedAt": "2025-01-25T00:00:00.000Z",
        "resolvedBy": "user-uuid",
        "method": "Paiement régularisé",
        "notes": "Paiement effectué avec pénalités"
      },
      "createdAt": "2025-01-15T08:00:00.000Z"
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
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "type": "cheque",
  "severity": "high",
  "amount": 2500000,
  "currency": "CDF",
  "description": "Chèque impayé - insuffisance de provision",
  "incidentDate": "2025-02-01T00:00:00.000Z",
  "reportedBy": "institution-uuid"
}
```

#### 2.4 Mettre à jour un incident

```http
PUT /centrale-risque/incidents/:id
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
| `companyId` | string | Non | Filtrer par entreprise |
| `type` | string | Non | Type d'alerte |
| `severity` | string | Non | Sévérité (`low`, `medium`, `high`, `critical`) |
| `isAcknowledged` | boolean | Non | Filtrer par acquittement |
| `dateFrom` | string | Non | Date début |
| `dateTo` | string | Non | Date fin |

**Réponse (200 OK) :**

```json
{
  "data": [
    {
      "id": "alert-uuid",
      "companyId": "company-uuid",
      "companyName": "Entreprise ABC",
      "type": "credit_score_drop",
      "severity": "high",
      "title": "Baisse du score de crédit",
      "message": "Score de crédit passé de 78 à 65 (-13 points)",
      "triggeredAt": "2025-02-01T08:00:00.000Z",
      "isAcknowledged": false,
      "acknowledgedAt": null,
      "acknowledgedBy": null,
      "metadata": {
        "previousValue": 78,
        "currentValue": 65,
        "threshold": 10
      }
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
  "companyId": "company-uuid",
  "companyName": "Entreprise ABC",
  "type": "payment_delay",
  "severity": "medium",
  "title": "Retard de paiement détecté",
  "message": "L'entreprise a un retard de 15 jours sur l'échéance",
  "metadata": {
    "daysLate": 15,
    "amount": 5000000
  }
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
  "acknowledgedBy": "user-uuid",
  "notes": "Alerte traitée, situation suivie de près"
}
```

**Réponse (200 OK) :**

```json
{
  "id": "alert-uuid",
  "isAcknowledged": true,
  "acknowledgedAt": "2025-02-01T10:30:00.000Z",
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
    "veryHigh": 20
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
  "lastUpdated": "2025-02-01T12:00:00.000Z"
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
  "entityType": "company",
  "creditScore": 72,
  "riskCategory": "medium",
  "totalExposure": 150000000,
  "activeCredits": 3,
  "incidents": {
    "total": 2,
    "pending": 0,
    "resolved": 2
  },
  "alerts": {
    "total": 1,
    "unacknowledged": 0
  },
  "financialHealth": {
    "solvency": 0.65,
    "liquidity": 1.2,
    "profitability": 0.08,
    "debtRatio": 0.45
  },
  "lastUpdate": "2025-02-01T10:30:00.000Z"
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
  "entityType": "company",
  "reportType": "full",
  "includeHistory": true,
  "periodStart": "2024-01-01",
  "periodEnd": "2025-01-31"
}
```

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
GET /centrale-risque/risk-summary?companyId={companyId}
```

---

## 📊 Modèles de Données

### Enums

```typescript
// Types de risque
type RiskType = 'credit' | 'leasing' | 'investment';

// Statuts d'entrée
type RiskEntryStatus = 'active' | 'closed' | 'defaulted' | 'restructured';

// Types d'incident
type IncidentType = 'cheque' | 'effet' | 'retard' | 'autre';

// Statuts d'incident
type IncidentStatus = 'pending' | 'resolved' | 'escalated';

// Types d'alerte (8 valeurs)
type AlertType = 
  | 'credit_score_drop'      // Baisse du score de crédit
  | 'payment_delay'          // Retard de paiement
  | 'exposure_limit'         // Limite d'exposition atteinte
  | 'new_incident'           // Nouvel incident de paiement
  | 'risk_increase'          // Augmentation du niveau de risque
  | 'classification_change'  // Changement de classification OHADA/BCC
  | 'payment_missed'         // Échéance manquée
  | 'provisioning_required'; // Provisionnement requis

// Sévérités
type Severity = 'low' | 'medium' | 'high' | 'critical';

// Statuts d'alerte
type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

// Catégories de risque
type RiskCategory = 'low' | 'medium' | 'high' | 'very_high';
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
