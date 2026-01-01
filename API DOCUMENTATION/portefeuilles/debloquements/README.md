# API des Déboursements (Disbursements)

Cette API permet de gérer les déboursements (virements de fonds) associés aux contrats de crédit, incluant le support des comptes bancaires et Mobile Money.

## Entités et DTOs

### Disbursement (Entité principale)

```typescript
interface Disbursement {
  id: string;
  company: string;
  product: string;
  amount: number;
  currency: string;                    // Code devise ISO 4217 (CDF, USD, XOF, EUR, XAF)
  status: DisbursementStatus;
  date: string;                        // ISO 8601
  requestId?: string;
  portfolioId: string;
  contractReference: string;           // Référence du contrat associé (obligatoire)
  
  // Validation
  validatedBy?: string;                // ID utilisateur validateur
  validatedAt?: string;                // Date de validation ISO 8601
  rejectionReason?: string;            // Raison du rejet si status=rejected
  errorCode?: string;                  // Code d'erreur si status=failed
  errorMessage?: string;               // Message d'erreur détaillé
  
  // Informations bancaires de l'ordre de virement
  transactionReference?: string;       // Référence de transaction bancaire
  valueDate?: string;                  // Date de valeur
  executionDate?: string;              // Date d'exécution
  
  // Type de compte utilisé pour le déboursement
  accountType: AccountType;            // 'bank' | 'mobile_money'
  accountId?: string;                  // ID du compte source
  
  // Compte débité (compte de l'institution)
  debitAccount?: BankDebitAccount;
  mobileMoneySource?: MobileMoneySource;
  
  // Compte crédité (bénéficiaire)
  beneficiary: Beneficiary;
  
  // Informations de paiement
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  description?: string;
  
  // Informations spécifiques selon le type de portefeuille
  investmentType?: InvestmentType;
  leasingEquipmentDetails?: LeasingEquipment;
}
```

### Enums et Types

```typescript
// Statuts du déboursement (8 valeurs)
type DisbursementStatus = 
  | 'draft'      // Brouillon
  | 'pending'    // En attente de validation
  | 'approved'   // Approuvé, en attente d'exécution
  | 'rejected'   // Rejeté
  | 'processing' // En cours de traitement
  | 'completed'  // Effectué avec succès
  | 'failed'     // Échec de l'exécution
  | 'canceled';  // Annulé

// Type de compte
type AccountType = 'bank' | 'mobile_money';

// Méthode de paiement (4 valeurs)
type PaymentMethod = 
  | 'bank_transfer'  // Virement bancaire
  | 'mobile_money'   // Mobile Money
  | 'check'          // Chèque
  | 'cash';          // Espèces

// Fournisseurs Mobile Money (RDC) - 5 valeurs
// Note: Dans le type Disbursement.mobileMoneySource, le format snake_case est utilisé
// pour compatibilité avec les APIs de paiement externes
type MobileMoneyProvider = 
  | 'orange_money'    // Orange Money
  | 'mpesa'           // M-Pesa (Vodacom)
  | 'airtel_money'    // Airtel Money
  | 'africell_money'  // Africell Money
  | 'vodacom_mpesa';  // Vodacom M-Pesa (alias de mpesa)

// Note: Le type MobileMoneyAccount utilise les noms display:
// 'Orange Money' | 'M-Pesa' | 'Airtel Money' | 'Africell Money' | 'Vodacom M-Pesa'

// Type d'investissement (pour portefeuille investissement)
type InvestmentType = 
  | 'prise de participation'
  | 'complément'
  | 'dividende'
  | 'cession';
```

### Types imbriqués

```typescript
// Compte bancaire débité (institution)
interface BankDebitAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  branchCode?: string;
}

// Compte Mobile Money source (institution)
interface MobileMoneySource {
  provider: MobileMoneyProvider;
  phoneNumber: string;
  accountName: string;
  transactionId?: string;
}

// Bénéficiaire du déboursement
interface Beneficiary {
  accountType: AccountType;
  
  // Pour compte bancaire
  accountNumber?: string;
  accountName: string;              // Nom du titulaire du compte
  bankName?: string;
  bankCode?: string;
  branchCode?: string;
  swiftCode?: string;
  
  // Pour Mobile Money
  provider?: MobileMoneyProvider;
  phoneNumber?: string;
  
  // Infos communes
  companyName: string;
  address?: string;
}

// Équipement leasing
interface LeasingEquipment {
  equipmentId?: string;
  equipmentName?: string;
  equipmentCategory?: string;
  supplier?: string;
}
```

## Points d'accès

### Liste des déboursements

**Endpoint** : `GET /portfolios/traditional/disbursements`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `portfolioId` | string | Non | Filtrer par portefeuille |
| `contractId` | string | Non | Filtrer par contrat |
| `status` | DisbursementStatus | Non | Filtrer par statut |
| `accountType` | AccountType | Non | Filtrer par type de compte |
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
      "id": "DISB-00001",
      "company": "Entreprise ABC",
      "product": "Crédit PME",
      "amount": 50000.00,
      "currency": "CDF",
      "status": "completed",
      "date": "2025-01-15T09:30:00.000Z",
      "portfolioId": "TP-00001",
      "contractReference": "CTR-20250001",
      "accountType": "bank",
      "paymentMethod": "bank_transfer",
      "beneficiary": {
        "accountType": "bank",
        "accountName": "Compte Entreprise ABC",
        "accountNumber": "00123456789",
        "bankName": "Rawbank",
        "companyName": "Entreprise ABC"
      },
      "transactionReference": "TRX-12345678"
    },
    {
      "id": "DISB-00002",
      "company": "Société XYZ",
      "product": "Microcrédit",
      "amount": 5000.00,
      "currency": "CDF",
      "status": "completed",
      "date": "2025-01-16T10:00:00.000Z",
      "portfolioId": "TP-00001",
      "contractReference": "CTR-20250002",
      "accountType": "mobile_money",
      "paymentMethod": "mobile_money",
      "beneficiary": {
        "accountType": "mobile_money",
        "accountName": "Jean Mukendi",
        "provider": "orange_money",
        "phoneNumber": "+243851234567",
        "companyName": "Société XYZ"
      },
      "mobileMoneySource": {
        "provider": "orange_money",
        "phoneNumber": "+243850000001",
        "accountName": "Portefeuille PME",
        "transactionId": "MM-98765432"
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

### Détails d'un déboursement

**Endpoint** : `GET /portfolios/traditional/disbursements/{id}`

**Réponse réussie** (200 OK) : Retourne l'objet `Disbursement` complet.

### Créer un déboursement

**Endpoint** : `POST /portfolios/traditional/disbursements`

**Corps de la requête (Virement bancaire)** :
```json
{
  "portfolioId": "TP-00001",
  "contractReference": "CTR-20250001",
  "company": "Entreprise ABC",
  "product": "Crédit PME",
  "amount": 50000.00,
  "currency": "CDF",
  "accountType": "bank",
  "paymentMethod": "bank_transfer",
  "debitAccount": {
    "accountNumber": "00987654321",
    "accountName": "Compte Portefeuille PME",
    "bankName": "Rawbank",
    "bankCode": "RWB"
  },
  "beneficiary": {
    "accountType": "bank",
    "accountNumber": "00123456789",
    "accountName": "Compte Entreprise ABC",
    "bankName": "Rawbank",
    "bankCode": "RWB",
    "companyName": "Entreprise ABC",
    "address": "123 Avenue Commerce, Kinshasa"
  },
  "description": "Déboursement crédit PME - Première tranche"
}
```

**Corps de la requête (Mobile Money)** :
```json
{
  "portfolioId": "TP-00001",
  "contractReference": "CTR-20250002",
  "company": "Société XYZ",
  "product": "Microcrédit",
  "amount": 5000.00,
  "currency": "CDF",
  "accountType": "mobile_money",
  "paymentMethod": "mobile_money",
  "mobileMoneySource": {
    "provider": "orange_money",
    "phoneNumber": "+243850000001",
    "accountName": "Portefeuille PME"
  },
  "beneficiary": {
    "accountType": "mobile_money",
    "accountName": "Jean Mukendi",
    "provider": "orange_money",
    "phoneNumber": "+243851234567",
    "companyName": "Société XYZ"
  },
  "description": "Déboursement microcrédit"
}
```

### Confirmer un déboursement

**Endpoint** : `POST /portfolios/traditional/disbursements/{id}/confirm`

**Corps de la requête** :
```json
{
  "transactionReference": "TRX-12345678",
  "executionDate": "2025-01-15T09:30:00.000Z",
  "valueDate": "2025-01-15T09:30:00.000Z"
}
```

### Annuler un déboursement

**Endpoint** : `POST /portfolios/traditional/disbursements/{id}/cancel`

**Corps de la requête** :
```json
{
  "reason": "Annulé à la demande du client"
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 404 | Déboursement non trouvé |
| 409 | Conflit (ex: déboursement déjà confirmé) |
| 422 | Fonds insuffisants sur le compte source |
| 503 | Service de paiement indisponible |

## Règles métier

1. **Validation du compte source** : Le compte source doit avoir un solde suffisant
2. **Mobile Money** : Les limites journalières/mensuelles doivent être respectées
3. **Statuts autorisés pour confirmation** : `pending` ou `approved`
4. **Statuts autorisés pour annulation** : `draft`, `pending`, `approved`
5. **Traçabilité** : Chaque déboursement doit être lié à un contrat existant
