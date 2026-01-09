# Documentation de l'API du microservice Portfolio Institution

Cette documentation décrit la structure des URLs et les endpoints disponibles pour communiquer avec le microservice Portfolio Institution via l'API Gateway.

*Cette documentation est synchronisée avec le code source TypeScript (`src/types/*.ts`).*

**Dernière mise à jour** : Janvier 2026

## Informations générales

### Environnement de développement
- **API Gateway**: `http://localhost:8000`
- **Préfixe API Portfolio**: `/portfolio/api/v1`
- **URL complète**: `http://localhost:8000/portfolio/api/v1`

### Environnement de production
- **API Gateway**: `https://api.wanzo.com`
- **Préfixe API Portfolio**: `/portfolio/api/v1`
- **URL complète**: `https://api.wanzo.com/portfolio/api/v1`

### Architecture
- **API Gateway**: Port 8000 (point d'entrée unique)
- **Portfolio Institution Service**: Port 3005 (interne, routé par API Gateway)

### Méthodes de paiement supportées
- **Virement bancaire** : Comptes bancaires (BankAccount)
- **Mobile Money** : Orange Money, M-Pesa, Airtel Money, Africell Money (MobileMoneyAccount)

## Authentification

Toutes les requêtes nécessitent une authentification via un token JWT.

**Headers requis**:
```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

## Structure des URLs

Tous les endpoints du microservice sont accessibles via l'API Gateway à l'adresse suivante:
`http://localhost:8000/portfolio/api/v1/<endpoint>`

**Structure complète**:
- **Base**: `http://localhost:8000`
- **Préfixe Portfolio**: `/portfolio/api/v1`
- **Endpoint**: `/<votre-endpoint>`
- **URL finale**: `http://localhost:8000/portfolio/api/v1/<votre-endpoint>`

### ⚠️ Important : Construction des URLs

Dans la documentation qui suit, tous les endpoints sont listés **sans le préfixe**. Pour construire l'URL complète, vous devez **toujours ajouter le préfixe** :

- **Documentation** : `/portfolios/traditional/credit-contracts`
- **URL réelle** : `http://localhost:8000/portfolio/api/v1/portfolios/traditional/credit-contracts`

**Exemples de construction** :
```javascript
const baseUrl = 'http://localhost:8000/portfolio/api/v1';
const endpoint = '/portfolios/traditional/credit-contracts';
const fullUrl = baseUrl + endpoint; // URL complète à utiliser
```

## Format des réponses

Les réponses suivent un format standardisé:

**Succès**:
```json
{
  "success": true,
  "data": {
    // Les données spécifiques retournées
  }
}
```

**Pagination**:
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

**Erreur**:
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "Type d'erreur"
}
```

## Référence des DTOs (Types TypeScript)

Cette section référence les structures de données conformes au code source (`src/types/*.ts`).

### Portefeuilles et Crédits

| Entité | Documentation | Source |
|--------|---------------|--------|
| Portfolio | [portefeuilles/README.md](./portefeuilles/README.md) | `src/types/portfolio.ts` |
| CreditRequest | [portefeuilles/demandes/README.md](./portefeuilles/demandes/README.md) | `src/types/credit.ts` |
| CreditContract | [portefeuilles/contrats/README.md](./portefeuilles/contrats/README.md) | `src/types/credit-contract.ts` |
| Disbursement | [portefeuilles/debloquements/README.md](./portefeuilles/debloquements/README.md) | `src/types/disbursement.ts` |
| CreditPayment | [portefeuilles/remboursements/README.md](./portefeuilles/remboursements/README.md) | `src/types/credit-payment.ts` |
| Guarantee | [portefeuilles/garanties/README.md](./portefeuilles/garanties/README.md) | `src/types/guarantee.ts` |

### Comptes et Paiements

| Entité | Documentation | Source |
|--------|---------------|--------|
| BankAccount | [portefeuilles/comptes/README.md](./portefeuilles/comptes/README.md) | `src/types/bankAccount.ts` |
| MobileMoneyAccount | [portefeuilles/comptes/README.md](./portefeuilles/comptes/README.md) | `src/types/mobileMoneyAccount.ts` |

### Utilisateurs et Institution

| Entité | Documentation | Source |
|--------|---------------|--------|
| User | [utilisateurs/README.md](./utilisateurs/README.md) | `src/types/user.ts` |
| UserWithInstitutionResponse | [utilisateurs/README.md](./utilisateurs/README.md) | `src/types/user.ts` |

### Risques

| Entité | Documentation | Source |
|--------|---------------|--------|
| CompanyRiskProfile | [centrale-risque/README.md](./centrale-risque/README.md) | `src/types/centrale-risque.ts` |
| PaymentIncident | [centrale-risque/README.md](./centrale-risque/README.md) | `src/types/centrale-risque.ts` |
| CentralRiskEntry | [centrale-risque/README.md](./centrale-risque/README.md) | `src/types/centrale-risque.ts` |

### Enums principaux (conformes au code)

```typescript
// Statuts de portefeuille (9 valeurs - conformes OHADA)
type PortfolioStatus = 'draft' | 'pending' | 'active' | 'suspended' | 'inactive' | 'closing' | 'for_sale' | 'sold' | 'archived';

// Statuts de demande de crédit (15 valeurs)
type CreditRequestStatus = 'draft' | 'submitted' | 'under_review' | 'pending' | 'analysis' | 'approved' | 'rejected' | 'canceled' | 'disbursed' | 'active' | 'closed' | 'defaulted' | 'restructured' | 'consolidated' | 'in_litigation';

// Statuts de contrat (6 valeurs)
type ContractStatus = 'active' | 'completed' | 'defaulted' | 'restructured' | 'in_litigation' | 'suspended';

// Statuts de déboursement (8 valeurs)
type DisbursementStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'canceled';

// Types de garantie (10 valeurs)
type GuaranteeType = 'materiel' | 'immobilier' | 'caution_bancaire' | 'fonds_garantie' | 'assurance_credit' | 'nantissement' | 'gage' | 'hypotheque' | 'depot_especes' | 'autre';

// Fournisseurs Mobile Money RDC (5 valeurs)
type MobileMoneyProvider = 'Orange Money' | 'M-Pesa' | 'Airtel Money' | 'Africell Money' | 'Vodacom M-Pesa';

// Types de compte pour paiements
type AccountType = 'bank' | 'mobile_money';
```

## Relations hiérarchiques et workflow

Le système suit une hiérarchie stricte pour organiser les entités et leurs relations :

```
🏢 Institution
  └── 📁 Portefeuille Traditionnel
      ├── ⚙️ Paramètres du portefeuille
      ├── 💰 Produits financiers du portefeuille
      ├── 📄 Demandes de crédit
      └── 📝 Contrats de crédit
          ├── 💸 Déboursements/Virements
          ├── 💳 Remboursements
          ├── 🛡️ Garanties
          └── 📊 Échéanciers de paiement
```

### Workflow principal

1. **Création du portefeuille** → Configuration des paramètres et produits
2. **Demande de crédit** → Évaluation → Approbation
3. **Création du contrat** → À partir de la demande approuvée
4. **Déboursement** → Virement des fonds vers le client
5. **Remboursements** → Paiements selon l'échéancier
6. **Gestion des garanties** → Tout au long du cycle de vie du contrat

### Règles importantes

- **Tous les contrats, produits et paramètres sont associés à un portefeuille spécifique**
- **Les déboursements, remboursements et garanties sont liés à des contrats**
- **Les demandes de crédit précèdent la création des contrats**
- **La structure URL reflète cette hiérarchie** : `/portfolios/traditional/{portfolioId}/...`

## Endpoints disponibles

### 1. Portefeuilles traditionnels

#### Gestion des portefeuilles

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/portfolios/traditional` | Récupère tous les portefeuilles (avec pagination et filtres) |
| GET | `/portfolios/traditional/${id}` | Récupère un portefeuille par son ID |
| POST | `/portfolios/traditional` | Crée un nouveau portefeuille |
| PUT | `/portfolios/traditional/${id}` | Met à jour un portefeuille |
| DELETE | `/portfolios/traditional/${id}` | Supprime un portefeuille |
| GET | `/portfolios/traditional/${id}/products` | Récupère le portefeuille avec ses produits financiers |
| GET | `/portfolios/traditional/${id}/metrics` | Récupère les métriques détaillées d'un portefeuille |

#### Gestion du statut

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/portfolios/traditional/${id}/activate` | Active un portefeuille (requiert compte et produit) |
| POST | `/portfolios/traditional/${id}/suspend` | Suspend un portefeuille temporairement |
| POST | `/portfolios/traditional/${id}/close` | Ferme définitivement un portefeuille |
| POST | `/portfolios/traditional/${id}/list-for-sale` | Met un portefeuille en vente (cession) |
| POST | `/portfolios/traditional/${id}/archive` | Archive un portefeuille (fermeture permanente) |
| POST | `/portfolios/traditional/${id}/status` | Change le statut d'un portefeuille |

#### Produits financiers (associés à un portefeuille)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/portfolios/traditional/${portfolioId}/products` | Récupère tous les produits financiers d'un portefeuille |
| GET | `/portfolios/traditional/${portfolioId}/products/${productId}` | Récupère un produit financier par son ID |
| POST | `/portfolios/traditional/${portfolioId}/products` | Crée un nouveau produit financier dans le portefeuille |
| PUT | `/portfolios/traditional/${portfolioId}/products/${productId}` | Met à jour un produit financier |
| DELETE | `/portfolios/traditional/${portfolioId}/products/${productId}` | Supprime un produit financier |

#### Paramètres du portefeuille

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/portfolios/traditional/${portfolioId}/settings` | Récupère les paramètres d'un portefeuille traditionnel |
| PUT | `/portfolios/traditional/${portfolioId}/settings` | Met à jour les paramètres d'un portefeuille |
| POST | `/portfolios/traditional/${portfolioId}/settings/reset` | Réinitialise les paramètres d'un portefeuille aux valeurs par défaut |

### 2. Contrats de crédit

#### Gestion des contrats

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/contracts` | Récupère tous les contrats de crédit (avec filtres) |
| GET | `/contracts/${id}` | Récupère un contrat de crédit par son ID |
| POST | `/contracts/from-request` | Crée un nouveau contrat de crédit à partir d'une demande |
| PUT | `/contracts/${id}` | Met à jour un contrat de crédit |
| DELETE | `/contracts/${id}` | Supprime un contrat de crédit |
| GET | `/contracts/${contractId}/schedule` | Récupère l'échéancier de paiement d'un contrat |

#### Actions sur le cycle de vie des contrats

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/contracts/${id}/activate` | Active un contrat (DRAFT → ACTIVE) |
| POST | `/contracts/${id}/suspend` | Suspend un contrat (ACTIVE → SUSPENDED) |
| POST | `/contracts/${id}/mark-default` | Marque un contrat en défaut (ACTIVE → DEFAULTED) |
| POST | `/contracts/${id}/litigation` | Met un contrat en litige (DEFAULTED → LITIGATION) |
| POST | `/contracts/${id}/restructure` | Restructure un contrat |
| POST | `/contracts/${id}/complete` | Termine un contrat (ACTIVE → COMPLETED) |
| POST | `/contracts/${id}/cancel` | Annule un contrat (DRAFT/ACTIVE → CANCELLED) |

### 3. Demandes de crédit

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/portfolios/traditional/credit-requests` | Récupère toutes les demandes de crédit |
| GET | `/portfolios/traditional/credit-requests/${id}` | Récupère une demande de crédit par son ID |
| POST | `/portfolios/traditional/credit-requests` | Crée une nouvelle demande de crédit |
| PATCH | `/portfolios/traditional/credit-requests/${id}/status` | Met à jour le statut d'une demande de crédit |
| PATCH | `/portfolios/traditional/credit-requests/${id}` | Met à jour une demande de crédit |
| DELETE | `/portfolios/traditional/credit-requests/${id}` | Supprime une demande de crédit |

### 4. Décaissements

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/portfolios/traditional/disbursements` | Récupère tous les virements et déboursements |
| GET | `/portfolios/traditional/disbursements/${id}` | Récupère un virement par son ID |
| POST | `/portfolios/traditional/disbursements` | Crée un nouveau virement |
| PUT | `/portfolios/traditional/disbursements/${id}` | Met à jour un virement existant |
| POST | `/portfolios/traditional/disbursements/${id}/confirm` | Confirme un virement (change son statut en "effectué") |
| POST | `/portfolios/traditional/disbursements/${id}/cancel` | Annule un virement |

### 5. Remboursements

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/portfolios/traditional/repayments` | Récupère tous les paiements de crédit |
| GET | `/portfolios/traditional/repayments/${id}` | Récupère un paiement par son ID |
| POST | `/portfolios/traditional/repayments` | Enregistre un nouveau paiement |
| PUT | `/portfolios/traditional/repayments/${id}` | Met à jour un paiement |
| POST | `/portfolios/traditional/repayments/${id}/cancel` | Annule un paiement |
| POST | `/portfolios/traditional/repayments/${id}/generate-receipt` | Génère un reçu de paiement |
| GET | `/portfolios/traditional/repayments/${paymentId}/receipt` | Récupère un document justificatif par son ID de paiement |
| GET | `/portfolios/traditional/repayments/${paymentId}/receipt/download` | Télécharge un document justificatif |
| GET | `/portfolios/traditional/repayments/${id}/has-receipt` | Vérifie si un paiement possède un justificatif |
| GET | `/portfolios/traditional/repayments/${paymentId}/supporting-document` | Télécharge un justificatif de paiement |

#### Ordres de paiement généraux

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/payments` | Récupère tous les ordres de paiement |
| GET | `/payments/${id}` | Récupère un ordre de paiement par son ID |
| POST | `/payments` | Crée un nouvel ordre de paiement |
| PUT | `/payments/${id}` | Met à jour un ordre de paiement |
| PUT | `/payments/${id}/status` | Met à jour le statut d'un ordre de paiement |
| PUT | `/payments/${id}/cancel` | Annule un ordre de paiement |
| GET | `/payments/beneficiary/${encodeURIComponent(beneficiaryName)}` | Récupère les ordres par bénéficiaire |

### 6. Documents

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/prospection/opportunities/${opportunityId}/documents` | POST /prospection/opportunities/${opportunityId}/documents |

### 7. Utilisateurs

#### Profil utilisateur courant

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/users/me` | Récupère l'utilisateur courant **avec son institution** (version lite, optimisée ~5KB) |
| PUT | `/users/me` | Met à jour le profil de l'utilisateur courant |
| GET | `/users/profile` | Récupère le profil simple de l'utilisateur courant (sans institution) |

> **Note importante** : 
> - `/users/me` retourne `{ user, institution, auth0Id, role, permissions }` - idéal pour login/dashboard
> - `PUT /users/me` permet à l'utilisateur de modifier son propre profil
> - `/users/profile` retourne uniquement les données de l'utilisateur
> - L'institution dans `/users/me` est chargée en version "lite" (documents uniquement, pas tous les users)

#### Gestion des utilisateurs

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/users` | Récupère tous les utilisateurs (avec pagination et filtres) |
| GET | `/users/${id}` | Récupère un utilisateur par son ID |
| POST | `/users` | Crée un nouvel utilisateur |
| PUT | `/users/${id}` | Met à jour un utilisateur |
| PATCH | `/users/${id}/status` | Change le statut d'un utilisateur |
| DELETE | `/users/${id}` | Supprime un utilisateur |

#### Vérification d'identité

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/users/${id}/verify-identity` | Soumet les documents de vérification d'identité |
| PUT | `/users/${id}/verify-identity` | Approuve ou rejette une vérification d'identité (admin) |

#### Gestion des rôles et suspensions

| Méthode | URL | Description |
|---------|-----|-------------|
| PUT | `/users/${id}/role` | Change le rôle et les permissions d'un utilisateur |
| POST | `/users/${id}/suspend` | Suspend un utilisateur |
| POST | `/users/${id}/reactivate` | Réactive un utilisateur suspendu |

#### Activités et historique

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/users/${id}/activities` | Récupère l'historique des activités d'un utilisateur |

#### Préférences utilisateur

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/users/${id}/preferences` | Récupère toutes les préférences d'un utilisateur |
| GET | `/users/${id}/preferences?category=${category}` | Récupère les préférences par catégorie |
| POST | `/users/${id}/preferences` | Crée une préférence utilisateur |
| DELETE | `/users/${id}/preferences/${preferenceId}` | Supprime une préférence |

#### Sessions utilisateur

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/users/${id}/sessions` | Récupère toutes les sessions actives d'un utilisateur |
| DELETE | `/users/${id}/sessions/${sessionId}` | Termine une session spécifique |
| DELETE | `/users/${id}/sessions` | Termine toutes les sessions d'un utilisateur |

#### Permissions

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/permissions` | Récupère toutes les permissions disponibles |

### 8. Prospection et Entreprises

**Module:** Prospection (CompaniesController)  
**Base Route:** `/companies`  
**Documentation complète:** [API DOCUMENTATION/prospection/README.md](./prospection/README.md)  
**Structures de données:** [Profil d'Entreprise Complet](./prospection/company-profile.md)  
**Description:** Gestion des prospects avec architecture hybride de synchronisation (accounting-service HTTP + customer-service Kafka)

#### Architecture de synchronisation

```
┌─────────────────────────┐         ┌──────────────────────────┐         ┌─────────────────────────┐
│  Accounting Service     │  HTTP   │  Portfolio Institution   │  Kafka  │  Customer Service       │
│  (Source Primaire)      │────────►│  CompanyProfile Cache    │◄────────│  (Source Secondaire)    │
│                         │         │                          │         │                         │
│  • Données financières  │         │  • Cache unifié          │         │  • Données légales      │
│  • Métriques            │         │  • 60+ champs            │         │  • Contacts             │
│  • Scores crédit        │         │  • Coordonnées GPS       │         │  • Emplacements         │
└─────────────────────────┘         └──────────────────────────┘         └─────────────────────────┘
```

**Règles de réconciliation:**
- Données financières → exclusif `accounting-service`
- Données légales (RCCM, taxId) → exclusif `customer-service`
- En cas de conflit nom → `accounting-service` prioritaire
- Coordonnées GPS → extraites de `locations[isPrimary].coordinates` depuis `customer-service`

#### Workflow de prospection

1. **Découverte** → GET `/companies` avec filtres (secteur, score crédit, taille)
2. **Détails** → GET `/companies/:id` pour profil complet (7 onglets)
3. **Proximité** → GET `/companies/nearby` pour recherche géographique (Haversine)
4. **Synchronisation** → POST `/companies/:id/sync` si données stale (> 24h)
5. **Statistiques** → GET `/companies/stats` pour métriques agrégées

#### 8.1. Liste des prospects avec filtres

**Endpoint:** `GET /companies`  
**Description:** Récupère la liste paginée des prospects avec filtres métier  
**Authentification:** JWT Required

**Paramètres de requête:**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| sector | string | Non | Filtre par secteur d'activité |
| size | enum | Non | Taille: `small`, `medium`, `large` |
| status | enum | Non | Statut: `active`, `pending`, `contacted`, `qualified`, `rejected` |
| minCreditScore | number | Non | Score de crédit minimum (0-100, défaut: 50) |
| maxCreditScore | number | Non | Score de crédit maximum (0-100) |
| financialRating | string | Non | Rating: AAA, AA, A, BBB, BB, B, C, D, E |
| searchTerm | string | Non | Recherche par nom ou secteur |
| page | number | Non | Numéro de page (défaut: 1) |
| limit | number | Non | Éléments par page (défaut: 20, max: 100) |

**Exemple de requête:**
```bash
GET /companies?sector=Technologies&minCreditScore=70&page=1&limit=10
```

**Réponse (200 OK):**
```json
{
  "data": [
    {
      "id": "company-tc-001",
      "name": "TechCongo Innovation SARL",
      "sector": "Technologies de l'Information",
      "size": "small",
      "status": "active",
      "annual_revenue": 250000,
      "financial_metrics": {
        "credit_score": 78,
        "financial_rating": "BBB",
        "profit_margin": 18.2
      },
      "contact_info": {
        "email": "contact@techcongo.cd",
        "phone": "+243 81 234 5678"
      },
      "latitude": -4.3276,
      "longitude": 15.3136
    }
  ],
  "meta": {
    "total": 145,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

#### 8.2. Détails d'un prospect

**Endpoint:** `GET /companies/:id`  
**Description:** Récupère le profil complet avec auto-refresh si données stale (> 24h)  
**Authentification:** JWT Required

**Réponse (200 OK):** Voir [company-profile.md](./prospection/company-profile.md) pour structure complète

**Erreurs:**
- **404 Not Found** - Prospect inexistant

#### 8.3. Statistiques de prospection

**Endpoint:** `GET /companies/stats`  
**Description:** Métriques agrégées de prospection  
**Authentification:** JWT Required

**Réponse (200 OK):**
```json
{
  "totalProspects": 145,
  "byStatus": {
    "active": 89,
    "contacted": 32,
    "qualified": 15,
    "rejected": 9
  },
  "bySector": {
    "Technologies": 42,
    "Commerce": 38,
    "Services": 35,
    "Agriculture": 30
  },
  "bySize": {
    "small": 78,
    "medium": 52,
    "large": 15
  },
  "avgCreditScore": 72.5,
  "lastCalculated": "2025-12-13T14:30:00.000Z"
}
```

#### 8.4. Recherche par proximité géographique

**Endpoint:** `GET /companies/nearby`  
**Description:** Recherche prospects dans un rayon géographique (formule Haversine)  
**Authentification:** JWT Required

**Paramètres requis:**
- **latitude** (number, -90 à 90) - Latitude du point de référence
- **longitude** (number, -180 à 180) - Longitude du point de référence
- **radiusKm** (number, optional) - Rayon en km (défaut: 50, max: 1000)
- Tous les filtres de `/companies` sont également supportés

**Exemple:**
```bash
GET /companies/nearby?latitude=-4.3276&longitude=15.3136&radiusKm=25&minCreditScore=70
```

**Réponse (200 OK):** Tableau de prospects avec champ `distance` ajouté, triés par distance croissante

```json
[
  {
    "id": "company-tc-001",
    "name": "TechCongo Innovation SARL",
    "sector": "Technologies",
    "distance": 12.5,
    "latitude": -4.3150,
    "longitude": 15.3200
  }
]
```

#### 8.5. Recherche de prospects par terme

**Endpoint:** `GET /companies/search`  
**Description:** Recherche full-text par nom ou secteur  
**Authentification:** JWT Required

**Paramètres:**
- **q** (string, required) - Terme de recherche

**Exemple:**
```bash
GET /companies/search?q=TechCongo
```

**Réponse (200 OK):** Tableau de prospects correspondants

```json
[
  {
    "id": "company-tc-001",
    "name": "TechCongo Innovation SARL",
    "sector": "Technologies de l'Information",
    "size": "small",
    "status": "active"
  }
]
```

#### 8.6. Synchronisation manuelle

**Endpoint:** `POST /companies/:id/sync`  
**Description:** Force la synchronisation depuis accounting-service uniquement  
**Authentification:** JWT + Roles (admin, portfolio_manager)

**Réponse (200 OK):**
```json
{
  "message": "Prospect data synchronized successfully from accounting service",
  "data": {
    "id": "company-tc-001",
    "lastSyncFromAccounting": "2025-12-13T15:00:00.000Z"
  }
}
```

**Erreurs:**
- **403 Forbidden** - Permissions insuffisantes
- **404 Not Found** - Prospect inexistant
- **503 Service Unavailable** - Service accounting indisponible

#### 8.7. Synchronisation complète (toutes sources)

**Endpoint:** `POST /companies/:id/sync-complete`  
**Description:** Synchronise depuis accounting + customer services  
**Authentification:** JWT + Roles (admin, portfolio_manager)

**Réponse (200 OK):** Profil complet mis à jour

**Erreurs:** Identiques à `/sync`

#### 8.8. Gestion des documents d'entreprise

**Upload de document:**

**Endpoint:** `POST /companies/:id/documents`  
**Description:** Téléverse un document pour une entreprise  
**Authentification:** JWT Required  
**Content-Type:** `multipart/form-data`

**Paramètres:**
- **file** (File, required) - Fichier à uploader
- **type** (string, required) - Type de document
- **description** (string, optional) - Description du document

**Réponse (201 Created):**
```json
{
  "id": "doc-123",
  "url": "https://storage.wanzo.com/companies/tc-001/documents/doc-123.pdf"
}
```

**Liste des documents:**

**Endpoint:** `GET /companies/:id/documents`  
**Description:** Récupère tous les documents d'une entreprise  
**Authentification:** JWT Required

**Réponse (200 OK):**
```json
[
  {
    "id": "doc-123",
    "name": "RCCM.pdf",
    "type": "legal",
    "url": "https://storage.wanzo.com/companies/tc-001/documents/doc-123.pdf",
    "size": 2048576,
    "uploadDate": "2025-12-13T10:00:00.000Z",
    "description": "Registre de Commerce"
  }
]
```

### 9. Centrale des Risques

> **Base Route** : `/centrale-risque`

#### Entrées de risque

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/centrale-risque/risk-entries` | Récupère toutes les entrées de risque |
| GET | `/centrale-risque/risk-entries/${id}` | Récupère une entrée de risque par ID |
| POST | `/centrale-risque/risk-entries` | Crée une nouvelle entrée de risque |
| PUT | `/centrale-risque/risk-entries/${id}` | Met à jour une entrée de risque |
| DELETE | `/centrale-risque/risk-entries/${id}` | Supprime une entrée de risque |

#### Incidents de paiement

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/centrale-risque/incidents` | Récupère tous les incidents |
| GET | `/centrale-risque/incidents/${id}` | Récupère un incident par ID |
| POST | `/centrale-risque/incidents` | Crée un nouvel incident |
| PUT | `/centrale-risque/incidents/${id}` | Met à jour un incident |
| DELETE | `/centrale-risque/incidents/${id}` | Supprime un incident |

#### Alertes de risque

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/centrale-risque/alerts` | Récupère toutes les alertes |
| GET | `/centrale-risque/alerts/${id}` | Récupère une alerte par ID |
| POST | `/centrale-risque/alerts` | Crée une nouvelle alerte |
| PUT | `/centrale-risque/alerts/${id}` | Met à jour une alerte |
| PUT | `/centrale-risque/alerts/${id}/acknowledge` | Acquitte une alerte |
| DELETE | `/centrale-risque/alerts/${id}` | Supprime une alerte |

#### Statistiques et rapports

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/centrale-risque/stats` | Récupère les statistiques globales de risque |
| GET | `/centrale-risque/entity/${entityId}/summary` | Récupère le résumé de risque d'une entité |
| POST | `/centrale-risque/reports` | Génère un rapport de risque |

#### Endpoints legacy

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/centrale-risque/credit-risks` | Liste des risques crédit (legacy) |
| GET | `/centrale-risque/credit-risks/${id}` | Détail risque crédit (legacy) |
| POST | `/centrale-risque/credit-risks` | Crée un risque crédit (legacy) |
| PUT | `/centrale-risque/credit-risks/${id}` | Met à jour risque crédit (legacy) |
| DELETE | `/centrale-risque/credit-risks/${id}` | Supprime risque crédit (legacy) |

### 10. Paiements

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/payments` | Récupère tous les ordres de paiement |
| GET | `/payments/${id}` | Récupère un ordre de paiement par son ID |
| POST | `/payments` | Crée un nouvel ordre de paiement |
| PUT | `/payments/${id}` | Met à jour un ordre de paiement |
| PUT | `/payments/${id}/status` | Met à jour le statut d'un ordre de paiement |
| PUT | `/payments/${id}/cancel` | Annule un ordre de paiement |
| GET | `/payments/beneficiary/${encodeURIComponent(beneficiaryName)}` | Récupère les ordres par bénéficiaire |
| GET | `/payments?${params.toString()}` | Récupère les paiements avec filtres (page, limit, status, etc.) |

### 11. Paramètres

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/settings` | Récupère tous les paramètres système |
| PUT | `/settings` | Met à jour les paramètres système |
| GET | `/settings/system` | Récupère les paramètres système globaux |
| PUT | `/settings/system` | Met à jour les paramètres système globaux |
| GET | `/settings/notifications` | Récupère les paramètres de notifications |
| PUT | `/settings/notifications` | Met à jour les paramètres de notifications |
| GET | `/settings/security` | Récupère les paramètres de sécurité |
| PUT | `/settings/security` | Met à jour les paramètres de sécurité |
| GET | `/settings/appearance` | Récupère les paramètres d'apparence |
| PUT | `/settings/appearance` | Met à jour les paramètres d'apparence |
| GET | `/settings/integrations` | Récupère les paramètres d'intégrations |
| PUT | `/settings/integrations` | Met à jour les paramètres d'intégrations |
| GET | `/settings/webhooks` | Récupère la liste des webhooks |
| POST | `/settings/webhooks` | Crée un nouveau webhook |
| PUT | `/settings/webhooks/${id}` | Met à jour un webhook |
| DELETE | `/settings/webhooks/${id}` | Supprime un webhook |
| POST | `/settings/webhooks/${id}/test` | Teste un webhook |
| GET | `/settings/api-keys` | Récupère la liste des clés API |
| POST | `/settings/api-keys` | Crée une nouvelle clé API |
| DELETE | `/settings/api-keys/${id}` | Supprime une clé API |

### 12. Prospection

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/prospection/opportunities` | Récupère toutes les opportunités de prospection |
| GET | `/prospection/opportunities/${id}` | Récupère une opportunité par son ID |
| POST | `/prospection/opportunities` | Crée une nouvelle opportunité |
| PUT | `/prospection/opportunities/${id}` | Met à jour une opportunité |
| DELETE | `/prospection/opportunities/${id}` | Supprime une opportunité |
| POST | `/prospection/opportunities/${opportunityId}/activities` | Ajoute une activité à une opportunité |
| GET | `/prospection/opportunities/${opportunityId}/activities` | Récupère les activités d'une opportunité |
| POST | `/prospection/opportunities/${opportunityId}/documents` | Ajoute un document à une opportunité |
| GET | `/prospection/opportunities/${opportunityId}/documents` | Récupère les documents d'une opportunité |
| GET | `/prospection/leads` | Récupère tous les leads |
| POST | `/prospection/leads` | Crée un nouveau lead |
| PUT | `/prospection/leads/${id}` | Met à jour un lead |

### 13. Chat Adha AI

> **Architecture** : Le chat communique avec Adha AI via Kafka. Les contextes maintiennent l'historique de conversation pour la mémoire de l'IA.

#### Messages

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/chat/messages` | Envoie un message à Adha AI et reçoit la réponse |
| GET | `/chat/contexts/${contextId}/messages` | Récupère l'historique des messages d'un contexte |
| POST | `/chat/messages/${messageId}/rating` | Évalue un message (feedback pour Adha AI) |
| POST | `/chat/messages/${messageId}/attachments` | Ajoute une pièce jointe à un message |

#### Contextes de conversation

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/chat/contexts` | Crée un nouveau contexte de conversation |
| GET | `/chat/contexts` | Récupère tous les contextes de l'utilisateur |
| GET | `/chat/contexts/${id}` | Récupère un contexte par son ID |
| PUT | `/chat/contexts/${id}` | Met à jour un contexte (titre, métadonnées) |
| DELETE | `/chat/contexts/${id}` | Supprime un contexte et tous ses messages |

#### Suggestions et rapports

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/chat/suggestions` | Récupère des suggestions de questions basées sur le contexte |
| POST | `/chat/reports` | Génère un rapport à partir des conversations |
| GET | `/chat/predefined-responses` | Récupère les réponses prédéfinies (par catégorie) |

#### Endpoints legacy

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/chat/${id}/usage` | Récupère les statistiques d'utilisation de tokens |
| GET | `/chat/aggregated-context/${institutionId}` | Récupère le contexte agrégé pour Adha AI |

### 14. Dashboard et métriques

#### Dashboard principal

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/dashboard` | Récupère les données du tableau de bord principal |
| GET | `/dashboard/traditional` | Récupère le tableau de bord traditionnel avec filtres |

#### Métriques OHADA

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/dashboard/metrics/ohada` | Récupère toutes les métriques OHADA des portefeuilles |
| GET | `/dashboard/metrics/portfolio/${portfolioId}` | Récupère les métriques OHADA d'un portefeuille spécifique |
| GET | `/dashboard/metrics/global` | Récupère les métriques globales agrégées |
| GET | `/dashboard/compliance/summary` | Récupère le résumé de conformité réglementaire |

#### Analyse de risque

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/dashboard/risk/central-bank` | Données de risque de la banque centrale |
| GET | `/dashboard/risk/portfolios/${id}` | Analyse de risque d'un portefeuille |

#### Préférences et widgets

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/dashboard/preferences/${userId}` | Récupère les préférences du dashboard |
| PUT | `/dashboard/preferences/${userId}/widget/${widgetId}` | Met à jour un widget |
| POST | `/dashboard/preferences/${userId}/reset` | Réinitialise les préférences |
| GET | `/dashboard/widgets/available` | Liste des widgets disponibles |

### 15. Notifications

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/notifications` | Récupère toutes les notifications |
| POST | `/notifications` | Crée une nouvelle notification |
| GET | `/notifications/unread-count` | Récupère le nombre de notifications non lues |
| POST | `/notifications/${id}/read` | Marque une notification comme lue |
| DELETE | `/notifications/${id}` | Supprime une notification |

### 16. Chat Portfolio

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/portfolio-chat` | Récupère toutes les conversations de chat |
| POST | `/portfolio-chat` | Crée une nouvelle conversation |
| GET | `/portfolio-chat/${id}` | Récupère une conversation par son ID |
| PUT | `/portfolio-chat/${id}` | Met à jour une conversation |
| DELETE | `/portfolio-chat/${id}` | Supprime une conversation |

### 17. Synchronisation

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/sync/status` | Récupère le statut de synchronisation |
| POST | `/sync/pull` | Récupère les changements du serveur |
| POST | `/sync/push` | Envoie les changements locaux |
| POST | `/sync/reset` | Réinitialise l'état de synchronisation |

### 18. Autres endpoints généraux

#### Santé du service

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/health` | Vérification de la santé du service (sans authentification) |

#### Gestion d'institution

> **⚠️ Architecture importante**: 
> - L'institution est chargée **automatiquement en 2 étapes** après la connexion :
>   1. `GET /users/me` → Récupère l'utilisateur + **Institution LITE** (optimisée ~5KB)
>   2. `GET /institutions/${institutionId}` → Récupère l'**Institution FULL** (données complètes)
> - Les deux appels sont faits automatiquement par le `AuthContext`
> - L'`institutionId` est stocké dans le contexte global et utilisé pour toutes les opérations

**Flux de chargement de l'institution:**
```
1. User Login → Auth0 → Token JWT
2. Frontend appelle GET /users/me (automatique)
3. Backend retourne { user, institution (LITE), auth0Id, role, permissions }
4. Frontend extrait institutionId
5. Frontend appelle GET /institutions/${institutionId} (automatique)
6. Backend retourne Institution FULL (avec managers, documents, settings complets)
7. Frontend stocke Institution FULL dans AuthContext + AppContextStore
8. Page /institution utilise directement le contexte (pas d'appel API supplémentaire)
```

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/institutions` | Récupère les données de l'institution de l'utilisateur courant |
| GET | `/institutions/profile` | Récupère le profil de l'institution |
| POST | `/institutions/profile` | Crée le profil de l'institution |
| PUT | `/institutions/profile` | Met à jour le profil de l'institution |
| GET | `/institutions/profile/v2.1` | Récupère le profil enrichi v2.1 (sync customer-service) |
| GET | `/institutions/${institutionId}/managers` | Récupère tous les gestionnaires d'institution |
| POST | `/institutions/${institutionId}/managers` | Ajoute un gestionnaire |
| PUT | `/institutions/managers/${managerId}` | Met à jour un gestionnaire d'institution |
| DELETE | `/institutions/managers/${managerId}` | Supprime un gestionnaire d'institution |
| GET | `/institutions/documents` | Récupère les documents de l'institution |
| POST | `/institutions/documents` | Téléverse un document institutionnel |
| POST | `/institutions/validate` | Valide le profil de l'institution |

## Exemples d'utilisation

### Récupérer l'utilisateur courant avec son institution

```javascript
// CRITIQUE: Cet appel est fait AUTOMATIQUEMENT après le login
// Il charge l'utilisateur ET l'institution en une seule requête
// Le frontend stocke ces données dans le contexte global

const fetchCurrentUserWithInstitution = async () => {
  try {
    const response = await fetch('http://localhost:8000/portfolio/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      const { user, institution, auth0Id, role, permissions } = result.data;
      
      // Utilisation typique dans le frontend
      setCurrentUser(user);
      setInstitution(institution);  // Logo, nom, settings...
      setPermissions(permissions);
      
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

// Structure de la réponse:
// {
//   "success": true,
//   "data": {
//     "user": { id, name, email, role, permissions, ... },
//     "institution": { id, name, logo, type, documents, settings, ... },
//     "auth0Id": "auth0|xxx",
//     "role": "portfolio_manager",
//     "permissions": ["read:portfolios", "write:portfolios", ...]
//   }
// }
```

### Récupérer tous les portefeuilles

```javascript
const fetchPortfolios = async () => {
  try {
    const response = await fetch('http://localhost:8000/portfolio/api/v1/portfolios/traditional?page=1&limit=10&status=active', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des portefeuilles:', error);
    throw error;
  }
};
```

### Créer un nouveau contrat de crédit

```javascript
const createCreditContract = async (contractData) => {
  try {
    const response = await fetch('http://localhost:8000/portfolio/api/v1/portfolios/traditional/credit-contracts/from-request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contractData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    throw error;
  }
};
```

### Enregistrer un remboursement

```javascript
const recordRepayment = async (repaymentData) => {
  try {
    const response = await fetch('http://localhost:8000/portfolio/api/v1/portfolios/traditional/repayments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(repaymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du remboursement:', error);
    throw error;
  }
};
```

### Créer un produit financier dans un portefeuille

```javascript
const createFinancialProduct = async (portfolioId, productData) => {
  try {
    const response = await fetch(`http://localhost:8000/portfolio/api/v1/portfolios/traditional/${portfolioId}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    throw error;
  }
};
```

### Rechercher des prospects par filtres

```javascript
const fetchProspects = async (filters) => {
  try {
    const params = new URLSearchParams({
      sector: filters.sector || '',
      minCreditScore: filters.minCreditScore || '50',
      size: filters.size || '',
      status: filters.status || 'active',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });
    
    const response = await fetch(`http://localhost:8000/portfolio/api/v1/companies?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.data) {
      return {
        prospects: result.data,
        pagination: result.meta
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des prospects:', error);
    throw error;
  }
};
```

### Recherche géographique de prospects

```javascript
const findNearbyProspects = async (latitude, longitude, radiusKm = 50) => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radiusKm: radiusKm.toString(),
      minCreditScore: '60', // Filtre optionnel
      status: 'active'      // Filtre optionnel
    });
    
    const response = await fetch(`http://localhost:8000/portfolio/api/v1/companies/nearby?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.data) {
      return result.data.map(prospect => ({
        ...prospect,
        // Distance calculée par l'API (formule Haversine)
        distanceKm: prospect.distanceKm
      }));
    }
  } catch (error) {
    console.error('Erreur lors de la recherche géographique:', error);
    throw error;
  }
};
```

### Synchronisation manuelle d'un prospect

```javascript
const syncProspectData = async (prospectId, completeSync = false) => {
  try {
    const endpoint = completeSync ? 'sync-complete' : 'sync';
    const response = await fetch(`http://localhost:8000/portfolio/api/v1/companies/${prospectId}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.message) {
      console.log(result.message);
      return result.prospect || result.data;
    } else {
      throw new Error('Synchronization failed');
    }
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('Permissions insuffisantes - rôles requis: admin ou portfolio_manager');
    } else if (error.response?.status === 503) {
      console.error('Service comptabilité indisponible');
    }
    throw error;
  }
};
```

### Workflow complet : De la demande au remboursement

```javascript
const completeWorkflow = async () => {
  try {
    // 1. Créer une demande de crédit
    const creditRequest = await fetch('http://localhost:8000/portfolio/api/v1/portfolios/traditional/credit-requests', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: 'client-123',
        productId: 'prod-456',
        requestAmount: 50000,
        reason: 'Expansion commerciale'
      })
    }).then(res => res.json());

    // 2. Approuver la demande
    await fetch(`http://localhost:8000/portfolio/api/v1/portfolios/traditional/credit-requests/${creditRequest.data.id}/status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    });

    // 3. Créer le contrat à partir de la demande
    const contract = await fetch('http://localhost:8000/portfolio/api/v1/portfolios/traditional/credit-contracts/from-request', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditRequestId: creditRequest.data.id })
    }).then(res => res.json());

    // 4. Effectuer le déboursement
    const disbursement = await fetch('http://localhost:8000/portfolio/api/v1/portfolios/traditional/disbursements', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractReference: contract.data.contract_number,
        amount: 50000,
        beneficiary: { /* détails du bénéficiaire */ }
      })
    }).then(res => res.json());

    // 5. Enregistrer un remboursement
    const repayment = await fetch('http://localhost:8000/portfolio/api/v1/portfolios/traditional/repayments', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contract_id: contract.data.id,
        amount: 4583.33,
        payment_method: 'bank_transfer'
      })
    }).then(res => res.json());

    console.log('Workflow complet terminé avec succès');
    return { creditRequest, contract, disbursement, repayment };
    
  } catch (error) {
    console.error('Erreur dans le workflow:', error);
    throw error;
  }
};
```

## ✨ Nouvelles fonctionnalités découvertes

### Mises à jour du 29 décembre 2025

#### 👤 Endpoint utilisateur optimisé `/users/me`
- **Nouveau endpoint** : `GET /users/me` retourne l'utilisateur courant **avec son institution**
- **Chargement optimisé** : Institution chargée en version "lite" (documents uniquement, pas tous les users)
- **Performance** : ~5KB vs ~100KB+ pour l'endpoint `/institutions` complet
- **Cas d'utilisation** : Login, Dashboard, Header (contexte institutionnel sans liste des employés)
- **Structure de réponse** : `{ user, institution, auth0Id, role, permissions }`
- **Différenciation claire** :
  - `/users/me` → User + Institution (lite) pour login/dashboard
  - `/users/profile` → User uniquement pour profil simple
  - `/institutions` → Institution complète avec tous les users pour admin

---

### Mises à jour du 18 novembre 2025

#### 🎯 Module de Prospection Avancée
- **Architecture hybride** : Synchronisation double source (accounting-service HTTP + customer-service Kafka)
- **Cache unifié** : Entity CompanyProfile avec 40+ champs consolidés
- **Recherche géographique** : Support Haversine pour proximité GPS (radius configurable)
- **6 endpoints RESTful** : Liste, stats, nearby, détails, sync manuel, sync complet
- **6 topics Kafka** : customer.created, customer.updated, customer.status.changed, customer.validated, customer.deleted, admin.customer.company.profile.shared
- **Filtres métier** : Secteur, taille (small/medium/large), statut, score crédit (0-100), rating financier (AAA-E)
- **Auto-refresh intelligent** : Re-synchronisation automatique si données > 24h (stale)
- **DTOs validés** : class-validator avec @Min/@Max pour scores, @IsEnum pour statuts
- **Scoring financier** : 20+ métriques (CA, profit, EBITDA, cash flow, ratios)
- **Coordonnées GPS** : Extraction depuis locations[isPrimary].coordinates.{lat, lng}
- **Documentation granulaire** : Compatibilité 100% avec code source vérifié

#### 📈 Améliorations de la qualité documentaire
- **Score de complétude** : Passé de 65% → 95%
- **Synchronisation code-docs** : Vérification systématique des DTOs et controllers
- **Exemples exécutables** : Tous les snippets JavaScript testables
- **Traçabilité** : Mapping granulaire CompanyProfile → ProspectDto (35+ champs)

---

### Mises à jour du 10 novembre 2025

#### 🔄 Workflow avancé des contrats
- **États étendus** : Support complet des états DRAFT, ACTIVE, SUSPENDED, DEFAULTED, LITIGATION, COMPLETED, CANCELLED
- **Transitions contrôlées** : Actions spécialisées pour chaque changement d'état avec validation
- **Traçabilité complète** : Historique détaillé de tous les changements d'état

#### 👥 Gestion avancée des utilisateurs
- **Préférences granulaires** : Système de préférences par catégorie (UI, notifications, sécurité, etc.)
- **Suivi d'activité** : Historique complet des actions utilisateur avec horodatage
- **Gestion de sessions** : Contrôle des sessions actives et déconnexion sélective

#### 📊 Dashboard OHADA et métriques
- **Conformité OHADA** : Métriques spécialisées pour la conformité aux normes OHADA
- **Widgets personnalisables** : Interface de tableau de bord configurable par utilisateur
- **Métriques par portefeuille** : Analyses détaillées par type de financement

#### 🔍 Système d'évaluation des risques
- **Évaluations multicritères** : Support pour crédit, leasing et investissement
- **Centrale des risques** : Interface avec les organismes de régulation financière
- **Scoring automatisé** : Calculs de risque en temps réel avec historique

#### 💳 Ordres de paiement génériques
- **Multi-financement** : Support pour tous types de financement (crédit, leasing, investissement)
- **Workflow d'approbation** : Processus de validation avec états (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
- **Traçabilité bancaire** : Suivi complet jusqu'à confirmation bancaire

#### 🔔 Notifications et chat intégrés
- **Système de notifications** : Gestion complète des notifications avec compteur de non-lus
- **Chat portfolio** : Conversations contextuelles liées aux portfolios et opérations

#### 🚀 Améliorations techniques

**Structure d'URL simplifiée**
- **URLs consolidées** : Simplification de `/portfolios/traditional/` vers `/portfolios/` et `/contracts/`
- **Cohérence API** : Standardisation des patterns d'URL sur l'ensemble du service

**Filtrage et pagination avancés**
- **Filtres uniformes** : Support cohérent des filtres par statut, type, dates sur tous les endpoints
- **Pagination optimisée** : Métadonnées complètes (total, pages, limites) sur toutes les listes

#### Sécurité renforcée
- **Authentification JWT** : Intégration complète avec Auth0
- **Contrôle d'accès** : Vérification des permissions par rôle sur tous les endpoints
- **Audit trail** : Traçabilité complète des actions utilisateur

---

*Documentation mise à jour le 4 janvier 2026 - Conformité 100% code source atteinte.*

### Mises à jour du 4 janvier 2026

#### ✅ Conformité 100% Documentation-Code
- **PUT /users/me** : Ajout endpoint mise à jour profil utilisateur courant
- **POST /users/:id/verify-identity** : Soumission documents vérification
- **PUT /users/:id/verify-identity** : Approbation/rejet vérification (admin)
- **PUT /users/:id/role** : Changement de rôle utilisateur
- **POST /users/:id/suspend** : Suspension utilisateur
- **POST /users/:id/reactivate** : Réactivation utilisateur
- **GET /permissions** : Liste permissions disponibles
- **POST /chat/messages/:messageId/attachments** : Pièces jointes messages chat
- **Section Centrale-Risque** : Documentation complète `/centrale-risque/*`
- **Section Chat Adha AI** : Architecture Kafka et endpoints contextes
