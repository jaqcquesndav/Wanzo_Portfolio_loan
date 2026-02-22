# Wallet Institution - Documentation API

> **Synchronisée avec le code source TypeScript** - Janvier 2026

Ce document décrit les endpoints wallet disponibles pour les **institutions financières** via le portfolio-institution-service. Ces endpoints sont des proxies vers le payment-service, avec résolution automatique du wallet de l'institution à partir du JWT.

> **Service** : portfolio-institution-service (port 3005)  
> **Préfixe contrôleur** : `/wallet`  
> **URL de base** : `http://localhost:8000/portfolio/api/v1/wallet`  
> **Guards** : `JwtAuthGuard`, `RolesGuard`  
> **Scope** : Les institutions financières (prêteurs) qui gèrent des portefeuilles de crédit

---

## Table des matières

1. [Mon wallet](#1-mon-wallet)
2. [Solde](#2-solde)
3. [Dashboard](#3-dashboard)
4. [Transactions en attente](#4-transactions-en-attente)
5. [Détails d'un wallet](#5-détails-dun-wallet)
6. [Modifier le statut d'un wallet](#6-modifier-le-statut-dun-wallet)
7. [Lister les transactions](#7-lister-les-transactions)
8. [Détails d'une transaction](#8-détails-dune-transaction)
9. [Transaction par référence](#9-transaction-par-référence)
10. [Approuver une transaction](#10-approuver-une-transaction)
11. [Rejeter une transaction](#11-rejeter-une-transaction)
12. [Dépôt mobile money](#12-dépôt-mobile-money)
13. [Retrait mobile money](#13-retrait-mobile-money)

---

## Rôles et permissions

| Endpoint | Rôles autorisés |
|----------|----------------|
| Mon wallet, Solde, Dashboard, Pending count | `admin`, `manager` |
| Détails wallet, Modifier statut | `admin` |
| Lister transactions, Détails transaction, Par référence | `admin`, `manager`, `analyst` |
| Approuver/Rejeter transaction | `admin` |
| Dépôt, Retrait | `admin`, `manager` |

---

## 1. Mon wallet

Récupère le wallet de l'institution connectée. Le `portfolioId` est automatiquement extrait du JWT.

**Endpoint** : `GET /portfolio/api/v1/wallet/my-wallet`

**Headers** :
```
Authorization: Bearer <jwt_token>
```

**Réponse réussie** (200 OK) :

```json
{
  "id": "wallet-uuid-institution",
  "reference": "WAL-INST-20260110-KIOTA",
  "ownerType": "portfolio",
  "ownerId": "portfolio-uuid",
  "ownerName": "Kiota Hub",
  "balance": 50000000.00,
  "availableBalance": 48000000.00,
  "frozenBalance": 2000000.00,
  "currency": "CDF",
  "status": "active",
  "limits": {
    "dailyLimit": 10000000,
    "monthlyLimit": 100000000,
    "singleTransactionLimit": 5000000,
    "minimumBalance": 100000
  },
  "kyc": {
    "verified": true,
    "level": "full"
  },
  "createdAt": "2026-01-10T08:00:00.000Z"
}
```

**Erreur si pas de portfolio associé** :

```json
{
  "message": "No portfolio associated with current user"
}
```

---

## 2. Solde

Récupère le résumé des soldes du wallet de l'institution.

**Endpoint** : `GET /portfolio/api/v1/wallet/balance`

**Réponse réussie** (200 OK) :

```json
{
  "summary": [
    {
      "ownerType": "portfolio",
      "currency": "CDF",
      "totalBalance": 50000000.00,
      "totalAvailable": 48000000.00,
      "totalFrozen": 2000000.00,
      "walletCount": 1
    }
  ]
}
```

---

## 3. Dashboard

Récupère les statistiques du tableau de bord des transactions wallet.

**Endpoint** : `GET /portfolio/api/v1/wallet/dashboard`

**Réponse réussie** (200 OK) :

```json
{
  "totalTransactions": 450,
  "totalVolume": 150000000.00,
  "byType": {
    "credit_disbursement": { "count": 120, "volume": 100000000 },
    "credit_repayment": { "count": 200, "volume": 45000000 },
    "deposit": { "count": 80, "volume": 4000000 },
    "withdrawal": { "count": 50, "volume": 1000000 }
  },
  "byStatus": {
    "completed": 400,
    "pending": 20,
    "pending_approval": 10,
    "failed": 15,
    "cancelled": 5
  }
}
```

---

## 4. Transactions en attente

Compte les transactions en attente d'approbation.

**Endpoint** : `GET /portfolio/api/v1/wallet/pending-count`

**Réponse réussie** (200 OK) :

```json
{
  "count": 5
}
```

---

## 5. Détails d'un wallet

Récupère les détails d'un wallet par son ID.

**Endpoint** : `GET /portfolio/api/v1/wallet/{walletId}`

**Paramètres de chemin** :
- `walletId` (UUID, requis) : ID du wallet

**Réponse** : Identique à la section 1 (Mon wallet).

---

## 6. Modifier le statut d'un wallet

Suspend ou gèle un wallet. Réservé au rôle `admin`.

**Endpoint** : `PATCH /portfolio/api/v1/wallet/{walletId}/status`

**Body (JSON)** :

```json
{
  "status": "frozen",
  "reason": "Audit interne en cours"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `status` | `string` | ✅ | Nouveau statut : `active`, `suspended`, `frozen`, `closed` |
| `reason` | `string` | ❌ | Motif du changement |

**Réponse réussie** (200 OK) :

```json
{
  "id": "wallet-uuid",
  "status": "frozen",
  "suspendedBy": "admin-user-id",
  "suspendedReason": "Audit interne en cours",
  "suspendedAt": "2026-01-15T11:00:00.000Z"
}
```

---

## 7. Lister les transactions

Récupère les transactions du portefeuille avec filtrage. Le `portfolioId` est automatiquement injecté depuis le JWT.

**Endpoint** : `GET /portfolio/api/v1/wallet/transactions/list`

**Paramètres de requête** :

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `walletId` | `string` | ❌ | Filtrer par wallet spécifique |
| `type` | `string` | ❌ | Type : `credit_disbursement`, `credit_repayment`, `deposit`, `withdrawal`, etc. |
| `status` | `string` | ❌ | Statut : `completed`, `pending`, `pending_approval`, `failed`, etc. |
| `page` | `number` | ❌ | Page (défaut: 1) |
| `limit` | `number` | ❌ | Éléments par page (défaut: 10) |

**Exemple** : `GET /portfolio/api/v1/wallet/transactions/list?type=credit_disbursement&status=completed&page=1&limit=20`

**Réponse réussie** (200 OK) :

```json
{
  "data": [
    {
      "id": "tx-uuid-1234",
      "reference": "TXN-20260115-ABC123",
      "type": "credit_disbursement",
      "status": "completed",
      "sourceWalletId": "wallet-institution",
      "destinationWalletId": "wallet-pme",
      "amount": 500000.00,
      "fees": 5000.00,
      "netAmount": 495000.00,
      "currency": "CDF",
      "contractId": "contract-uuid",
      "companyId": "company-uuid",
      "description": "Décaissement crédit CONT-2026-001",
      "createdAt": "2026-01-15T10:00:00.000Z",
      "completedAt": "2026-01-15T10:00:02.000Z"
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

---

## 8. Détails d'une transaction

**Endpoint** : `GET /portfolio/api/v1/wallet/transactions/{transactionId}`

**Paramètres de chemin** :
- `transactionId` (UUID, requis) : ID de la transaction

**Réponse** : Structure complète de la transaction (voir payment-service wallet-transactions documentation).

---

## 9. Transaction par référence

**Endpoint** : `GET /portfolio/api/v1/wallet/transactions/ref/{reference}`

**Paramètres de chemin** :
- `reference` (string, requis) : Référence unique (ex: `TXN-20260115-ABC123`)

**Réponse** : Structure complète de la transaction.

---

## 10. Approuver une transaction

Approuve une transaction en attente d'approbation manuelle. Réservé au rôle `admin`.

**Endpoint** : `POST /portfolio/api/v1/wallet/transactions/{transactionId}/approve`

**Body (JSON)** :

```json
{
  "notes": "Vérification effectuée, transaction conforme"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `notes` | `string` | ❌ | Notes d'approbation |

**Réponse réussie** (200 OK) :

```json
{
  "id": "tx-uuid",
  "status": "completed",
  "approvedBy": "admin-user-id",
  "approvedAt": "2026-01-15T10:30:00.000Z"
}
```

---

## 11. Rejeter une transaction

Rejette une transaction en attente. Réservé au rôle `admin`.

**Endpoint** : `POST /portfolio/api/v1/wallet/transactions/{transactionId}/reject`

**Body (JSON)** :

```json
{
  "reason": "Contrat non finalisé"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `reason` | `string` | ✅ | Motif du rejet (obligatoire) |

**Réponse réussie** (200 OK) :

```json
{
  "id": "tx-uuid",
  "status": "cancelled",
  "rejectedBy": "admin-user-id",
  "rejectedAt": "2026-01-15T10:35:00.000Z",
  "rejectionReason": "Contrat non finalisé"
}
```

---

## 12. Dépôt mobile money

Approvisionne le wallet de l'institution via mobile money (SerdiPay). Le wallet est automatiquement résolu à partir du `portfolioId` du JWT.

**Endpoint** : `POST /portfolio/api/v1/wallet/deposit`

**Body (JSON)** :

```json
{
  "amount": 5000000,
  "clientPhone": "+243812345678",
  "telecom": "AM",
  "currency": "CDF",
  "description": "Approvisionnement capital de prêt"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `amount` | `number` | ✅ | Montant à déposer (minimum: 1) |
| `clientPhone` | `string` | ✅ | Numéro mobile money du payeur |
| `telecom` | `string` | ✅ | Opérateur : `AM` (Airtel), `OM` (Orange), `MP` (M-Pesa), `AF` (Africell) |
| `currency` | `string` | ❌ | Devise (défaut: `CDF`) |
| `description` | `string` | ❌ | Description du dépôt |

> **Note** : Le `walletId` n'est **pas requis** dans le body — le service résout automatiquement le wallet de l'institution connectée.

**Réponse réussie** (201 Created) :

```json
{
  "transactionId": "tx-uuid-dep",
  "reference": "DEP-20260115-ABC123",
  "status": "completed",
  "walletId": "wallet-institution-uuid",
  "amount": 5000000,
  "providerStatus": "success",
  "message": "Dépôt de 5000000 CDF effectué avec succès"
}
```

**Réponse en attente** :

```json
{
  "transactionId": "tx-uuid-dep",
  "reference": "DEP-20260115-ABC123",
  "status": "pending",
  "walletId": "wallet-institution-uuid",
  "amount": 5000000,
  "providerStatus": "pending",
  "message": "Dépôt en cours de traitement. Confirmez sur votre téléphone."
}
```

**Erreurs possibles** :
| Code | Message |
|------|---------|
| `200` | `No wallet found for this institution. Please create a wallet first.` |
| `400` | Wallet is not active |
| `400` | Deposit failed via SerdiPay |

---

## 13. Retrait mobile money

Retire des fonds du wallet de l'institution vers un compte mobile money. Le wallet est automatiquement résolu.

**Endpoint** : `POST /portfolio/api/v1/wallet/withdraw`

**Body (JSON)** :

```json
{
  "amount": 1000000,
  "clientPhone": "+243812345678",
  "telecom": "OM",
  "currency": "CDF",
  "description": "Retrait bénéfices trimestriels"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `amount` | `number` | ✅ | Montant à retirer (minimum: 1) |
| `clientPhone` | `string` | ✅ | Numéro mobile money destinataire |
| `telecom` | `string` | ✅ | Opérateur : `AM`, `OM`, `MP`, `AF` |
| `currency` | `string` | ❌ | Devise (défaut: `CDF`) |
| `description` | `string` | ❌ | Description du retrait |

**Réponse réussie** (201 Created) :

```json
{
  "transactionId": "tx-uuid-wdr",
  "reference": "WDR-20260115-XYZ789",
  "status": "completed",
  "walletId": "wallet-institution-uuid",
  "amount": 1000000,
  "providerStatus": "success",
  "message": "Retrait de 1000000 CDF effectué avec succès"
}
```

**Erreurs possibles** :
| Code | Message |
|------|---------|
| `200` | `No wallet found for this institution. Please create a wallet first.` |
| `400` | Wallet is not active |
| `400` | Insufficient balance |
| `400` | Withdrawal failed via SerdiPay (rollback automatique) |

---

## Flux des opérations de crédit (wallet-à-wallet)

Les opérations de crédit ne passent **pas** par ces endpoints mais sont déclenchées automatiquement via **Kafka** :

### Décaissement crédit
```
portfolio-institution → Kafka: portfolio.disbursement.initiated
→ payment-service: Wallet Institution (débit) → Wallet PME (crédit)
→ Kafka callback: portfolio.disbursement.callback
```

### Remboursement crédit
```
portfolio-institution → Kafka: portfolio.repayment.requested
→ payment-service: Wallet PME (débit) → Wallet Institution (crédit)
→ Kafka callback: portfolio.repayment.callback
```

> **Important** : Aucun SerdiPay n'est impliqué dans les opérations de crédit. Ce sont des transferts internes wallet-à-wallet.

---

*Documentation synchronisée avec le code source TypeScript - Janvier 2026*
