# Profil d'Entreprise - Documentation Complète

## Vue d'ensemble

Ce document décrit la structure complète du profil d'une entreprise dans le système Wanzo Portfolio. Le profil est organisé en **7 onglets** correspondant aux sections affichées dans l'interface utilisateur.

## Structure de l'interface

### Onglets du profil
1. **Général** - Identification de base, immatriculations, activités, incubation
2. **Patrimoine** - Immobilisations, équipements, véhicules, stocks, moyens techniques
3. **Structure** - Organisation, employés, organigramme
4. **Finance** - Informations juridiques, comptes bancaires, prêts, aspects juridiques
5. **Localisation** - Sièges, implantations, contacts, présence numérique
6. **Pitch** - Présentation, proposition de valeur, documents marketing
7. **Documents** - Documents d'entreprise par catégorie

---

## Types et Énumérations

### CompanySize
```typescript
type CompanySize = 'micro' | 'small' | 'medium' | 'large';
```
- `micro`: Micro-entreprise (< 10 employés)
- `small`: Petite entreprise (10-49 employés)
- `medium`: Moyenne entreprise (50-249 employés)
- `large`: Grande entreprise (≥ 250 employés)

### CompanyStatus
```typescript
type CompanyStatus = 'lead' | 'contacted' | 'qualified' | 'active' | 'funded' | 'pending' | 'rejected';
```

### Currency
```typescript
type Currency = 'CDF' | 'USD' | 'EUR';
```

### LegalForm
```typescript
type LegalForm = 'SARL' | 'SA' | 'SAS' | 'EIRL' | 'SPRL' | 'Autres';
```

### FinancialRating
```typescript
type FinancialRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C' | 'D' | 'E' | 'NR';
```

---

## Onglet 1: GÉNÉRAL

### Section: Identification de base

```typescript
{
  id: string;                      // Identifiant unique
  name: string;                    // Raison sociale
  sigle?: string;                  // Sigle/Acronyme
  logo_url?: string;               // URL du logo de l'entreprise
  sector: string;                  // Secteur principal
  typeEntreprise?: 'traditional' | 'startup';
  size: CompanySize;               // Taille
  capitalSocial?: number;          // Capital social
  deviseCapital?: Currency;        // Devise du capital
  dateCreation?: string;           // Date de création (ISO 8601)
}
```

**Exemple:**
```json
{
  "id": "COMP-0001",
  "name": "TechCongo Innovation SARL",
  "sigle": "TCI",
  "logo_url": "https://cdn.wanzo.com/logos/techcongo.png",
  "sector": "Technologies de l'Information",
  "typeEntreprise": "startup",
  "size": "small",
  "capitalSocial": 50000,
  "deviseCapital": "USD",
  "dateCreation": "2020-03-15"
}
```

### Section: Immatriculations et identifications

```typescript
interface LegalInfo {
  legalForm?: LegalForm;           // Forme juridique OHADA
  rccm?: string;                   // Numéro RCCM
  taxId?: string;                  // Numéro d'impôt fiscal
  yearFounded?: number;            // Année de création
}

{
  legal_info?: LegalInfo;
  numeroIdentificationNationale?: string;  // Numéro d'identification nationale
  dateDebutActivites?: string;     // Date de début d'activités
}
```

**Exemple:**
```json
{
  "legal_info": {
    "legalForm": "SARL",
    "rccm": "CD/KIN/RCCM/20-A-03456",
    "taxId": "A2003456F",
    "yearFounded": 2020
  },
  "numeroIdentificationNationale": "NIN-123456789",
  "dateDebutActivites": "2020-05-01"
}
```

### Section: Nature des activités

```typescript
{
  descriptionActivites?: string;         // Description détaillée
  secteursActiviteSecondaires?: string[]; // Secteurs secondaires
  secteursPersonalises?: string[];       // Secteurs personnalisés
  produitsServices?: string[];           // Produits/Services offerts
}
```

**Exemple:**
```json
{
  "descriptionActivites": "Développement de solutions logicielles innovantes pour la gestion des PME en Afrique centrale",
  "secteursActiviteSecondaires": ["Fintech", "E-commerce"],
  "produitsServices": [
    "Logiciel de gestion comptable",
    "Plateforme de paiement mobile",
    "Application mobile de gestion de stock"
  ]
}
```

### Section: Incubation / Accélération

```typescript
interface IncubationData {
  enIncubation: boolean;
  typeAccompagnement?: 'incubation' | 'acceleration';
  nomIncubateur?: string;
  certificatAffiliation?: string;  // URL du certificat
}

{
  incubation?: IncubationData;
}
```

**Exemple:**
```json
{
  "incubation": {
    "enIncubation": true,
    "typeAccompagnement": "acceleration",
    "nomIncubateur": "Kinshasa Digital Hub",
    "certificatAffiliation": "https://example.com/certificate.pdf"
  }
}
```

### Section: Spécificités Startup

```typescript
interface StartupSpecifics {
  niveauMaturiteTechnologique?: string;  // TRL (Technology Readiness Level)
  modeleEconomique?: string;
  proprieteIntellectuelle?: string[];    // Brevets, marques, etc.
}

{
  startupSpecifics?: StartupSpecifics;
}
```

**Exemple:**
```json
{
  "startupSpecifics": {
    "niveauMaturiteTechnologique": "TRL 7 - Prototype opérationnel",
    "modeleEconomique": "SaaS avec abonnement mensuel",
    "proprieteIntellectuelle": [
      "Brevet logiciel - Algorithme de prédiction",
      "Marque déposée - TechCongo"
    ]
  }
}
```

### Section: Spécificités Traditionnelle

```typescript
interface TraditionalSpecifics {
  certificationQualite?: boolean;
  licencesExploitation?: string[];
}

{
  traditionalSpecifics?: TraditionalSpecifics;
}
```

**Exemple:**
```json
{
  "traditionalSpecifics": {
    "certificationQualite": true,
    "licencesExploitation": [
      "ISO 9001:2015",
      "Licence d'exploitation minière A-12345"
    ]
  }
}
```

---

## Onglet 2: PATRIMOINE

### Section: Immobilisations (Bâtiments, Terrains)

```typescript
/** Type d'actif */
type AssetType = 'immobilier' | 'vehicule' | 'equipement' | 'stock' | 'autre';

/** État d'un actif */
type AssetCondition = 'neuf' | 'excellent' | 'bon' | 'moyen' | 'mauvais' | 'deteriore';

/** Type de propriété */
type OwnershipType = 'propre' | 'location' | 'leasing' | 'emprunt';

interface Asset {
  id?: string;
  designation?: string;         // Désignation de l'actif
  type?: AssetType;             // Type d'actif
  description?: string;         // Description détaillée
  
  // Valeurs financières
  prixAchat?: number;           // Prix d'achat
  valeurActuelle?: number;      // Valeur actuelle
  devise?: Currency;
  
  // Informations temporelles
  dateAcquisition?: string;     // Date d'acquisition (ISO 8601)
  
  // État et localisation
  etatActuel?: AssetCondition;  // État actuel
  localisation?: string;        // Localisation physique
  
  // Informations techniques
  numeroSerie?: string;
  marque?: string;
  modele?: string;
  quantite?: number;
  unite?: string;
  
  // Statut de propriété
  proprietaire?: OwnershipType;
  
  // Observations
  observations?: string;
}

{
  // Actifs génériques (legacy)
  assets?: Asset[];
  
  // Actifs par catégorie (recommandé)
  immobilisations?: Asset[];    // Bâtiments, terrains
  equipements?: Asset[];        // Équipements et matériel
  vehicules?: Asset[];          // Parc automobile
}
```

**Exemple:**
```json
{
  "immobilisations": [
    {
      "id": "immo-001",
      "designation": "Entrepôt Zone Industrielle",
      "type": "immobilier",
      "description": "Entrepôt de stockage de 500m²",
      "prixAchat": 150000,
      "valeurActuelle": 180000,
      "devise": "USD",
      "dateAcquisition": "2020-06-15",
      "etatActuel": "bon",
      "localisation": "Zone Industrielle de Limete, Kinshasa",
      "proprietaire": "propre"
    }
  ],
  "equipements": [
    {
      "id": "equip-001",
      "designation": "Serveur Dell PowerEdge R740",
      "type": "equipement",
      "prixAchat": 18000,
      "valeurActuelle": 15000,
      "devise": "USD",
      "dateAcquisition": "2023-01-15",
      "etatActuel": "excellent",
      "marque": "Dell",
      "modele": "PowerEdge R740",
      "numeroSerie": "SN-2023-001234"
    }
  ],
  "vehicules": [
    {
      "id": "veh-001",
      "designation": "Toyota Hilux 4x4",
      "type": "vehicule",
      "prixAchat": 45000,
      "valeurActuelle": 35000,
      "devise": "USD",
      "dateAcquisition": "2022-03-20",
      "etatActuel": "bon",
      "marque": "Toyota",
      "modele": "Hilux Double Cabine",
      "numeroSerie": "JTFSS22P8H0123456",
      "proprietaire": "propre"
    }
  ]
}
```

### Section: Stocks et inventaire

```typescript
/** Catégorie de stock */
type StockCategory = 'matiere_premiere' | 'produit_semi_fini' | 'produit_fini' | 'fourniture' | 'emballage' | 'autre';

/** État du stock */
type StockCondition = 'excellent' | 'bon' | 'moyen' | 'deteriore' | 'perime';

interface Stock {
  id?: string;
  designation?: string;           // Désignation du stock
  categorie?: StockCategory;      // Catégorie
  description?: string;
  
  // Quantités et unités
  quantiteStock?: number;         // Quantité en stock
  unite?: string;                 // Unité de mesure
  seuilMinimum?: number;          // Seuil de réapprovisionnement
  seuilMaximum?: number;          // Capacité maximale
  
  // Valeurs financières
  coutUnitaire?: number;          // Coût unitaire
  valeurTotaleStock?: number;     // Valeur totale
  devise?: Currency;
  
  // Informations temporelles
  dateDernierInventaire?: string;
  dureeRotationMoyenne?: number;  // Durée de rotation (jours)
  datePeremption?: string;        // Date de péremption (si applicable)
  
  // Localisation et stockage
  emplacement?: string;
  conditionsStockage?: string;
  
  // Suivi et gestion
  fournisseurPrincipal?: string;
  numeroLot?: string;
  codeArticle?: string;
  
  // État
  etatStock?: StockCondition;
  observations?: string;
}

{
  stocks?: Stock[];
}
```

**Exemple:**
```json
{
  "stocks": [
    {
      "designation": "Licences logicielles Microsoft",
      "categorie": "Logiciels",
      "quantiteStock": 50,
      "valeurTotaleStock": 25000,
      "etatStock": "Actif"
    }
  ]
}
```

### Section: Moyens techniques et capacités

```typescript
{
  moyensTechniques?: string[];   // Moyens techniques et technologiques
  capaciteProduction?: string;   // Capacité de production
}
```

**Exemple:**
```json
{
  "moyensTechniques": [
    "Infrastructure cloud AWS",
    "Plateforme de développement GitLab",
    "Suite Adobe Creative Cloud",
    "Outils de monitoring (Datadog, New Relic)"
  ],
  "capaciteProduction": "Capacité de développement: 5 projets simultanés avec équipe de 12 développeurs. Infrastructure capable de supporter 10,000 utilisateurs actifs."
}
```

---

## Onglet 3: STRUCTURE

### Section: Structure organisationnelle

```typescript
{
  employee_count: number;     // Nombre total d'employés
  size: CompanySize;          // Taille de l'entreprise
  organigramme?: string;      // Description ou URL de l'organigramme
}
```

**Exemple:**
```json
{
  "employee_count": 25,
  "size": "small",
  "organigramme": "Direction Générale\n├── Direction Technique (8 personnes)\n│   ├── Équipe Dev Frontend (3)\n│   ├── Équipe Dev Backend (3)\n│   └── DevOps (2)\n├── Direction Commerciale (6 personnes)\n│   ├── Ventes (4)\n│   └── Marketing (2)\n├── Direction Administrative (4 personnes)\n│   ├── Comptabilité (2)\n│   └── RH (2)\n└── Support Client (5 personnes)"
}
```

### Section: Dirigeants, Actionnaires et Employés

```typescript
/** Type de détenteur pour l'actionnariat */
type HolderType = 'physique' | 'morale';

/**
 * Personne de contact (dirigeant, actionnaire, employé)
 * Interface unifiée pour tous les types de personnes liées à l'entreprise
 */
interface ContactPerson {
  id?: string;
  
  // Type de détenteur (personne physique ou morale)
  typeDetenteur?: HolderType;
  
  // Champs personne physique
  nom?: string;                    // Nom de famille
  prenoms?: string;                // Prénoms
  fonction?: string;               // Fonction dans l'entreprise
  nationalite?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  linkedin?: string;               // URL LinkedIn
  cv?: string;                     // URL du CV uploadé
  cvFileName?: string;             // Nom du fichier CV
  
  // Champs personne morale (actionnaire)
  raisonSociale?: string;          // Raison sociale (si personne morale)
  formeJuridique?: string;         // Forme juridique
  rccm?: string;                   // Numéro RCCM
  idnat?: string;                  // ID National
  siegeSocial?: string;
  representantLegal?: string;      // Nom du représentant légal
  representantFonction?: string;   // Fonction du représentant
  
  // Champs actionnariat
  nombreActions?: number;          // Nombre d'actions ou de parts sociales
  pourcentageActions?: number;     // Pourcentage du capital (0-100)
  
  // Champs employé
  dateNomination?: string;         // Date de nomination (ISO 8601)
  typeContrat?: string;            // Type de contrat (CDI, CDD, etc.)
  salaire?: number;                // Salaire mensuel
  diplomes?: string[];             // Liste des diplômes
}

{
  // Personnes de contact (legacy - générique)
  owner?: Owner;
  contactPersons?: ContactPerson[];
  
  // Personnes par catégorie (recommandé)
  dirigeants?: ContactPerson[];     // Dirigeants et managers
  actionnaires?: ContactPerson[];   // Actionnaires et associés
  employes?: ContactPerson[];       // Employés clés
}
```

**Exemple - Dirigeants:**
```json
{
  "dirigeants": [
    {
      "id": "dir-001",
      "typeDetenteur": "physique",
      "nom": "Kabila",
      "prenoms": "Jean-Pierre",
      "fonction": "Directeur Général",
      "nationalite": "Congolaise",
      "telephone": "+243 81 234 5678",
      "email": "jp.kabila@techcongo.cd",
      "linkedin": "https://linkedin.com/in/jpkabila",
      "cv": "https://docs.techcongo.cd/cv/jpkabila.pdf",
      "dateNomination": "2020-03-15",
      "diplomes": ["MBA - UNIKIN", "Ingénieur Informatique - ISP Gombe"]
    }
  ]
}
```

**Exemple - Actionnaires (personnes physiques et morales):**
```json
{
  "actionnaires": [
    {
      "id": "act-001",
      "typeDetenteur": "physique",
      "nom": "Kabila",
      "prenoms": "Jean-Pierre",
      "nombreActions": 5000,
      "pourcentageActions": 50
    },
    {
      "id": "act-002",
      "typeDetenteur": "morale",
      "raisonSociale": "Africa Tech Ventures SA",
      "formeJuridique": "SA",
      "rccm": "CD/KIN/RCCM/18-A-12345",
      "siegeSocial": "45 Avenue des Investisseurs, Kinshasa",
      "representantLegal": "Marie Lukusa",
      "representantFonction": "Directrice des Investissements",
      "nombreActions": 3000,
      "pourcentageActions": 30
    }
  ]
}
```

**Exemple - Employés:**
```json
{
  "employes": [
    {
      "id": "emp-001",
      "typeDetenteur": "physique",
      "nom": "Mwamba",
      "prenoms": "David",
      "fonction": "Développeur Senior",
      "telephone": "+243 85 987 6543",
      "email": "david.mwamba@techcongo.cd",
      "typeContrat": "CDI",
      "salaire": 2500,
      "dateNomination": "2021-06-01",
      "diplomes": ["Licence Informatique - UNIKIN"]
    }
  ]
}
```

---

## Onglet 4: FINANCE & JURIDIQUE

### Section: Informations juridiques

Voir la structure `LegalInfo` dans l'onglet Général.

### Section: Comptes bancaires et Assurances

```typescript
interface BankAccount {
  id?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  currency: Currency;
  isPrimary: boolean;
  swiftCode?: string;
  iban?: string;
  typeCompte?: 'courant' | 'epargne' | 'professionnel' | 'devise';
  agence?: string;
}

interface MobileMoneyAccount {
  phoneNumber: string;
  accountName: string;
  provider: string;
  currency: Currency;
  isPrimary: boolean;
}

/** Type d'assurance */
type InsuranceType = 'responsabilite_civile' | 'incendie' | 'vol' | 'accidents_travail' | 'marchandises' | 'vehicules' | 'multirisque' | 'autre';

interface Insurance {
  id?: string;
  compagnie: string;               // Compagnie d'assurance
  typeAssurance: InsuranceType;    // Type d'assurance
  numeroPolice: string;            // Numéro de police
  montantCouverture?: number;      // Montant de couverture
  devise?: Currency;
  dateDebut?: string;              // Date de début (ISO 8601)
  dateExpiration?: string;         // Date d'expiration (ISO 8601)
  prime?: number;                  // Montant de la prime
  frequencePaiement?: 'mensuel' | 'trimestriel' | 'annuel';
  observations?: string;
}

interface PaymentInfo {
  preferredMethod?: 'bank' | 'mobile_money';
  bankAccounts?: BankAccount[];
  mobileMoneyAccounts?: MobileMoneyAccount[];
  assurances?: Insurance[];        // Polices d'assurance
}

{
  payment_info?: PaymentInfo;
}
```

**Exemple:**
```json
{
  "payment_info": {
    "preferredMethod": "bank",
    "bankAccounts": [
      {
        "id": "bank-001",
        "accountNumber": "0123456789",
        "accountName": "TechCongo Innovation SARL",
        "bankName": "Equity Bank Congo",
        "currency": "USD",
        "isPrimary": true,
        "swiftCode": "EQBLCDKI",
        "typeCompte": "professionnel",
        "agence": "Kinshasa Centre"
      }
    ],
    "mobileMoneyAccounts": [
      {
        "phoneNumber": "+243812345678",
        "accountName": "TechCongo SARL",
        "provider": "M-Pesa",
        "currency": "CDF",
        "isPrimary": false
      }
    ],
    "assurances": [
      {
        "id": "assur-001",
        "compagnie": "SONAS",
        "typeAssurance": "responsabilite_civile",
        "numeroPolice": "RC-2023-001234",
        "montantCouverture": 50000,
        "devise": "USD",
        "dateDebut": "2023-01-01",
        "dateExpiration": "2024-12-31",
        "prime": 1200,
        "frequencePaiement": "annuel"
      },
      {
        "id": "assur-002",
        "compagnie": "Rawsur",
        "typeAssurance": "multirisque",
        "numeroPolice": "MR-2023-005678",
        "montantCouverture": 100000,
        "devise": "USD",
        "dateDebut": "2023-06-01",
        "dateExpiration": "2024-05-31",
        "prime": 2500,
        "frequencePaiement": "annuel",
        "observations": "Couvre locaux et équipements"
      }
    ]
  }
}
```

### Section: Prêts en cours

```typescript
interface Loan {
  id: string;
  type: string;                // Type de prêt
  amount: number;              // Montant
  currency: Currency;
  lender: string;              // Prêteur
  startDate: string;           // Date de début (ISO 8601)
  endDate?: string;            // Date de fin
  interestRate?: number;       // Taux d'intérêt (%)
  status: 'active' | 'completed' | 'defaulted';
}

{
  pretsEnCours?: Loan[];
}
```

**Exemple:**
```json
{
  "pretsEnCours": [
    {
      "id": "loan-001",
      "type": "Prêt d'équipement",
      "amount": 50000,
      "currency": "USD",
      "lender": "Equity Bank Congo",
      "startDate": "2023-06-01",
      "endDate": "2026-06-01",
      "interestRate": 12.5,
      "status": "active"
    }
  ]
}
```

### Section: Levées de fonds (Startup)

```typescript
interface FundingRound {
  id: string;
  roundType: string;           // Seed, Series A, Series B, etc.
  amount: number;              // Montant levé
  currency: Currency;
  valuation?: number;          // Valorisation post-money
  investors?: string[];        // Liste des investisseurs
  date: string;                // Date de la levée (ISO 8601)
}

{
  leveeDeFonds?: FundingRound[];
}
```

**Exemple:**
```json
{
  "leveeDeFonds": [
    {
      "id": "funding-001",
      "roundType": "Seed",
      "amount": 100000,
      "currency": "USD",
      "valuation": 500000,
      "investors": ["Kinshasa Angels", "Africa Tech Ventures"],
      "date": "2022-03-15"
    }
  ]
}
```

### Section: Aspects juridiques et réglementaires

```typescript
interface LegalAspects {
  failliteAnterieure: boolean;
  detailsFaillite?: string;
  poursuiteJudiciaire: boolean;
  detailsPoursuites?: string;
  garantiePrets: boolean;
  detailsGaranties?: string;
  antecedentsFiscaux: boolean;
  detailsAntecedentsFiscaux?: string;
}

{
  legalAspects?: LegalAspects;
}
```

**Exemple:**
```json
{
  "legalAspects": {
    "failliteAnterieure": false,
    "poursuiteJudiciaire": false,
    "garantiePrets": true,
    "detailsGaranties": "Garantie personnelle du dirigeant pour prêt bancaire de 50,000 USD",
    "antecedentsFiscaux": false
  }
}
```

### Section: Métriques financières

```typescript
interface FinancialMetrics {
  annual_revenue: number;
  revenue_growth: number;      // Croissance du CA (%)
  profit_margin: number;       // Marge bénéficiaire (%)
  cash_flow: number;
  debt_ratio: number;          // Ratio d'endettement
  working_capital: number;     // Fonds de roulement
  credit_score: number;        // Score de crédit (0-100)
  financial_rating: FinancialRating;
  ebitda?: number;
  treasury_data?: TreasuryData;
}

{
  annual_revenue: number;
  financial_metrics: FinancialMetrics;
}
```

**Exemple:**
```json
{
  "annual_revenue": 250000,
  "financial_metrics": {
    "annual_revenue": 250000,
    "revenue_growth": 45.5,
    "profit_margin": 18.2,
    "cash_flow": 65000,
    "debt_ratio": 0.25,
    "working_capital": 85000,
    "credit_score": 78,
    "financial_rating": "BBB",
    "ebitda": 75000
  }
}
```

---

## Onglet 5: LOCALISATION

### Section: Sièges et implantations

```typescript
interface Location {
  id: string;
  address: string;
  city: string;
  country: string;
  isPrimary: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

{
  siegeSocial?: Location;          // Siège social
  siegeExploitation?: Location;    // Siège d'exploitation
  locations?: Location[];          // Autres localisations
  unitesProduction?: Location[];   // Unités de production
  pointsVente?: Location[];        // Points de vente
  latitude?: number;
  longitude?: number;
}
```

**Exemple:**
```json
{
  "siegeSocial": {
    "id": "loc-001",
    "address": "123 Avenue de la Libération",
    "city": "Kinshasa",
    "country": "RDC",
    "isPrimary": true,
    "coordinates": {
      "lat": -4.3276,
      "lng": 15.3136
    }
  },
  "siegeExploitation": {
    "id": "loc-002",
    "address": "45 Boulevard du 30 Juin",
    "city": "Kinshasa",
    "country": "RDC",
    "isPrimary": false
  },
  "pointsVente": [
    {
      "id": "loc-003",
      "address": "Place du Marché Central",
      "city": "Lubumbashi",
      "country": "RDC",
      "isPrimary": false
    }
  ]
}
```

### Section: Informations de contact

```typescript
interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

{
  contact_info?: ContactInfo;
  telephoneFixe?: string;
  telephoneMobile?: string;
  fax?: string;
  boitePostale?: string;
  website_url?: string;
}
```

**Exemple:**
```json
{
  "contact_info": {
    "email": "contact@techcongo.cd",
    "phone": "+243 81 234 5678",
    "address": "123 Avenue de la Libération, Kinshasa, RDC",
    "website": "https://www.techcongo.cd"
  },
  "telephoneFixe": "+243 12 345 6789",
  "telephoneMobile": "+243 81 234 5678",
  "fax": "+243 12 345 6790",
  "boitePostale": "BP 1234 Kinshasa"
}
```

### Section: Présence numérique et réseaux sociaux

```typescript
interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

{
  reseauxSociaux?: SocialLink[];
}
```

**Exemple:**
```json
{
  "reseauxSociaux": [
    {
      "platform": "LinkedIn",
      "url": "https://linkedin.com/company/techcongo",
      "label": "TechCongo Innovation"
    },
    {
      "platform": "Facebook",
      "url": "https://facebook.com/techcongo",
      "label": "@TechCongo"
    },
    {
      "platform": "Twitter",
      "url": "https://twitter.com/techcongo",
      "label": "@TechCongo"
    }
  ]
}
```

---

## Onglet 6: PITCH & PRÉSENTATION

### Section: Pitch et proposition de valeur

```typescript
interface PitchData {
  elevator_pitch?: string;         // Pitch elevator (30 secondes)
  value_proposition?: string;      // Proposition de valeur
  target_market?: string;          // Marché cible
  competitive_advantage?: string;  // Avantage concurrentiel
  pitch_deck_url?: string;         // URL du pitch deck
  demo_video_url?: string;         // URL de la vidéo démo
}

{
  pitch?: PitchData;
  pitch_deck_url?: string;  // Aussi disponible au niveau racine
}
```

**Exemple:**
```json
{
  "pitch": {
    "elevator_pitch": "TechCongo révolutionne la gestion des PME en Afrique en offrant des solutions logicielles accessibles et adaptées au contexte local.",
    "value_proposition": "Nous permettons aux PME africaines d'automatiser leur gestion comptable et administrative à un coût abordable, avec un support en langues locales et une adaptation aux réglementations OHADA.",
    "target_market": "PME de 10 à 100 employés dans les secteurs du commerce, services et industrie en RDC et en Afrique centrale.",
    "competitive_advantage": "Seule solution cloud complète en français avec support SYSCOHADA et paiements mobile money intégrés. Prix 70% inférieur aux solutions internationales.",
    "pitch_deck_url": "https://techcongo.cd/pitch-deck.pdf",
    "demo_video_url": "https://youtube.com/watch?v=demo123"
  }
}
```

---

## Onglet 7: DOCUMENTS

### Section: Documents de l'entreprise

```typescript
interface CompanyDocuments {
  documentsEntreprise?: string[];           // Documents juridiques (RCCM, statuts, etc.)
  documentsPersonnel?: string[];            // Documents RH (contrats, organigramme, etc.)
  documentsFinanciers?: string[];           // États financiers, bilans, etc.
  documentsPatrimoine?: string[];           // Titres de propriété, certificats, etc.
  documentsProprieteIntellectuelle?: string[]; // Brevets, marques, etc.
  documentsSectoriels?: string[];           // Licences, certifications sectorielles
}

{
  documents?: CompanyDocuments;
}
```

**Exemple:**
```json
{
  "documents": {
    "documentsEntreprise": [
      "https://docs.techcongo.cd/rccm.pdf",
      "https://docs.techcongo.cd/statuts.pdf",
      "https://docs.techcongo.cd/pv-ag-2024.pdf"
    ],
    "documentsFinanciers": [
      "https://docs.techcongo.cd/bilan-2023.pdf",
      "https://docs.techcongo.cd/compte-resultats-2023.pdf",
      "https://docs.techcongo.cd/flux-tresorerie-2023.pdf"
    ],
    "documentsProprieteIntellectuelle": [
      "https://docs.techcongo.cd/brevet-algorithme.pdf",
      "https://docs.techcongo.cd/marque-deposee.pdf"
    ]
  }
}
```

---

## Interfaces supplémentaires

### ContactPerson (Personnes de contact)

```typescript
interface ContactPerson {
  id?: string;
  nom?: string;
  prenoms?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  pourcentageActions?: number;
  role?: string;  // 'dirigeant', 'actionnaire', 'contact', etc.
}

{
  contactPersons?: ContactPerson[];
}
```

**Exemple:**
```json
{
  "contactPersons": [
    {
      "id": "person-001",
      "nom": "Kabongo",
      "prenoms": "Jean-Pierre",
      "fonction": "Directeur Général",
      "email": "jp.kabongo@techcongo.cd",
      "telephone": "+243 81 234 5678",
      "pourcentageActions": 60,
      "role": "dirigeant"
    },
    {
      "id": "person-002",
      "nom": "Mbuyi",
      "prenoms": "Marie",
      "fonction": "Directrice Technique",
      "email": "m.mbuyi@techcongo.cd",
      "telephone": "+243 82 345 6789",
      "pourcentageActions": 40,
      "role": "actionnaire"
    }
  ]
}
```

### Owner (Propriétaire principal)

```typescript
interface Owner {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

{
  owner?: Owner;
}
```

**Exemple:**
```json
{
  "owner": {
    "id": "owner-001",
    "name": "Jean-Pierre Kabongo",
    "email": "jp.kabongo@techcongo.cd",
    "phone": "+243 81 234 5678"
  }
}
```

---

## Interface Principale Complète: Company

```typescript
interface Company {
  // ===== IDENTITÉ ET CONTEXTE =====
  id: string;
  name: string;
  sector: string;
  size: CompanySize;
  status: CompanyStatus;
  
  // ===== IDENTIFICATION ÉTENDUE =====
  sigle?: string;
  typeEntreprise?: 'traditional' | 'startup';
  numeroIdentificationNationale?: string;
  secteursActiviteSecondaires?: string[];
  secteursPersonalises?: string[];
  descriptionActivites?: string;
  produitsServices?: string[];
  capitalSocial?: number;
  deviseCapital?: Currency;
  dateCreation?: string;
  dateDebutActivites?: string;
  
  // ===== DONNÉES OPÉRATIONNELLES =====
  employee_count: number;
  website_url?: string;
  pitch_deck_url?: string;
  lastContact?: string;
  
  // ===== DONNÉES FINANCIÈRES =====
  annual_revenue: number;
  financial_metrics: FinancialMetrics;
  
  // ===== CONTACT ET LOCALISATION =====
  contact_info?: ContactInfo;
  locations?: Location[];
  latitude?: number;
  longitude?: number;
  
  // ===== LOCALISATION DÉTAILLÉE =====
  siegeSocial?: Location;
  siegeExploitation?: Location;
  unitesProduction?: Location[];
  pointsVente?: Location[];
  telephoneFixe?: string;
  telephoneMobile?: string;
  fax?: string;
  boitePostale?: string;
  reseauxSociaux?: SocialLink[];
  
  // ===== DONNÉES LÉGALES ET PAIEMENT =====
  legal_info?: LegalInfo;
  payment_info?: PaymentInfo;
  
  // ===== PERSONNES =====
  owner?: Owner;
  contactPersons?: ContactPerson[];
  
  // ===== PATRIMOINE ET ACTIFS =====
  assets?: Asset[];
  stocks?: Stock[];
  moyensTechniques?: string[];
  capaciteProduction?: string;
  
  // ===== STRUCTURE =====
  organigramme?: string;
  
  // ===== INCUBATION ET ACCOMPAGNEMENT =====
  incubation?: IncubationData;
  
  // ===== SPÉCIFICITÉS SELON TYPE =====
  startupSpecifics?: StartupSpecifics;
  traditionalSpecifics?: TraditionalSpecifics;
  
  // ===== PITCH ET PRÉSENTATION =====
  pitch?: PitchData;
  
  // ===== FINANCE ÉTENDUE =====
  pretsEnCours?: Loan[];
  leveeDeFonds?: FundingRound[];
  
  // ===== ASPECTS JURIDIQUES =====
  legalAspects?: LegalAspects;
  
  // ===== DOCUMENTS =====
  documents?: CompanyDocuments;
  
  // ===== MÉTRIQUES ESG =====
  esg_metrics: ESGMetrics;
  
  // ===== MÉTADONNÉES =====
  profileCompleteness?: number;
  lastSyncFromAccounting?: string;
  lastSyncFromCustomer?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Exemple Complet

Voici un exemple complet d'un profil d'entreprise avec toutes les sections renseignées:

```json
{
  "id": "company-tc-001",
  "name": "TechCongo Innovation SARL",
  "sigle": "TCI",
  "sector": "Technologies de l'Information",
  "typeEntreprise": "startup",
  "size": "small",
  "status": "active",
  "numeroIdentificationNationale": "NIN-123456789",
  "capitalSocial": 50000,
  "deviseCapital": "USD",
  "dateCreation": "2020-03-15",
  "dateDebutActivites": "2020-05-01",
  "descriptionActivites": "Développement de solutions logicielles innovantes pour la gestion des PME en Afrique centrale",
  "secteursActiviteSecondaires": ["Fintech", "E-commerce"],
  "produitsServices": [
    "Logiciel de gestion comptable",
    "Plateforme de paiement mobile",
    "Application mobile de gestion de stock"
  ],
  
  "employee_count": 25,
  "website_url": "https://www.techcongo.cd",
  "pitch_deck_url": "https://techcongo.cd/pitch-deck.pdf",
  "annual_revenue": 250000,
  
  "legal_info": {
    "legalForm": "SARL",
    "rccm": "CD/KIN/RCCM/20-A-03456",
    "taxId": "A2003456F",
    "yearFounded": 2020
  },
  
  "financial_metrics": {
    "annual_revenue": 250000,
    "revenue_growth": 45.5,
    "profit_margin": 18.2,
    "cash_flow": 65000,
    "debt_ratio": 0.25,
    "working_capital": 85000,
    "credit_score": 78,
    "financial_rating": "BBB",
    "ebitda": 75000
  },
  
  "contact_info": {
    "email": "contact@techcongo.cd",
    "phone": "+243 81 234 5678",
    "address": "123 Avenue de la Libération, Kinshasa, RDC",
    "website": "https://www.techcongo.cd"
  },
  
  "telephoneFixe": "+243 12 345 6789",
  "telephoneMobile": "+243 81 234 5678",
  "fax": "+243 12 345 6790",
  "boitePostale": "BP 1234 Kinshasa",
  
  "siegeSocial": {
    "id": "loc-001",
    "address": "123 Avenue de la Libération",
    "city": "Kinshasa",
    "country": "RDC",
    "isPrimary": true,
    "coordinates": {
      "lat": -4.3276,
      "lng": 15.3136
    }
  },
  
  "reseauxSociaux": [
    {
      "platform": "LinkedIn",
      "url": "https://linkedin.com/company/techcongo",
      "label": "TechCongo Innovation"
    },
    {
      "platform": "Facebook",
      "url": "https://facebook.com/techcongo",
      "label": "@TechCongo"
    }
  ],
  
  "owner": {
    "id": "owner-001",
    "name": "Jean-Pierre Kabongo",
    "email": "jp.kabongo@techcongo.cd",
    "phone": "+243 81 234 5678"
  },
  
  "contactPersons": [
    {
      "id": "person-001",
      "nom": "Kabongo",
      "prenoms": "Jean-Pierre",
      "fonction": "Directeur Général",
      "email": "jp.kabongo@techcongo.cd",
      "telephone": "+243 81 234 5678",
      "pourcentageActions": 60,
      "role": "dirigeant"
    }
  ],
  
  "payment_info": {
    "preferredMethod": "bank",
    "bankAccounts": [
      {
        "accountNumber": "0123456789",
        "accountName": "TechCongo Innovation SARL",
        "bankName": "Equity Bank Congo",
        "currency": "USD",
        "isPrimary": true,
        "swiftCode": "EQBLCDKI"
      }
    ]
  },
  
  "assets": [
    {
      "designation": "Serveur Dell PowerEdge R740",
      "type": "Matériel informatique",
      "valeurActuelle": 15000,
      "etatActuel": "Bon état",
      "observations": "Acheté en janvier 2023, garantie 3 ans"
    }
  ],
  
  "stocks": [
    {
      "designation": "Licences logicielles Microsoft",
      "categorie": "Logiciels",
      "quantiteStock": 50,
      "valeurTotaleStock": 25000,
      "etatStock": "Actif"
    }
  ],
  
  "moyensTechniques": [
    "Infrastructure cloud AWS",
    "Plateforme de développement GitLab",
    "Suite Adobe Creative Cloud"
  ],
  
  "capaciteProduction": "Capacité de développement: 5 projets simultanés avec équipe de 12 développeurs",
  
  "organigramme": "Direction Générale\n├── Direction Technique (8 personnes)\n├── Direction Commerciale (6 personnes)\n├── Direction Administrative (4 personnes)\n└── Support Client (5 personnes)",
  
  "incubation": {
    "enIncubation": true,
    "typeAccompagnement": "acceleration",
    "nomIncubateur": "Kinshasa Digital Hub",
    "certificatAffiliation": "https://example.com/certificate.pdf"
  },
  
  "startupSpecifics": {
    "niveauMaturiteTechnologique": "TRL 7 - Prototype opérationnel",
    "modeleEconomique": "SaaS avec abonnement mensuel",
    "proprieteIntellectuelle": [
      "Brevet logiciel - Algorithme de prédiction",
      "Marque déposée - TechCongo"
    ]
  },
  
  "pitch": {
    "elevator_pitch": "TechCongo révolutionne la gestion des PME en Afrique en offrant des solutions logicielles accessibles et adaptées au contexte local.",
    "value_proposition": "Nous permettons aux PME africaines d'automatiser leur gestion comptable et administrative à un coût abordable.",
    "target_market": "PME de 10 à 100 employés dans les secteurs du commerce, services et industrie en RDC.",
    "competitive_advantage": "Seule solution cloud complète en français avec support SYSCOHADA et paiements mobile money intégrés.",
    "pitch_deck_url": "https://techcongo.cd/pitch-deck.pdf",
    "demo_video_url": "https://youtube.com/watch?v=demo123"
  },
  
  "pretsEnCours": [
    {
      "id": "loan-001",
      "type": "Prêt d'équipement",
      "amount": 50000,
      "currency": "USD",
      "lender": "Equity Bank Congo",
      "startDate": "2023-06-01",
      "endDate": "2026-06-01",
      "interestRate": 12.5,
      "status": "active"
    }
  ],
  
  "leveeDeFonds": [
    {
      "id": "funding-001",
      "roundType": "Seed",
      "amount": 100000,
      "currency": "USD",
      "valuation": 500000,
      "investors": ["Kinshasa Angels", "Africa Tech Ventures"],
      "date": "2022-03-15"
    }
  ],
  
  "legalAspects": {
    "failliteAnterieure": false,
    "poursuiteJudiciaire": false,
    "garantiePrets": true,
    "detailsGaranties": "Garantie personnelle du dirigeant pour prêt bancaire de 50,000 USD",
    "antecedentsFiscaux": false
  },
  
  "documents": {
    "documentsEntreprise": [
      "https://docs.techcongo.cd/rccm.pdf",
      "https://docs.techcongo.cd/statuts.pdf"
    ],
    "documentsFinanciers": [
      "https://docs.techcongo.cd/bilan-2023.pdf",
      "https://docs.techcongo.cd/compte-resultats-2023.pdf"
    ]
  },
  
  "esg_metrics": {
    "carbon_footprint": 12.5,
    "environmental_rating": "B",
    "social_rating": "A",
    "governance_rating": "B"
  },
  
  "profileCompleteness": 92,
  "created_at": "2020-03-15T08:00:00.000Z",
  "updated_at": "2025-12-13T14:30:00.000Z"
}
```

---

## Notes d'implémentation

### Score de crédit - Affichage dans l'UI

Le score de crédit (`credit_score`) est affiché avec un badge coloré selon la valeur:

- **80-100**: Badge vert - "Excellent" - Faible risque
- **60-79**: Badge jaune - "Bon" - Risque modéré
- **40-59**: Badge orange - "Moyen" - Risque élevé
- **0-39**: Badge rouge - "Faible" - Risque très élevé

### Export des données

Le profil complet peut être exporté dans les formats suivants:
- **Excel (.xlsx)**: Toutes les sections dans des onglets séparés
- **CSV (.csv)**: Version aplatie pour import/export simple
- **PDF (.pdf)**: Document formaté pour impression

### Complétude du profil

Le champ `profileCompleteness` (0-100) indique le pourcentage de remplissage du profil:
- **90-100%**: Profil très complet
- **70-89%**: Profil complet
- **50-69%**: Profil partiellement rempli
- **<50%**: Profil incomplet

---

## API Endpoints

Pour interagir avec les profils d'entreprise via l'API, consultez la documentation complète des endpoints:

### Documentation des Endpoints

📖 **[Documentation Complète des Endpoints de Prospection](./README.md)**

Endpoints disponibles:

1. **GET `/companies`** - Liste paginée avec filtres (secteur, taille, score crédit, rating)
2. **GET `/companies/:id`** - Détails complets du profil (7 onglets)
3. **GET `/companies/stats`** - Statistiques agrégées de prospection
4. **GET `/companies/nearby`** - Recherche géographique par proximité (Haversine)
5. **GET `/companies/search`** - Recherche full-text par nom ou secteur
6. **POST `/companies/:id/sync`** - Synchronisation depuis accounting-service
7. **POST `/companies/:id/sync-complete`** - Synchronisation complète (accounting + customer)
8. **POST `/companies/:id/documents`** - Upload de document pour une entreprise
9. **GET `/companies/:id/documents`** - Liste des documents d'une entreprise
10. **POST `/companies`** - Créer une nouvelle entreprise (CRUD)
11. **PUT `/companies/:id`** - Mettre à jour une entreprise (CRUD)
12. **DELETE `/companies/:id`** - Supprimer une entreprise (CRUD)

### Workflow recommandé

```
1. Découverte
   GET /companies?sector=Technologies&minCreditScore=70
   → Liste des prospects qualifiés

2. Recherche rapide
   GET /companies/search?q=TechCongo
   → Recherche full-text par nom

3. Détails
   GET /companies/{id}
   → Profil complet avec 7 onglets (Général, Patrimoine, Structure, Finance, Localisation, Pitch, Documents)

4. Proximité
   GET /companies/nearby?latitude=-4.3276&longitude=15.3136&radiusKm=25
   → Prospects à proximité d'un point GPS

5. Documents
   GET /companies/{id}/documents
   → Liste des documents de l'entreprise
   
   POST /companies/{id}/documents
   → Upload d'un nouveau document

6. Synchronisation (si données stale > 24h)
   POST /companies/{id}/sync
   → Mise à jour depuis sources externes

7. Statistiques
   GET /companies/stats
   → Métriques agrégées (total, par secteur, taille, statut)
```

### Architecture de synchronisation

Les données du profil d'entreprise proviennent de **deux sources** :

**Source primaire (HTTP):** `accounting-service`
- Données financières (annual_revenue, financial_metrics, credit_score, financial_rating)
- Métriques de performance (EBITDA, cash_flow, profit_margin)
- Ratios financiers (debt_ratio, working_capital, revenue_growth)

**Source secondaire (Kafka):** `customer-service`
- Données légales (legal_info: rccm, taxId, legalForm, yearFounded)
- Contacts (contact_info, owner, contactPersons)
- Localisations (locations, siegeSocial, siegeExploitation avec coordonnées GPS)
- Structure capital et associés

**Règles de réconciliation:**
- En Recherche rapide par nom:**
```bash
GET /companies/search?q=TechCongo
```

**3. Obtenir les détails complets d'un prospect:**
```bash
GET /companies/company-tc-001
```

**4. Trouver des prospects à proximité (rayon 50km):**
```bash
GET /companies/nearby?latitude=-4.3276&longitude=15.3136&radiusKm=50&size=small
```

**5. Lister les documents d'une entreprise:**
```bash
GET /companies/company-tc-001/documents
```

**6. Uploader un document:**
```bash
POST /companies/company-tc-001/documents
Content-Type: multipart/form-data

file: [binary]
type: "legal"
description: "RCCM officiel"
```

**7
**2. Obtenir les détails complets d'un prospect:**
```bash
GET /companies/company-tc-001
```

**3. Trouver des prospects à proximité (rayon 50km):**
```bash
GET /companies/nearby?latitude=-4.3276&longitude=15.3136&radiusKm=50&size=small
```

**4. Synchroniser les données d'un prospect:**
```bash
POST /companies/company-tc-001/sync
Authorization: Bearer <jwt_token>
```

### Codes de réponse HTTP

| Code | Description |
|------|-------------|
| 200 | Succès - Données retournées |
| 201 | Créé - Nouvelle ressource créée |
| 400 | Requête invalide - Paramètres manquants/incorrects |
| 401 | Non authentifié - Token JWT manquant/invalide |
| 403 | Non autorisé - Permissions insuffisantes |
| 404 | Non trouvé - Ressource inexistante |
| 503 | Service indisponible - Service externe inaccessible |

### Notes d'implémentation

- **Pagination:** Par défaut 20 résultats par page, maximum 100
- **Auto-refresh:** Si `lastSyncFromAccounting > 24h`, synchronisation automatique déclenchée
- **Cache:** Les profils sont mis en cache dans `portfolio-institution-service`
- **Kafka topics:** 6 topics pour synchronisation temps réel depuis `customer-service`
- **Permissions:** Synchronisation manuelle réservée aux rôles `admin` et `portfolio_manager`
