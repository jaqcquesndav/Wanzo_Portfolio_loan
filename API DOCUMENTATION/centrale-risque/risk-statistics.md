# API des Statistiques de Risque

> **Synchronisée avec le code source** - Janvier 2026

Cette API expose les métriques de risque du portefeuille conformes aux normes OHADA/BCC (Banque Centrale du Congo), incluant les ratios PAR (Portfolio at Risk), NPL (Non-Performing Loans), et les calculs de provisions réglementaires.

## 🔗 Base URL

**Développement :** `http://localhost:8000/portfolio/api/v1/risk-statistics`  
**Production :** `https://api.wanzo.com/portfolio/api/v1/risk-statistics`

**Controller**: `risk-statistics.controller.ts`

---

## 📊 Classifications de Risque OHADA/BCC

Les créances sont classifiées selon les normes de la Banque Centrale du Congo :

| Classification | Jours de Retard | Taux de Provision | Description |
|----------------|-----------------|-------------------|-------------|
| `STANDARD` | 0 jours | 1% | Créances saines |
| `WATCH` | 1-30 jours | 5% | Créances à surveiller |
| `SUBSTANDARD` | 31-90 jours | 25% | Créances pré-douteuses |
| `DOUBTFUL` | 91-180 jours | 50% | Créances douteuses |
| `LOSS` | +180 jours | 100% | Créances compromises |

---

## 📡 Endpoints

### 1. Statistiques de Risque du Portefeuille

Récupère les statistiques globales de risque du portefeuille incluant PAR30, PAR90, ratio NPL et provisions requises.

```http
GET /risk-statistics/portfolio
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `institutionId` | string | Non | Filtrer par institution |

**Réponse (200 OK) :**

```json
{
  "par30": 8.5,
  "par90": 3.2,
  "nplRatio": 5.7,
  "provisionRequired": 125000000,
  "totalContracts": 1250,
  "totalAmount": 2500000000,
  "byClassification": {
    "STANDARD": {
      "count": 980,
      "amount": 1960000000,
      "provisionRate": 1,
      "provisionAmount": 19600000
    },
    "WATCH": {
      "count": 150,
      "amount": 300000000,
      "provisionRate": 5,
      "provisionAmount": 15000000
    },
    "SUBSTANDARD": {
      "count": 80,
      "amount": 160000000,
      "provisionRate": 25,
      "provisionAmount": 40000000
    },
    "DOUBTFUL": {
      "count": 30,
      "amount": 60000000,
      "provisionRate": 50,
      "provisionAmount": 30000000
    },
    "LOSS": {
      "count": 10,
      "amount": 20000000,
      "provisionRate": 100,
      "provisionAmount": 20000000
    }
  },
  "calculatedAt": "2026-01-17T10:00:00.000Z"
}
```

**Définitions des métriques :**

| Métrique | Formule | Description |
|----------|---------|-------------|
| `par30` | (Montant contrats >30j retard / Total encours) × 100 | Portfolio at Risk > 30 jours |
| `par90` | (Montant contrats >90j retard / Total encours) × 100 | Portfolio at Risk > 90 jours |
| `nplRatio` | (Montant NPL / Total encours) × 100 | Ratio de créances non-performantes |
| `provisionRequired` | Σ(Montant × Taux provision par classe) | Provision totale requise |

---

### 2. Jours de Retard d'un Contrat

Calcule le nombre de jours de retard pour un contrat spécifique basé sur l'échéance la plus ancienne non payée.

```http
GET /risk-statistics/contract/:contractId/days-overdue
```

**Paramètres de chemin :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `contractId` | string | Oui | ID du contrat |

**Réponse (200 OK) :**

```json
{
  "contractId": "contract-uuid",
  "daysOverdue": 45,
  "calculatedAt": "2026-01-17T10:00:00.000Z"
}
```

---

### 3. Mettre à Jour la Classification d'un Contrat

Déclenche manuellement la mise à jour de la classification de risque d'un contrat selon les jours de retard.

```http
POST /risk-statistics/contract/:contractId/update-classification
```

**Paramètres de chemin :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `contractId` | string | Oui | ID du contrat |

**Corps de la requête (optionnel) :**

```json
{
  "daysOverdue": 45
}
```

> **Note :** Si `daysOverdue` n'est pas fourni, le système calcule automatiquement les jours de retard.

**Réponse (200 OK) :**

```json
{
  "contractId": "contract-uuid",
  "contractNumber": "CTR-20260001",
  "riskClass": "SUBSTANDARD",
  "delinquencyDays": 45,
  "provisionRate": "25%",
  "updatedAt": "2026-01-17T10:00:00.000Z"
}
```

**Réponse erreur (404) :**

```json
{
  "error": "Contract not found",
  "contractId": "invalid-uuid"
}
```

---

### 4. Mettre à Jour Toutes les Classifications

Déclenche une mise à jour globale de toutes les classifications de risque des contrats actifs. **Opération lourde - utiliser avec précaution.**

```http
POST /risk-statistics/update-all-classifications
```

**Réponse (200 OK) :**

```json
{
  "message": "Classification update completed",
  "triggeredAt": "2026-01-17T10:00:00.000Z"
}
```

> **Note :** Cette opération est automatiquement exécutée quotidiennement à 6h00 via un job CRON.

---

### 5. Seuils Réglementaires OHADA/BCC

Récupère les seuils réglementaires configurés pour la classification des risques.

```http
GET /risk-statistics/regulatory-thresholds
```

**Réponse (200 OK) :**

```json
{
  "norm": "OHADA/BCC (Banque Centrale du Congo)",
  "classification": {
    "standard": {
      "description": "Créances saines",
      "daysOverdue": "0 jours",
      "provisionRate": "1%"
    },
    "watch": {
      "description": "Créances à surveiller",
      "daysOverdue": "1-30 jours",
      "provisionRate": "5%"
    },
    "substandard": {
      "description": "Créances pré-douteuses",
      "daysOverdue": "31-90 jours",
      "provisionRate": "25%"
    },
    "doubtful": {
      "description": "Créances douteuses",
      "daysOverdue": "91-180 jours",
      "provisionRate": "50%"
    },
    "loss": {
      "description": "Créances compromises",
      "daysOverdue": "+180 jours",
      "provisionRate": "100%"
    }
  },
  "provisionRates": {
    "standard": 1,
    "watch": 5,
    "substandard": 25,
    "doubtful": 50,
    "loss": 100
  }
}
```

---

### 6. Alertes de Risque Actives

Récupère toutes les alertes de risque actives (non résolues).

```http
GET /risk-statistics/alerts/active
```

**Paramètres de requête :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `companyId` | string | Non | Filtrer par entreprise |
| `severity` | string | Non | Filtrer par sévérité (`low`, `medium`, `high`, `critical`) |
| `type` | string | Non | Filtrer par type d'alerte |

**Types d'alertes disponibles :**

| Type | Description |
|------|-------------|
| `credit_score_drop` | Baisse du score de crédit |
| `payment_delay` | Retard de paiement |
| `exposure_limit` | Limite d'exposition atteinte |
| `new_incident` | Nouvel incident de paiement |
| `risk_increase` | Augmentation du niveau de risque |
| `classification_change` | Changement de classification |
| `payment_missed` | Échéance manquée |
| `provisioning_required` | Provisionnement requis |

**Réponse (200 OK) :**

```json
{
  "data": [
    {
      "id": "alert-uuid",
      "companyId": "company-uuid",
      "companyName": "Entreprise ABC",
      "type": "classification_change",
      "severity": "high",
      "message": "Contrat CTR-20260001 passé de WATCH à SUBSTANDARD",
      "status": "active",
      "triggeredAt": "2026-01-17T06:00:00.000Z",
      "metadata": {
        "previousValue": "watch",
        "currentValue": "substandard",
        "threshold": 30,
        "resolution": null
      },
      "riskEntryId": "risk-entry-uuid"
    },
    {
      "id": "alert-uuid-2",
      "companyId": "company-uuid-2",
      "companyName": "Société XYZ",
      "type": "payment_missed",
      "severity": "medium",
      "message": "Échéance de janvier 2026 non payée - 15 jours de retard",
      "status": "active",
      "triggeredAt": "2026-01-15T08:00:00.000Z",
      "metadata": {
        "daysOverdue": 15,
        "amount": 2500000,
        "currency": "CDF"
      }
    }
  ],
  "total": 2
}
```

---

## 📊 Modèles de Données

### Enums

```typescript
// Classification du risque (normes OHADA/BCC)
enum RiskClass {
  STANDARD = 'standard',       // Créance saine (0 jours)
  WATCH = 'watch',             // À surveiller (1-30 jours)
  SUBSTANDARD = 'substandard', // Pré-douteuse (31-90 jours)
  DOUBTFUL = 'doubtful',       // Douteuse (91-180 jours)
  LOSS = 'loss'                // Compromise (+180 jours)
}

// Types d'alertes de risque
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

// Sévérité des alertes
enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Statut des alertes
enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}
```

### Interfaces

```typescript
// Statistiques de risque du portefeuille
interface PortfolioRiskStats {
  par30: number;
  par90: number;
  nplRatio: number;
  provisionRequired: number;
  totalContracts: number;
  totalAmount: number;
  byClassification: {
    [key in RiskClass]: {
      count: number;
      amount: number;
      provisionRate: number;
      provisionAmount: number;
    };
  };
  calculatedAt: string;
}

// Métadonnées d'alerte
interface AlertMetadata {
  previousValue?: number | string;
  currentValue?: number | string;
  threshold?: number;
  details?: Record<string, unknown>;
  resolution?: string;
  daysOverdue?: number;
  amount?: number;
  currency?: string;
}
```

---

## ⏰ Jobs Automatiques

| Job | Fréquence | Description |
|-----|-----------|-------------|
| `updateAllContractRiskClassifications` | Quotidien à 6h00 | Met à jour toutes les classifications de risque |
| `updatePortfolioMetrics` | Toutes les heures | Recalcule les métriques PAR et NPL |

---

## ❌ Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Paramètres invalides |
| 401 | Non authentifié |
| 403 | Accès non autorisé |
| 404 | Contrat non trouvé |
| 500 | Erreur serveur |

---

## 🔗 Relations avec d'autres modules

- **Contrats** : Classification de risque appliquée aux contrats
- **Centrale des Risques** : Alertes créées automatiquement
- **Remboursements** : Calcul des jours de retard basé sur les échéances
- **Échéanciers** : Source des données pour le calcul PAR/NPL

---

*Documentation mise à jour le 17 janvier 2026 - Conforme au contrôleur `risk-statistics.controller.ts`*
