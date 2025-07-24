# Stratégie de gestion du mode hors ligne

Ce document explique l'architecture et l'implémentation du mode hors ligne dans l'application Wanzo Portfolio Institution.

## Architecture globale

L'application utilise une architecture qui permet aux utilisateurs de continuer à travailler même lorsqu'ils sont hors ligne. Voici les principaux composants :

1. **ConnectivityContext** : Gère l'état de connexion et les actions en attente
2. **offlineService** : Utilitaires pour le stockage local et la gestion des actions hors ligne
3. **offlineClient** : Client API avec support du mode hors ligne
4. **useSyncManager** : Hook pour gérer la synchronisation des actions en attente
5. **ConnectivityStatus** : Composant UI pour afficher l'état de connexion

## Fonctionnalités clés

### Détection de l'état de connexion

Le `ConnectivityContext` détecte automatiquement l'état de connexion de l'utilisateur et met à jour l'application en conséquence.

```tsx
// src/contexts/ConnectivityContext.tsx
export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // ...
};
```

### Stockage local des données

L'application utilise le stockage local pour garder une copie des données et permettre leur manipulation hors ligne.

```typescript
// src/services/offlineService.ts
export function getStoredData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des données stockées (${key}):`, error);
    return [];
  }
}
```

### File d'attente des actions

Lorsqu'un utilisateur effectue une action hors ligne, celle-ci est ajoutée à une file d'attente pour être exécutée ultérieurement.

```typescript
// src/contexts/ConnectivityContext.tsx
const addPendingAction = (action: PendingAction) => {
  setPendingActions(prev => [...prev, action]);
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify([...pendingActions, action]));
};
```

### Synchronisation automatique

La synchronisation des actions en attente est déclenchée automatiquement lorsque la connexion est rétablie.

```typescript
// src/hooks/useSyncManager.ts
useEffect(() => {
  if (isOnline && hasPendingActions && !isSyncing) {
    synchronize();
  }
}, [isOnline, hasPendingActions]);
```

### Feedback utilisateur

L'utilisateur est informé de l'état de connexion et des actions en attente grâce au composant `ConnectivityStatus`.

```tsx
// src/components/layout/ConnectivityStatus.tsx
export const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({ minimal = false }) => {
  const { isOnline, hasPendingActions, pendingActions } = useConnectivity();
  
  // Affichage minimal (pour la barre d'état)
  if (minimal) {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs font-medium">
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
        {hasPendingActions && (
          <button
            onClick={() => synchronize()}
            disabled={!isOnline || isSync7ing}
            className="text-xs text-blue-500 hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            {isSync7ing ? 'Synchronisation...' : `Synchroniser (${pendingActionsCount})`}
          </button>
        )}
      </div>
    );
  }
  
  // ...
};
```

## Utilisation dans les services

Pour utiliser le mode hors ligne dans un service, il suffit d'utiliser le client API avec support du mode hors ligne :

```typescript
// src/services/portfolio/portfolioService.ts
export const portfolioService = () => {
  const offlineClient = createOfflineClient();
  const storageKey = OFFLINE_STORAGE_CONFIG.PORTFOLIOS;
  
  const getAllPortfolios = () => {
    return offlineClient.getWithOfflineSupport<Portfolio>(endpoint, storageKey);
  };
  
  // ...
};
```

## Comment étendre le support hors ligne

Pour ajouter le support du mode hors ligne à un nouveau type de ressource :

1. Ajouter une clé de stockage dans `OFFLINE_STORAGE_CONFIG`
2. Créer un service utilisant `createOfflineClient` pour les opérations CRUD
3. Remplacer les appels API directs par les méthodes du service

## Bonnes pratiques

1. **Toujours vérifier l'état de connexion** avant d'effectuer des opérations critiques
2. **Informer l'utilisateur** de l'état de ses actions (en attente, synchronisées, etc.)
3. **Gérer les conflits** lors de la synchronisation (stratégie de résolution)
4. **Limiter la taille des données stockées** localement pour éviter de dépasser les limites de localStorage
5. **Nettoyer régulièrement** les données temporaires et les actions obsolètes
