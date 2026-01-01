# API des Demandes de Crédit - Portefeuille Traditionnel

Cette API permet de gérer les demandes de crédit dans le cadre des portefeuilles traditionnels, incluant la création, la consultation, l'analyse, l'approbation ou le rejet des demandes de crédit.

## Entités et DTOs

### CreditRequest (Entité principale)

```typescript
interface CreditRequest {
  id: string;
  memberId: string;                       // ID du client/entreprise
  productId: string;                      // ID du produit de crédit
  portfolioId?: string;                   // ID du portefeuille associé
  receptionDate: string;                  // Date de réception (ISO 8601)
  requestAmount: number;
  currency: string;                       // Code devise ISO 4217 (CDF, USD, XOF, EUR, XAF)
  periodicity: CreditPeriodicity;
  interestRate: number;                   // Taux d'intérêt en %
  reason: string;                         // Motif de la demande
  scheduleType: 'constant' | 'degressive';
  schedulesCount: number;                 // Nombre d'échéances
  deferredPaymentsCount: number;          // Nombre d'échéances différées
  gracePeriod?: number;                   // Période de grâce en mois
  financingPurpose: string;               // Objectif du financement
  creditManagerId: string;                // ID du gestionnaire de crédit
  status: CreditRequestStatus;
  isGroup: boolean;                       // Crédit de groupe ou individuel
  groupId?: string;                       // ID du groupe si crédit de groupe
  distributions?: CreditDistribution[];   // Répartition si crédit de groupe
  documents?: CreditDocument[];           // Documents justificatifs
  rejectionReason?: string;               // Raison du rejet si rejeté
  metadata?: CreditRequestMetadata;       // Métadonnées de synchronisation
  createdAt: string;
  updatedAt?: string;
}
```

### Enums et Types

```typescript
// Statuts de la demande de crédit (15 valeurs)
type CreditRequestStatus = 
  | 'draft'          // Brouillon (non soumis)
  | 'submitted'      // Soumis pour analyse
  | 'under_review'   // En cours d'examen
  | 'pending'        // En attente de décision
  | 'analysis'       // En analyse (scoring, vérifications)
  | 'approved'       // Approuvé (en attente de déblocage)
  | 'rejected'       // Rejeté
  | 'canceled'       // Annulé par le demandeur
  | 'disbursed'      // Déboursé (fonds transférés)
  | 'active'         // Crédit actif (en cours de remboursement)
  | 'closed'         // Crédit clôturé (remboursé intégralement)
  | 'defaulted'      // En défaut de paiement
  | 'restructured'   // Restructuré (échéancier modifié)
  | 'consolidated'   // Consolidé avec d'autres crédits
  | 'in_litigation'; // En contentieux/litige

// Périodicité des remboursements (7 valeurs)
type CreditPeriodicity = 
  | 'daily'       // Quotidien
  | 'weekly'      // Hebdomadaire
  | 'biweekly'    // Bi-hebdomadaire
  | 'monthly'     // Mensuel
  | 'quarterly'   // Trimestriel
  | 'semiannual'  // Semestriel
  | 'annual';     // Annuel

// Types de documents acceptés (9 valeurs)
type CreditDocumentType = 
  | 'business_plan'        // Plan d'affaires
  | 'financial_statements' // États financiers
  | 'identity_document'    // Pièce d'identité
  | 'proof_of_address'     // Justificatif de domicile
  | 'tax_certificate'      // Attestation fiscale
  | 'bank_statements'      // Relevés bancaires
  | 'project_file'         // Dossier de projet
  | 'guarantee_document'   // Document de garantie
  | 'other';               // Autre document
```

### Types imbriqués

```typescript
// Document attaché à une demande
interface CreditDocument {
  id: string;
  name: string;
  type: CreditDocumentType;
  url: string;
  size?: number;                // Taille en bytes
  mimeType?: string;            // Type MIME (application/pdf, image/jpeg, etc.)
  uploadedBy?: string;          // ID de l'utilisateur qui a uploadé
  uploadedAt: string;           // Date d'upload (ISO 8601)
  description?: string;
}

// Métadonnées de synchronisation (avec gestion commerciale)
interface CreditRequestMetadata {
  sourceRequestId?: string;      // ID de la demande source
  syncedFrom?: string;           // Service source (ex: 'gestion_commerciale')
  businessInformation?: any;     // Informations commerciales
  financialInformation?: any;    // Informations financières
  creditScore?: any;             // Score de crédit
  firstSyncAt?: string;          // Date de première synchronisation
  lastSyncAt?: string;           // Date de dernière synchronisation
}

// Répartition pour crédit de groupe
interface CreditDistribution {
  id: string;
  creditRequestId: string;
  memberId: string;              // ID du membre du groupe
  amount: number;                // Montant attribué
  createdAt: string;
}

// Analyse de crédit
interface CreditAnalysis {
  id: string;
  creditRequestId: string;
  financialData: {
    income: number;              // Revenus
    expenses: number;            // Dépenses
    existingDebts: number;       // Dettes existantes
    assets: number;              // Actifs
  };
  creditAssessment: {
    debtToIncomeRatio: number;   // Ratio dette/revenu
    creditScore: number;         // Score de crédit
    repaymentCapacity: number;   // Capacité de remboursement
    riskLevel: 'low' | 'medium' | 'high';
  };
  recommendation: 'approve' | 'reject' | 'pending';
  comments: string;
  analyzedBy: string;            // ID de l'analyste
  analyzedAt: string;
  createdAt: string;
  updatedAt?: string;
}

// Garant physique
interface PhysicalGuarantor {
  id: string;
  firstName: string;
  lastName: string;
  idType: 'passport' | 'nationalId' | 'drivingLicense' | 'other';
  idNumber: string;
  gender: 'male' | 'female' | 'other';
  profession: string;
  employer?: string;
  address: string;
  photoUrl?: string;
  signatureUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// Garant moral (personne morale)
interface LegalGuarantor {
  id: string;
  name: string;
  registrationNumber: string;
  registrationDate: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
}
```

## Points d'accès

### Liste des demandes de crédit

**Endpoint** : `GET /portfolios/traditional/credit-requests`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `portfolioId` | string | Non | Filtrer par portefeuille |
| `status` | CreditRequestStatus | Non | Filtrer par statut |
| `clientId` | string | Non | Filtrer par client/membre |
| `productId` | string | Non | Filtrer par produit |
| `dateFrom` | string | Non | Date de création min (ISO 8601) |
| `dateTo` | string | Non | Date de création max (ISO 8601) |
| `search` | string | Non | Recherche textuelle |
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Éléments par page (défaut: 10) |
| `sortBy` | string | Non | Champ de tri (createdAt, requestAmount) |
| `sortOrder` | string | Non | Ordre (asc, desc) |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "CR-00001",
      "memberId": "COMP-001",
      "productId": "PROD-001",
      "portfolioId": "TP-00001",
      "receptionDate": "2025-02-01",
      "requestAmount": 50000.00,
      "currency": "USD",
      "periodicity": "monthly",
      "interestRate": 8.5,
      "reason": "Expansion des activités commerciales",
      "scheduleType": "constant",
      "schedulesCount": 12,
      "deferredPaymentsCount": 0,
      "gracePeriod": 1,
      "financingPurpose": "Achat de stocks et équipements",
      "creditManagerId": "USER-001",
      "status": "approved",
      "isGroup": false,
      "documents": [
        {
          "id": "DOC-001",
          "name": "Plan d'affaires.pdf",
          "type": "business_plan",
          "url": "/documents/CR-00001/business-plan.pdf",
          "size": 2457600,
          "mimeType": "application/pdf",
          "uploadedAt": "2025-02-01T09:00:00Z"
        },
        {
          "id": "DOC-002",
          "name": "États financiers 2024.pdf",
          "type": "financial_statements",
          "url": "/documents/CR-00001/financials.pdf",
          "size": 1843200,
          "mimeType": "application/pdf",
          "uploadedAt": "2025-02-01T09:15:00Z"
        }
      ],
      "metadata": {
        "syncedFrom": "gestion_commerciale",
        "sourceRequestId": "GC-2025-00123",
        "lastSyncAt": "2025-02-01T10:00:00Z"
      },
      "createdAt": "2025-02-01T09:30:00Z",
      "updatedAt": "2025-02-05T14:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Détails d'une demande

**Endpoint** : `GET /portfolios/traditional/credit-requests/{id}`

**Réponse réussie** (200 OK) : Retourne l'objet `CreditRequest` complet avec ses relations (documents, garanties, analyse).

### Créer une demande de crédit

**Endpoint** : `POST /portfolios/traditional/credit-requests`

**Corps de la requête** :

```json
{
  "memberId": "COMP-001",
  "productId": "PROD-001",
  "portfolioId": "TP-00001",
  "receptionDate": "2025-02-01",
  "requestAmount": 50000.00,
  "currency": "USD",
  "periodicity": "monthly",
  "interestRate": 8.5,
  "reason": "Expansion des activités commerciales",
  "scheduleType": "constant",
  "schedulesCount": 12,
  "deferredPaymentsCount": 0,
  "gracePeriod": 1,
  "financingPurpose": "Achat de stocks et équipements",
  "creditManagerId": "USER-001",
  "isGroup": false
}
```

**Réponse réussie** (201 Created) : Retourne l'objet `CreditRequest` créé avec statut `draft`.

### Mettre à jour une demande

**Endpoint** : `PUT /portfolios/traditional/credit-requests/{id}`

**Corps de la requête** : Champs partiels de `CreditRequest`

**Note** : Seules les demandes avec statut `draft` ou `submitted` peuvent être modifiées.

### Soumettre une demande

**Endpoint** : `POST /portfolios/traditional/credit-requests/{id}/submit`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "CR-00001",
    "status": "submitted",
    "updatedAt": "2025-02-01T10:00:00Z"
  }
}
```

### Approuver une demande

**Endpoint** : `POST /portfolios/traditional/credit-requests/{id}/approve`

**Corps de la requête** :

```json
{
  "approvedAmount": 50000.00,
  "approvedInterestRate": 8.5,
  "conditions": "Mise en place des garanties avant déblocage",
  "approvedBy": "USER-002"
}
```

### Rejeter une demande

**Endpoint** : `POST /portfolios/traditional/credit-requests/{id}/reject`

**Corps de la requête** :

```json
{
  "rejectionReason": "Capacité de remboursement insuffisante",
  "rejectedBy": "USER-002"
}
```

### Annuler une demande

**Endpoint** : `POST /portfolios/traditional/credit-requests/{id}/cancel`

**Corps de la requête** :

```json
{
  "cancellationReason": "Demande annulée par le client"
}
```

### Ajouter un document

**Endpoint** : `POST /portfolios/traditional/credit-requests/{id}/documents`

**Corps de la requête** (multipart/form-data) :
- `file`: Fichier du document (PDF, PNG, JPG)
- `type`: Type de document (CreditDocumentType)
- `description`: Description optionnelle

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "DOC-003",
    "name": "Relevé bancaire.pdf",
    "type": "bank_statements",
    "url": "/documents/CR-00001/bank-statement.pdf",
    "size": 524288,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-02-02T11:00:00Z"
  }
}
```

### Supprimer un document

**Endpoint** : `DELETE /portfolios/traditional/credit-requests/{id}/documents/{documentId}`

### Analyse de crédit

**Endpoint** : `POST /portfolios/traditional/credit-requests/{id}/analysis`

**Corps de la requête** :

```json
{
  "financialData": {
    "income": 15000.00,
    "expenses": 8000.00,
    "existingDebts": 5000.00,
    "assets": 100000.00
  },
  "creditAssessment": {
    "debtToIncomeRatio": 0.33,
    "creditScore": 720,
    "repaymentCapacity": 7000.00,
    "riskLevel": "low"
  },
  "recommendation": "approve",
  "comments": "Profil solide avec capacité de remboursement adéquate"
}
```

### Synchronisation depuis gestion commerciale

**Endpoint** : `POST /portfolios/traditional/credit-requests/sync`

**Corps de la requête** :

```json
{
  "sourceRequestId": "GC-2025-00123",
  "syncedFrom": "gestion_commerciale",
  "memberId": "COMP-001",
  "requestAmount": 50000.00,
  "currency": "USD",
  "businessInformation": {
    "sector": "Commerce",
    "yearsInBusiness": 5
  },
  "financialInformation": {
    "annualRevenue": 200000.00,
    "netProfit": 30000.00
  },
  "creditScore": {
    "score": 720,
    "rating": "A"
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides ou paramètres manquants |
| 404 | Demande non trouvée |
| 409 | Conflit (transition de statut non autorisée) |
| 422 | Opération non autorisée selon le statut |

## Règles métier

1. **Transitions de statut** :
   - `draft` → `submitted`
   - `submitted` → `under_review` → `analysis` → `approved` / `rejected`
   - `approved` → `disbursed` → `active`
   - `active` → `closed` / `defaulted` / `restructured`
   - `canceled` peut survenir depuis `draft`, `submitted`, `pending`

2. **Documents requis** : 
   - Minimum 2 documents obligatoires avant soumission
   - `business_plan` ou `project_file` requis
   - `financial_statements` ou `bank_statements` requis

3. **Montants** :
   - Montant minimum : défini par le produit
   - Montant maximum : défini par le produit et la capacité

4. **Période de grâce** :
   - Maximum 6 mois selon le produit
   - Différé des intérêts configurable

5. **Synchronisation** :
   - Les demandes synchronisées conservent l'ID source
   - Mise à jour automatique des métadonnées à chaque sync
