# Structures de Données - Company (Entreprise)

## Types de données

### CompanySize
Taille d'entreprise selon classification standard.

```typescript
type CompanySize = 'micro' | 'small' | 'medium' | 'large';
```

**Valeurs**:
- `micro`: Micro-entreprise (< 10 employés)
- `small`: Petite entreprise (10-49 employés)
- `medium`: Moyenne entreprise (50-249 employés)
- `large`: Grande entreprise (≥ 250 employés)

### CompanyStatus
Statut de l'entreprise dans le pipeline commercial.

```typescript
type CompanyStatus = 'lead' | 'contacted' | 'qualified' | 'active' | 'funded' | 'pending' | 'rejected';
```

**Valeurs**:
- `lead`: Prospect identifié
- `contacted`: Contact établi
- `qualified`: Qualifié pour financement
- `active`: Client actif
- `funded`: Financement accordé
- `pending`: En attente de décision
- `rejected`: Demande rejetée

### FinancialRating
Rating financier conforme à la notation de crédit.

```typescript
type FinancialRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C' | 'D' | 'E' | 'NR';
```

**Valeurs**:
- `AAA` à `A`: Qualité de crédit élevée
- `BBB` à `B`: Qualité de crédit moyenne
- `C` à `E`: Qualité de crédit faible
- `NR`: Non noté (Not Rated)

### ESGRating
Rating ESG (Environnement, Social, Gouvernance).

```typescript
type ESGRating = 'A' | 'B' | 'C' | 'D' | 'NR';
```

**Valeurs**:
- `A`: Excellence ESG
- `B`: Bon niveau ESG
- `C`: Niveau ESG moyen
- `D`: Niveau ESG faible
- `NR`: Non évalué

### LegalForm
Forme juridique de l'entreprise (OHADA).

```typescript
type LegalForm = 'SARL' | 'SA' | 'SAS' | 'EIRL' | 'SPRL' | 'Autres';
```

**Valeurs**:
- `SARL`: Société à Responsabilité Limitée
- `SA`: Société Anonyme
- `SAS`: Société par Actions Simplifiée
- `EIRL`: Entreprise Individuelle à Responsabilité Limitée
- `SPRL`: Société Privée à Responsabilité Limitée
- `Autres`: Autres formes juridiques

### Currency
Devises supportées.

```typescript
type Currency = 'CDF' | 'USD' | 'EUR';
```

**Valeurs**:
- `CDF`: Franc Congolais
- `USD`: Dollar Américain
- `EUR`: Euro

### TreasuryAccountType
Types de comptes de trésorerie selon SYSCOHADA.

```typescript
type TreasuryAccountType = 'bank' | 'cash' | 'investment' | 'transit';
```

**Valeurs**:
- `bank`: Compte bancaire (classe 521)
- `cash`: Caisse (classe 53)
- `investment`: Placements (classe 54)
- `transit`: Virements internes (classe 57)

### TimeseriesScale
Échelle temporelle pour les séries de trésorerie.

```typescript
type TimeseriesScale = 'weekly' | 'monthly' | 'quarterly' | 'annual';
```

## Interfaces Financières

### TreasuryAccount
Compte de trésorerie SYSCOHADA.

```typescript
interface TreasuryAccount {
  code: string;                      // Code comptable SYSCOHADA
  name: string;                      // Nom du compte
  type: TreasuryAccountType;         // Type de compte
  balance: number;                   // Solde actuel
  currency: Currency;                // Devise
  bankName?: string;                 // Nom de la banque (si applicable)
  accountNumber?: string;            // Numéro de compte (si applicable)
}
```

### TreasuryPeriod
Période temporelle pour la trésorerie.

```typescript
interface TreasuryPeriod {
  periodId: string;                  // Identifiant unique de la période
  startDate: string;                 // Date de début (ISO 8601)
  endDate: string;                   // Date de fin (ISO 8601)
  totalBalance: number;              // Solde total de la période
  accountsCount: number;             // Nombre de comptes
  treasuryAccounts?: TreasuryAccount[]; // Détails des comptes
}
```

### TreasuryTimeseries
Séries temporelles multi-échelles de trésorerie.

```typescript
interface TreasuryTimeseries {
  weekly: TreasuryPeriod[];          // Données hebdomadaires
  monthly: TreasuryPeriod[];         // Données mensuelles
  quarterly: TreasuryPeriod[];       // Données trimestrielles
  annual: TreasuryPeriod[];          // Données annuelles
}
```

### TreasuryData
Données complètes de trésorerie.

```typescript
interface TreasuryData {
  total_treasury_balance: number;    // Solde total de trésorerie
  accounts: TreasuryAccount[];       // Liste des comptes
  timeseries?: TreasuryTimeseries;   // Séries temporelles
}
```

### FinancialMetrics
Métriques financières de l'entreprise.

```typescript
interface FinancialMetrics {
  annual_revenue: number;            // Chiffre d'affaires annuel
  revenue_growth: number;            // Croissance du CA (%)
  profit_margin: number;             // Marge bénéficiaire (%)
  cash_flow: number;                 // Flux de trésorerie
  debt_ratio: number;                // Ratio d'endettement
  working_capital: number;           // Fonds de roulement
  credit_score: number;              // Score de crédit (0-100)
  financial_rating: FinancialRating; // Rating financier
  ebitda?: number;                   // EBITDA (optionnel)
  treasury_data?: TreasuryData;      // Données de trésorerie détaillées
}
```

## Interfaces de Contact et Localisation

### ContactInfo
Informations de contact.

```typescript
interface ContactInfo {
  email?: string;                    // Email
  phone?: string;                    // Téléphone
  address?: string;                  // Adresse
  website?: string;                  // Site web
}
```

### Location
Localisation d'un site (siège ou succursale).

```typescript
interface Location {
  id: string;                        // Identifiant unique
  address: string;                   // Adresse complète
  city: string;                      // Ville
  country: string;                   // Pays
  isPrimary: boolean;                // Si c'est le site principal
  coordinates?: {                    // Coordonnées GPS (optionnel)
    lat: number;
    lng: number;
  };
}
```

### ContactPerson
Personne de contact dans l'entreprise.

```typescript
interface ContactPerson {
  id?: string;                       // Identifiant unique
  nom?: string;                      // Nom de famille
  prenoms?: string;                  // Prénoms
  fonction?: string;                 // Fonction/Poste
  email?: string;                    // Email
  telephone?: string;                // Téléphone
  pourcentageActions?: number;       // Pourcentage d'actions détenues
  role?: string;                     // Rôle (dirigeant, actionnaire, etc.)
}
```

### Owner
Propriétaire ou dirigeant principal.

```typescript
interface Owner {
  id?: string;                       // Identifiant unique
  name: string;                      // Nom complet
  email?: string;                    // Email
  phone?: string;                    // Téléphone
}
```

## Interfaces Légales et Paiement

### LegalInfo
Informations légales de l'entreprise.

```typescript
interface LegalInfo {
  legalForm?: LegalForm;             // Forme juridique OHADA
  rccm?: string;                     // Numéro RCCM
  taxId?: string;                    // Numéro d'identification fiscale
  yearFounded?: number;              // Année de création
}
```

### BankAccount
Compte bancaire pour paiement.

```typescript
interface BankAccount {
  accountNumber: string;             // Numéro de compte
  accountName: string;               // Nom du titulaire
  bankName: string;                  // Nom de la banque
  currency: Currency;                // Devise du compte
  isPrimary: boolean;                // Si c'est le compte principal
  swiftCode?: string;                // Code SWIFT (optionnel)
  iban?: string;                     // IBAN (optionnel)
}
```

### MobileMoneyAccount
Compte Mobile Money pour paiement.

```typescript
interface MobileMoneyAccount {
  phoneNumber: string;               // Numéro de téléphone
  accountName: string;               // Nom du titulaire
  provider: string;                  // Opérateur (M-PESA, Orange Money, etc.)
  currency: Currency;                // Devise
  isPrimary: boolean;                // Si c'est le compte principal
}
```

### PaymentInfo
Informations de paiement.

```typescript
interface PaymentInfo {
  preferredMethod?: 'bank' | 'mobile_money'; // Méthode préférée
  bankAccounts?: BankAccount[];      // Comptes bancaires
  mobileMoneyAccounts?: MobileMoneyAccount[]; // Comptes Mobile Money
}
```

## Interfaces Actifs et Patrimoine

### Asset
Asset (immobilisation ou bien patrimonial).

```typescript
interface Asset {
  designation?: string;              // Désignation de l'actif
  type?: string;                     // Type d'actif
  valeurActuelle?: number;           // Valeur actuelle
  etatActuel?: string;               // État actuel
  observations?: string;             // Observations
}
```

### Stock
Stock/Inventaire.

```typescript
interface Stock {
  designation?: string;              // Désignation du stock
  categorie?: string;                // Catégorie
  quantiteStock?: number;            // Quantité en stock
  valeurTotaleStock?: number;        // Valeur totale
  etatStock?: string;                // État du stock
}
```

## Interfaces Pitch et Présentation

### SocialLink
Lien vers réseau social.

```typescript
interface SocialLink {
  platform: string;                  // Plateforme (LinkedIn, Facebook, etc.)
  url: string;                       // URL complète
  label: string;                     // Label d'affichage
}
```

### PitchData
Données de pitch et présentation.

```typescript
interface PitchData {
  elevator_pitch?: string;           // Pitch elevator (30 secondes)
  value_proposition?: string;        // Proposition de valeur
  target_market?: string;            // Marché cible
  competitive_advantage?: string;    // Avantage concurrentiel
  pitch_deck_url?: string;           // URL du pitch deck
  demo_video_url?: string;           // URL de la vidéo démo
}
```

## Interfaces Incubation et Spécificités

### IncubationData
Données d'incubation/accélération.

```typescript
interface IncubationData {
  enIncubation: boolean;             // Si l'entreprise est incubée
  typeAccompagnement?: 'incubation' | 'acceleration'; // Type d'accompagnement
  nomIncubateur?: string;            // Nom de l'incubateur/accélérateur
  certificatAffiliation?: string;    // URL du certificat
}
```

### StartupSpecifics
Spécificités pour les startups.

```typescript
interface StartupSpecifics {
  niveauMaturiteTechnologique?: string; // TRL (Technology Readiness Level)
  modeleEconomique?: string;         // Modèle économique
  proprieteIntellectuelle?: string[]; // Brevets, marques, etc.
}
```

### TraditionalSpecifics
Spécificités pour les entreprises traditionnelles.

```typescript
interface TraditionalSpecifics {
  certificationQualite?: boolean;    // Certifications qualité (ISO, etc.)
  licencesExploitation?: string[];   // Licences d'exploitation
}
```

## Interfaces Finance Étendue et Juridique

### Loan
Prêt ou concours financier en cours.

```typescript
interface Loan {
  id: string;                        // Identifiant unique
  type: string;                      // Type de prêt
  amount: number;                    // Montant
  currency: Currency;                // Devise
  lender: string;                    // Prêteur
  startDate: string;                 // Date de début (ISO 8601)
  endDate?: string;                  // Date de fin (ISO 8601)
  interestRate?: number;             // Taux d'intérêt (%)
  status: 'active' | 'completed' | 'defaulted'; // Statut
}
```

### FundingRound
Levée de fonds (funding round).

```typescript
interface FundingRound {
  id: string;                        // Identifiant unique
  roundType: string;                 // Type (Seed, Series A, Series B, etc.)
  amount: number;                    // Montant levé
  currency: Currency;                // Devise
  valuation?: number;                // Valorisation post-money
  investors?: string[];              // Liste des investisseurs
  date: string;                      // Date de la levée (ISO 8601)
}
```

### LegalAspects
Aspects juridiques et réglementaires.

```typescript
interface LegalAspects {
  failliteAnterieure: boolean;       // Faillite antérieure
  detailsFaillite?: string;          // Détails de la faillite
  poursuiteJudiciaire: boolean;      // Poursuites judiciaires en cours
  detailsPoursuites?: string;        // Détails des poursuites
  garantiePrets: boolean;            // Garanties sur prêts
  detailsGaranties?: string;         // Détails des garanties
  antecedentsFiscaux: boolean;       // Antécédents fiscaux
  detailsAntecedentsFiscaux?: string; // Détails des antécédents
}
```

### CompanyDocuments
Documents de l'entreprise par catégorie.

```typescript
interface CompanyDocuments {
  documentsEntreprise?: string[];    // Documents juridiques (RCCM, statuts, etc.)
  documentsPersonnel?: string[];     // Documents RH (contrats, organigramme, etc.)
  documentsFinanciers?: string[];    // États financiers, bilans, etc.
  documentsPatrimoine?: string[];    // Titres de propriété, certificats, etc.
  documentsProprieteIntellectuelle?: string[]; // Brevets, marques, etc.
  documentsSectoriels?: string[];    // Licences, certifications sectorielles
}
```

## Interface ESG

### ESGMetrics
Métriques ESG (Environnement, Social, Gouvernance).

```typescript
interface ESGMetrics {
  esg_rating?: string;               // Rating ESG global (optionnel)
  carbon_footprint: number;          // Empreinte carbone (tonnes CO2)
  environmental_rating: ESGRating;   // Rating environnemental
  social_rating: ESGRating;          // Rating social
  governance_rating: ESGRating;      // Rating gouvernance
  gender_ratio?: {                   // Ratio hommes/femmes (optionnel)
    male: number;
    female: number;
  };
}
```

## Interface Principale: Company

Interface complète représentant une entreprise dans le système.

```typescript
interface Company {
  // ===== IDENTITÉ ET CONTEXTE =====
  id: string;                        // Identifiant unique
  name: string;                      // Nom de l'entreprise
  sector: string;                    // Secteur d'activité principal
  size: CompanySize;                 // Taille de l'entreprise
  status: CompanyStatus;             // Statut dans le pipeline
  
  // ===== DONNÉES OPÉRATIONNELLES =====
  employee_count: number;            // Nombre d'employés
  website_url?: string;              // Site web (optionnel)
  pitch_deck_url?: string;           // URL du pitch deck (optionnel)
  lastContact?: string;              // Date du dernier contact (ISO 8601)
  
  // ===== DONNÉES FINANCIÈRES =====
  annual_revenue: number;            // Chiffre d'affaires annuel
  financial_metrics: FinancialMetrics; // Métriques financières détaillées
  
  // ===== CONTACT ET LOCALISATION =====
  contact_info?: ContactInfo;        // Informations de contact
  locations?: Location[];            // Localisation(s)
  latitude?: number;                 // Latitude du siège principal
  longitude?: number;                // Longitude du siège principal
  
  // ===== DONNÉES LÉGALES ET PAIEMENT =====
  legal_info?: LegalInfo;            // Informations légales
  payment_info?: PaymentInfo;        // Informations de paiement
  
  // ===== PERSONNES =====
  owner?: Owner;                     // Propriétaire principal
  contactPersons?: ContactPerson[];  // Personnes de contact
  
  // ===== PATRIMOINES ET ACTIFS =====
  assets?: Asset[];                  // Actifs immobilisés
  stocks?: Stock[];                  // Stocks/Inventaires
  
  // ===== MÉTRIQUES ESG =====
  esg_metrics: ESGMetrics;           // Métriques ESG
  
  // ===== MÉTADONNÉES DE SYNCHRONISATION =====
  profileCompleteness?: number;      // Complétude du profil (0-100)
  lastSyncFromAccounting?: string;   // Dernière synchro Comptabilité (ISO 8601)
  lastSyncFromCustomer?: string;     // Dernière synchro Customer (ISO 8601)
  
  // ===== TIMESTAMPS =====
  created_at: string;                // Date de création (ISO 8601)
  updated_at: string;                // Date de dernière modification (ISO 8601)
  
  // ===== IDENTIFICATION ÉTENDUE =====
  sigle?: string;                    // Sigle/Acronyme
  typeEntreprise?: 'traditional' | 'startup'; // Type d'entreprise
  numeroIdentificationNationale?: string; // Numéro d'identification national
  secteursActiviteSecondaires?: string[]; // Secteurs secondaires
  secteursPersonalises?: string[];   // Secteurs personnalisés
  descriptionActivites?: string;     // Description des activités
  produitsServices?: string[];       // Liste des produits/services
  capitalSocial?: number;            // Capital social
  deviseCapital?: Currency;          // Devise du capital
  dateCreation?: string;             // Date de création juridique (ISO 8601)
  dateDebutActivites?: string;       // Date de début d'activités (ISO 8601)
  
  // ===== INCUBATION ET ACCOMPAGNEMENT =====
  incubation?: IncubationData;       // Données d'incubation
  
  // ===== SPÉCIFICITÉS SELON TYPE =====
  startupSpecifics?: StartupSpecifics; // Spécificités startup
  traditionalSpecifics?: TraditionalSpecifics; // Spécificités traditionnelles
  
  // ===== PITCH ET PRÉSENTATION =====
  pitch?: PitchData;                 // Données de pitch
  
  // ===== LOCALISATION DÉTAILLÉE =====
  siegeSocial?: Location;            // Siège social
  siegeExploitation?: Location;      // Siège d'exploitation
  unitesProduction?: Location[];     // Unités de production
  pointsVente?: Location[];          // Points de vente
  telephoneFixe?: string;            // Téléphone fixe
  telephoneMobile?: string;          // Téléphone mobile
  fax?: string;                      // Fax
  boitePostale?: string;             // Boîte postale
  reseauxSociaux?: SocialLink[];     // Réseaux sociaux
  
  // ===== PATRIMOINE ÉTENDU =====
  moyensTechniques?: string[];       // Moyens techniques
  capaciteProduction?: string;       // Capacité de production
  
  // ===== STRUCTURE ÉTENDUE =====
  organigramme?: string;             // URL de l'organigramme
  
  // ===== FINANCE ÉTENDUE =====
  pretsEnCours?: Loan[];             // Prêts en cours
  leveeDeFonds?: FundingRound[];     // Levées de fonds
  
  // ===== ASPECTS JURIDIQUES =====
  legalAspects?: LegalAspects;       // Aspects juridiques
  
  // ===== DOCUMENTS =====
  documents?: CompanyDocuments;      // Documents de l'entreprise
}
```

## Exemple de données complètes

```json
{
  "id": "mem-001",
  "name": "Entreprise Alpha SARL",
  "size": "medium",
  "status": "active",
  "sector": "Agriculture",
  "employee_count": 120,
  "annual_revenue": 5000000,
  "legal_info": {
    "legalForm": "SARL",
    "rccm": "CD/KIN/RCCM/23-A-12345",
    "taxId": "A2301234B",
    "yearFounded": 2018
  },
  "financial_metrics": {
    "annual_revenue": 5000000,
    "revenue_growth": 12.5,
    "profit_margin": 8.3,
    "cash_flow": 450000,
    "debt_ratio": 0.35,
    "working_capital": 800000,
    "credit_score": 82,
    "financial_rating": "BBB"
  },
  "esg_metrics": {
    "carbon_footprint": 1250,
    "environmental_rating": "B",
    "social_rating": "A",
    "governance_rating": "B"
  },
  "created_at": "2023-01-15T08:00:00.000Z",
  "updated_at": "2025-12-13T10:30:00.000Z"
}
```
