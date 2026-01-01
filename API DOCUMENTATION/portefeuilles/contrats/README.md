# API des Contrats de Crédit

Cette API permet de gérer les contrats de crédit, y compris la création, la consultation, la mise à jour, la restructuration et la gestion complète du cycle de vie des contrats.

## Entités et DTOs

### CreditContract (Entité principale)

```typescript
interface CreditContract {
  id: string;
  portfolioId: string;
  client_id: string;
  company_name: string;
  product_type: string;
  contract_number: string;
  amount: number;
  interest_rate: number;
  start_date: string;        // ISO 8601
  end_date: string;          // ISO 8601
  status: ContractStatus;
  amortization_method?: AmortizationMethod;
  terms: string;
  created_at: string;
  updated_at: string;
  funding_request_id?: string;
  
  // Champs additionnels
  creditRequestId?: string;
  memberId?: string;
  memberName?: string;
  productId?: string;
  productName?: string;
  disbursedAmount?: number;
  remainingAmount?: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  delinquencyDays?: number;
  riskClass?: RiskClass;
  guaranteesTotalValue?: number;
  guaranteeId?: string;
  scheduleId?: string;
  documentUrl?: string;
  duration?: number;
  grace_period?: number;
  
  // Consolidation
  consolidatedFrom?: string[];
  isConsolidated?: boolean;
  consolidatedTo?: string;
  
  // Défaut et litige
  default_date?: string;
  default_reason?: string;
  litigation_date?: string;
  litigation_reason?: string;
  completion_date?: string;
  
  // Relations imbriquées
  guarantees?: ContractGuarantee[];
  disbursements?: ContractDisbursement[];
  payment_schedule?: PaymentScheduleItem[];
  restructuring_history?: RestructuringEntry[];
  documents?: ContractDocument[];
}
```

### Enums et Types

```typescript
// Statuts du contrat (6 valeurs)
type ContractStatus = 
  | 'active'        // Contrat actif en cours
  | 'completed'     // Contrat terminé normalement
  | 'defaulted'     // Contrat en défaut de paiement
  | 'restructured'  // Contrat restructuré
  | 'in_litigation' // Contrat en contentieux
  | 'suspended';    // Contrat suspendu temporairement

// Méthode d'amortissement (4 valeurs)
type AmortizationMethod = 
  | 'linear'       // Amortissement linéaire (échéances constantes)
  | 'degressive'   // Amortissement dégressif
  | 'progressive'  // Amortissement progressif
  | 'balloon';     // Remboursement in fine (balloon)

// Classification du risque (5 valeurs - normes OHADA/BCC)
type RiskClass = 
  | 'standard'     // Créance saine
  | 'watch'        // À surveiller (1-30 jours)
  | 'substandard'  // Sous-standard (31-90 jours)
  | 'doubtful'     // Douteux (91-180 jours)
  | 'loss';        // Perte (>180 jours)

// Statut des échéances
type PaymentScheduleStatus = 
  | 'pending'   // En attente
  | 'paid'      // Payé
  | 'partial'   // Partiellement payé
  | 'late'      // En retard
  | 'defaulted';// En défaut
```

### Types imbriqués

```typescript
interface ContractGuarantee {
  id: string;
  type: string;
  description: string;
  value: number;
  currency: string;
  documents?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

interface ContractDisbursement {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
}

interface PaymentScheduleItem {
  id: string;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: PaymentScheduleStatus;
  payment_date?: string;
  payment_amount?: number;
  payment_reference?: string;
  installment_number: number;
  remaining_percentage?: number;
  remaining_amount?: number;
  transaction_reference?: string;
}

interface RestructuringEntry {
  date: string;
  reason: string;
  previous_terms: string;
  previous_rate: number;
  previous_end_date: string;
}

interface ContractDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}
```

## Points d'accès

### Liste des contrats de crédit

**Endpoint** : `GET /portfolios/traditional/credit-contracts`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `portfolioId` | string | Non | Filtrer par portefeuille |
| `status` | ContractStatus | Non | Filtrer par statut |
| `clientId` | string | Non | Filtrer par client |
| `productType` | string | Non | Filtrer par type de produit |
| `dateFrom` | string | Non | Date de début (ISO 8601) |
| `dateTo` | string | Non | Date de fin (ISO 8601) |
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Éléments par page (défaut: 10, max: 100) |

**Réponse réussie** (200 OK) :
```json
{
  "success": true,
  "data": [
    {
      "id": "CC-00001",
      "portfolioId": "TP-00001",
      "contract_number": "CTR-20250001",
      "client_id": "CL-00001",
      "company_name": "Entreprise ABC",
      "product_type": "Crédit PME",
      "amount": 50000.00,
      "interest_rate": 12.5,
      "start_date": "2025-01-15T00:00:00.000Z",
      "end_date": "2026-01-15T00:00:00.000Z",
      "status": "active",
      "amortization_method": "linear",
      "riskClass": "standard",
      "disbursedAmount": 50000.00,
      "remainingAmount": 45000.00,
      "nextPaymentDate": "2025-02-15T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Détails d'un contrat

**Endpoint** : `GET /portfolios/traditional/credit-contracts/{id}`

**Réponse réussie** (200 OK) : Retourne l'objet `CreditContract` complet avec toutes les relations.

### Créer un contrat depuis une demande approuvée

**Endpoint** : `POST /portfolios/traditional/credit-contracts/from-request`

**Corps de la requête** :
```json
{
  "portfolioId": "TP-00001",
  "creditRequestId": "CR-00001",
  "client_id": "CL-00001",
  "company_name": "Entreprise ABC",
  "product_type": "Crédit PME",
  "amount": 50000.00,
  "interest_rate": 12.5,
  "start_date": "2025-01-15T00:00:00.000Z",
  "end_date": "2026-01-15T00:00:00.000Z",
  "terms": "12 échéances - monthly",
  "amortization_method": "linear",
  "grace_period": 0
}
```

### Mettre à jour un contrat

**Endpoint** : `PUT /portfolios/traditional/credit-contracts/{id}`

**Corps de la requête** : Champs partiels de `CreditContract`

### Marquer en défaut

**Endpoint** : `POST /portfolios/traditional/credit-contracts/{id}/default`

**Corps de la requête** :
```json
{
  "reason": "Non-paiement depuis 90 jours",
  "default_date": "2025-04-15T00:00:00.000Z"
}
```

### Restructurer un contrat

**Endpoint** : `POST /portfolios/traditional/credit-contracts/{id}/restructure`

**Corps de la requête** :
```json
{
  "new_terms": "18 échéances - monthly",
  "new_interest_rate": 10.0,
  "new_end_date": "2026-07-15T00:00:00.000Z",
  "reason": "Difficultés temporaires de trésorerie"
}
```

### Clôturer un contrat

**Endpoint** : `POST /portfolios/traditional/credit-contracts/{id}/complete`

**Corps de la requête** :
```json
{
  "completion_date": "2026-01-15T00:00:00.000Z",
  "notes": "Remboursement intégral effectué"
}
```

### Générer le document du contrat

**Endpoint** : `POST /portfolios/traditional/credit-contracts/{id}/generate-document`

**Réponse réussie** (200 OK) :
```json
{
  "success": true,
  "documentUrl": "https://storage.example.com/contracts/CTR-20250001.pdf"
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 404 | Contrat non trouvé |
| 409 | Conflit (ex: contrat déjà clôturé) |
| 422 | Transition de statut invalide |

## Règles métier

1. **Création de contrat** : Uniquement depuis une demande avec statut `approved`
2. **Transitions de statut autorisées** :
   - `active` → `suspended`, `defaulted`, `in_litigation`, `completed`
   - `suspended` → `active`, `defaulted`, `in_litigation`
   - `defaulted` → `restructured`, `in_litigation`, `completed`
   - `in_litigation` → `completed`
   - `restructured` → `active`, `defaulted`
3. **Classification du risque** : Mise à jour automatique selon les jours de retard
