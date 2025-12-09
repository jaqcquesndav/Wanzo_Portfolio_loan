# 📋 Documentation Page Profil Entreprise (Company Profile)

## 🎯 Vue d'ensemble

La page **Company Profile** (`/company`) est dédiée à la gestion complète des informations d'entreprise (PME, startups). Elle est accessible via le dropdown du header dans **"Votre entreprise"** et permet à l'utilisateur de gérer et soumettre le formulaire d'identification d'entreprise.

**Route** : `/company`  
**Fichier page** : `src/pages/Company.tsx` (importe BusinessProfile.tsx)  
**Formulaire** : `src/components/company/EnterpriseIdentificationForm.tsx`

---

## 1. Page Principale : Company.tsx

### Code exact

```tsx
import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useOnceEffect } from '../hooks/useOnceEffect';
import { PageContainer } from '../components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import EnterpriseIdentificationForm from '../components/company/EnterpriseIdentificationForm';
import FinancialInstitutionPage from './FinancialInstitution';

// Type pour le sélecteur de profil business
type BusinessProfileType = 'company' | 'financial_institution';

export default function BusinessProfile() {
  // Utiliser le hook useUser pour accéder aux données de l'utilisateur
  const { user, isLoading } = useUser();
  
  // Déterminer le profil à afficher par défaut
  const [currentProfile, setCurrentProfile] = useState<BusinessProfileType>('company');

  // Définir l'onglet par défaut en fonction du type d'utilisateur (une seule fois)
  useOnceEffect(() => {
    if (user) {
      if (user.userType === 'financial_institution' && user.financialInstitutionId) {
        setCurrentProfile('financial_institution');
      } else {
        // Pour les PME ou les utilisateurs sans type défini, on affiche le profil entreprise par défaut
        setCurrentProfile('company');
      }
    }
  });

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading && !user) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Profil Professionnel</h1>
            <p className="text-gray-600">Gérez vos informations d'entreprise et d'institution financière</p>
          </div>

          <Tabs 
            defaultValue={currentProfile} 
            onValueChange={(value) => setCurrentProfile(value as BusinessProfileType)}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="company">
                PME / Entreprise
              </TabsTrigger>
              
              {user?.financialInstitutionId && (
                <TabsTrigger value="financial_institution">
                  Institution Financière
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="company">
              <EnterpriseIdentificationForm />
            </TabsContent>

            {user?.financialInstitutionId && (
              <TabsContent value="financial_institution">
                <FinancialInstitutionPage financialInstitutionId={user.financialInstitutionId} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
```

### 📝 Logique de la page

- **Route** : `/company`
- **État initial** : `currentProfile = 'company'`
- **Détermination du profil par défaut** via `useOnceEffect()` :
  - Si `user.userType === 'financial_institution'` ET `user.financialInstitutionId` → `'financial_institution'`
  - Sinon → `'company'`
- **Onglet "Institution Financière"** : affiché seulement si `user.financialInstitutionId` existe
- **Chargement** : spinner affiché pendant `isLoading && !user`

---

## 2. Composant Principal : EnterpriseIdentificationForm.tsx

**Fichier complet** : `src/components/company/EnterpriseIdentificationForm.tsx` (1583 lignes)

### 📦 Imports principaux

```tsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { EditableField } from '../ui/EditableField';
import { TagInput } from '../ui/TagInput';
import { SocialLinksInput } from '../ui/SocialLinksInput';
import { LocationPicker } from '../ui/LocationPicker';
import { MultiLocationPicker } from '../ui/MultiLocationPicker';
import { PitchSection } from '../ui/PitchSection';
import { PersonInput } from '../ui/PersonInput';
import { AssetInput } from '../ui/AssetInput';
import { StockInput } from '../ui/StockInput';
import FileUpload from '../ui/FileUpload';
import FinancialInput from '../ui/FinancialInput';
import { CompanyLogo } from './CompanyLogo';
import ProfessionalPDFExtractionButton from '../pdf/ProfessionalPDFExtractionButton';
import { useCompany } from '../../hooks/useCompany';
import { Edit3, Save, X, Loader2, Scale, FolderOpen, Send } from 'lucide-react';
import {
  LEGAL_FORMS_OHADA,
  COMPANY_TYPES,
  TRADITIONAL_SECTORS,
  STARTUP_SECTORS,
  TECHNOLOGY_READINESS_LEVELS,
  BUSINESS_MODELS,
  YES_NO_OPTIONS,
  CURRENCIES,
  COMPANY_SIZES,
  ACCOMPANIMENT_TYPES
} from '../../constants/enterpriseFormOptions';
```

### 🔷 Types et Interfaces

```tsx
interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

interface PitchData {
  elevator_pitch: string;
  value_proposition: string;
  target_market: string;
  competitive_advantage: string;
  pitch_deck_url?: string;
  demo_video_url?: string;
}

interface PersonData {
  id: string;
  nom: string;
  prenoms: string;
  fonction: string;
  nationalite?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  pourcentageActions?: number;
  dateNomination?: string;
  typeContrat?: string;
  salaire?: number;
  diplomes?: string[];
}

interface AssetData {
  id: string;
  designation: string;
  type: 'immobilier' | 'vehicule' | 'equipement' | 'stock' | 'autre';
  description?: string;
  prixAchat?: number;
  valeurActuelle?: number;
  devise?: 'USD' | 'CDF' | 'EUR';
  dateAcquisition?: string;
  etatActuel?: 'neuf' | 'excellent' | 'bon' | 'moyen' | 'mauvais' | 'deteriore';
  localisation?: string;
  numeroSerie?: string;
  marque?: string;
  modele?: string;
  quantite?: number;
  unite?: string;
  proprietaire?: 'propre' | 'location' | 'leasing' | 'emprunt';
  observations?: string;
  valeur?: number;
  etatUsage?: 'neuf' | 'bon' | 'moyen' | 'mauvais';
}

interface StockData {
  id: string;
  designation: string;
  categorie: 'matiere_premiere' | 'produit_semi_fini' | 'produit_fini' | 'fourniture' | 'emballage' | 'autre';
  description?: string;
  quantiteStock: number;
  unite: string;
  seuilMinimum?: number;
  seuilMaximum?: number;
  coutUnitaire: number;
  valeurTotaleStock: number;
  devise: 'USD' | 'CDF' | 'EUR';
  dateDernierInventaire?: string;
  dureeRotationMoyenne?: number;
  datePeremption?: string;
  emplacement?: string;
  conditionsStockage?: string;
  fournisseurPrincipal?: string;
  numeroLot?: string;
  codeArticle?: string;
  etatStock: 'excellent' | 'bon' | 'moyen' | 'deteriore' | 'perime';
  observations?: string;
}
```

### 📊 État du formulaire (formData)

```tsx
const [formData, setFormData] = useState({
  // Identification de base
  raisonSociale: '',
  sigle: '',
  formeJuridiqueOHADA: '',
  dateCreation: '',
  dateDebutActivites: '',
  numeroRCCM: '',
  numeroIdentificationNationale: '',
  numeroImpotFiscal: '',
  
  // Nature des activités
  typeEntreprise: 'traditional' as 'traditional' | 'startup',
  secteurActivitePrincipal: '',
  secteursActiviteSecondaires: [] as string[],
  secteursPersonalises: [] as string[],
  descriptionActivites: '',
  produitsServices: [] as string[],
  
  // Informations complémentaires
  tailleEntreprise: '',
  capitalSocial: '',
  deviseCapital: 'USD' as 'USD' | 'CDF' | 'EUR',
  
  // Incubation et accélération
  enIncubation: false,
  typeAccompagnement: '' as 'incubation' | 'acceleration' | '',
  nomIncubateurAccelerateur: '',
  certificatAffiliation: [] as any[],
  
  // Coordonnées et localisation
  siegeSocial: null as Coordinates | null,
  siegeExploitation: null as Coordinates | null,
  unitesProduction: [] as Coordinates[],
  pointsVente: [] as Coordinates[],
  
  // Contacts et réseaux sociaux
  telephoneFixe: '',
  telephoneMobile: '',
  fax: '',
  email: '',
  boitePostale: '',
  reseauxSociaux: [] as SocialLink[],
  
  // Pitch et présentation
  pitch: {
    elevator_pitch: '',
    value_proposition: '',
    target_market: '',
    competitive_advantage: '',
    pitch_deck_url: '',
    demo_video_url: ''
  } as PitchData,
  
  // Spécificités startup
  niveauMaturiteTechnologique: '',
  modeleEconomique: '',
  proprieteIntellectuelle: [] as string[],
  
  // Spécificités traditionnelles
  certificationQualite: false,
  licencesExploitation: [] as string[],
  
  // Structure organisationnelle
  dirigeants: [] as PersonData[],
  employes: [] as PersonData[],
  actionnaires: [] as PersonData[],
  nombreEmployes: 0,
  organigramme: '',
  
  // Patrimoine et moyens
  immobilisations: [] as AssetData[],
  equipements: [] as AssetData[],
  vehicules: [] as AssetData[],
  stocks: [] as StockData[],
  moyensTechniques: [] as string[],
  capaciteProduction: '',
  
  // Financier et juridique
  comptesBancaires: [] as any[],
  assurances: [] as any[],
  financements: [] as any[],
  litigesEnCours: false,
  detailsLitiges: '',
  failliteAnterieure: false,
  detailsFaillite: '',
  poursuiteJudiciaire: false,
  detailsPoursuites: '',
  garantiePrets: false,
  detailsGaranties: '',
  antecedentesFiscales: false,
  detailsAntecedentes: '',
  
  // Documents obligatoires
  documentsEntreprise: [] as any[],
  documentsPersonnel: [] as any[],
  documentsFinanciers: [] as any[],
  documentsPatrimoine: [] as any[],
  documentsProprietéIntellectuelle: [] as any[],
  documentsSectoriels: [] as any[],
});
```

### 📌 États additionnels

```tsx
const { company, updateCompany } = useCompany(undefined);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 🎨 Onglets du formulaire

```tsx
<Tabs defaultValue="general">
  <TabsList className="mb-8">
    <TabsTrigger value="general">Général</TabsTrigger>
    <TabsTrigger value="patrimoine">Patrimoine</TabsTrigger>
    <TabsTrigger value="structure">Structure</TabsTrigger>
    <TabsTrigger value="financier">Finance & Juridique</TabsTrigger>
    <TabsTrigger value="localisation">Localisation</TabsTrigger>
    <TabsTrigger value="presentation">Pitch</TabsTrigger>
  </TabsList>
</Tabs>
```

### 🔘 Actions principales

| Action | Fonction | Effet |
|--------|----------|-------|
| **Éditer** | `handleStartEditing()` | Passe en mode édition |
| **Annuler** | `handleCancelEditing()` | Restaure les données originales, sort du mode édition |
| **Sauvegarder** | `handleSaveProfile()` | Sauvegarde les modifications via `updateCompany()` |
| **Soumettre** | `handleSubmitProfile()` | Soumet pour validation, marque `formulaireStatut.statutValidation = 'soumis'` |

### 🧩 Composants enfants utilisés

- `Tabs / TabsList / TabsTrigger / TabsContent` - Navigation par onglets
- `EditableField` - Champ éditable avec mode lecture/édition
- `TagInput` - Saisie de tags/étiquettes
- `SocialLinksInput` - Gestion des liens sociaux
- `LocationPicker` - Sélection d'une position géographique
- `MultiLocationPicker` - Sélection de multiples positions
- `PitchSection` - Section présentation/pitch
- `PersonInput` - Saisie de données personnelles (dirigeants, employés, actionnaires)
- `AssetInput` - Saisie d'informations d'actifs
- `StockInput` - Saisie d'informations de stock
- `FileUpload` - Upload de fichiers
- `FinancialInput` - Saisie d'informations financières
- `CompanyLogo` - Gestion du logo de l'entreprise
- `ProfessionalPDFExtractionButton` - Extraction de données depuis PDF professionnel

### 🔗 Hooks utilisés

| Hook | Source | Usage |
|------|--------|-------|
| `useCompany(undefined)` | `src/hooks/useCompany.ts` | Récupère/met à jour les données company |
| `useState` | React | État local du formulaire |
| `useEffect` | React | Synchronisation avec les données company |

---

## 3. Composant : CompanyLogo.tsx

**Fichier** : `src/components/company/CompanyLogo.tsx`

```tsx
import { ChangeEvent, useState } from 'react';
import { useCompany } from '../../hooks/useCompany';

interface CompanyLogoProps {
  companyId: string;
  logo?: string;
  name: string;
  onLogoUpdate?: (success: boolean) => void;
}

export function CompanyLogo({ companyId, logo, name, onLogoUpdate }: CompanyLogoProps) {
  const { uploadLogo, loading: isUpdating } = useCompany(companyId);
  const [isHovering, setIsHovering] = useState(false);
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type et la taille du fichier
    if (!file.type.includes('image/')) {
      alert('Veuillez sélectionner une image.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert("L'image est trop volumineuse. La taille maximale est de 5MB.");
      return;
    }
    
    const result = await uploadLogo(file);
    if (onLogoUpdate) onLogoUpdate(!!result);
  };

  return (
    <div className="relative group">
      <div 
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden relative border-2 border-gray-200 shadow-sm"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {logo ? (
          <img
            src={logo}
            alt={`Logo de ${name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-2xl font-bold">
            {initials}
          </div>
        )}
        
        <div
          className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <label
            htmlFor="logo-upload"
            className="text-white cursor-pointer px-2 py-1 text-xs sm:text-sm rounded-md hover:underline"
          >
            {isUpdating ? 'Chargement...' : 'Modifier'}
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUpdating}
          />
        </div>
      </div>
      
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
}
```

### 📋 Responsabilités

- Affiche le logo de l'entreprise (ou initiales si absent)
- Permet le upload d'une nouvelle image au survol
- Valide le type et la taille du fichier (max 5MB)
- Callback `onLogoUpdate` pour notifier le composant parent

---

## 4. Accès à la page

### Via le dropdown du header

**Fichier** : `src/components/layout/Header.tsx` (lignes 256-259)

```tsx
<Link to="/company" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
  <Building2 className="w-4 h-4 mr-3 text-gray-400" />
  Votre entreprise
</Link>
```

### Route protégée

**Fichier** : `src/routes/index.tsx` (lignes 57-59)

```tsx
<Route path="/company" element={<ProtectedRoute><CompanyPage /></ProtectedRoute>} />
<Route path="/company/:companyId" element={<ProtectedRoute><CompanyPage /></ProtectedRoute>} />
```

---

## 5. Flux d'utilisation complet

```
Utilisateur clique sur "Votre entreprise" dans le dropdown du header
  ↓
Navigation vers /company
  ↓
ProtectedRoute vérifie l'authentification
  ↓
CompanyPage (BusinessProfile.tsx) charge
  ↓
useUser() récupère les données utilisateur
  ↓
useOnceEffect() détermine le profil par défaut
  ↓
Affichage des onglets (Company / Financial Institution)
  ↓
TabsContent("company") affiche EnterpriseIdentificationForm
  ↓
useCompany() récupère les données company existantes
  ↓
FormData se remplit depuis company (useEffect)
  ↓
Utilisateur clique sur "Éditer"
  ↓
isEditing = true
  ↓
Modification des champs (handleFieldChange)
  ↓
Utilisateur clique "Sauvegarder" ou "Soumettre"
  ↓
handleSaveProfile() ou handleSubmitProfile()
  ↓
updateCompany(formData) lance l'appel API
  ↓
Données sauvegardées/soumises pour validation
```

---

## 6. Constantes utilisées

**Source** : `src/constants/enterpriseFormOptions.ts`

| Constante | Type | Description |
|-----------|------|-------------|
| `LEGAL_FORMS_OHADA` | Array | Formes juridiques OHADA |
| `COMPANY_TYPES` | Array | Types d'entreprise (traditional, startup) |
| `TRADITIONAL_SECTORS` | Array | Secteurs traditionnels |
| `STARTUP_SECTORS` | Array | Secteurs startups |
| `TECHNOLOGY_READINESS_LEVELS` | Array | Niveaux de maturité technologique |
| `BUSINESS_MODELS` | Array | Modèles économiques |
| `YES_NO_OPTIONS` | Array | Options oui/non |
| `CURRENCIES` | Array | Devises (USD, CDF, EUR) |
| `COMPANY_SIZES` | Array | Tailles d'entreprise |
| `ACCOMPANIMENT_TYPES` | Array | Types d'accompagnement (incubation, accélération) |

---

## 7. Points clés de la page

✅ **Validation** : Champs requis marqués avec asterisque (*)  
✅ **Mode édition** : Bascule lisible/éditable  
✅ **Sauvegarde** : "Sauvegarder" (brouillon) vs "Soumettre" (validation)  
✅ **Responsive** : Design mobile-first avec breakpoints  
✅ **Upload fichiers** : Documents et logo supportés  
✅ **Onglets** : Organisation des sections du formulaire  
✅ **Hooks personnalisés** : useCompany() pour la gestion des données

---

## 8. Améliorations possibles

- ⏱️ Validation progressive des champs
- 💾 Sauvegarde automatique (autosave)
- 📝 Historique des modifications
- 📄 Pagination pour grandes sections
- 📊 Progress bar de complétion du formulaire
