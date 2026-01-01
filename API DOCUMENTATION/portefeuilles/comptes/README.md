# API des Comptes de Portefeuille

Cette API permet de gérer les comptes bancaires et Mobile Money associés à un portefeuille. Les comptes sont utilisés pour les décaissements, les encaissements et la gestion des fonds.

## Base URL

```
/portfolio/api/v1/portfolios/{portfolioId}/accounts
```

## Entités et DTOs

### BankAccount (Compte Bancaire)

```typescript
interface BankAccount {
  id: string;
  account_number: string;            // Numéro de compte
  account_name: string;              // Nom du compte
  bank_name: string;                 // Nom de la banque
  branch?: string;                   // Agence
  swift_code?: string;               // Code SWIFT
  iban?: string;                     // IBAN
  currency: string;                  // Code devise ISO 4217
  is_primary: boolean;               // Compte principal
  is_active: boolean;                // Compte actif
  portfolio_id?: string;             // ID du portefeuille
  institution_id?: string;           // ID de l'institution
  purpose?: AccountPurpose;          // Usage du compte
  balance?: number;                  // Solde actuel
  created_at: string;                // ISO 8601
  updated_at: string;                // ISO 8601
}
```

### MobileMoneyAccount (Compte Mobile Money)

```typescript
interface MobileMoneyAccount {
  id: string;
  account_name: string;              // Nom du détenteur
  phone_number: string;              // Numéro de téléphone
  provider: MobileMoneyProvider;     // Fournisseur
  pin_code?: string;                 // Code PIN (chiffré)
  account_holder_id?: string;        // ID du titulaire
  currency: string;                  // Code devise ISO 4217
  is_primary: boolean;               // Compte principal
  is_active: boolean;                // Compte actif
  portfolio_id?: string;             // ID du portefeuille
  institution_id?: string;           // ID de l'institution
  purpose?: AccountPurpose;          // Usage du compte
  balance?: number;                  // Solde actuel
  service_number?: string;           // Numéro du service (USSD)
  account_status?: MobileMoneyStatus;// Statut du compte
  daily_limit?: number;              // Limite journalière
  monthly_limit?: number;            // Limite mensuelle
  created_at: string;                // ISO 8601
  updated_at: string;                // ISO 8601
}
```

### Enums et Types

```typescript
// Usages de compte (6 valeurs)
type AccountPurpose = 
  | 'disbursement'  // Décaissements
  | 'collection'    // Encaissements/Remboursements
  | 'general'       // Usage général
  | 'investment'    // Investissements
  | 'escrow'        // Séquestre
  | 'reserve';      // Réserve

// Fournisseurs Mobile Money RDC (5 valeurs)
type MobileMoneyProvider = 
  | 'Orange Money'
  | 'M-Pesa'
  | 'Airtel Money'
  | 'Africell Money'
  | 'Vodacom M-Pesa';

// Statuts Mobile Money (3 valeurs)
type MobileMoneyStatus = 'verified' | 'pending' | 'suspended';
```

### Opérateurs Mobile Money RDC

```typescript
const MOBILE_MONEY_PROVIDERS = [
  { code: 'Orange Money', name: 'Orange Money', prefix: '85', ussd: '*150#' },
  { code: 'M-Pesa', name: 'M-Pesa (Vodacom)', prefix: '81', ussd: '*151#' },
  { code: 'Airtel Money', name: 'Airtel Money', prefix: '99', ussd: '*501#' },
  { code: 'Africell Money', name: 'Africell Money', prefix: '90', ussd: '*140#' },
];
```

## Synchronisation Automatique

**Important** : Toutes les opérations CRUD sur les comptes déclenchent une synchronisation automatique avec l'entité Portfolio.

### Mécanisme

Après chaque modification, le système :
1. Met à jour le stockage dédié des comptes
2. Synchronise vers l'entité Portfolio (champs `bank_accounts` et `mobile_money_accounts`)
3. Met à jour le timestamp `updated_at` du portfolio

### Avantages
- Cohérence des données
- Synchronisation transparente
- Gestion d'erreurs sans blocage
- Performance (async)

---

## Comptes Bancaires

### Liste des comptes bancaires

**Endpoint** : `GET /portfolios/{portfolioId}/accounts/bank`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "BA-00001",
      "account_number": "0010023456789",
      "account_name": "Portefeuille Principal",
      "bank_name": "Rawbank",
      "branch": "Gombe",
      "swift_code": "RAWBCDKI",
      "currency": "USD",
      "is_primary": true,
      "is_active": true,
      "portfolio_id": "TP-00001",
      "purpose": "general",
      "balance": 500000.00,
      "created_at": "2025-01-01T10:00:00.000Z",
      "updated_at": "2025-02-01T14:30:00.000Z"
    },
    {
      "id": "BA-00002",
      "account_number": "0010098765432",
      "account_name": "Compte Décaissement",
      "bank_name": "Equity Bank",
      "currency": "CDF",
      "is_primary": false,
      "is_active": true,
      "portfolio_id": "TP-00001",
      "purpose": "disbursement",
      "balance": 150000000.00,
      "created_at": "2025-01-05T08:00:00.000Z",
      "updated_at": "2025-01-20T11:00:00.000Z"
    }
  ]
}
```

### Détails d'un compte bancaire

**Endpoint** : `GET /portfolios/{portfolioId}/accounts/bank/{accountId}`

**Réponse réussie** (200 OK) : Retourne l'objet `BankAccount` complet.

### Créer un compte bancaire

**Endpoint** : `POST /portfolios/{portfolioId}/accounts/bank`

**Corps de la requête** :

```json
{
  "account_number": "0010023456789",
  "account_name": "Portefeuille Principal",
  "bank_name": "Rawbank",
  "branch": "Gombe",
  "swift_code": "RAWBCDKI",
  "currency": "USD",
  "is_primary": true,
  "is_active": true,
  "purpose": "general"
}
```

**Réponse réussie** (201 Created) : Retourne l'objet `BankAccount` créé.

### Mettre à jour un compte bancaire

**Endpoint** : `PUT /portfolios/{portfolioId}/accounts/bank/{accountId}`

**Corps de la requête** : Champs partiels de `BankAccount`

### Définir comme compte principal

**Endpoint** : `PUT /portfolios/{portfolioId}/accounts/bank/{accountId}/primary`

**Note** : Retire le statut principal de tout autre compte bancaire du portefeuille.

### Supprimer un compte bancaire

**Endpoint** : `DELETE /portfolios/{portfolioId}/accounts/bank/{accountId}`

**Conditions** : Le compte ne doit pas être le seul compte actif du portefeuille.

---

## Comptes Mobile Money

### Liste des comptes Mobile Money

**Endpoint** : `GET /portfolios/{portfolioId}/accounts/mobile-money`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "MM-00001",
      "account_name": "Compte Mobile Portefeuille",
      "phone_number": "+243850000001",
      "provider": "Orange Money",
      "currency": "CDF",
      "is_primary": true,
      "is_active": true,
      "portfolio_id": "TP-00001",
      "purpose": "collection",
      "balance": 25000000.00,
      "service_number": "*150#",
      "account_status": "verified",
      "daily_limit": 5000000,
      "monthly_limit": 50000000,
      "created_at": "2025-01-01T10:00:00.000Z",
      "updated_at": "2025-02-01T14:30:00.000Z"
    },
    {
      "id": "MM-00002",
      "account_name": "Compte M-Pesa",
      "phone_number": "+243810000001",
      "provider": "M-Pesa",
      "currency": "CDF",
      "is_primary": false,
      "is_active": true,
      "portfolio_id": "TP-00001",
      "purpose": "disbursement",
      "balance": 10000000.00,
      "service_number": "*151#",
      "account_status": "verified",
      "daily_limit": 3000000,
      "monthly_limit": 30000000,
      "created_at": "2025-01-10T08:00:00.000Z",
      "updated_at": "2025-01-25T11:00:00.000Z"
    }
  ]
}
```

### Détails d'un compte Mobile Money

**Endpoint** : `GET /portfolios/{portfolioId}/accounts/mobile-money/{accountId}`

**Réponse réussie** (200 OK) : Retourne l'objet `MobileMoneyAccount` complet.

### Créer un compte Mobile Money

**Endpoint** : `POST /portfolios/{portfolioId}/accounts/mobile-money`

**Corps de la requête** :

```json
{
  "account_name": "Compte Mobile Portefeuille",
  "phone_number": "+243850000001",
  "provider": "Orange Money",
  "currency": "CDF",
  "is_primary": true,
  "is_active": true,
  "purpose": "collection",
  "daily_limit": 5000000,
  "monthly_limit": 50000000
}
```

**Réponse réussie** (201 Created) : Retourne l'objet `MobileMoneyAccount` créé.

### Mettre à jour un compte Mobile Money

**Endpoint** : `PUT /portfolios/{portfolioId}/accounts/mobile-money/{accountId}`

**Corps de la requête** : Champs partiels de `MobileMoneyAccount`

### Définir comme compte principal

**Endpoint** : `PUT /portfolios/{portfolioId}/accounts/mobile-money/{accountId}/primary`

### Vérifier un compte Mobile Money

**Endpoint** : `POST /portfolios/{portfolioId}/accounts/mobile-money/{accountId}/verify`

**Description** : Envoie un code de vérification au numéro de téléphone.

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "verification_id": "VER-00001",
    "phone_number": "+243850000001",
    "expires_at": "2025-02-01T10:15:00.000Z"
  }
}
```

### Confirmer la vérification

**Endpoint** : `POST /portfolios/{portfolioId}/accounts/mobile-money/{accountId}/verify/confirm`

**Corps de la requête** :

```json
{
  "verification_id": "VER-00001",
  "code": "123456"
}
```

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "MM-00001",
    "account_status": "verified"
  }
}
```

### Supprimer un compte Mobile Money

**Endpoint** : `DELETE /portfolios/{portfolioId}/accounts/mobile-money/{accountId}`

---

## Opérations sur tous les comptes

### Récupérer tous les comptes

**Endpoint** : `GET /portfolios/{portfolioId}/accounts/all`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "bankAccounts": [
      { "id": "BA-00001", "account_name": "Compte Principal", "..." }
    ],
    "mobileMoneyAccounts": [
      { "id": "MM-00001", "account_name": "Orange Money", "..." }
    ]
  }
}
```

### Solde total des comptes

**Endpoint** : `GET /portfolios/{portfolioId}/accounts/balance`

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "total_balance_usd": 750000.00,
    "bank_balance": {
      "USD": 500000.00,
      "CDF": 150000000.00
    },
    "mobile_money_balance": {
      "CDF": 35000000.00
    },
    "exchange_rate_used": {
      "CDF_to_USD": 2800
    }
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 404 | Compte ou portefeuille non trouvé |
| 409 | Conflit (numéro de compte déjà existant) |
| 422 | Opération non autorisée |

## Règles métier

1. **Compte principal** : Un seul compte bancaire et un seul compte Mobile Money peuvent être principaux par portefeuille
2. **Numéros uniques** : Les numéros de compte bancaire et de téléphone doivent être uniques par portefeuille
3. **Vérification Mobile Money** : Un compte doit être vérifié avant de pouvoir recevoir des fonds
4. **Limites** : Les limites journalières et mensuelles sont imposées par l'opérateur
5. **Devise** : Un compte ne peut avoir qu'une seule devise
6. **Suppression** : Un compte avec des transactions en cours ne peut pas être supprimé
