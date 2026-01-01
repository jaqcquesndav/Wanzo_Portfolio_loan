# API Documentation - Wanzo Portfolio Loan

Documentation complète de l'API Wanzo Portfolio Loan, synchronisée avec le code source TypeScript.

**Dernière mise à jour** : Janvier 2026

## 📋 Vue d'ensemble

Cette documentation décrit les endpoints et structures de données de l'API tels qu'ils sont **réellement implémentés** dans le code source (`src/types/*.ts`).

## 🏗️ Architecture API

L'API suit une architecture microservices avec API Gateway :

### Environnement de développement
- **API Gateway** : `http://localhost:8000`
- **Préfixe Portfolio** : `/portfolio/api/v1`
- **URL complète** : `http://localhost:8000/portfolio/api/v1`

### Environnement de production
- **API Gateway** : `https://api.wanzo.com` (port 8000)
- **Préfixe Portfolio** : `/portfolio/api/v1`
- **URL complète** : `https://api.wanzo.com/portfolio/api/v1`
- **Serveur** : VM Azure (Canada Central) - IP: 4.205.236.59

### Architecture interne
```
Frontend → API Gateway (port 8000) → Microservices internes
                                    ├─ portfolio-institution-service (3005)
                                    ├─ accounting-service
                                    ├─ customer-service
                                    └─ autres services...
```

### Méthodes de paiement supportées
- **Virement bancaire** : Comptes bancaires (`BankAccount`)
- **Mobile Money** : Orange Money, M-Pesa, Airtel Money, Africell Money (`MobileMoneyAccount`)

## 📚 Modules Disponibles

### 🏦 [Portefeuilles](./portefeuilles/README.md)
Gestion des portefeuilles traditionnels
- **Endpoint** : `/portfolios/traditional`
- **Types** : `Portfolio`, `TraditionalPortfolio` (`src/types/portfolio.ts`)
- **Statuts** : 9 valeurs (draft, pending, active, suspended, inactive, closing, for_sale, sold, archived)

### 💳 [Demandes de Crédit](./portefeuilles/demandes/README.md)
Gestion des demandes de crédit traditionnelles
- **Endpoint** : `/portfolios/traditional/credit-requests`
- **Type** : `CreditRequest` (`src/types/credit.ts`)
- **Statuts** : 15 valeurs (draft → in_litigation)

### 📝 [Contrats de Crédit](./portefeuilles/contrats/README.md)
Gestion des contrats de crédit
- **Endpoint** : `/contracts`
- **Type** : `CreditContract` (`src/types/credit-contract.ts`)
- **Statuts** : 6 valeurs (active, completed, defaulted, restructured, in_litigation, suspended)

### 💸 [Déboursements](./portefeuilles/debloquements/README.md)
Gestion des décaissements (Bank + Mobile Money)
- **Endpoint** : `/portfolios/traditional/disbursements`
- **Type** : `Disbursement` (`src/types/disbursement.ts`)
- **Statuts** : 8 valeurs (draft → canceled)
- **Support** : Virement bancaire + Mobile Money (Orange Money, M-Pesa, etc.)

### 💰 [Remboursements](./portefeuilles/remboursements/README.md)
Gestion des paiements clients
- **Endpoint** : `/portfolios/traditional/repayments`
- **Type** : `CreditPayment` (`src/types/credit-payment.ts`)
- **Méthodes** : bank_transfer, mobile_money, cash, check

### 🛡️ [Garanties](./portefeuilles/garanties/README.md)
Gestion des garanties de crédit
- **Endpoint** : `/portfolios/traditional/guarantees`
- **Type** : `Guarantee` (`src/types/guarantee.ts`)
- **Types** : 10 valeurs (materiel, immobilier, caution_bancaire, etc.)

### 🏧 [Comptes](./portefeuilles/comptes/README.md)
Gestion des comptes bancaires et Mobile Money
- **Endpoint** : `/portfolios/{id}/accounts`
- **Types** : `BankAccount`, `MobileMoneyAccount`
- **Providers Mobile Money RDC** : Orange Money, M-Pesa, Airtel Money, Africell Money

### 📊 [Dashboard](./dashboard/README.md)
Tableaux de bord et métriques
- **Endpoint** : `/dashboard`
- **Fonctionnalités** : Métriques temps réel, KPIs, graphiques

### 🏢 [Institution](./institution/README.md)
Gestion des informations institutionnelles
- **Endpoint** : `/institutions`
- **Fonctionnalités** : Configuration, paramètres institutionnels

### 👥 [Utilisateurs](./utilisateurs/README.md)
Gestion des utilisateurs et autorisations
- **Endpoint** : `/users`
- **Type** : `User`, `UserWithInstitutionResponse` (`src/types/user.ts`)
- **Rôles** : Admin, Portfolio_Manager, Auditor, User

### 🎯 [Prospection](./prospection/README.md)
Gestion de la prospection commerciale
- **Endpoint** : `/companies`
- **Fonctionnalités** : 
  - Gestion prospects (PME/SME)
  - Recherche géographique par proximité (Haversine)
  - Synchronisation hybride : accounting-service (HTTP) + customer-service (Kafka)

### 🛡️ [Centrale des Risques](./centrale-risque/README.md)
Gestion des risques et évaluations
- **Endpoint** : `/risk/central`
- **Types** : `CompanyRiskProfile`, `PaymentIncident`, `CentralRiskEntry` (`src/types/centrale-risque.ts`)
- **Catégories** : low, medium, high, very_high

### 💰 [Paiements](./paiements/README.md)
Gestion des ordres de paiement génériques
- **Endpoint** : `/payments`
- **Fonctionnalités** : Ordres de paiement pour tous types de portefeuilles

### ⚙️ [Paramètres](./parametres/README.md)
Configuration système et paramètres
- **Endpoint** : `/settings`
- **Fonctionnalités** : Configuration globale, paramètres utilisateur

## 🔧 Configuration

### [Configuration de Base](./01-configuration.md)
- URLs de base, headers, formats de réponse
- Gestion des erreurs, pagination, sécurité

### [Authentification](./02-authentification.md)
- JWT tokens, authentification OAuth avec Auth0
- Flux PKCE, gestion des permissions et rôles

## 📊 Référence des Enums (conformes au code)

### Statuts de Portefeuille (9 valeurs - OHADA)
```typescript
type PortfolioStatus = 'draft' | 'pending' | 'active' | 'suspended' | 'inactive' | 'closing' | 'for_sale' | 'sold' | 'archived';
```

### Statuts de Demande de Crédit (15 valeurs)
```typescript
type CreditRequestStatus = 'draft' | 'submitted' | 'under_review' | 'pending' | 'analysis' | 'approved' | 'rejected' | 'canceled' | 'disbursed' | 'active' | 'closed' | 'defaulted' | 'restructured' | 'consolidated' | 'in_litigation';
```

### Statuts de Contrat (6 valeurs)
```typescript
type ContractStatus = 'active' | 'completed' | 'defaulted' | 'restructured' | 'in_litigation' | 'suspended';
```

### Statuts de Déboursement (8 valeurs)
```typescript
type DisbursementStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'canceled';
```

### Types de Garantie (10 valeurs)
```typescript
type GuaranteeType = 'materiel' | 'immobilier' | 'caution_bancaire' | 'fonds_garantie' | 'assurance_credit' | 'nantissement' | 'gage' | 'hypotheque' | 'depot_especes' | 'autre';
```

### Providers Mobile Money RDC (5 valeurs)
```typescript
type MobileMoneyProvider = 'Orange Money' | 'M-Pesa' | 'Airtel Money' | 'Africell Money' | 'Vodacom M-Pesa';
```

## 📖 Conventions

### Format des Dates
Toutes les dates utilisent le format ISO 8601 : `YYYY-MM-DDTHH:mm:ss.sssZ`

### Codes de Statut HTTP
- `200` : Succès
- `201` : Créé avec succès
- `400` : Erreur de requête
- `401` : Non autorisé
- `404` : Ressource non trouvée
- `409` : Conflit (ex: transition de statut non autorisée)
- `422` : Opération non autorisée
- `500` : Erreur serveur

### Pagination
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 🚀 Démarrage Rapide

1. **Authentification** : Consultez [02-authentification.md](./02-authentification.md)
2. **Configuration** : Consultez [01-configuration.md](./01-configuration.md)
3. **Premier appel** : Testez avec `/portfolios/traditional`

## 📝 Notes importantes

- Cette documentation reflète exactement le code source implémenté (`src/types/*.ts`)
- Les endpoints documentés correspondent aux services API réels
- Les structures de données TypeScript sont la source de vérité
- Support Mobile Money intégré dans tous les modules de paiement

---

*Version synchronisée avec le code source TypeScript*
