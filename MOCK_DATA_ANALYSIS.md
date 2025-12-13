# 🔍 Analyse Complète des Mock Data - Problèmes Identifiés

## 🚨 Problèmes Détectés

### 1. **Mock Data Incomplets pour Credit Requests**

#### Données Actuelles (mockCreditRequests.ts)
- ✅ **Total de demandes** : 5 seulement
- ⚠️ **Status distribution** :
  - `pending`: 2 demandes (req-001, req-005)
  - `analysis`: 1 demande (req-002)
  - `approved`: 1 demande (req-003) ✓
  - `rejected`: 1 demande (req-004)
  - `disbursed`: 0 demande ❌

#### Problème
```typescript
export const mockCreditContracts: CreditContract[] = mockCreditRequests
  .filter(request => request.status === 'approved' || request.status === 'disbursed')
  //                                                      ^^^^^^^^^ AUCUNE DONNÉE!
  .map((request, index) => {
```

**Impact** : Seulement 1 contrat généré au lieu d'avoir au moins 10-15 contrats actifs

### 2. **Mapping Members ↔ Companies Incomplet**

#### Mock Members (mockMembers.ts)
- Total: 21 membres (mem-001 à mem-019 + grp-001, grp-002)

#### Mock Company Registry (mockCompanyDetails.ts)
- **Mappés**: 13 membres seulement (mem-001 à mem-013)
- **Non mappés**: 8 membres (mem-014 à mem-019, grp-001, grp-002) ❌

```typescript
export const mockCompanyRegistry: Record<string, any> = {
  'mem-001': techinnovate,
  // ...
  'mem-013': agritech,
  // ❌ mem-014 à mem-019 manquants!
  // ❌ grp-001, grp-002 manquants!
};
```

**Impact** : Erreur 404 quand on clique sur les entreprises mem-014+

### 3. **Profils Company Incomplets**

Les données mockées legacy ne contiennent pas tous les champs du type `Company`:
- ❌ `assets[]` (immobilisations)
- ❌ `stocks[]` (inventaire)
- ❌ `payment_info.bankAccounts[]`
- ❌ `payment_info.mobileMoneyAccounts[]`
- ⚠️ `contactPersons[]` (mapping partiel depuis leadership_team)

### 4. **Routes Potentiellement Problématiques**

Les routes pour demandes/contrats peuvent avoir des problèmes de résolution:

```tsx
// ❌ Pas de route explicite pour:
/app/traditional/:portfolioId/requests/:requestId
/app/traditional/:portfolioId/contracts/:contractId
```

Actuellement les routes existent mais peuvent ne pas correspondre aux liens générés.

---

## 🔧 Solutions à Implémenter

### Solution 1: Enrichir mockCreditRequests.ts

Ajouter au moins 10 demandes supplémentaires avec statuts variés:

```typescript
// Ajouter req-006 à req-015
{
  id: 'req-006',
  memberId: 'mem-005', // Agriculteur 1
  productId: 'prod-002',
  status: 'disbursed', // ← Pour créer des contrats
  // ...
},
{
  id: 'req-007',
  memberId: 'mem-006',
  productId: 'prod-001',
  status: 'approved', // ← Pour créer des contrats
  // ...
},
// ... continuer jusqu'à req-015
```

### Solution 2: Compléter mockCompanyRegistry.ts

Mapper tous les membres aux entreprises:

```typescript
export const mockCompanyRegistry: Record<string, any> = {
  // ... existant mem-001 à mem-013
  'mem-014': constructionplus,  // Lambda Manufacturing
  'mem-015': agritech,           // Agriculteur 2
  'mem-016': agritech,           // Agriculteur 3
  'mem-017': cleanenergy,        // Transporteur 1
  'mem-018': cleanenergy,        // Transporteur 2
  'mem-019': healthsolutions,    // Transporteur 3
  'grp-001': agritech,           // Coopérative Agricole
  'grp-002': cleanenergy,        // Coopérative Transport
};
```

### Solution 3: Enrichir les Profils Company

Ajouter des données complètes dans les fichiers companies/*.ts:

```typescript
// Dans agritech.ts par exemple
export const agritech = {
  // ... existant
  assets: [
    {
      designation: 'Terrain agricole',
      type: 'immobilier',
      valeurActuelle: 150000,
      etatActuel: 'bon',
      observations: 'Terrain de 5 hectares'
    },
    {
      designation: 'Tracteur John Deere',
      type: 'vehicule',
      valeurActuelle: 45000,
      etatActuel: 'excellent',
      observations: 'Acheté en 2022'
    }
  ],
  stocks: [
    {
      designation: 'Semences de maïs',
      categorie: 'matiere_premiere',
      quantiteStock: 500,
      valeurTotaleStock: 15000,
      etatStock: 'excellent'
    }
  ],
  bankAccounts: [
    {
      accountNumber: '0001234567890',
      accountName: 'AgriTech Solutions Ltd',
      bankName: 'Equity Bank',
      currency: 'USD',
      isPrimary: true,
      swiftCode: 'EQBLCDKI'
    }
  ],
  mobileMoneyAccounts: [
    {
      phoneNumber: '+243999123456',
      accountName: 'AgriTech M-Pesa',
      provider: 'M-Pesa',
      currency: 'USD',
      isPrimary: true
    }
  ]
};
```

### Solution 4: Vérifier les Routes

S'assurer que toutes les routes sont bien définies:

```tsx
// Dans routes/index.tsx
{
  path: 'traditional/:portfolioId/requests/:requestId',
  element: <CreditRequestDetails />,
  errorElement: <PortfolioErrorBoundary />
},
{
  path: 'traditional/:portfolioId/contracts/:contractId',
  element: <CreditContractDetail />,
  errorElement: <PortfolioErrorBoundary />
},
```

---

## 📊 État Actuel vs État Souhaité

| Élément | Actuel | Souhaité | Gap |
|---------|--------|----------|-----|
| **Credit Requests** | 5 | 15-20 | 10-15 manquants |
| **Approved/Disbursed** | 1 | 8-10 | 7-9 manquants |
| **Credit Contracts** | 1 | 8-10 | 7-9 manquants |
| **Members Mappés** | 13/21 | 21/21 | 8 manquants |
| **Company Assets** | 0 | 3-5 par company | 100% manquants |
| **Company Stocks** | 0 | 2-3 par company | 100% manquants |
| **Bank Accounts** | 0 | 1-2 par company | 100% manquants |
| **Mobile Money** | 0 | 1 par company | 100% manquants |

---

## 🎯 Priorités de Correction

### Priorité 1 - CRITIQUE (Fix 404)
1. ✅ Ajouter mappings pour mem-014 à mem-019, grp-001, grp-002
2. ✅ Ajouter 10 credit requests avec statuts approved/disbursed

### Priorité 2 - IMPORTANT (Enrichir données)
3. ✅ Ajouter assets[] pour chaque company
4. ✅ Ajouter stocks[] pour chaque company
5. ✅ Ajouter payment_info (bank + mobile money)

### Priorité 3 - AMÉLIORATION (UX)
6. ⚠️ Enrichir contactPersons[] avec données réelles
7. ⚠️ Ajouter documents[] pour credit requests
8. ⚠️ Ajouter guarantees liées aux contracts

---

## 🚀 Plan d'Action Immédiat

1. **Étendre mockCreditRequests.ts** avec req-006 à req-015
2. **Compléter mockCompanyRegistry** avec tous les membres
3. **Enrichir les fichiers companies/*.ts** avec assets, stocks, payment_info
4. **Tester la navigation** demandes → contrats → company profiles
5. **Vérifier absence de 404** sur tous les liens

---

**Date d'analyse** : 13 décembre 2025  
**Fichiers concernés** :
- `src/data/mockCreditRequests.ts` ⚠️
- `src/data/mockCreditContracts.ts` ⚠️
- `src/data/mockCompanyDetails.ts` ⚠️
- `src/data/companies/*.ts` ⚠️
- `src/routes/index.tsx` ✅ (OK)
