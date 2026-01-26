# Configuration Production - Wanzo Portfolio

## Vue d'ensemble

Ce document décrit les modifications apportées pour préparer l'application à la production.

## 1. Configuration d'environnement centralisée

### Fichier: `src/config/environment.ts`

Nouvelle configuration centralisée qui gère:
- `isProduction`: Détermine si l'app est en mode production
- `isDevelopment`: Détermine si l'app est en mode développement
- `allowMockData`: Autorise les données mock (DEV uniquement)
- `allowOfflineFallback`: Autorise le fallback localStorage
- `enableDetailedLogging`: Active les logs détaillés

### Variables d'environnement supportées:
```env
VITE_PRODUCTION_MODE=true|false
VITE_ALLOW_MOCKS=true|false
VITE_ALLOW_OFFLINE_FALLBACK=true|false
VITE_ENABLE_LOGGING=true|false
```

## 2. Gestion des erreurs centralisée

### Fichier: `src/services/api/productionErrorHandler.ts`

Nouveau service de gestion d'erreurs avec:
- Parsing automatique des erreurs (réseau, API, validation, etc.)
- Notifications toast automatiques via `react-hot-toast`
- Support pour les opérations avec retry
- Log d'erreurs pour le debugging

### Utilisation:
```typescript
import { productionErrorHandler } from '../services/api/productionErrorHandler';

// Gestion d'erreur simple
productionErrorHandler.handleError(error);

// Avec options
productionErrorHandler.handleError(error, {
  showNotification: true,
  duration: 5000
});

// Wrapper API avec toast loading
const result = await productionErrorHandler.wrapApiCall(
  () => api.getData(),
  {
    showLoadingToast: true,
    loadingMessage: 'Chargement...',
    successMessage: 'Données chargées'
  }
);
```

## 3. Services de stockage adaptés pour la production

Tous les services de stockage ont été modifiés pour:
- **Ne jamais initialiser de mocks en production**
- Utiliser des imports dynamiques pour les mocks (tree-shaking)
- Ajouter des logs `[PROD]` ou `[DEV]` pour le debugging

### Services modifiés:
- `src/services/storage/mockDataInitializer.ts`
- `src/services/storage/companyStorage.ts`
- `src/services/storage/creditRequestsStorage.ts`
- `src/services/storage/creditContractsStorage.ts`
- `src/services/storage/guaranteeStorage.ts`
- `src/services/storage/centraleRisqueStorage.ts`
- `src/services/guaranteeService.ts`

## 4. SyncManager IndexedDB complété

### Fichier: `src/services/storage/indexedDB/syncManager.ts`

Le SyncManager a été complété avec:
- Handlers réels pour tous les stores (portfolios, credit-requests, credit-contracts, guarantees)
- Appels API en production
- Notifications toast pour les événements online/offline
- Gestion des erreurs avec productionErrorHandler

### Événements gérés:
- `online`: Notification + synchronisation automatique
- `offline`: Notification d'avertissement
- Sync réussie: Notification de succès
- Sync échouée après 3 tentatives: Notification d'abandon

## 5. Configuration React Query

### Fichier: `src/services/api/reactQueryConfig.ts`

Améliorations:
- Gestion d'erreurs globale pour les mutations
- Notifications toast automatiques via productionErrorHandler
- Retry intelligent avec backoff exponentiel
- Gestion du rate limiting (429)

## 6. Hook useNetworkStatus existant

Le hook `src/hooks/useNetworkStatus.ts` existait déjà et fournit:
- Statut de connexion en temps réel
- Informations de qualité réseau
- Helpers pour chargement conditionnel

## 7. Comportement en Production vs Développement

### En Production (isProduction = true):
- ❌ Pas de données mock
- ✅ Toutes les données viennent du backend
- ✅ Toast notifications pour les erreurs
- ✅ Sync automatique avec IndexedDB
- ❌ Les fonctions `resetToMockData()` sont no-op

### En Développement (isDevelopment = true):
- ✅ Données mock initialisées si disponibles
- ✅ localStorage peut être utilisé comme fallback
- ✅ Logs détaillés dans la console
- ✅ `resetToMockData()` fonctionnel

## 8. Checklist de déploiement

Avant de déployer en production, vérifiez:

- [ ] Variables d'environnement configurées sur le serveur
- [ ] `VITE_PRODUCTION_MODE=true`
- [ ] `VITE_API_URL` pointe vers le backend de production
- [ ] `VITE_GATEWAY_URL` pointe vers le gateway de production
- [ ] Auth0 configuré pour le domaine de production
- [ ] CORS configuré sur le backend pour le domaine frontend
- [ ] IndexedDB fonctionne dans tous les navigateurs cibles

## 9. Tests recommandés

1. **Test offline**: 
   - Couper le réseau
   - Vérifier la notification "Connexion perdue"
   - Reconnecter et vérifier "Connexion rétablie"

2. **Test d'erreur API**:
   - Forcer une erreur 500
   - Vérifier que le toast d'erreur s'affiche

3. **Test de création**:
   - Créer un portefeuille
   - Vérifier qu'il persiste après refresh

4. **Test de synchronisation**:
   - Faire des modifications offline
   - Reconnecter et vérifier la sync
