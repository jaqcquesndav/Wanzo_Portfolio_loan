# Rapport d'Audit — Dead Code & Code Orphelin

> **Date** : Juillet 2025  
> **Scope** : `src/` – Wanzo Portfolio Loan Frontend  
> **Méthodologie** : Retrace depuis `App.tsx → optimizedRouter → suspenseComponents` + grep des imports

---

## 1. Résumé Exécutif

L'application utilise **`optimizedRouter`** (importé dans `App.tsx`). Quatre fichiers de routeur alternatifs créés au cours du développement ne sont **jamais importés en production** et constituent du dead code pur. Plusieurs composants de page et de présentation partagent le même sort.

| Catégorie | Fichiers identifiés | Sévérité |
|-----------|---------------------|----------|
| Fichiers routeur morts | 4 | 🔴 Critique |
| Routes hardcodées | 1 | 🔴 Critique |
| Routes dupliquées / mock | 2 | 🟠 Élevé |
| Page mockée (`TraditionalPortfolioView`) | 1 | 🟠 Élevé |
| Composants de contrat non câblés | 3 | 🟡 Moyen |
| Composants UI dupliqués ou orphelins | 4 | 🟡 Moyen |
| Route debug exposée en prod | 1 | 🔴 Sécurité |

---

## 2. Fichiers Routeur Morts (non utilisés par App.tsx)

`App.tsx` importe uniquement `optimizedRouter` depuis `./routes/optimizedRouter`. Les fichiers suivants créent des routeurs alternatifs qui ne sont jamais utilisés :

| Fichier | Export | Statut |
|---------|--------|--------|
| `src/routes/index.tsx` | `router` | ❌ Dead — jamais importé |
| `src/routes/lazyRouter.tsx` | `lazyRouter` | ❌ Dead — jamais importé |
| `src/routes/lazyRoutes.tsx` | lazy components | ❌ Dead — uniquement utilisé par `lazyRouter.tsx` (mort) |
| `src/routes/createLazyRouter.tsx` | `createLazyRouter()` | ❌ Dead — jamais importé |

> ⚠️ `src/routes/suspenseComponents.tsx` est **actif** — importé par `optimizedRouter.tsx`.

**Action recommandée** : Supprimer les 4 fichiers. Puis supprimer `src/routes/index.tsx` *après* avoir vérifié qu'aucun chemin d'import non détecté ne le référence.

---

## 3. Routes Problématiques dans `optimizedRouter.tsx`

### 3.1 Route hardcodée avec IDs de test 🔴

```tsx
{ path: 'traditional/trad-1/guarantees/G001', element: <GuaranteeDetails /> }
```

**Problème** : Artefact de développement avec un ID de portefeuille (`trad-1`) et un ID de garantie (`G001`) codés en dur. Cette route ne correspond à aucun cas d'usage réel.  
**Action** : Supprimer.

### 3.2 Routes `TraditionalPortfolioView` avec données mockées 🟠

```tsx
{ path: 'traditional/view/:id', element: <TraditionalPortfolioView /> },
{ path: 'traditional/:id/view', element: <TraditionalPortfolioView /> },
```

**Problème** : `TraditionalPortfolioView` utilise un `setTimeout` de 500 ms pour simuler des données avec des **valeurs hardcodées** (`pendingRequests: 12, activeContracts: 45`). Aucune navigation réelle dans l'application ne mène à ces routes — le module Prospection navigue vers `company/:id/view` et les portfolios vers `traditional/:id` (qui pointe sur `TraditionalPortfolioDetails`, le vrai composant).  
**Action** : Supprimer les deux routes + supprimer `src/pages/TraditionalPortfolioView.tsx`.

### 3.3 Route `/auth/debug` exposée en production 🔴 Sécurité

```tsx
{ path: '/auth/debug', element: <components.AuthDebug /> }
```

**Problème** : Page de debug Auth0 accessible en production. Expose potentiellement des informations sur la configuration de l'authentification.  
**Action** : Conditionner via `import.meta.env.DEV` ou supprimer si la page n'est plus nécessaire.

---

## 4. Composants de Contrat Non Câblés

Ces trois composants existent dans `src/components/portfolio/traditional/contract/` mais ne sont **pas inclus dans les onglets de `ContractDetailsResponsive.tsx`** (qui n'affiche que 3 onglets : informations générales, échéancier, documents) :

| Fichier | Statut | Note |
|---------|--------|------|
| `ContractGuarantees.tsx` | 🟡 Orphelin | Composant complet non inclus dans un onglet |
| `ContractRepayments.tsx` | 🟡 Orphelin | Idem |
| `ContractRiskAnalysis.tsx` | 🟡 Orphelin | Idem — utilise des données simulées (Math.random()) |

**Recommandation** : Soit les ajouter comme onglets dans `ContractDetailsResponsive` (onglets **Garanties**, **Remboursements**, **Analyse de risque**), soit les supprimer si l'implémentation est abandonnée.

> ⚠️ `ContractRiskAnalysis` utilise `Math.random()` pour générer le score de crédit et le ratio d'endettement — le brancher sur des vraies données avant de l'activer.

---

## 5. Composants UI Dupliqués ou Orphelins

### 5.1 `EnhancedRepaymentsTable.tsx` — Jamais importé 🟡

```
src/components/portfolio/traditional/EnhancedRepaymentsTable.tsx
```

Aucun fichier dans `src/` n'importe `EnhancedRepaymentsTable`. L'onglet **Remboursements** utilise `RepaymentsTable` (via `portfolioTypes.ts`).  
**Action** : Supprimer (ou remplacer `RepaymentsTable` par cette version améliorée si c'est l'intention).

### 5.2 `ProductList.tsx` — Jamais importé 🟡

```
src/components/portfolio/traditional/ProductList.tsx
```

Aucun import trouvé. `FinancialProductsList.tsx` est le composant actif utilisé dans `PortfolioSettingsDisplay`.  
**Action** : Supprimer.

### 5.3 `TempContractDocuments.tsx` — Artefact temporaire 🟡

```
src/components/portfolio/traditional/TempContractDocuments.tsx
```

Le préfixe `Temp` indique un artefact de développement. À vérifier et supprimer si remplacé.

### 5.4 `ProductForm.tsx` vs `FinancialProductForm.tsx` 🟡

| Composant | Utilisé par |
|-----------|-------------|
| `ProductForm.tsx` | `TraditionalPortfolioDetails.tsx` (modal) |
| `FinancialProductForm.tsx` | `FinancialProductDetails.tsx` |

Ces deux formulaires coexistent. Il faudrait vérifier si les deux sont maintenus ou si `ProductForm` peut être remplacé par `FinancialProductForm`.

---

## 6. Anomalie Fonctionnelle Critique — Stockage Local pour les Mises à Jour de Contrat

**Fichier** : `src/pages/CreditContractDetail.tsx`

La page de détail d'un contrat utilise `creditContractsStorageService` (localStorage) pour les mises à jour, au lieu d'appeler l'API réelle.

```tsx
// Dans CreditContractDetail.tsx
import { creditContractsStorageService } from '../services/storage/creditContractsStorage';
```

**Impact** : Les actions sur les contrats (statut, notes) provenant de l'interface `ContractDetailsResponsive` ne se propagent pas au backend. Les données affichées peuvent diverger de l'état réel.

> Note : `creditContractApi.ts` dispose d'un mécanisme de **fallback localStorage** — si l'API est disponible, l'appel API se fait en premier. Mais `creditContractsStorageService` utilisé **directement** dans la page bypasse ce mécanisme.

**Action** : Remplacer l'utilisation directe de `creditContractsStorageService` par des appels à `creditContractApi` dans `CreditContractDetail.tsx`.

---

## 7. Import Commenté (`HistoryTimeline`)

**Fichier** : `src/pages/CreditRequestDetails.tsx`

```tsx
// import { HistoryTimeline } from '../components/common/HistoryTimeline';
```

L'historique des transitions de statut est importé mais commenté. La page n'affiche pas l'historique des actions sur la demande.  
**Action** : Réactiver ou supprimer. L'historique est très utile pour l'audit du cycle de crédit.

---

## 8. Ce qui N'est PAS du Dead Code (Confusion Possible)

Pour éviter des suppressions erronées, ces éléments ressemblent à du dead code mais sont actifs :

| Fichier | Pourquoi il semble mort | Pourquoi il est actif |
|---------|------------------------|----------------------|
| `src/routes/suspenseComponents.tsx` | Pas de `router` export | Importé par `optimizedRouter.tsx` comme `* as components` |
| `RepaymentsTable.tsx` | `EnhancedRepaymentsTable` existe | Utilisé via `portfolioTypes.ts` |
| `FinancialProductForm.tsx` | `ProductForm.tsx` existe | Utilisé via `FinancialProductDetails.tsx` |
| `src/data/mockCentraleRisque.ts` | Semble mock | Utilisé par `useCentraleRisqueApi.ts` en fallback |

---

## 9. Récapitulatif des Actions Prioritaires

| # | Action | Fichier(s) | Priorité |
|---|--------|-----------|----------|
| 1 | Supprimer routeurs morts | `index.tsx`, `lazyRouter.tsx`, `lazyRoutes.tsx`, `createLazyRouter.tsx` | 🔴 Haute |
| 2 | Protéger `/auth/debug` en production | `optimizedRouter.tsx` | 🔴 Sécurité |
| 3 | Supprimer route hardcodée test | `optimizedRouter.tsx` ligne ~97 | 🔴 Haute |
| 4 | Supprimer `TraditionalPortfolioView` + 2 routes | `optimizedRouter.tsx` + page | 🟠 Moyenne |
| 5 | Corriger `CreditContractDetail` → utiliser `creditContractApi` | `CreditContractDetail.tsx` | 🟠 Fonctionnelle critique |
| 6 | Câbler ou supprimer 3 composants contrat orphelins | `ContractGuarantees/Repayments/RiskAnalysis` | 🟡 À décider |
| 7 | Supprimer composants dupliqués | `EnhancedRepaymentsTable`, `ProductList`, `TempContractDocuments` | 🟡 Basse |
| 8 | Réactiver `HistoryTimeline` dans `CreditRequestDetails` | Commentaires ligne ~5 | 🟡 UX |
