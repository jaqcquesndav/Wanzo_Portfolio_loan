# Documentation API Prospection v2.0

Documentation complète du module de prospection, synchronisée avec l'implémentation réelle du code source (Novembre 2025).

## 🏗️ Architecture

Le module de prospection repose sur une **architecture événementielle Kafka** de synchronisation des données :

```
┌─────────────────────────┐         ┌──────────────────────────┐         ┌─────────────────────────┐
│  Accounting Service     │  Kafka  │  Portfolio Institution   │  Kafka  │  Customer Service       │
│  (Source Financière)    │────────►│  CompanyProfile Cache    │◄────────│  (Source Légale)        │
│                         │         │                          │         │                         │
│  • Données financières  │         │  • Cache unifié          │         │  • Données légales      │
│  • Métriques/Ratios     │         │  • 70+ champs            │         │  • Contacts             │
│  • Scores crédit        │         │  • Coordonnées GPS       │         │  • Emplacements         │
│  • Trésorerie SYSCOHADA │         │  • Treasury data         │         │  • Structure capital    │
└─────────────────────────┘         └──────────────────────────┘         └─────────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │  ProspectionService  │
                                    │  • Filtrage métier   │
                                    │  • Recherche géo     │
                                    │  • Statistiques      │
                                    └──────────────────────┘
```

### Stratégie de Synchronisation

**Source Financière (Kafka) :** `accounting-service`
- Topic: `company.financial.data.shared` (StandardKafkaTopics.COMPANY_FINANCIAL_DATA_SHARED)
- Données financières opérationnelles (20+ métriques)
- Scores de crédit (0-100) et ratings (AAA à E)
- Métriques de performance (CA, profit, EBITDA, cash flow)
- Ratios financiers (endettement, marge, croissance)
- **Données de trésorerie SYSCOHADA** (comptes 52x, 53x, 54x, 57x)
- Séries temporelles multi-échelles (weekly, monthly, quarterly, annual)
- Synchronisation temps réel via événements Kafka

**Source Légale/Administrative (Kafka) :** `customer-service`
- Enrichissement avec données administratives/légales
- Informations de contact (owner, contactPersons, email, phone)
- Emplacements multiples avec coordonnées géographiques (lat/lng)
- Structure de capital, associés, affiliations (CNSS, INPP)
- Synchronisation temps réel via **6 topics Kafka** :
  1. `admin.customer.company.profile.shared` - Profil complet (70+ champs)
  2. `customer.created` (StandardKafkaTopics.CUSTOMER_CREATED)
  3. `customer.updated` (StandardKafkaTopics.CUSTOMER_UPDATED)
  4. `customer.status.changed` (StandardKafkaTopics.CUSTOMER_STATUS_CHANGED)
  5. `customer.validated` (StandardKafkaTopics.CUSTOMER_VALIDATED)
  6. `customer.deleted` (StandardKafkaTopics.CUSTOMER_DELETED)

**Règles de Réconciliation :**
- En cas de conflit `companyName` → `accounting-service` TOUJOURS prioritaire
- Coordonnées GPS → extraites de `locations[isPrimary].coordinates.{lat, lng}` depuis `customer-service`
- `employeeCount` → `accounting-service` prioritaire, `customer-service` fallback
- Données légales (RCCM, taxId, forme juridique) → exclusif `customer-service`
- Données financières → exclusif `accounting-service`

## 🔗 Base URL

**Développement :** `http://localhost:8000/portfolio/api/v1/companies`  
**Production :** `https://api.wanzo.com/portfolio/api/v1/companies`

**Note:** Toutes les requêtes passent par l'API Gateway qui route vers les microservices internes.

## 📡 Endpoints

### 1. Liste des prospects avec filtres

Récupère la liste paginée des prospects (companies) avec filtres métier.

#### Requête

```http
GET /companies
```

#### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Paramètres de requête (Query Params)

| Paramètre         | Type    | Requis | Description                                      |
|-------------------|---------|--------|--------------------------------------------------|
| sector            | string  | Non    | Filtre par secteur d'activité                   |
| size              | enum    | Non    | Taille : `small`, `medium`, `large`             |
| status            | enum    | Non    | Statut : `active`, `pending`, `contacted`, `qualified`, `rejected` |
| minCreditScore    | number  | Non    | Score de crédit minimum (0-100, défaut: 50)     |
| maxCreditScore    | number  | Non    | Score de crédit maximum (0-100)                 |
| financialRating   | string  | Non    | Rating financier (AAA, AA, A, BBB, BB, B, C, D, E) |
| searchTerm        | string  | Non    | Recherche par nom ou secteur                    |
| page              | number  | Non    | Numéro de page (défaut: 1)                      |
| limit             | number  | Non    | Éléments par page (défaut: 20, max: 100)       |

#### Exemple de requête

```bash
GET /companies?sector=Technologies&minCreditScore=70&page=1&limit=10
```

#### Réponse réussie (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-company-123",
      "name": "TechInnovate SARL",
      "sector": "Technologies",
      "size": "medium",
      "status": "active",
      "financial_metrics": {
        "annual_revenue": 2500000.00,
        "revenue_growth": 12.50,
        "profit_margin": 8.20,
        "cash_flow": 450000.00,
        "debt_ratio": 0.40,
        "working_capital": 650000.00,
        "credit_score": 82,
        "financial_rating": "B+",
        "ebitda": 320000.00,
        "treasury_data": {
          "total_treasury_balance": 125000000.00,
          "accounts": [
            {
              "code": "521001",
              "name": "Rawbank - Compte Courant CDF",
              "type": "bank",
              "balance": 75000000.00,
              "currency": "CDF",
              "bankName": "Rawbank",
              "accountNumber": "CD39-1234-5678-9012-3456"
            },
            {
              "code": "531001",
              "name": "Caisse Principale CDF",
              "type": "cash",
              "balance": 15000000.00,
              "currency": "CDF"
            },
            {
              "code": "541001",
              "name": "Dépôts à terme - Equity Bank",
              "type": "investment",
              "balance": 35000000.00,
              "currency": "USD"
            }
          ],
          "timeseries": {
            "weekly": [
              {
                "periodId": "2025-W46",
                "startDate": "2025-11-10",
                "endDate": "2025-11-16",
                "totalBalance": 125000000.00,
                "accountsCount": 3
              }
            ],
            "monthly": [
              {
                "periodId": "2025-11",
                "startDate": "2025-11-01",
                "endDate": "2025-11-30",
                "totalBalance": 118000000.00,
                "accountsCount": 3
              }
            ],
            "quarterly": [
              {
                "periodId": "2025-Q4",
                "startDate": "2025-10-01",
                "endDate": "2025-12-31",
                "totalBalance": 110000000.00,
                "accountsCount": 3
              }
            ],
            "annual": [
              {
                "periodId": "2025",
                "startDate": "2025-01-01",
                "endDate": "2025-12-31",
                "totalBalance": 95000000.00,
                "accountsCount": 2
              }
            ]
          }
        }
      },
      "contact_info": {
        "email": "contact@techinnovate.cd",
        "phone": "+243 123 456 789",
        "address": "123 Avenue de la Libération, Kinshasa, RDC",
        "website": "https://techinnovate.cd"
      },
      "latitude": -4.3276,
      "longitude": 15.3136,
      "legal_info": {
        "legalForm": "SARL",
        "rccm": "CD/KIN/RCCM/12-A-12345",
        "taxId": "A1234567Z",
        "yearFounded": 2015
      },
      "employeeCount": 85,
      "locations": [
        {
          "id": "loc-uuid-001",
          "address": "123 Avenue de la Libération",
          "city": "Kinshasa",
          "country": "RDC",
          "isPrimary": true,
          "coordinates": {
            "lat": -4.3276,
            "lng": 15.3136
          }
        },
        {
          "id": "loc-uuid-002",
          "address": "456 Boulevard Lumumba",
          "city": "Lubumbashi",
          "country": "RDC",
          "isPrimary": false,
          "coordinates": {
            "lat": -11.6703,
            "lng": 27.4794
          }
        }
      ],
      "owner": {
        "id": "owner-456",
        "name": "Jean Kabila",
        "email": "j.kabila@techinnovate.cd",
        "phone": "+243 999 888 777"
      },
      "contactPersons": [
        {
          "name": "Marie Tshisekedi",
          "role": "Directrice Commerciale",
          "email": "m.tshisekedi@techinnovate.cd",
          "phone": "+243 888 777 666"
        }
      ],
      "profileCompleteness": 85,
      "lastSyncFromAccounting": "2025-11-18T10:30:00.000Z",
      "lastSyncFromCustomer": "2025-11-18T08:15:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2025-11-18T10:30:00.000Z"
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

---

### 2. Détails d'un prospect

Récupère les détails complets d'un prospect spécifique avec auto-refresh si données stale.

#### Requête

```http
GET /companies/:id
```

#### Paramètres URL

| Paramètre | Type   | Requis | Description                  |
|-----------|--------|--------|------------------------------|
| id        | string | Oui    | UUID du prospect/company     |

#### Exemple

```bash
GET /companies/uuid-company-123
```

#### Réponse réussie (200 OK)

Même structure que l'objet `data[]` de la liste des prospects.

#### Réponse d'erreur (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Prospect uuid-company-123 not found",
  "error": "Not Found"
}
```

---

### 3. Statistiques de prospection

Récupère les métriques agrégées de prospection.

#### Requête

```http
GET /companies/stats
```

#### Réponse réussie (200 OK)

```json
{
  "totalProspects": 145,
  "bySector": {
    "Technologies": 35,
    "Commerce": 50,
    "Agriculture": 25,
    "Services": 35
  },
  "bySize": {
    "small": 80,
    "medium": 45,
    "large": 20
  },
  "byFinancialRating": {
    "AAA": 5,
    "AA": 10,
    "A": 20,
    "BBB": 30,
    "BB": 25,
    "B": 35,
    "C": 15,
    "D": 5
  },
  "averageCreditScore": 68.5,
  "dataFreshness": {
    "withFreshAccountingData": 120,
    "withFreshCustomerData": 135
  },
  "lastCalculated": "2025-11-18T12:00:00.000Z"
}
```

---

### 4. Recherche de prospects par proximité géographique

Recherche des prospects dans un rayon géographique donné (utilise la formule de Haversine).

#### Requête

```http
GET /companies/nearby
```

#### Paramètres de requête

| Paramètre  | Type   | Requis | Description                            |
|------------|--------|--------|----------------------------------------|
| latitude   | number | Oui    | Latitude du point de référence (-90 à 90) |
| longitude  | number | Oui    | Longitude du point de référence (-180 à 180) |
| radiusKm   | number | Non    | Rayon de recherche en km (défaut: 50, max: 1000) |

**Note :** Tous les paramètres de filtrage de l'endpoint `/companies` peuvent être combinés.

#### Exemple

```bash
GET /companies/nearby?latitude=-4.3276&longitude=15.3136&radiusKm=25&minCreditScore=70
```

#### Réponse réussie (200 OK)

```json
[
  {
    "id": "uuid-company-456",
    "name": "ProximitéTech SPRL",
    "sector": "Technologies",
    "latitude": -4.3150,
    "longitude": 15.3200,
    "distance": 2.3,
    "financial_metrics": {
      "credit_score": 75,
      "financial_rating": "B"
    },
    "contact_info": {
      "email": "info@proximitetech.cd",
      "phone": "+243 800 700 600"
    }
  }
]
```

**Note :** Les résultats sont triés par distance croissante.

---

### 5. Synchronisation manuelle d'un prospect

Force la synchronisation des données depuis `accounting-service` pour un prospect spécifique.

#### Requête

```http
POST /companies/:id/sync
```

#### Permissions requises

- `admin`
- `portfolio_manager`

#### Paramètres URL

| Paramètre | Type   | Requis | Description              |
|-----------|--------|--------|--------------------------|
| id        | string | Oui    | UUID du prospect/company |

#### Réponse réussie (200 OK)

```json
{
  "message": "Prospect data synchronized successfully from accounting service",
  "prospect": {
    "id": "uuid-company-123",
    "name": "TechInnovate SARL",
    "lastSyncFromAccounting": "2025-11-18T14:30:00.000Z"
  }
}
```

#### Réponses d'erreur

**403 Forbidden** - Permissions insuffisantes
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**404 Not Found** - Prospect inexistant
```json
{
  "statusCode": 404,
  "message": "Prospect uuid-company-123 not found",
  "error": "Not Found"
}
```

**503 Service Unavailable** - Service accounting indisponible
```json
{
  "statusCode": 503,
  "message": "Accounting service is currently unavailable",
  "error": "Service Unavailable"
}
```

---

### 6. Synchronisation complète (toutes sources)

Synchronise les données depuis **toutes les sources** (accounting + customer services).

#### Requête

```http
POST /companies/:id/sync-complete
```

#### Permissions requises

- `admin`
- `portfolio_manager`

#### Paramètres URL

| Paramètre | Type   | Requis | Description              |
|-----------|--------|--------|--------------------------|
| id        | string | Oui    | UUID du prospect/company |

#### Réponse réussie (200 OK)

```json
{
  "id": "uuid-company-123",
  "name": "TechInnovate SARL",
  "profileCompleteness": 92,
  "lastSyncFromAccounting": "2025-11-18T14:35:00.000Z",
  "lastSyncFromCustomer": "2025-11-18T14:35:30.000Z",
  "syncStatus": {
    "accounting": "success",
    "customer": "success"
  }
}
```

---

## 📊 Modèles de Données

### ProspectDto (Structure Exacte)

**Source :** `src/modules/prospection/dtos/prospection.dto.ts`

```typescript
import { ProspectSize, ProspectStatus } from './prospection.dto';

export enum ProspectSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum ProspectStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  REJECTED = 'rejected'
}

interface ProspectDto {
  // Identifiants
  id: string;                                // @IsUUID() - UUID du prospect
  name: string;                              // @IsString() - Nom de la company
  sector: string;                            // @IsString() - Secteur d'activité
  size: string;                              // @IsEnum(ProspectSize) - 'small' | 'medium' | 'large'
  status: string;                            // @IsEnum(ProspectStatus) - Statut prospection
  
  // Métriques financières (SOURCE: accounting-service via CompanyProfile)
  financial_metrics: ProspectFinancialMetricsDto;  // @ValidateNested() @Type(() => ProspectFinancialMetricsDto)
  
  // Informations de contact (SOURCE: customer-service via Kafka)
  contact_info: ProspectContactInfoDto;      // @ValidateNested() @Type(() => ProspectContactInfoDto)
  
  // Géolocalisation (SOURCE: customer-service, extrait de locations[isPrimary])
  latitude?: number;                         // @IsOptional() @IsNumber() - Latitude GPS (-90 à 90)
  longitude?: number;                        // @IsOptional() @IsNumber() - Longitude GPS (-180 à 180)
  
  // Informations légales (SOURCE: customer-service)
  legal_info?: ProspectLegalInfoDto;         // @IsOptional() @ValidateNested() @Type(() => ProspectLegalInfoDto)
  
  // Ressources humaines
  employeeCount?: number;                    // @IsOptional() @IsNumber() - Nombre d'employés
  
  // Emplacements multiples
  locations?: Array<{                        // @IsOptional() @IsArray() - Liste des emplacements
    id: string;
    address: string;
    city: string;
    country: string;
    isPrimary: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  
  // Propriétaire principal
  owner?: {                                  // @IsOptional() @IsObject()
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  
  // Personnes de contact
  contactPersons?: Array<{                   // @IsOptional() @IsArray()
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  
  // Métadonnées
  profileCompleteness: number;               // @IsNumber() @Min(0) @Max(100) - Complétude (0-100%)
  lastSyncFromAccounting?: string;           // @IsOptional() @IsString() - Date ISO 8601
  lastSyncFromCustomer?: string;             // @IsOptional() @IsString() - Date ISO 8601
  createdAt: string;                         // @IsString() - Date ISO 8601
  updatedAt: string;                         // @IsString() - Date ISO 8601
}

// --- Sous-DTOs ---

interface ProspectFinancialMetricsDto {
  annual_revenue: number;                    // @IsNumber() - CA annuel (CDF)
  revenue_growth: number;                    // @IsNumber() - Croissance YoY (%)
  profit_margin: number;                     // @IsNumber() - Marge bénéficiaire (%)
  cash_flow: number;                         // @IsNumber() - Flux de trésorerie (CDF)
  debt_ratio: number;                        // @IsNumber() - Ratio d'endettement (0.0-1.0)
  working_capital: number;                   // @IsNumber() - Fonds de roulement (CDF)
  credit_score: number;                      // @IsNumber() @Min(0) @Max(100) - Score (0-100)
  financial_rating: string;                  // @IsString() - Rating (AAA, AA, A, BBB, BB, B, C, D, E)
  ebitda?: number;                           // @IsOptional() @IsNumber() - EBITDA (CDF)
  treasury_data?: TreasuryDataDto;           // @IsOptional() @ValidateNested() - Données de trésorerie
}

interface TreasuryDataDto {
  total_treasury_balance: number;            // @IsNumber() - Solde total trésorerie (CDF)
  accounts: TreasuryAccountDto[];            // @IsArray() - Liste des comptes de trésorerie
  timeseries?: {                             // @IsOptional() - Séries temporelles multi-échelles
    weekly: TreasuryPeriodDto[];             // 12 dernières semaines
    monthly: TreasuryPeriodDto[];            // 12 derniers mois
    quarterly: TreasuryPeriodDto[];          // 4 derniers trimestres
    annual: TreasuryPeriodDto[];             // 3 dernières années
  };
}

interface TreasuryAccountDto {
  code: string;                              // @IsString() - Code comptable SYSCOHADA (521*, 53*, 54*, 57*)
  name: string;                              // @IsString() - Libellé du compte
  type: 'bank' | 'cash' | 'investment' | 'transit'; // @IsEnum() - Type de compte
  balance: number;                           // @IsNumber() - Solde actuel
  currency: string;                          // @IsString() - Devise (CDF, USD, EUR)
  bankName?: string;                         // @IsOptional() - Nom de la banque (pour type=bank)
  accountNumber?: string;                    // @IsOptional() - Numéro de compte (pour type=bank)
}

interface TreasuryPeriodDto {
  periodId: string;                          // @IsString() - Identifiant période (2025-W46, 2025-11, 2025-Q4, 2025)
  startDate: string;                         // @IsString() - Date début période (ISO 8601)
  endDate: string;                           // @IsString() - Date fin période (ISO 8601)
  totalBalance: number;                      // @IsNumber() - Solde total pour la période
  accountsCount: number;                     // @IsNumber() - Nombre de comptes actifs
}

interface ProspectContactInfoDto {
  email?: string;                            // @IsOptional() @IsEmail() - Email de contact
  phone?: string;                            // @IsOptional() @IsString() - Téléphone
  address?: string;                          // @IsOptional() @IsString() - Adresse physique
  website?: string;                          // @IsOptional() @IsUrl() - Site web
}

interface ProspectLegalInfoDto {
  legalForm?: string;                        // @IsOptional() @IsString() - Forme juridique (SARL, SA, SAS, etc.)
  rccm?: string;                             // @IsOptional() @IsString() - Numéro RCCM
  taxId?: string;                            // @IsOptional() @IsString() - Numéro fiscal
  yearFounded?: number;                      // @IsOptional() @IsNumber() - Année de création
}
```

---

### ProspectionFiltersDto (Structure Exacte)

**Source :** `src/modules/prospection/dtos/prospection.dto.ts`

```typescript
import { ProspectSize, ProspectStatus } from './prospection.dto';

class ProspectionFiltersDto {
  sector?: string;                           // @IsOptional() @IsString() - Filtre par secteur
  size?: ProspectSize;                       // @IsOptional() @IsEnum(ProspectSize) - 'small' | 'medium' | 'large'
  status?: ProspectStatus;                   // @IsOptional() @IsEnum(ProspectStatus) - Statut prospection
  minCreditScore?: number;                   // @IsOptional() @IsNumber() @Min(0) @Max(100) - Score minimum
  maxCreditScore?: number;                   // @IsOptional() @IsNumber() @Min(0) @Max(100) - Score maximum
  financialRating?: string;                  // @IsOptional() @IsString() - Rating financier
  searchTerm?: string;                       // @IsOptional() @IsString() - Recherche par nom ou secteur
  page?: number;                             // @IsOptional() @IsNumber() @Min(1) - Page (défaut: 1)
  limit?: number;                            // @IsOptional() @IsNumber() @Min(1) @Max(100) - Limite (défaut: 20)
}
```

---

### GeolocationDto (Structure Exacte)

**Source :** `src/modules/prospection/dtos/prospection.dto.ts`

```typescript
class GeolocationDto {
  latitude: number;                          // @IsNumber() @Min(-90) @Max(90) - Latitude GPS
  longitude: number;                         // @IsNumber() @Min(-180) @Max(180) - Longitude GPS
  radiusKm?: number;                         // @IsOptional() @IsNumber() @Min(0.1) @Max(1000) - Rayon en km
}
```

---

### NearbyProspectsSearchDto (Structure Exacte)

**Source :** `src/modules/prospection/dtos/prospection.dto.ts`

```typescript
class NearbyProspectsSearchDto extends GeolocationDto {
  filters?: ProspectionFiltersDto;           // @IsOptional() @ValidateNested() @Type(() => ProspectionFiltersDto)
}
```

---

### ProspectionStatsDto (Structure Exacte)

**Source :** `src/modules/prospection/dtos/prospection.dto.ts`

```typescript
class ProspectionStatsDto {
  totalProspects: number;                    // @IsNumber() - Nombre total de prospects
  bySector: Record<string, number>;          // @IsObject() - Distribution par secteur
  bySize: Record<string, number>;            // @IsObject() - Distribution par taille
  byFinancialRating: Record<string, number>; // @IsObject() - Distribution par rating
  averageCreditScore: number;                // @IsNumber() - Score moyen calculé
  dataFreshness: {                           // @IsObject() - Métriques de fraîcheur
    withFreshAccountingData: number;         // Nombre avec données accounting < 24h
    withFreshCustomerData: number;           // Nombre avec données customer < 7 jours
  };
  lastCalculated: string;                    // @IsString() - Date ISO 8601 du calcul
}
```

---

### ProspectListResponseDto (Structure Exacte)

**Source :** `src/modules/prospection/dtos/prospection.dto.ts`

```typescript
class ProspectListResponseDto {
  data: ProspectDto[];                       // @IsArray() @ValidateNested({ each: true }) @Type(() => ProspectDto)
  meta: {                                    // @IsObject() - Métadonnées pagination
    total: number;                           // Nombre total de résultats
    page: number;                            // Page actuelle
    limit: number;                           // Limite par page
    totalPages: number;                      // Nombre total de pages
  };
}
```

---

## 💰 Données de Trésorerie (Treasury Data)

### Vue d'ensemble

Les données de trésorerie sont **automatiquement partagées** depuis `accounting-service` vers `portfolio-institution-service` via Kafka lorsque l'entreprise active le **partage de données** (Data Sharing Consent).

```
┌─────────────────────────┐         Kafka Topic:                    ┌──────────────────────────┐
│  Accounting Service     │   company.financial.data.shared         │  Portfolio Institution   │
│                         │──────────────────────────────────────►  │  CompanyProfile Cache    │
│  • Génère séries tempo  │                                          │                          │
│  • Comptes SYSCOHADA    │   Payload: treasuryAccounts +            │  • Stockage metadata     │
│  • 4 échelles temporelles│            treasuryTimeseries            │  • API REST              │
└─────────────────────────┘                                          └──────────────────────────┘
```

### Classification des Comptes (SYSCOHADA)

Les comptes de trésorerie suivent la **norme SYSCOHADA** (Plan comptable OHADA révisé 2017) :

| Classe SYSCOHADA | Type         | Description                           | Équivalent IFRS |
|------------------|--------------|---------------------------------------|-----------------|
| **521**          | `bank`       | Banques, établissements financiers    | IAS 7 - Cash    |
| **53**           | `cash`       | Caisse (531-538)                      | IAS 7 - Cash    |
| **54**           | `investment` | Instruments de trésorerie et placements | IAS 7 - Cash Equivalents |
| **57**           | `transit`    | Virements internes, régies d'avance   | IAS 7 - Cash    |

### Structure des Données

#### 1. Snapshot Actuel (Current Treasury)

Accessible via `financial_metrics.treasury_data.accounts[]` dans la réponse de l'API `/companies/:id` :

```json
{
  "total_treasury_balance": 125000000.00,
  "accounts": [
    {
      "code": "521001",
      "name": "Rawbank - Compte Courant CDF",
      "type": "bank",
      "balance": 75000000.00,
      "currency": "CDF",
      "bankName": "Rawbank",
      "accountNumber": "CD39-1234-5678-9012-3456"
    },
    {
      "code": "531001",
      "name": "Caisse Principale CDF",
      "type": "cash",
      "balance": 15000000.00,
      "currency": "CDF"
    }
  ]
}
```

#### 2. Séries Temporelles Multi-Échelles (Timeseries)

Accessible via `financial_metrics.treasury_data.timeseries` :

**4 échelles temporelles :**
- **Weekly** : 12 dernières semaines (périodes de 7 jours, identifiant: `2025-W46`)
- **Monthly** : 12 derniers mois (mois calendaires, identifiant: `2025-11`)
- **Quarterly** : 4 derniers trimestres (trimestres de 3 mois, identifiant: `2025-Q4`)
- **Annual** : 3 dernières années (années complètes, identifiant: `2025`)

```json
{
  "timeseries": {
    "weekly": [
      {
        "periodId": "2025-W46",
        "startDate": "2025-11-10",
        "endDate": "2025-11-16",
        "totalBalance": 125000000.00,
        "accountsCount": 3
      }
    ],
    "monthly": [
      {
        "periodId": "2025-11",
        "startDate": "2025-11-01",
        "endDate": "2025-11-30",
        "totalBalance": 118000000.00,
        "accountsCount": 3
      }
    ],
    "quarterly": [
      {
        "periodId": "2025-Q4",
        "startDate": "2025-10-01",
        "endDate": "2025-12-31",
        "totalBalance": 110000000.00,
        "accountsCount": 3
      }
    ],
    "annual": [
      {
        "periodId": "2025",
        "startDate": "2025-01-01",
        "endDate": "2025-12-31",
        "totalBalance": 95000000.00,
        "accountsCount": 2
      }
    ]
  }
}
```

### Stockage dans CompanyProfile.metadata

Les données de trésorerie sont stockées dans le champ JSONB `metadata` de l'entité `CompanyProfile` :

```typescript
// Structure metadata (JSONB column)
{
  accountingStandard: 'SYSCOHADA',      // Standard comptable (SYSCOHADA ou IFRS)
  treasuryAccounts: TreasuryAccount[],  // Snapshot actuel des comptes
  totalTreasuryBalance: number,          // Solde total agrégé
  treasuryTimeseries: {                  // Séries temporelles
    weekly: TreasuryPeriodSummary[],     // 12 semaines
    monthly: TreasuryPeriodSummary[],    // 12 mois
    quarterly: TreasuryPeriodSummary[],  // 4 trimestres
    annual: TreasuryPeriodSummary[]      // 3 années
  },
  sharedDataConsent: {                   // Consentement de partage
    granted: boolean,
    grantedTo: string[],
    grantedAt: string
  }
}
```

### Utilisation Frontend

#### Exemple 1 : Afficher le Solde Actuel

```typescript
import { useEffect, useState } from 'react';
import { companyApi } from '@/api';

function TreasuryBalance({ companyId }: { companyId: string }) {
  const [treasury, setTreasury] = useState<any>(null);
  
  useEffect(() => {
    async function loadTreasury() {
      const company = await companyApi.getCompanyById(companyId);
      setTreasury(company.financial_metrics.treasury_data);
    }
    loadTreasury();
  }, [companyId]);
  
  if (!treasury) return <div>Chargement...</div>;
  
  return (
    <div>
      <h3>Solde de Trésorerie</h3>
      <p><strong>{treasury.total_treasury_balance.toLocaleString()} CDF</strong></p>
      <ul>
        {treasury.accounts.map(acc => (
          <li key={acc.code}>
            {acc.name} ({acc.type}): {acc.balance.toLocaleString()} {acc.currency}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Exemple 2 : Graphique Temporel avec Chart.js

```typescript
import { Line } from 'react-chartjs-2';

function TreasuryChart({ companyId }: { companyId: string }) {
  const [data, setData] = useState<any>(null);
  const [scale, setScale] = useState<'weekly' | 'monthly' | 'quarterly' | 'annual'>('monthly');
  
  useEffect(() => {
    async function loadData() {
      const company = await companyApi.getCompanyById(companyId);
      const timeseries = company.financial_metrics.treasury_data?.timeseries;
      
      if (timeseries) {
        const periods = timeseries[scale];
        setData({
          labels: periods.map(p => p.periodId),
          datasets: [{
            label: 'Trésorerie Totale',
            data: periods.map(p => p.totalBalance),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        });
      }
    }
    loadData();
  }, [companyId, scale]);
  
  return (
    <div>
      <div>
        <button onClick={() => setScale('weekly')}>Hebdo</button>
        <button onClick={() => setScale('monthly')}>Mensuel</button>
        <button onClick={() => setScale('quarterly')}>Trimestriel</button>
        <button onClick={() => setScale('annual')}>Annuel</button>
      </div>
      {data && <Line data={data} />}
    </div>
  );
}
```

### Conformité SYSCOHADA et IFRS

| Norme       | Référence                              | Application                                    |
|-------------|----------------------------------------|------------------------------------------------|
| SYSCOHADA   | Plan comptable OHADA révisé 2017       | Classification des comptes (521, 53, 54, 57)   |
| SYSCOHADA   | Classes 1-8                            | Structure du bilan et compte de résultat       |
| IFRS        | IAS 7 - Statement of Cash Flows        | Flux de trésorerie, équivalents de trésorerie  |
| IFRS        | IAS 1 - Presentation of Financial Statements | Présentation des états financiers     |

### Sécurité et Consentement

Les données de trésorerie ne sont partagées **QUE SI** :
1. L'entreprise a **explicitement consenti** au partage de données (Data Sharing Consent)
2. Le consentement est actif dans `accounting-service` via `PUT /settings/data-sharing`
3. Le consentement inclut `portfolio-institution-service` dans la liste des services autorisés

**Vérification côté frontend :**

```typescript
function hasConsentForTreasury(company: CompanyProfile): boolean {
  const consent = company.metadata?.sharedDataConsent;
  return consent?.granted && consent?.grantedTo?.includes('portfolio-institution');
}
```

### Cas d'Usage

1. **Analyse de Solvabilité** : Évaluer la capacité de remboursement via le solde de trésorerie actuel
2. **Détection de Tendances** : Identifier les variations saisonnières dans les séries temporelles
3. **Scoring Crédit** : Intégrer les données de trésorerie dans l'algorithme de credit scoring
4. **Alertes Automatiques** : Déclencher des alertes si le solde tombe sous un seuil critique
5. **Rapports Réglementaires** : Générer des rapports conformes SYSCOHADA/IFRS

---

## 🔄 Topics Kafka Consommés

Le module `CompanyEventsConsumer` écoute **6 topics Kafka** depuis `customer-service` :

| Topic                                    | Événement                     | Description                                  |
|------------------------------------------|-------------------------------|----------------------------------------------|
| `admin.customer.company.profile.shared`  | @EventPattern                 | Profil complet partagé (70+ champs incluant owner, associates, locations, affiliations) |
| `customer.created`                       | StandardKafkaTopics.CUSTOMER_CREATED | Nouvelle company créée - déclenche sync initiale |
| `customer.updated`                       | StandardKafkaTopics.CUSTOMER_UPDATED | Company mise à jour - enrichit le profil |
| `customer.status.changed`                | StandardKafkaTopics.CUSTOMER_STATUS_CHANGED | Changement de statut (active, suspended, deleted) |
| `customer.validated`                     | StandardKafkaTopics.CUSTOMER_VALIDATED | Company validée - déclenche sync complète |
| `customer.deleted`                       | StandardKafkaTopics.CUSTOMER_DELETED | Company supprimée - marque comme deleted (garde historique) |

### Structure de l'événement `company.financial.data.shared` (Accounting Service)

**Topic :** `company.financial.data.shared` (StandardKafkaTopics.COMPANY_FINANCIAL_DATA_SHARED)  
**Source :** `accounting-service`  
**Consumer :** `FinancialDataConsumer` dans `portfolio-institution-service`

Cet événement est publié lorsqu'une entreprise **active le partage de données** (Data Sharing Consent) dans `accounting-service`. Il contient les **données financières complètes** incluant les comptes de trésorerie avec séries temporelles multi-échelles.

```typescript
interface CompanyFinancialDataSharedEvent {
  organizationId: string;                 // UUID de l'organization
  companyName: string;                    // Nom de la company
  sector?: string;                        // Secteur d'activité
  
  // Métriques financières
  totalRevenue?: number;
  annualRevenue?: number;
  netProfit?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  cashFlow?: number;
  debtRatio?: number;
  workingCapital?: number;
  creditScore?: number;
  financialRating?: string;
  ebitda?: number;
  revenueGrowth?: number;
  profitMargin?: number;
  
  // Autres métriques
  employeeCount?: number;
  companySize?: string;
  websiteUrl?: string;
  
  // Standard comptable (SYSCOHADA ou IFRS)
  accountingStandard?: string;
  
  // NOUVEAUTÉ : Comptes de trésorerie (snapshot actuel)
  treasuryAccounts?: Array<{
    code: string;                         // Code comptable (521*, 53*, 54*, 57*)
    name: string;                         // Libellé du compte
    type: 'bank' | 'cash' | 'investment' | 'transit';
    balance: number;                      // Solde actuel
    currency: string;                     // Devise (CDF, USD, EUR)
    bankName?: string;                    // Nom de la banque (si type=bank)
    accountNumber?: string;               // Numéro de compte (si type=bank)
  }>;
  
  // NOUVEAUTÉ : Séries temporelles multi-échelles
  treasuryTimeseries?: {
    weekly: Array<{                       // 12 dernières semaines
      periodId: string;                   // "2025-W46"
      startDate: string;                  // Date ISO 8601
      endDate: string;                    // Date ISO 8601
      totalBalance: number;               // Solde total période
      accountsCount: number;              // Nombre de comptes actifs
      treasuryAccounts: Array<{           // Détails des comptes pour cette période
        code: string;
        name: string;
        type: string;
        balance: number;
        currency: string;
      }>;
    }>;
    monthly: Array<{                      // 12 derniers mois
      periodId: string;                   // "2025-11"
      startDate: string;
      endDate: string;
      totalBalance: number;
      accountsCount: number;
      treasuryAccounts: Array<{...}>;
    }>;
    quarterly: Array<{                    // 4 derniers trimestres
      periodId: string;                   // "2025-Q4"
      startDate: string;
      endDate: string;
      totalBalance: number;
      accountsCount: number;
      treasuryAccounts: Array<{...}>;
    }>;
    annual: Array<{                       // 3 dernières années
      periodId: string;                   // "2025"
      startDate: string;
      endDate: string;
      totalBalance: number;
      accountsCount: number;
      treasuryAccounts: Array<{...}>;
    }>;
  };
}
```

**Traitement dans FinancialDataConsumer :**
1. Reçoit l'événement Kafka avec les données financières + trésorerie
2. Crée ou met à jour le `CompanyProfile` avec toutes les métriques
3. Stocke les comptes de trésorerie dans `metadata.treasuryAccounts`
4. Stocke les séries temporelles dans `metadata.treasuryTimeseries` (avec résumé : periodId, dates, totalBalance, accountsCount)
5. Stocke le standard comptable dans `metadata.accountingStandard`
6. Met à jour `lastSyncFromAccounting` avec le timestamp actuel

---

### Structure de l'événement `admin.customer.company.profile.shared` (Customer Service)

**Topic :** `admin.customer.company.profile.shared`  
**Source :** `customer-service`  
**Consumer :** `CompanyEventsConsumer` dans `portfolio-institution-service`

```typescript
interface CustomerCompanyProfileEvent {
  customerId: string;              // UUID du customer (= companyId)
  customerType: string;            // 'COMPANY' ou 'sme'
  name: string;                    // Nom de la company
  email?: string;                  // Email principal
  phone?: string;                  // Téléphone principal
  logo?: string;                   // URL du logo
  address?: string;                // Adresse complète
  status?: string;                 // Statut dans customer-service
  
  companyProfile?: {
    legalForm?: string;            // Forme juridique (SARL, SA, SAS, etc.)
    industry?: string;             // Industrie/secteur détaillé
    size?: string;                 // Taille (small, medium, large)
    rccm?: string;                 // Numéro RCCM
    taxId?: string;                // Numéro fiscal
    natId?: string;                // Numéro d'identification nationale
    activities?: string[];         // Liste des activités
    
    capital?: {
      amount: number;
      currency: string;
    };
    
    owner?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    
    associates?: Array<{
      id: string;
      name: string;
      shares: number;              // Pourcentage de parts
      role: string;                // Rôle dans l'entreprise
    }>;
    
    locations?: Array<{
      id: string;
      address: string;
      city: string;
      country: string;
      isPrimary: boolean;
      coordinates?: {
        lat: number;               // Latitude GPS
        lng: number;               // Longitude GPS
      };
    }>;
    
    contactPersons?: Array<{
      name: string;
      role: string;
      email: string;
      phone: string;
    }>;
    
    affiliations?: {
      cnss?: string;               // Numéro CNSS
      inpp?: string;               // Numéro INPP
      [key: string]: any;          // Autres affiliations
    };
    
    socialMedia?: {
      facebook?: string;
      linkedin?: string;
      twitter?: string;
      [key: string]: any;
    };
    
    yearFounded?: number;          // Année de création
    employeeCount?: number;        // Nombre d'employés (fallback)
    financials?: any;              // Données financières (non utilisées)
  };
  
  profileCompleteness?: number;    // Pourcentage de complétude (0-100)
  lastProfileUpdate?: string;      // Date ISO 8601 dernière maj
}
```

---

## ⚠️ Gestion des Erreurs

### Codes d'erreur

| Code | Erreur                | Description                                      |
|------|-----------------------|--------------------------------------------------|
| 400  | Bad Request           | Données invalides ou manquantes                 |
| 401  | Unauthorized          | Token JWT manquant ou invalide                  |
| 403  | Forbidden             | Permissions insuffisantes                       |
| 404  | Not Found             | Prospect inexistant                             |
| 500  | Internal Server Error | Erreur serveur interne                          |
| 503  | Service Unavailable   | Service externe (accounting/customer) indisponible |

### Format d'erreur standard

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "minCreditScore",
      "error": "must be between 0 and 100"
    }
  ]
}
```

---

## 🧪 Tests et Validation

### Exemples avec cURL

```bash
# 1. Lister les prospects avec filtres
curl -X GET "http://localhost:8000/portfolio/api/v1/companies?sector=Technologies&minCreditScore=70" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Détails d'un prospect
curl -X GET "http://localhost:8000/portfolio/api/v1/companies/uuid-company-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Statistiques
curl -X GET "http://localhost:8000/portfolio/api/v1/companies/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Recherche géographique
curl -X GET "http://localhost:8000/portfolio/api/v1/companies/nearby?latitude=-4.3276&longitude=15.3136&radiusKm=25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Synchronisation manuelle
curl -X POST "http://localhost:8000/portfolio/api/v1/companies/uuid-company-123/sync" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Notes d'Implémentation

### Cache CompanyProfile

- **Entité unifiée :** 40+ champs consolidés depuis accounting + customer
- **Auto-refresh :** Données stale après 24h (accounting) ou 7 jours (customer)
- **Indicateurs de fraîcheur :** `isAccountingDataFresh`, `isCustomerDataFresh`
- **Calcul de complétude :** Pourcentage automatique basé sur 14 champs clés

### Mapping Granulaire des Champs (CompanyProfile → ProspectDto)

**Transformation dans `ProspectionService.toProspectDto()`**

| Champ ProspectDto           | Source CompanyProfile        | Origine Donnée          | Type            |
|-----------------------------|------------------------------|-------------------------|-----------------|
| `id`                        | `profile.id`                 | UUID                    | string          |
| `name`                      | `profile.companyName`        | accounting-service      | string          |
| `sector`                    | `profile.sector`             | accounting-service      | string          |
| `size`                      | `profile.companySize`        | accounting-service      | enum            |
| `status`                    | `'active'` (hardcoded)       | prospection-logic       | enum            |
| **financial_metrics:**      |                              |                         |                 |
| `annual_revenue`            | `profile.annualRevenue`      | accounting-service      | decimal(20,2)   |
| `revenue_growth`            | `profile.revenueGrowth`      | accounting-service      | decimal(6,2)    |
| `profit_margin`             | `profile.profitMargin`       | accounting-service      | decimal(6,2)    |
| `cash_flow`                 | `profile.cashFlow`           | accounting-service      | decimal(20,2)   |
| `debt_ratio`                | `profile.debtRatio`          | accounting-service      | decimal(5,4)    |
| `working_capital`           | `profile.workingCapital`     | accounting-service      | decimal(20,2)   |
| `credit_score`              | `profile.creditScore`        | accounting-service      | int (0-100)     |
| `financial_rating`          | `profile.financialRating`    | accounting-service      | string          |
| `ebitda`                    | `profile.ebitda`             | accounting-service      | decimal(20,2)?  |
| **contact_info:**           |                              |                         |                 |
| `email`                     | `profile.email`              | customer-service        | string?         |
| `phone`                     | `profile.phone`              | customer-service        | string?         |
| `address`                   | `profile.address`            | customer-service        | text?           |
| `website`                   | `profile.websiteUrl`         | accounting-service      | string?         |
| `latitude`                  | `profile.latitude`           | customer-service (GPS)  | decimal(10,6)?  |
| `longitude`                 | `profile.longitude`          | customer-service (GPS)  | decimal(10,6)?  |
| **legal_info:**             |                              |                         |                 |
| `legalForm`                 | `profile.legalForm`          | customer-service        | string?         |
| `rccm`                      | `profile.rccm`               | customer-service        | string?         |
| `taxId`                     | `profile.taxId`              | customer-service        | string?         |
| `yearFounded`               | `profile.yearFounded`        | customer-service        | int?            |
| `employeeCount`             | `profile.employeeCount`      | accounting-service      | int             |
| `locations`                 | `profile.locations`          | customer-service (JSONB)| Array?          |
| `owner`                     | `profile.owner`              | customer-service (JSONB)| Object?         |
| `contactPersons`            | `profile.contactPersons`     | customer-service (JSONB)| Array?          |
| `profileCompleteness`       | `profile.profileCompleteness`| calculated              | int (0-100)     |
| `lastSyncFromAccounting`    | `profile.lastSyncFromAccounting` | metadata            | timestamp?      |
| `lastSyncFromCustomer`      | `profile.lastSyncFromCustomer`   | metadata            | timestamp?      |
| `createdAt`                 | `profile.createdAt`          | metadata                | timestamp       |
| `updatedAt`                 | `profile.updatedAt`          | metadata                | timestamp       |

### Coordonnées Géographiques

- **Source :** `customer-service` via topic `admin.customer.company.profile.shared`
- **Extraction :** Depuis `event.companyProfile.locations[isPrimary].coordinates.{lat, lng}`
- **Stockage :** Dénormalisé dans `CompanyProfile.latitude` (decimal 10,6) et `CompanyProfile.longitude` (decimal 10,6)
- **Calcul distance :** Formule de Haversine dans `ProspectionService.calculateDistance()`
  ```typescript
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
  ```

### Synchronisation Hybride

**1. Accounting-Service (HTTP - Source Primaire)**
- **Méthode :** `CompanySyncService.syncFromAccounting(companyId, force)`
- **Endpoint :** `GET /accounting-service/companies/:id`
- **Données :** 20+ métriques financières (totalRevenue, annualRevenue, netProfit, totalAssets, totalLiabilities, cashFlow, debtRatio, workingCapital, creditScore, financialRating, revenueGrowth, profitMargin, ebitda, employeeCount, companySize, websiteUrl)
- **Fréquence :** Automatique si > 24h (stale), ou manuelle via API
- **Type :** Synchronisation active (pull)
- **Priorité :** TOUJOURS prioritaire en cas de conflit de nom

**2. Customer-Service (Kafka - Source Secondaire)**
- **Méthode :** `CompanyEventsConsumer` avec 6 event handlers
- **Topics :**
  1. `admin.customer.company.profile.shared` → enrichissement complet (70+ champs)
  2. `customer.created` → création initiale + trigger sync accounting
  3. `customer.updated` → mise à jour partielle
  4. `customer.status.changed` → changement de statut
  5. `customer.validated` → trigger sync complète
  6. `customer.deleted` → marquage deleted (garde historique)
- **Données :** Légales (legalForm, rccm, taxId, natId, yearFounded), contacts (owner, associates, contactPersons), emplacements (locations avec GPS), affiliations (CNSS, INPP), capital, socialMedia
- **Fréquence :** Temps réel (push events)
- **Type :** Synchronisation passive (événementiel)
- **Priorité :** Enrichissement uniquement, ne modifie JAMAIS les données financières

### Implémentation Frontend

Le frontend utilise les sources de données suivantes par ordre de priorité:

1. **API Backend** (prioritaire) via `companyApi.getAllCompanies()`
2. **localStorage** via `useCompaniesData` (cache local)
3. **Données mockées** via `mockCompanies` (fallback développement)

```typescript
// Extrait de useProspection
const loadCompanies = useCallback(async (baseCompanies: Company[] | unknown[]) => {
  try {
    setLoading(true);
    let allCompanies = [...baseCompanies] as Company[];
    
    try {
      // Tenter de charger depuis l'API
      const apiData = await companyApi.getAllCompanies();
      const apiIds = new Set(apiData.map((company: Company) => company.id));
      const uniqueBaseCompanies = allCompanies.filter(company => !apiIds.has(company.id));
      allCompanies = [...apiData, ...uniqueBaseCompanies];
    } catch {
      console.warn('API unavailable, using base data');
    }
    
    setCompanies(allCompanies);
  } catch {
    showNotification('Erreur lors du chargement des entreprises', 'error');
    setCompanies(baseCompanies as Company[]);
  } finally {
    setLoading(false);
  }
}, [showNotification]);
```

---

## 🔗 Voir Aussi

- [Architecture Technique CompanyProfile](./ARCHITECTURE_COMPANY_PROFILE.md) - Documentation détaillée de l'architecture
- [Documentation Integration API](../integration/README.md) - Intégration inter-services
- [Documentation API Principale](../README.md) - Vue d'ensemble de l'API

---

*Documentation mise à jour le 18 novembre 2025*  
*Synchronisée avec le code source portfolio-institution-service*  
*Version : 2.0*
