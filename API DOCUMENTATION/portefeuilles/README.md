# Portefeuilles Traditionnels

Cette API permet de gérer les portefeuilles traditionnels de crédit dans Wanzo Portfolio Institution. Les portefeuilles regroupent les produits financiers, les comptes bancaires/Mobile Money, et les métriques de performance.

## Modules des Portefeuilles Traditionnels

1. **[Demandes de Crédit](./demandes/README.md)** - Gestion des demandes de financement
2. **[Contrats de Crédit](./contrats/README.md)** - Gestion des contrats de crédit
3. **[Déboursements](./debloquements/README.md)** - Gestion des déboursements/déblocages
4. **[Remboursements](./remboursements/README.md)** - Gestion des remboursements
5. **[Garanties](./garanties/README.md)** - Gestion des garanties
6. **[Comptes](./comptes/README.md)** - Comptes bancaires et Mobile Money
7. **[Produits](./produits/README.md)** - Configuration des produits financiers
8. **[Paramètres](./parametres/README.md)** - Paramètres du portefeuille
9. **[Virements](./virements/README.md)** - Virements entre comptes

## Entités et DTOs

### Portfolio (Entité principale)

```typescript
interface Portfolio {
  id: string;
  name: string;
  type: PortfolioType;                   // 'traditional'
  status: PortfolioStatus;
  
  // Devise et montants
  currency: PortfolioCurrency;           // CDF, USD, EUR
  initial_capital: number;               // Capital initial
  target_amount?: number;                // Objectif de collecte
  
  // Période de validité
  start_date: string;                    // ISO 8601
  end_date?: string;                     // ISO 8601 (optionnel)
  is_permanent?: boolean;                // Sans date de fin
  
  // Compte principal
  primary_account_type: AccountType;     // 'bank' | 'mobile_money'
  primary_bank_account_id?: string;
  primary_mobile_money_account_id?: string;
  
  // Configuration
  description?: string;
  target_return?: number;                // Rendement cible en %
  target_sectors?: string[];             // Secteurs cibles
  risk_profile?: RiskProfile;
  
  // Relations
  products: FinancialProduct[];
  bank_accounts?: BankAccount[];
  mobile_money_accounts?: MobileMoneyAccount[];
  manager?: PortfolioManager;
  management_fees?: ManagementFees;
  
  // Métriques
  metrics: PortfolioMetrics;
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Cession
  sale_info?: SaleInfo;
}
```

### TraditionalPortfolio (Extension)

```typescript
interface TraditionalPortfolio extends Portfolio {
  description: string;
  manager_id: string;
  institution_id: string;
}
```

### Enums et Types

```typescript
// Statuts du portefeuille (10 valeurs - conformes OHADA + legacy)
type PortfolioStatus = 
  | 'draft'      // Brouillon (en configuration)
  | 'pending'    // En attente d'approbation
  | 'active'     // Actif (opérationnel)
  | 'suspended'  // Suspendu temporairement
  | 'inactive'   // Inactif (arrêté)
  | 'closing'    // En cours de clôture
  | 'for_sale'   // En vente (cession)
  | 'sold'       // Vendu/Cédé
  | 'archived'   // Archivé (clôturé définitivement)
  | 'closed';    // Legacy: Alias de archived

// Types de portefeuille (9 valeurs)
type PortfolioType = 
  | 'traditional'   // Portefeuille de crédits traditionnels
  | 'leasing'       // Portefeuille de leasing/crédit-bail
  | 'investment'    // Portefeuille d'investissements
  | 'mixed'         // Portefeuille mixte
  | 'credit'        // Legacy: Alias de traditional
  | 'savings'       // Épargne (legacy)
  | 'microfinance'  // Microfinance (legacy)
  | 'treasury'      // Trésorerie (legacy)
  | 'other';        // Autre type

// Devises supportées (RDC/OHADA)
type PortfolioCurrency = 'CDF' | 'USD' | 'EUR';

// Types de compte
type AccountType = 'bank' | 'mobile_money';

// Profils de risque
type RiskProfile = 'conservative' | 'moderate' | 'aggressive';
```

### Types imbriqués

```typescript
// Produit financier
interface FinancialProduct {
  id: string;
  name: string;
  type: ProductType;
  description: string;
  minAmount: number;
  maxAmount: number;
  duration: { min: number; max: number };
  interestRate: {
    type: 'fixed' | 'variable';
    value?: number;
    min?: number;
    max?: number;
  };
  requirements: string[];
  acceptedGuarantees?: string[];
  isPublic: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Types de produits (6 valeurs)
type ProductType = 
  | 'credit_personnel'
  | 'credit_immobilier'
  | 'credit_auto'
  | 'credit_professionnel'
  | 'microcredit'
  | 'credit_consommation';

// Gestionnaire de portefeuille
interface PortfolioManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
}

// Frais de gestion
interface ManagementFees {
  setup_fee?: number;        // Frais de mise en place
  annual_fee?: number;       // Frais annuels
  performance_fee?: number;  // Commission sur performance
}

// Métriques du portefeuille
interface PortfolioMetrics {
  net_value: number;              // Valeur nette
  average_return: number;         // Rendement moyen
  risk_portfolio: number;         // Risque du portefeuille
  sharpe_ratio: number;           // Ratio de Sharpe
  volatility: number;             // Volatilité
  alpha: number;
  beta: number;
  asset_allocation: AssetAllocation[];
  performance_curve?: number[];
  returns?: number[];
  benchmark?: number[];
  
  // Métriques crédit spécifiques
  balance_AGE?: {                 // Balance âgée
    total: number;
    echeance_0_30: number;
    echeance_31_60: number;
    echeance_61_90: number;
    echeance_91_plus: number;
  };
  taux_impayes?: number;          // Taux d'impayés
  taux_couverture?: number;       // Taux de couverture
  nb_credits?: number;            // Nombre de crédits
  total_credits?: number;         // Total des crédits
  avg_credit?: number;            // Crédit moyen
  nb_clients?: number;            // Nombre de clients
  taux_rotation?: number;         // Taux de rotation
  taux_provision?: number;        // Taux de provision
  taux_recouvrement?: number;     // Taux de recouvrement
}

// Information de cession
interface SaleInfo {
  listed_at?: string;             // Date de mise en vente
  asking_price?: number;          // Prix demandé
  sold_at?: string;               // Date de vente
  sold_price?: number;            // Prix de vente
  buyer_institution_id?: string;  // ID de l'acheteur
}
```

## Points d'accès

### Liste des portefeuilles traditionnels

**Endpoint** : `GET /portfolios/traditional`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | number | Non | Numéro de page (défaut: 1) |
| `limit` | number | Non | Éléments par page (défaut: 10) |
| `status` | PortfolioStatus | Non | Filtrer par statut |
| `manager` | string | Non | Filtrer par gestionnaire |
| `currency` | PortfolioCurrency | Non | Filtrer par devise |
| `search` | string | Non | Recherche textuelle |
| `dateFrom` | string | Non | Date de début (ISO 8601) |
| `dateTo` | string | Non | Date de fin (ISO 8601) |
| `sortBy` | string | Non | Champ de tri |
| `sortOrder` | string | Non | Ordre (asc, desc) |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": [
    {
      "id": "TP-00001",
      "name": "Portefeuille PME 2025",
      "type": "traditional",
      "status": "active",
      "currency": "USD",
      "initial_capital": 500000.00,
      "target_amount": 1000000.00,
      "start_date": "2025-01-01T00:00:00.000Z",
      "is_permanent": false,
      "end_date": "2025-12-31T23:59:59.000Z",
      "primary_account_type": "bank",
      "primary_bank_account_id": "BA-00001",
      "description": "Portefeuille de crédits aux PME",
      "target_return": 12.5,
      "target_sectors": ["Commerce", "Services", "Agriculture"],
      "risk_profile": "moderate",
      "products": [
        {
          "id": "PROD-001",
          "name": "Crédit PME Standard",
          "type": "credit_professionnel",
          "minAmount": 5000,
          "maxAmount": 100000,
          "duration": { "min": 6, "max": 36 },
          "interestRate": { "type": "fixed", "value": 15 },
          "status": "active"
        }
      ],
      "bank_accounts": [
        {
          "id": "BA-00001",
          "account_name": "Compte Principal",
          "bank_name": "Rawbank",
          "account_number": "0010023456789",
          "currency": "USD",
          "is_primary": true,
          "balance": 450000.00
        }
      ],
      "mobile_money_accounts": [
        {
          "id": "MM-00001",
          "account_name": "Orange Money Portefeuille",
          "phone_number": "+243850000001",
          "provider": "Orange Money",
          "currency": "CDF",
          "is_primary": true,
          "balance": 50000000.00
        }
      ],
      "manager": {
        "id": "USER-001",
        "name": "Jean Dupont",
        "email": "jean.dupont@example.com"
      },
      "metrics": {
        "net_value": 485000.00,
        "average_return": 11.2,
        "nb_credits": 45,
        "total_credits": 425000.00,
        "nb_clients": 42,
        "taux_impayes": 0.035,
        "taux_recouvrement": 0.92
      },
      "created_at": "2025-01-01T08:00:00.000Z",
      "updated_at": "2025-02-01T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Détails d'un portefeuille

**Endpoint** : `GET /portfolios/traditional/{id}`

**Réponse réussie** (200 OK) : Retourne l'objet `Portfolio` complet avec toutes ses relations.

### Créer un portefeuille

**Endpoint** : `POST /portfolios/traditional`

**Corps de la requête** :

```json
{
  "name": "Portefeuille PME 2025",
  "currency": "USD",
  "initial_capital": 500000.00,
  "target_amount": 1000000.00,
  "start_date": "2025-01-01T00:00:00.000Z",
  "end_date": "2025-12-31T23:59:59.000Z",
  "primary_account_type": "bank",
  "primary_bank_account_id": "BA-00001",
  "description": "Portefeuille de crédits aux PME",
  "target_return": 12.5,
  "target_sectors": ["Commerce", "Services", "Agriculture"],
  "risk_profile": "moderate",
  "manager_id": "USER-001",
  "institution_id": "INST-001"
}
```

**Réponse réussie** (201 Created) : Retourne l'objet `Portfolio` créé avec statut `draft`.

### Mettre à jour un portefeuille

**Endpoint** : `PUT /portfolios/traditional/{id}`

**Corps de la requête** : Champs partiels de `Portfolio`

### Récupérer un portefeuille avec ses produits

**Endpoint** : `GET /portfolios/traditional/{id}/products`

**Description** : Récupère le portefeuille avec la liste complète de ses produits financiers associés.

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "portfolio": {
      "id": "TP-00001",
      "name": "Portefeuille PME 2025",
      "status": "active"
    },
    "products": [
      {
        "id": "PROD-001",
        "name": "Crédit PME Standard",
        "type": "credit_professionnel",
        "minAmount": 5000,
        "maxAmount": 100000,
        "status": "active"
      }
    ]
  }
}
```

### Activer un portefeuille

**Endpoint** : `POST /portfolios/traditional/{id}/activate`

**Prérequis** :
- Au moins un compte (bancaire ou Mobile Money) associé
- Au moins un produit financier configuré
- Gestionnaire assigné

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "id": "TP-00001",
    "status": "active",
    "activated_at": "2025-01-15T10:00:00.000Z"
  }
}
```

### Suspendre un portefeuille

**Endpoint** : `POST /portfolios/traditional/{id}/suspend`

**Corps de la requête** :

```json
{
  "reason": "Audit en cours",
  "expected_resume_date": "2025-03-01T00:00:00.000Z"
}
```

### Changer le statut d'un portefeuille

**Endpoint** : `POST /portfolios/traditional/{id}/status`

**Corps de la requête** :

```json
{
  "status": "active"
}
```

**Valeurs autorisées** : `active`, `inactive`, `pending`, `archived`

**Réponse réussie** (200 OK) :

```json
{
  "id": "TP-00001",
  "name": "Portefeuille PME 2025",
  "status": "active",
  "updated_at": "2025-01-15T10:30:00.000Z"
}
```

### Clôturer un portefeuille

**Endpoint** : `POST /portfolios/traditional/{id}/close`

**Corps de la requête** :

```json
{
  "closureReason": "Fin de période",
  "closureNotes": "Transfert vers nouveau portefeuille"
}
```

### Mettre en vente

**Endpoint** : `POST /portfolios/traditional/{id}/list-for-sale`

**Corps de la requête** :

```json
{
  "asking_price": 520000.00,
  "description": "Portefeuille performant avec bon historique"
}
```

### Archiver

**Endpoint** : `POST /portfolios/traditional/{id}/archive`

### Supprimer

**Endpoint** : `DELETE /portfolios/traditional/{id}`

**Conditions** : Seuls les portefeuilles avec statut `draft` peuvent être supprimés.

### Métriques détaillées

**Endpoint** : `GET /portfolios/traditional/{id}/metrics`

**Paramètres de requête** :
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `period` | string | Non | Période (month, quarter, year) |
| `dateFrom` | string | Non | Date de début |
| `dateTo` | string | Non | Date de fin |

**Réponse réussie** (200 OK) :

```json
{
  "success": true,
  "data": {
    "summary": {
      "net_value": 485000.00,
      "average_return": 11.2,
      "sharpe_ratio": 1.45,
      "volatility": 0.08
    },
    "credit_metrics": {
      "nb_credits": 45,
      "total_credits": 425000.00,
      "avg_credit": 9444.44,
      "nb_clients": 42,
      "taux_impayes": 0.035,
      "taux_recouvrement": 0.92,
      "taux_provision": 0.05
    },
    "balance_age": {
      "total": 425000.00,
      "echeance_0_30": 380000.00,
      "echeance_31_60": 25000.00,
      "echeance_61_90": 12000.00,
      "echeance_91_plus": 8000.00
    },
    "performance_curve": [100, 102, 105, 103, 108, 111],
    "asset_allocation": [
      { "type": "credit_professionnel", "percentage": 60 },
      { "type": "microcredit", "percentage": 30 },
      { "type": "credit_personnel", "percentage": 10 }
    ]
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Données invalides |
| 404 | Portefeuille non trouvé |
| 409 | Conflit (transition de statut non autorisée) |
| 422 | Opération non autorisée selon le statut |

## Règles métier

1. **Transitions de statut** :
   - `draft` → `active` (avec prérequis)
   - `active` → `suspended`, `closing`, `for_sale`
   - `suspended` → `active`, `closing`
   - `for_sale` → `sold`, `active` (retrait de la vente)
   - `closing` → `archived`

2. **Compte principal obligatoire** :
   - Un portefeuille actif doit avoir un compte principal configuré
   - Le compte doit être vérifié et actif

3. **Clôture** :
   - Tous les crédits doivent être soldés ou transférés
   - Les soldes résiduels doivent être transférés

4. **Synchronisation des comptes** :
   - Les modifications via `/accounts` sont synchronisées automatiquement
   - Les champs `bank_accounts` et `mobile_money_accounts` sont mis à jour

5. **Cession** :
   - Un portefeuille en vente reste opérationnel
   - La vente transfert toutes les relations (crédits, comptes, etc.)
