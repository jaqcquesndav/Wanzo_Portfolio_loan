# 🔍 Analyse de Complétude du Profil Company

**Date**: 13 décembre 2025  
**Objectif**: Vérifier que le workflow UI → Hooks → Types → API est complet pour l'affichage du profil company

---

## 📋 Référence: Documentation EnterpriseIdentificationForm

Selon `DOCUMENTATION_PROFILS/11-BUSINESS_PROFILE_COMPANY.md`, le formulaire d'édition contient **6 onglets** avec **~100+ champs**:

### Onglets documentés
1. **Général** - Identification, activités, capital, incubation, spécificités startup/traditional
2. **Localisation** - Sièges, unités de production, points de vente, coordonnées, réseaux sociaux
3. **Pitch** - Elevator pitch, value proposition, target market, competitive advantage, pitch deck URL, demo video
4. **Patrimoine** - Immobilisations, équipements, véhicules, stocks, moyens techniques
5. **Structure** - Dirigeants, actionnaires, employés, organigramme
6. **Finance & Juridique** - Comptes bancaires, prêts, levées de fonds, aspects juridiques, documents

---

## ❌ CHAMPS MANQUANTS IDENTIFIÉS

### 1️⃣ Dans le Type `Company` (src/types/company.ts)

#### Onglet GÉNÉRAL - Champs manquants:
- ❌ `sigle` (sigle de l'entreprise)
- ❌ `typeEntreprise` ('traditional' | 'startup')
- ❌ `formeJuridiqueOHADA` (forme juridique OHADA: GIE, SARL, SAS, etc.) - **Partiellement présent via `LegalForm` mais pas OHADA complet**
- ❌ `dateCreation` / `dateDebutActivites` (dates importantes)
- ❌ `numeroRCCM`, `numeroIdentificationNationale`, `numeroImpotFiscal` - **Partiellement via `legal_info` mais manque `numeroIdentificationNationale`**
- ❌ `secteursActiviteSecondaires[]` (secteurs secondaires)
- ❌ `secteursPersonalises[]` (secteurs personnalisés)
- ❌ `descriptionActivites` (description détaillée)
- ❌ `produitsServices[]` (liste produits/services)
- ❌ `capitalSocial` + `devise` (capital avec devise)
- ❌ `enIncubation` (boolean)
- ❌ `typeAccompagnement` ('incubation' | 'acceleration')
- ❌ `nomIncubateur` (nom de l'incubateur/accélérateur)
- ❌ `certificatAffiliation` (fichier/URL)
- ❌ **STARTUP SPECIFICS**: `niveauMaturiteTechnologique` (TRL), `modeleEconomique`, `proprieteIntellectuelle[]`
- ❌ **TRADITIONAL SPECIFICS**: `certificationQualite`, `licencesExploitation[]`

#### Onglet LOCALISATION - Champs manquants:
- ✅ `latitude`, `longitude` - **PRÉSENT**
- ✅ `locations[]` - **PRÉSENT**
- ❌ `siegeSocial` (objet Coordinates distinct)
- ❌ `siegeExploitation` (objet Coordinates distinct)
- ❌ `unitesProduction[]` (MultiLocationPicker - max 5)
- ❌ `pointsVente[]` (MultiLocationPicker - max 10)
- ❌ `telephoneFixe`, `telephoneMobile`, `fax`, `boitePostale` - **Partiellement via `contact_info.phone`**
- ❌ `reseauxSociaux[]` (SocialLink[] avec platform, url, label)

#### Onglet PITCH - Champs manquants:
- ❌ `elevator_pitch` (pitch rapide 30s)
- ❌ `value_proposition` (proposition de valeur)
- ❌ `target_market` (marché cible)
- ❌ `competitive_advantage` (avantage concurrentiel)
- ✅ `pitch_deck_url` - **PRÉSENT**
- ❌ `demo_video_url` (URL vidéo démo)

#### Onglet PATRIMOINE - Champs manquants:
- ✅ `assets[]` - **PRÉSENT**
- ✅ `stocks[]` - **PRÉSENT**
- ❌ Distinction entre `immobilisations[]`, `equipements[]`, `vehicules[]` (actuellement tous dans `assets` sans catégorisation claire)
- ❌ `moyensTechniques[]` (liste moyens tech: ERP, CRM, etc.)
- ❌ `capaciteProduction` (description capacité)

#### Onglet STRUCTURE - Champs manquants:
- ✅ `owner` - **PRÉSENT**
- ✅ `contactPersons[]` - **PRÉSENT** (mais manque détails: diplômes, date nomination, type contrat, salaire)
- ✅ `employee_count` - **PRÉSENT**
- ❌ `organigramme` (description structure organisationnelle)
- ❌ Distinction entre:
  - `dirigeants[]` (équipe dirigeante)
  - `actionnaires[]` (structure actionnariale avec `pourcentageActions`)
  - `employes[]` (employés clés avec `typeContrat`, `salaire`, `dateNomination`)

#### Onglet FINANCE & JURIDIQUE - Champs manquants:
- ✅ `payment_info.bankAccounts[]` - **PRÉSENT**
- ✅ `payment_info.mobileMoneyAccounts[]` - **PRÉSENT**
- ❌ `pretsEnCours[]` (concours financiers et prêts)
- ❌ **STARTUP ONLY**: `leveeDeFonds[]` (funding rounds)
- ❌ **ASPECTS JURIDIQUES**:
  - `failliteAnterieure` (boolean) + `detailsFaillite` (textarea)
  - `poursuiteJudiciaire` (boolean) + `detailsPoursuites` (textarea)
  - `garantiePrets` (boolean) + `detailsGaranties` (textarea)
  - `antecedentsFiscaux` (boolean) + `detailsAntecedentsFiscaux` (textarea)
- ❌ **DOCUMENTS** (6 catégories avec FileUpload):
  - `documentsEntreprise[]` (statuts, RCCM, autorisations, attestations fiscales)
  - `documentsPersonnel[]` (CV dirigeants, cartes identité, procurations)
  - `documentsFinanciers[]` (business plan, états financiers OHADA)
  - `documentsPatrimoine[]` (factures, contrats licence, certificats propriété)
  - `documentsProprieteIntellectuelle[]` (brevets, marques, NDA) - **STARTUP ONLY**
  - `documentsSectoriels[]` (documents spécifiques au secteur)

---

## ✅ CHAMPS PRÉSENTS CONFIRMÉS

### Type Company - Champs implémentés:
- ✅ `id`, `name`, `sector`, `size`, `status`
- ✅ `employee_count`, `annual_revenue`
- ✅ `website_url`, `pitch_deck_url`
- ✅ `financial_metrics` (avec treasury_data)
- ✅ `contact_info` (email, phone, address, website)
- ✅ `locations[]` (avec coordinates)
- ✅ `latitude`, `longitude`
- ✅ `legal_info` (legalForm, rccm, taxId, yearFounded)
- ✅ `payment_info` (bankAccounts, mobileMoneyAccounts)
- ✅ `owner` (name, email, phone)
- ✅ `contactPersons[]` (avec pourcentageActions)
- ✅ `assets[]` (patrimoine)
- ✅ `stocks[]` (inventaire)
- ✅ `esg_metrics`
- ✅ `profileCompleteness`, `lastSyncFromAccounting`, `lastSyncFromCustomer`
- ✅ `created_at`, `updated_at`

---

## 🎯 AFFICHAGE DANS CompanyViewPage

### Onglets implémentés:
1. ✅ **Général** - Affiche identification de base, contact, métriques financières, présence web
2. ✅ **Patrimoine** - Affiche assets et stocks
3. ✅ **Structure** - Affiche owner, contactPersons, employee_count
4. ✅ **Finance & Juridique** - Affiche legal_info, bankAccounts, mobileMoneyAccounts
5. ✅ **Localisation** - Affiche locations ou latitude/longitude
6. ✅ **Pitch** - Affiche pitch_deck_url, website_url, esg_metrics, profileCompleteness

### Éléments manquants dans l'affichage:
- ❌ **Onglet Général**: Pas d'affichage pour sigle, typeEntreprise, secteursSecondaires, produitsServices, capitalSocial, incubation, spécificités startup/traditional
- ❌ **Onglet Localisation**: Pas de distinction siege social vs exploitation, pas de téléphones distincts, pas de réseaux sociaux
- ❌ **Onglet Pitch**: Manque elevator_pitch, value_proposition, target_market, competitive_advantage, demo_video_url
- ❌ **Onglet Patrimoine**: Pas de distinction immobilisations/équipements/véhicules, manque moyensTechniques, capaciteProduction
- ❌ **Onglet Structure**: Pas de distinction dirigeants/actionnaires/employés, manque organigramme
- ❌ **Onglet Finance & Juridique**: Manque prêts, levées de fonds, aspects juridiques (4 questions), documents (6 catégories)

---

## 🔄 HOOK useCompanyData

### Fonctionnalités présentes:
- ✅ Récupération via `companyApi.getCompanyById(id)`
- ✅ Normalisation via `normalizeToCompany(data)`
- ✅ Fallback vers mock data (getMockCompanyByMemberId, getMockCompanyByInternalId)
- ✅ Création de company par défaut avec `createDefaultCompany`
- ✅ Cache in-memory pour éviter requêtes dupliquées
- ✅ Gestion d'erreurs avec fallback gracieux

### Normalisation manquante:
- ❌ Les champs manquants du type Company ne sont pas normalisés (pitch fields, documents, etc.)
- ✅ Bonne gestion des champs existants (contacts, locations, financial_metrics)

---

## 🌐 API companyApi

### Endpoints présents:
- ✅ `getAllCompanies(filters)` - Récupération avec filtres de prospection
- ✅ `getCompanyById(id)` - Récupération d'une company par ID
- ✅ `createCompany(company)` - Création
- ✅ `updateCompany(id, company)` - Mise à jour
- ✅ `deleteCompany(id)` - Suppression
- ✅ `searchCompanies(searchTerm)` - Recherche
- ✅ `uploadCompanyDocument(companyId, file, metadata)` - Upload document
- ✅ `getCompanyDocuments(companyId)` - Récupération documents
- ✅ `getNearbyCompanies(params)` - Recherche géographique
- ✅ `getCompanyStats()` - Statistiques prospection
- ✅ `syncCompany(id)` - Synchronisation accounting
- ✅ `syncCompanyComplete(id)` - Synchronisation complète

### Observations:
- ✅ API bien structurée avec types ProspectionFilters, NearbySearchParams, ProspectionStats
- ✅ Support upload/récupération documents
- ⚠️ L'API retourne `Company` type - si le backend envoie des champs supplémentaires, ils doivent être ajoutés au type

---

## 📊 RÉSUMÉ ET RECOMMANDATIONS

### Statut actuel:
- **Type Company**: ✅ 60% complet (champs de base + financials + ESG)
- **CompanyViewPage**: ✅ 70% complet (affiche bien ce qui est dans le type)
- **useCompanyData**: ✅ 85% complet (bonne normalisation des champs existants)
- **companyApi**: ✅ 90% complet (API bien structurée)

### Problème principal:
Le type `Company` ne contient PAS tous les champs documentés dans `EnterpriseIdentificationForm` (formulaire d'édition). Cela signifie:
1. ❌ Le formulaire d'édition peut collecter des données qui ne seront pas sauvegardées
2. ❌ CompanyViewPage ne peut pas afficher ces données car elles ne sont pas dans le type
3. ⚠️ Incohérence entre page d'édition (EnterpriseIdentificationForm) et page de consultation (CompanyViewPage)

### Actions recommandées:

#### PRIORITÉ 1 - Étendre le type Company
```typescript
// Ajouter à src/types/company.ts
export interface PitchData {
  elevator_pitch?: string;
  value_proposition?: string;
  target_market?: string;
  competitive_advantage?: string;
  pitch_deck_url?: string;
  demo_video_url?: string;
}

export interface IncubationData {
  enIncubation: boolean;
  typeAccompagnement?: 'incubation' | 'acceleration';
  nomIncubateur?: string;
  certificatAffiliation?: string;
}

export interface StartupSpecifics {
  niveauMaturiteTechnologique?: string; // TRL
  modeleEconomique?: string;
  proprieteIntellectuelle?: string[];
}

export interface TraditionalSpecifics {
  certificationQualite?: boolean;
  licencesExploitation?: string[];
}

export interface LegalAspects {
  failliteAnterieure: boolean;
  detailsFaillite?: string;
  poursuiteJudiciaire: boolean;
  detailsPoursuites?: string;
  garantiePrets: boolean;
  detailsGaranties?: string;
  antecedentsFiscaux: boolean;
  detailsAntecedentsFiscaux?: string;
}

export interface CompanyDocuments {
  documentsEntreprise?: File[];
  documentsPersonnel?: File[];
  documentsFinanciers?: File[];
  documentsPatrimoine?: File[];
  documentsProprieteIntellectuelle?: File[];
  documentsSectoriels?: File[];
}

// Étendre Company interface
export interface Company {
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS
  sigle?: string;
  typeEntreprise?: 'traditional' | 'startup';
  numeroIdentificationNationale?: string;
  secteursActiviteSecondaires?: string[];
  secteursPersonalises?: string[];
  descriptionActivites?: string;
  produitsServices?: string[];
  capitalSocial?: number;
  deviseCapital?: Currency;
  
  incubation?: IncubationData;
  startupSpecifics?: StartupSpecifics;
  traditionalSpecifics?: TraditionalSpecifics;
  
  pitch?: PitchData;
  
  siegeSocial?: Coordinates;
  siegeExploitation?: Coordinates;
  unitesProduction?: Coordinates[];
  pointsVente?: Coordinates[];
  reseauxSociaux?: SocialLink[];
  
  moyensTechniques?: string[];
  capaciteProduction?: string;
  organigramme?: string;
  
  pretsEnCours?: Loan[];
  leveeDeFonds?: FundingRound[];
  legalAspects?: LegalAspects;
  documents?: CompanyDocuments;
}
```

#### PRIORITÉ 2 - Mettre à jour CompanyViewPage
Ajouter sections pour afficher:
- Sigle, type entreprise, secteurs secondaires
- Informations d'incubation
- Spécificités startup (TRL, modèle économique, PI)
- Spécificités traditional (certifications, licences)
- Pitch complet (6 champs)
- Réseaux sociaux
- Moyens techniques, capacité de production
- Organigramme
- Prêts, levées de fonds
- Aspects juridiques (4 questions)
- Documents (6 catégories)

#### PRIORITÉ 3 - Mettre à jour useCompanyData
Ajouter normalisation pour les nouveaux champs dans `normalizeToCompany()`

#### PRIORITÉ 4 - Vérifier le backend
S'assurer que l'API `/companies/:id` retourne TOUS ces champs depuis le backend

---

## ⚠️ ATTENTION

La documentation `11-BUSINESS_PROFILE_COMPANY.md` décrit un formulaire d'ÉDITION très complet avec ~100+ champs.
Le type `Company` actuel est plus limité et orienté "profil de base + métriques financières".

**Question cruciale**: Est-ce que le backend stocke TOUS ces champs, ou seulement les champs de base?
- Si le backend stocke tout → Il faut étendre le type Company frontend
- Si le backend ne stocke que les champs de base → La documentation doit être mise à jour

**Recommandation**: Vérifier avec l'équipe backend quelle est la structure réelle du modèle Company côté serveur.

---

**Statut**: 🟡 Workflow partiellement complet - Nécessite extension du type Company pour correspondre à la documentation
