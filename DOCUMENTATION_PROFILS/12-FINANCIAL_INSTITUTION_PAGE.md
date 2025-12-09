# 📋 Documentation Page Profil Institution Financière (Financial Institution Profile)

## 🎯 Vue d'ensemble

La page **Financial Institution Profile** (`/financial-institution`) est dédiée à la gestion complète des informations d'institution financière (banques, caisses, assurances, etc.). Elle est accessible via le dropdown du header dans **"Votre institution"** et permet à l'institution de gérer et soumettre le formulaire de partenariat avec Wanzo.

**Route** : `/financial-institution`  
**Fichier page** : `src/pages/FinancialInstitution.tsx`  
**Formulaire** : `src/components/company/FinancialInstitutionForm.tsx`

---

## 1. Page Principale : FinancialInstitution.tsx

### Code exact

```tsx
import React from 'react';
import FinancialInstitutionForm from '../components/company/FinancialInstitutionForm';
import { PageContainer } from '../components/layout/PageContainer';

interface FinancialInstitutionProps {
  financialInstitutionId?: string;
}

const FinancialInstitution: React.FC<FinancialInstitutionProps> = ({ financialInstitutionId }) => {
  return (
    <PageContainer>
      <FinancialInstitutionForm financialInstitutionId={financialInstitutionId} />
    </PageContainer>
  );
};

export default FinancialInstitution;
```

### 📝 Logique de la page

- **Route** : `/financial-institution` ou `/financial-institution/:institutionId`
- **Props** : `financialInstitutionId?` - ID de l'institution financière
- **Wrapper** : `PageContainer` avec padding-top pour le header
- **Contenu** : `FinancialInstitutionForm` reçoit l'ID de l'institution

---

## 2. Composant Principal : FinancialInstitutionForm.tsx

**Fichier complet** : `src/components/company/FinancialInstitutionForm.tsx` (912 lignes)

### 📦 Imports principaux

```tsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { EditableField } from '../ui/EditableField';
import { TagInput } from '../ui/TagInput';
import FileUpload from '../ui/FileUpload';
import ProfessionalPDFExtractionButton from '../pdf/ProfessionalPDFExtractionButton';
import { useFinancialInstitution } from '../../hooks/useFinancialInstitution';
import { CompanyLogo } from './CompanyLogo';
import { Edit3, Save, X, Loader2, Building2, Shield, FileText, Handshake, Send } from 'lucide-react';
import {
  FINANCIAL_INSTITUTION_TYPES,
  FINANCIAL_INSTITUTION_SUBTYPES,
  SUPERVISORY_AUTHORITIES,
  CLIENT_SEGMENTS,
  LEGAL_STATUSES,
  PARTNERSHIP_MOTIVATIONS,
  CURRENCIES,
} from '../../constants/financialInstitutionOptions';
```

### 🔷 Interface Props

```tsx
interface FinancialInstitutionFormProps {
  financialInstitutionId?: string;
}
```

### 📊 État du formulaire (formData)

```tsx
const [formData, setFormData] = useState({
  // Identification institutionnelle
  denominationSociale: '',
  sigle: '',
  typeInstitution: '',
  sousCategorie: '',
  dateCreation: '',
  paysOrigine: 'RDC',
  statutJuridique: '',
  
  // Informations réglementaires
  autoritéSupervision: '',
  numeroAgrement: '',
  dateAgrement: '',
  validiteAgrement: '',
  numeroRCCM: '',
  numeroNIF: '',
  
  // Activités autorisées
  activitesAutorisees: [] as string[],
  
  // Informations opérationnelles
  siegeSocial: '',
  nombreAgences: 0,
  villesProvincesCouvertes: [] as string[],
  presenceInternationale: false,
  
  // Capacités financières
  capitalSocialMinimum: '',
  capitalSocialActuel: '',
  fondsPropresMontant: '',
  totalBilan: '',
  chiffreAffairesAnnuel: '',
  devise: 'USD' as 'USD' | 'CDF' | 'EUR',
  
  // Clientèle et marché
  segmentClientelePrincipal: '',
  nombreClientsActifs: 0,
  portefeuilleCredit: '',
  depotsCollectes: '',
  
  // Services offerts à Wanzo
  servicesCredit: [] as string[],
  servicesInvestissement: [] as string[],
  servicesGarantie: [] as string[],
  servicesTransactionnels: [] as string[],
  servicesConseil: [] as string[],
  
  // Partenariat Wanzo
  motivationPrincipale: '',
  servicesPrioritaires: [] as string[],
  segmentsClienteleCibles: [] as string[],
  volumeAffairesEnvisage: '',
  
  // Conditions commerciales
  grillesTarifaires: '',
  conditionsPreferentielles: '',
  delaisTraitement: '',
  criteresEligibilite: '',
  
  // Capacité d'engagement
  montantMaximumDossier: '',
  enveloppeGlobale: '',
  secteursActivitePrivilegies: [] as string[],
  zonesGeographiquesPrioritaires: [] as string[],
  
  // Documents
  documentsLegaux: [] as any[],
  documentsFinanciers: [] as any[],
  documentsOperationnels: [] as any[],
  documentsCompliance: [] as any[],
});
```

### 📌 États additionnels

```tsx
const { institution, updateInstitutionData, loading } = useFinancialInstitution(financialInstitutionId || 'inst-001');
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 🎨 Onglets du formulaire

```tsx
<Tabs defaultValue="general">
  <TabsList className="mb-8">
    <TabsTrigger value="general">Général</TabsTrigger>
    <TabsTrigger value="reglementaire">Réglementaire</TabsTrigger>
    <TabsTrigger value="operationnel">Opérationnel</TabsTrigger>
    <TabsTrigger value="financier">Financier</TabsTrigger>
    <TabsTrigger value="partenariat">Partenariat Wanzo</TabsTrigger>
    <TabsTrigger value="commercial">Commercial</TabsTrigger>
  </TabsList>
</Tabs>
```

### 🔘 Actions principales

| Action | Fonction | Effet |
|--------|----------|-------|
| **Éditer** | `handleStartEditing()` | Passe en mode édition |
| **Annuler** | `handleCancelEditing()` | Restaure les données originales, sort du mode édition |
| **Sauvegarder** | `handleSaveProfile()` | Sauvegarde les modifications via `updateInstitutionData()` |
| **Soumettre** | `handleSubmitProfile()` | Soumet pour validation Wanzo |

### 🧩 Composants enfants utilisés

- `Tabs / TabsList / TabsTrigger / TabsContent` - Navigation par onglets
- `EditableField` - Champ éditable avec mode lecture/édition
- `TagInput` - Saisie de tags/étiquettes
- `FileUpload` - Upload de fichiers (documents légaux, financiers, etc.)
- `ProfessionalPDFExtractionButton` - Extraction de données depuis PDF
- `CompanyLogo` - Logo/image de l'institution

### 🔗 Hooks utilisés

| Hook | Source | Usage |
|------|--------|-------|
| `useFinancialInstitution(institutionId)` | `src/hooks/useFinancialInstitution.ts` | Récupère/met à jour les données institution |
| `useState` | React | État local du formulaire |
| `useEffect` | React | Synchronisation avec les données institution |

---

## 3. Accès à la page

### Via le dropdown du header

**Fichier** : `src/components/layout/Header.tsx` (lignes 261-264)

```tsx
<Link to="/financial-institution" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
  <Landmark className="w-4 h-4 mr-3 text-gray-400" />
  Votre institution
</Link>
```

**Visibilité conditionnelle** :
- Visible seulement si `user?.financialInstitutionId` existe

### Route protégée

**Fichier** : `src/routes/index.tsx` (lignes 61-62)

```tsx
<Route path="/financial-institution" element={<ProtectedRoute><FinancialInstitutionPage /></ProtectedRoute>} />
<Route path="/financial-institution/:institutionId" element={<ProtectedRoute><FinancialInstitutionPage /></ProtectedRoute>} />
```

---

## 4. Sections du formulaire

### 1️⃣ Section Générale (onglet "general")

**Contient** :
- Dénomination sociale
- Sigle
- Type d'institution
- Sous-catégorie
- Date de création
- Pays d'origine
- Statut juridique

### 2️⃣ Section Réglementaire (onglet "reglementaire")

**Contient** :
- Autorité de supervision
- Numéro d'agrément
- Date d'agrément
- Validité d'agrément
- Numéro RCCM
- Numéro NIF (Numéro d'Identification Fiscal)

### 3️⃣ Section Opérationnelle (onglet "operationnel")

**Contient** :
- Siège social
- Nombre d'agences
- Villes/provinces couvertes
- Présence internationale
- Activités autorisées

### 4️⃣ Section Financière (onglet "financier")

**Contient** :
- Capital social minimum
- Capital social actuel
- Fonds propres
- Total du bilan
- Chiffre d'affaires annuel
- Devise

### 5️⃣ Section Partenariat Wanzo (onglet "partenariat")

**Contient** :
- Motivation principale du partenariat
- Services prioritaires pour Wanzo
- Segments de clientèle cibles
- Volume d'affaires envisagé
- Services disponibles (crédit, investissement, garantie, transactionnel, conseil)

### 6️⃣ Section Commercial (onglet "commercial")

**Contient** :
- Grilles tarifaires
- Conditions préférentielles
- Délais de traitement
- Critères d'éligibilité
- Montant maximum par dossier
- Enveloppe globale
- Secteurs d'activité privilégiés
- Zones géographiques prioritaires

---

## 5. Flux d'utilisation complet

```
Utilisateur institution financière clique sur "Votre institution" dans le dropdown
  ↓
Navigation vers /financial-institution ou /financial-institution/:institutionId
  ↓
ProtectedRoute vérifie l'authentification
  ↓
FinancialInstitution.tsx charge
  ↓
FinancialInstitutionForm reçoit l'ID d'institution
  ↓
useFinancialInstitution() récupère les données institution
  ↓
FormData se remplit depuis institution (useEffect)
  ↓
Affichage des 6 onglets du formulaire
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
updateInstitutionData(formData) lance l'appel API
  ↓
Données sauvegardées/soumises pour validation
```

---

## 6. Constantes utilisées

**Source** : `src/constants/financialInstitutionOptions.ts`

| Constante | Type | Description |
|-----------|------|-------------|
| `FINANCIAL_INSTITUTION_TYPES` | Array | Types d'institution (banque, assurance, microfinance, etc.) |
| `FINANCIAL_INSTITUTION_SUBTYPES` | Array | Sous-catégories d'institution |
| `SUPERVISORY_AUTHORITIES` | Array | Autorités de supervision (BCC, CNSS, etc.) |
| `CLIENT_SEGMENTS` | Array | Segments de clientèle |
| `LEGAL_STATUSES` | Array | Statuts juridiques |
| `PARTNERSHIP_MOTIVATIONS` | Array | Motivations de partenariat |
| `CURRENCIES` | Array | Devises (USD, CDF, EUR) |

---

## 7. Synchronisation avec la page Company

**Important** : La page Company (BusinessProfile.tsx) contient un onglet "Institution Financière" qui redirige vers FinancialInstitutionPage si `user.financialInstitutionId` existe.

```
BusinessProfile.tsx (route /company)
  ├── Onglet "PME / Entreprise"
  │   └── EnterpriseIdentificationForm
  └── Onglet "Institution Financière" (si user.financialInstitutionId)
      └── FinancialInstitutionPage
          └── FinancialInstitutionForm
```

---

## 8. Points clés de la page

✅ **Validation** : Champs requis marqués avec asterisque (*)  
✅ **Mode édition** : Bascule lisible/éditable  
✅ **Sauvegarde** : "Sauvegarder" (brouillon) vs "Soumettre" (validation)  
✅ **Responsive** : Design mobile-first avec breakpoints  
✅ **Upload fichiers** : Documents légaux, financiers, opérationnels, compliance  
✅ **Onglets** : 6 sections pour une meilleure organisation  
✅ **Hooks personnalisés** : useFinancialInstitution() pour la gestion des données

---

## 9. Interactions avec les données Wanzo

Le formulaire collecte des informations essentielles pour :

1. **Validation de partenariat** : Vérification des agrégations et régularisation
2. **Évaluation financière** : Analyse des capacités financières
3. **Dimensionnement des services** : Détermination des montants maximums et enveloppe globale
4. **Alignement commercial** : Compréhension des attentes de l'institution
5. **Gestion des risques** : Évaluation de la conformité réglementaire

---

## 10. Différences avec la page Company

| Aspect | Company | Financial Institution |
|--------|---------|----------------------|
| **Onglets** | 6 onglets | 6 onglets |
| **Focus principal** | Identification entreprise | Partenariat & capacités |
| **Documents** | Documents métier, patrimoine | Documents légaux, financiers, compliance |
| **Types de données** | Secteurs, activités, patrimoine | Services financiers, régulation |
| **Visible si** | Aucune condition | `user.financialInstitutionId` existe |
| **Accès** | Route `/company` | Route `/financial-institution` |

---

## 11. Améliorations possibles

- ⏱️ Validation progressive des champs
- 💾 Sauvegarde automatique (autosave)
- 📝 Historique des modifications
- 📊 Tableau de bord avec metrics financières
- 🔄 Synchronisation avec les systèmes externes (BCC, CNSS)
- 📧 Notifications de validation aux administrateurs Wanzo
