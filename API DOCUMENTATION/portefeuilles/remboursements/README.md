# API des Remboursements - Portefeuille Traditionnel

Cette API permet de gérer les remboursements associés aux contrats de crédit dans le cadre des portefeuilles traditionnels, incluant l'enregistrement des paiements, le suivi des échéances, les pénalités et la gestion des retards.

## Entités et DTOs

### CreditPayment (Entité principale)

```typescript
interface CreditPayment {
  id: string;
  contract_id: string;
  portfolio_id: string;
  client_id: string;
  payment_date: string;                      // ISO 8601
  amount: number;
  payment_method: string;                    // bank_transfer, mobile_money, cash, check
  payment_reference: string;
  transaction_reference?: string;            // Référence de la transaction
  status: PaymentStatus;
  payment_type: PaymentType;
  payment_details?: PaymentDetails;
  scheduled_payment_id?: string;
  notes?: string;
  receipt_url?: string;                      // URL du justificatif de paiement
  supporting_document_url?: string;          // URL de la pièce justificative
  has_supporting_document?: boolean;         // Indique si une pièce justificative est disponible
  description?: string;                      // Description du paiement
  created_at: string;
  updated_at: string;
  cancellation_reason?: string;
  cancellation_date?: string;
  
  // Comptes source et destination
  source_account?: PaymentAccountSource;     // Compte de l'entreprise emprunteuse
  destination_account?: PaymentAccountDest;  // Compte de l'institution/portefeuille
  
  // Champs de suivi des échéances
  due_date?: string;                         // Date d'échéance prévue
  remaining_amount?: number;                 // Montant restant à payer
  remaining_percentage?: number;             // Pourcentage du montant restant
  slippage?: number;                         // Glissement en jours (+retard, -avance)
  installment_number?: number;               // Numéro de l'échéance
  total_installments?: number;               // Nombre total d'échéances
}
```

### Enums et Types

```typescript
// Statuts du paiement (6 valeurs - incluant legacy)
type PaymentStatus = 
  | 'pending'     // En attente de validation/traitement
  | 'completed'   // Paiement effectué et validé
  | 'failed'      // Paiement échoué
  | 'cancelled'   // Paiement annulé
  // Legacy values
  | 'processing'  // En cours de traitement
  | 'partial';    // Partiellement payé

// Types de paiement (8 valeurs - incluant legacy)
type PaymentType = 
  | 'principal'    // Remboursement du capital uniquement
  | 'interest'     // Paiement des intérêts uniquement
  | 'penalty'      // Paiement des pénalités uniquement
  | 'mixed'        // Paiement combiné (capital + intérêts + pénalités)
  // Legacy values
  | 'standard'     // Paiement standard
  | 'partial'      // Paiement partiel
  | 'advance'      // Paiement anticipé
  | 'early_payoff';// Remboursement anticipé total

// Méthodes de paiement acceptées (5 valeurs)
type PaymentMethod = 
  | 'bank_transfer'  // Virement bancaire
  | 'mobile_money'   // Mobile Money
  | 'cash'           // Espèces
  | 'check'          // Chèque
  | 'other';         // Autre méthode
```

### Types imbriqués

```typescript
// Détails de la répartition du paiement
interface PaymentDetails {
  principal_amount: number;   // Montant du capital
  interest_amount: number;    // Montant des intérêts
  penalty_amount: number;     // Montant des pénalités
}

// Compte source (entreprise emprunteuse) - Bank ou Mobile Money
interface PaymentAccountSource {
  account_type: 'bank' | 'mobile_money';
  accountNumber: string;
  accountName: string;
  companyName: string;
  // Pour compte bancaire
  bankName?: string;
  bankCode?: string;
  // Pour Mobile Money
  provider?: string;          // Orange Money, M-Pesa, Airtel Money, etc.
}

// Compte destination (institution/portefeuille) - Bank ou Mobile Money
interface PaymentAccountDest {
  account_type: 'bank' | 'mobile_money';
  accountId: string;          // ID du compte dans le portefeuille
  accountNumber: string;
  accountName: string;
  portfolioId?: string;
  portfolioName?: string;
  // Pour compte bancaire
  bankName?: string;
  bankCode?: string;
  // Pour Mobile Money
  provider?: string;          // Orange Money, M-Pesa, Airtel Money, etc.
}
```

## Architecture Wallet-First (Février 2026)

> **Important pour le frontend** : Les remboursements de crédit utilisent désormais un flux **wallet-to-wallet asynchrone**. Le frontend n'a plus besoin de fournir les détails de compte source/destination ou la méthode de paiement — le transfert est effectué automatiquement par le wallet engine.

### Changements clés pour le frontend

| Avant (ancien flux) | Maintenant (wallet-first) |
|---------------------|---------------------------|
| `payment_method` requis | Plus requis — transfert via wallet engine |
| `transaction_reference` requis | Plus requis — fourni par callback wallet |
| `source_account` / `destination_account` requis | Plus requis — wallets résolus automatiquement |
| Statut retourné = `completed` directement | Statut retourné = `pending` (asynchrone) |
| Échéances traitées immédiatement | Échéances traitées APRÈS callback wallet |
| Flux synchrone | Flux asynchrone via Kafka |

### Flux frontend recommandé

```
1. POST /repayments              → Crée un remboursement (retourne PENDING)
2. Polling GET /repayments/{id}  → Attendre COMPLETED ou FAILED
3. Si COMPLETED : les échéances sont automatiquement mises à jour
```

### Ce qui se passe en backend après le POST

```
portfolio-institution-service
  └─ RepaymentService.create()
       ├─ Status = PENDING (échéances NON traitées à ce stade)
       └─ Kafka: portfolio.repayment.requested
            └─ payment-service (wallet engine)
                 ├─ DEBIT wallet PME
                 ├─ CREDIT wallet institution
                 └─ Kafka callback
                      ├─ portfolio.repayment.completed
                      │    └─ Status = COMPLETED
                      │    └─ Échéances allouées (STANDARD/PARTIAL/ADVANCE/EARLY_PAYOFF)
                      │    └─ Contrat mis à jour
                      └─ portfolio.repayment.failed → Status = FAILED
```

> **Note** : Le champ `transaction_reference` est rempli automatiquement par le callback. Le frontend peut le lire après le passage en COMPLETED.

---

## Points d'accès

### Liste des remboursements d'un contrat

Récupère la liste des remboursements effectués pour un contrat de crédit spécifique.

**Endpoint** : `GET /portfolios/traditional/repayments`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `portfolioId` | string | Non | Identifiant du portefeuille |
| `contractId` | string | Non | Identifiant du contrat |
| `status` | PaymentStatus | Non | Filtrer par statut |
| `payment_type` | PaymentType | Non | Filtrer par type de paiement |
| `dateFrom` | string | Non | Date de début (ISO 8601) |
| `dateTo` | string | Non | Date de fin (ISO 8601) |
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Éléments par page (défaut: 10, max: 100) |
| `sortBy` | string | Non | Champ de tri (payment_date, due_date, amount) |
| `sortOrder` | string | Non | Ordre de tri (asc, desc) |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174123",
      "contract_id": "CC-00001",
      "portfolio_id": "TP-00001",
      "client_id": "CLIENT-001",
      "payment_date": "2025-02-14T10:30:00.000Z",
      "amount": 4583.33,
      "payment_method": "bank_transfer",
      "payment_reference": "PMT-2025-0001",
      "transaction_reference": "BOA20250214103022",
      "status": "completed",
      "payment_type": "mixed",
      "payment_details": {
        "principal_amount": 3750.00,
        "interest_amount": 833.33,
        "penalty_amount": 0.00
      },
      "source_account": {
        "account_type": "bank",
        "accountNumber": "00010023456789",
        "accountName": "ENTREPRISE ABC SARL",
        "bankName": "Rawbank",
        "bankCode": "RBK",
        "companyName": "Entreprise ABC"
      },
      "destination_account": {
        "account_type": "bank",
        "accountId": "BA-00001",
        "accountNumber": "00010098765432",
        "accountName": "PORTEFEUILLE PRINCIPAL",
        "bankName": "Rawbank",
        "bankCode": "RBK",
        "portfolioId": "TP-00001",
        "portfolioName": "Portefeuille PME 2025"
      },
      "due_date": "2025-02-15T00:00:00.000Z",
      "slippage": -1,
      "remaining_amount": 41250.00,
      "remaining_percentage": 82.5,
      "installment_number": 1,
      "total_installments": 12,
      "notes": "Paiement reçu en avance d'un jour",
      "created_at": "2025-02-14T10:30:00.000Z",
      "updated_at": "2025-02-14T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### Exemple avec Mobile Money

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": "PMT-00002",
      "contract_id": "CC-00002",
      "portfolio_id": "TP-00001",
      "client_id": "CLIENT-002",
      "payment_date": "2025-02-10T14:00:00.000Z",
      "amount": 2500.00,
      "payment_method": "mobile_money",
      "payment_reference": "PMT-MM-2025-0001",
      "transaction_reference": "OM202502101400123456",
      "status": "completed",
      "payment_type": "mixed",
      "payment_details": {
        "principal_amount": 2000.00,
        "interest_amount": 500.00,
        "penalty_amount": 0.00
      },
      "source_account": {
        "account_type": "mobile_money",
        "accountNumber": "+243999123456",
        "accountName": "JEAN MUKENDI",
        "provider": "Orange Money",
        "companyName": "Mukendi Trading"
      },
      "destination_account": {
        "account_type": "mobile_money",
        "accountId": "MM-00001",
        "accountNumber": "+243811000001",
        "accountName": "PORTEFEUILLE MOBILE",
        "provider": "Orange Money",
        "portfolioId": "TP-00001",
        "portfolioName": "Portefeuille PME 2025"
      },
      "due_date": "2025-02-10T00:00:00.000Z",
      "slippage": 0,
      "remaining_amount": 22500.00,
      "remaining_percentage": 90,
      "installment_number": 1,
      "total_installments": 10,
      "created_at": "2025-02-10T14:00:00.000Z"
    }
  ]
}
```

### Détails d'un remboursement

**Endpoint** : `GET /portfolios/traditional/repayments/{id}`

**Réponse réussie** (200 OK) : Retourne l'objet `CreditPayment` complet.

### Enregistrement d'un paiement (Wallet-First — simplifié)

> **Recommandé** : Avec l'architecture wallet-first, le frontend n'a besoin que du minimum. Le transfert est automatique via le wallet engine.

**Endpoint** : `POST /portfolios/traditional/repayments`

**Corps de la requête (simplifié)** :
```json
{
  "contract_id": "CC-00001",
  "amount": 4583.33,
  "payment_type": "standard",
  "scheduled_payment_id": "SP-00001",
  "notes": "Paiement de l'échéance de février 2026"
}
```

**Réponse (201 Created) — statut asynchrone** :
```json
{
  "success": true,
  "data": {
    "id": "PMT-00001",
    "contract_id": "CC-00001",
    "amount": 4583.33,
    "status": "pending",
    "payment_type": "standard",
    "created_at": "2026-02-15T10:30:00.000Z"
  }
}
```

> **Workflow après l'appel** :
> 1. Kafka `portfolio.repayment.requested` publié vers payment-service
> 2. Transfert wallet PME → wallet institution
> 3. Callback `portfolio.repayment.completed` ou `.failed`
> 4. Si succès : échéances allouées, contrat mis à jour, notification PME

### Enregistrement d'un paiement (Complet — avec détails pour traçabilité)

> Les champs `payment_method`, `source_account`, `destination_account` restent supportés pour la traçabilité mais ne sont plus utilisés pour le transfert effectif.

**Virement bancaire** :

```json
{
  "contract_id": "CC-00001",
  "amount": 4583.33,
  "payment_date": "2025-02-14T10:30:00.000Z",
  "payment_method": "bank_transfer",
  "payment_type": "mixed",
  "transaction_reference": "BOA20250214103022",
  "source_account": {
    "account_type": "bank",
    "accountNumber": "00010023456789",
    "accountName": "ENTREPRISE ABC SARL",
    "bankName": "Rawbank",
    "bankCode": "RBK",
    "companyName": "Entreprise ABC"
  },
  "destination_account": {
    "account_type": "bank",
    "accountId": "BA-00001"
  },
  "scheduled_payment_id": "SP-00001",
  "notes": "Paiement de l'échéance de février 2025"
}
```

### Enregistrement avec détails (Mobile Money)

> Les détails mobile money sont enregistrés pour traçabilité mais le transfert effectif passe par le wallet engine.

**Corps de la requête** :

```json
{
  "contract_id": "CC-00002",
  "amount": 2500.00,
  "payment_date": "2025-02-10T14:00:00.000Z",
  "payment_method": "mobile_money",
  "payment_type": "mixed",
  "transaction_reference": "OM202502101400123456",
  "source_account": {
    "account_type": "mobile_money",
    "accountNumber": "+243999123456",
    "accountName": "JEAN MUKENDI",
    "provider": "Orange Money",
    "companyName": "Mukendi Trading"
  },
  "destination_account": {
    "account_type": "mobile_money",
    "accountId": "MM-00001"
  },
  "scheduled_payment_id": "SP-00002",
  "notes": "Paiement via Orange Money"
}
```

### Annuler un paiement

**Endpoint** : `POST /portfolios/traditional/repayments/{id}/cancel`

**Corps de la requête** :

```json
{
  "cancellation_reason": "Transaction rejetée par la banque"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "PMT-00001",
    "status": "cancelled",
    "cancellation_reason": "Transaction rejetée par la banque",
    "cancellation_date": "2025-02-15T09:00:00.000Z"
  }
}
```

### Mettre à jour un paiement

**Endpoint** : `PUT /portfolios/traditional/repayments/{id}`

**Corps de la requête** : Champs partiels de `CreditPayment`

**Note** : Seuls les paiements avec statut `pending` peuvent être modifiés.

### Supprimer un paiement

**Endpoint** : `DELETE /portfolios/traditional/repayments/{id}`

**Conditions** : Seuls les paiements avec statut `pending` peuvent être supprimés.

### Ajouter un justificatif

**Endpoint** : `POST /portfolios/traditional/repayments/{id}/receipt`

**Corps de la requête** (multipart/form-data) :
- `file`: Fichier du justificatif (PDF, PNG, JPG)

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "PMT-00001",
    "receipt_url": "https://storage.example.com/receipts/PMT-00001.pdf",
    "has_supporting_document": true
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides ou montant incorrect |
| 404 | Paiement ou contrat non trouvé |
| 409 | Conflit (paiement déjà traité) |
| 422 | Opération non autorisée selon le statut |

## Règles métier

1. **Wallet-first** : Le transfert effectif passe par le wallet engine (wallet PME → wallet institution), pas par virement direct
2. **Asynchrone** : Après le POST, le statut est `pending`. Le frontend doit poller pour le résultat final
3. **Échéances après callback** : L'allocation aux échéances ne se fait qu'après confirmation du wallet engine
4. **Types de remboursement** : `standard` (une échéance), `partial` (montant inférieur), `advance` (anticipé), `early_payoff` (total anticipé)
5. **Montant minimum** : Le montant doit être supérieur à 0.01
6. **Glissement (slippage)** : 
   - Positif = paiement en retard
   - Négatif = paiement en avance
   - 0 = paiement à l'échéance
7. **Annulation** : Un paiement complété ne peut être annulé que par un administrateur
8. **Justificatifs** : Recommandé pour tout paiement > 500 USD équivalent
9. **Idempotent** : Les callbacks wallet vérifient le statut avant mise à jour (skip si déjà COMPLETED/FAILED)
