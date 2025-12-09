# 📋 Plan d'Architecture : Modal Entreprise → Page Détail Complète

## 🎯 Situation Actuelle

### Problème
- Quand on clique sur une entreprise (prospection, centrale risque, demandes credit), un **modal bizarre** s'affiche
- Ce modal (`CompanyDetails.tsx`) est un composant modal overlay fixe
- La structure d'affichage n'est pas cohérente avec la structure d'introduction des données

### Solution
Créer une **page de consultation complète** (read-only) qui :
1. **Respecte la même structure** que le formulaire d'introduction (`EnterpriseIdentificationForm.tsx`)
2. **Utilise des tableaux** pour les données composées (actifs, stock, personnes)
3. **N'est jamais éditable** lors de la consultation
4. **Est réutilisable** depuis n'importe quel point de l'app

---

## 📦 Composants Créés

### 1. Page de Consultation : `CompanyViewPage.tsx`
**Localisation** : `src/pages/CompanyViewPage.tsx`

**Structure** :
```
CompanyViewPage
├── Header (nom, secteur, boutons)
├── Tabs
│   ├── "Général" - Identification de base, contacts, métriques
│   ├── "Patrimoine" - Actifs, stocks
│   ├── "Structure" - Dirigeants, employés, actionnaires
│   ├── "Finance & Juridique" - Données légales
│   ├── "Localisation" - Sièges sociaux, unités, points de vente
│   └── "Présentation" - Pitch, proposition de valeur
└── Composants d'affichage
    ├── InfoDisplay - affiche label + valeur
    ├── AssetTableDisplay - tableau actifs (mode read-only)
    ├── StockTableDisplay - tableau stocks (mode read-only)
    └── PeopleTableDisplay - tableau personnes (mode read-only)
```

### 2. Tableaux Réutilisables

#### `AssetTable.tsx`
**Usage** : Affiche les immobilisations, véhicules, équipements  
**Props** :
- `assets: AssetData[]`
- `editable?: boolean` (pour mode édition futur)
- `compact?: boolean` (vue résumée vs complète)

**Colonnes affichées** :
- Désignation (+ marque/modèle)
- Type (immobilier, véhicule, équipement)
- Valeur actuelle (+ devise)
- État (avec code couleur)
- Propriétaire
- Observations

#### `StockTable.tsx`
**Usage** : Affiche les stocks et inventaire  
**Props** :
- `stocks: StockData[]`
- `editable?: boolean`
- `compact?: boolean`

**Colonnes affichées** :
- Désignation (+ code article)
- Catégorie
- Quantité (+ unité)
- Valeur totale (+ devise)
- État (excellent/bon/moyen/détérioré/périmé)
- Fournisseur principal
- Observations

#### `PeopleTable.tsx`
**Usage** : Affiche dirigeants, employés, actionnaires  
**Props** :
- `people: PersonData[]`
- `title?: string`
- `editable?: boolean`
- `compact?: boolean`

**Colonnes affichées** :
- Nom complet (+ nationalité)
- Fonction (+ date de nomination)
- Email (avec lien)
- Téléphone (avec lien)
- Actions (% d'actions pour actionnaires)

### 3. Composants UI Élémentaires (Partiellement créés)

| Composant | Fichier | Status | Usage |
|-----------|---------|--------|-------|
| `EditableField` | `ui/EditableField.tsx` | ✅ Créé | Champ texte mode lecture/édition |
| `LocationPicker` | `ui/LocationPicker.tsx` | ✅ Créé | Géolocalisation (latitude/longitude) |
| `SocialLinksInput` | `ui/SocialLinksInput.tsx` | ✅ Créé | Gestion réseaux sociaux |
| `MultiLocationPicker` | `ui/MultiLocationPicker.tsx` | 🔄 À créer | Multiples positions (siège, unités, etc) |
| `PitchSection` | `ui/PitchSection.tsx` | 🔄 À créer | Elevator pitch + proposition valeur |
| `PersonInput` | `ui/PersonInput.tsx` | 🔄 À créer | Formulaire saisie personne |
| `AssetInput` | `ui/AssetInput.tsx` | 🔄 À créer | Formulaire saisie actif |
| `StockInput` | `ui/StockInput.tsx` | 🔄 À créer | Formulaire saisie stock |
| `FinancialInput` | `ui/FinancialInput.tsx` | 🔄 À créer | Formulaire saisie données financières |
| `ProfessionalPDFExtractionButton` | `pdf/ProfessionalPDFExtractionButton.tsx` | 🔄 À créer | Extraction données depuis PDF |

---

## 🔄 Architecture des Données

### Modèle Company (existant)
```typescript
interface Company {
  id: string;
  name: string;
  sector: string;
  size: 'small' | 'medium' | 'large';
  status: 'active' | 'inactive' | 'qualified';
  annual_revenue: number;
  employee_count: number;
  financial_metrics: {
    credit_score: number;
    financial_rating: 'A' | 'B' | 'C' | 'D';
    revenue_growth: number;
    // ... autres champs
  };
  // ... autres champs
}
```

### Modèles Étendus (à créer dans types/company.ts)
```typescript
interface AssetData { /* ... */ }
interface StockData { /* ... */ }
interface PersonData { /* ... */ }
interface CompanyExtended extends Company {
  // Données d'introduction par l'entreprise
  assets: AssetData[];
  stocks: StockData[];
  people: PersonData[];
  pitch: PitchData;
  locations: Coordinates[];
  // ... etc
}
```

---

## 🛣️ Flux de Navigation

### Scénario 1 : Depuis une liste de demandes de crédit
```
TraditionalPortfolioDetails.tsx
  ↓ onClick sur nom du client (colonne)
  ↓ handleViewCompany(clientId)
  ↓ navigate(`/company/${clientId}/view`)
  ↓
CompanyViewPage.tsx (read-only)
```

### Scénario 2 : Depuis la prospection
```
ProspectionPage.tsx
  ↓ onClick sur CompanyCard
  ↓ onViewDetails(company)
  ↓ navigate(`/company/${company.id}/view`)
  ↓
CompanyViewPage.tsx (read-only)
```

### Scénario 3 : Depuis la centrale de risque
```
CentraleRisquePage.tsx
  ↓ onClick sur entreprise
  ↓ navigate(`/company/${companyId}/view`)
  ↓
CompanyViewPage.tsx (read-only)
```

---

## 📝 Fichiers à Modifier

### Routes
**Fichier** : `src/routes/index.tsx`

Ajouter :
```tsx
<Route 
  path="/company/:companyId/view" 
  element={<ProtectedRoute><CompanyViewPage /></ProtectedRoute>} 
/>

<Route 
  path="/company/:companyId/edit" 
  element={<ProtectedRoute><CompanyEditPage /></ProtectedRoute>} 
/>
```

### Composants appelant le modal

| Fichier | Changement |
|---------|-----------|
| `TraditionalPortfolioDetails.tsx` | Remplacer `handleViewCompany` → `navigate` |
| `CreditRequestsTable.tsx` | Remplacer `onViewCompany` → `navigate` |
| `CompanyCard.tsx` | Remplacer `onViewDetails` → `navigate` |
| `ProspectionPage.tsx` | Remplacer modal → `navigate` |
| `CentraleRisquePage.tsx` | Remplacer modal → `navigate` |

---

## 🎨 Principes de Conception

### 1. Mode Lecture (Read-Only)
- Les tableaux affichent les données comme introduites
- Pas de champs éditables
- Bouton "Éditer" si autorisation

### 2. Réutilisabilité
- `CompanyViewPage` peut être appelée depuis n'importe où
- Les tableaux (`AssetTable`, `StockTable`, `PeopleTable`) peuvent être utilisés dans d'autres contextes
- Les composants UI élémentaires doivent fonctionner en mode `isEditing=false`

### 3. Cohérence Visuelle
- Mêmes sections que le formulaire d'introduction
- Même ordre des onglets
- Tableaux formatés uniformément

### 4. Performance
- Tableaux avec `compact={true}` pour listes récapitulatives
- Tableaux complets dans `CompanyViewPage`

---

## ✅ Checklist de Mise en Œuvre

- [ ] Créer les 5 composants UI manquants (MultiLocationPicker, PitchSection, etc.)
- [ ] Créer `CompanyEditPage.tsx` (version éditable du formulaire)
- [ ] Créer hook `useCompanyData()` pour récupérer depuis API/localStorage
- [ ] Ajouter routes `/company/:id/view` et `/company/:id/edit`
- [ ] Remplacer modal dans `TraditionalPortfolioDetails.tsx`
- [ ] Remplacer modal dans `CreditRequestsTable.tsx`
- [ ] Remplacer modal dans `CompanyCard.tsx`
- [ ] Remplacer modal en Prospection
- [ ] Remplacer modal en Centrale de Risque
- [ ] Tests d'affichage des tableaux (actifs, stocks, personnes)
- [ ] Tests de navigation depuis différents contextes

---

## 🔗 Références Documentation

- Structure d'introduction : `DOCUMENTATION_PROFILS/11-BUSINESS_PROFILE_COMPANY.md`
- Types de données : `src/types/company.ts`
- Composants existants : `src/components/ui/`, `src/components/company/`
- Hooks existants : `src/hooks/useCompaniesData.ts`

