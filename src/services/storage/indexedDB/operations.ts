// src/services/storage/indexedDB/operations.ts
/**
 * Opérations CRUD génériques pour IndexedDB
 * 
 * Ces fonctions fournissent une abstraction simple pour interagir avec IndexedDB
 * de manière type-safe et asynchrone.
 */

import { openDatabase, StoreName, SyncQueueItem, CacheItem, STORES } from './database';

/**
 * Récupère un élément par son ID
 */
export async function getById<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(new Error(`Erreur de lecture: ${request.error?.message}`));
  });
}

/**
 * Récupère tous les éléments d'un store
 */
export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(new Error(`Erreur de lecture: ${request.error?.message}`));
  });
}

/**
 * Récupère les éléments par un index spécifique
 */
export async function getByIndex<T>(
  storeName: StoreName, 
  indexName: string, 
  value: IDBValidKey
): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    // Vérifier si l'index existe
    if (!store.indexNames.contains(indexName)) {
      console.warn(`⚠️ Index "${indexName}" n'existe pas dans le store "${storeName}"`);
      resolve([]);
      return;
    }
    
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(new Error(`Erreur de lecture par index: ${request.error?.message}`));
  });
}

/**
 * Ajoute ou met à jour un élément (upsert)
 */
export async function put<T extends { id: string }>(
  storeName: StoreName, 
  item: T,
  addToSyncQueue = false
): Promise<T> {
  const db = await openDatabase();
  
  // Ajouter les timestamps
  const itemWithTimestamp = {
    ...item,
    updated_at: new Date().toISOString(),
    created_at: (item as { created_at?: string }).created_at || new Date().toISOString(),
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      addToSyncQueue ? [storeName, STORES.SYNC_QUEUE] : [storeName], 
      'readwrite'
    );
    const store = transaction.objectStore(storeName);
    const request = store.put(itemWithTimestamp);
    
    // Si offline, ajouter à la queue de synchronisation
    if (addToSyncQueue) {
      const syncStore = transaction.objectStore(STORES.SYNC_QUEUE);
      const syncItem: SyncQueueItem = {
        id: `${storeName}_${item.id}_${Date.now()}`,
        storeName,
        operation: 'update',
        data: itemWithTimestamp,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      syncStore.put(syncItem);
    }
    
    request.onsuccess = () => resolve(itemWithTimestamp as T);
    request.onerror = () => reject(new Error(`Erreur d'écriture: ${request.error?.message}`));
  });
}

/**
 * Ajoute un nouvel élément
 */
export async function add<T extends { id: string }>(
  storeName: StoreName, 
  item: T,
  addToSyncQueue = false
): Promise<T> {
  const db = await openDatabase();
  
  // Ajouter les timestamps
  const itemWithTimestamp = {
    ...item,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      addToSyncQueue ? [storeName, STORES.SYNC_QUEUE] : [storeName], 
      'readwrite'
    );
    const store = transaction.objectStore(storeName);
    const request = store.add(itemWithTimestamp);
    
    // Si offline, ajouter à la queue de synchronisation
    if (addToSyncQueue) {
      const syncStore = transaction.objectStore(STORES.SYNC_QUEUE);
      const syncItem: SyncQueueItem = {
        id: `${storeName}_${item.id}_${Date.now()}`,
        storeName,
        operation: 'create',
        data: itemWithTimestamp,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      syncStore.put(syncItem);
    }
    
    request.onsuccess = () => resolve(itemWithTimestamp as T);
    request.onerror = () => reject(new Error(`Erreur d'ajout: ${request.error?.message}`));
  });
}

/**
 * Supprime un élément par son ID
 */
export async function remove(
  storeName: StoreName, 
  id: string,
  addToSyncQueue = false
): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      addToSyncQueue ? [storeName, STORES.SYNC_QUEUE] : [storeName], 
      'readwrite'
    );
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    // Si offline, ajouter à la queue de synchronisation
    if (addToSyncQueue) {
      const syncStore = transaction.objectStore(STORES.SYNC_QUEUE);
      const syncItem: SyncQueueItem = {
        id: `${storeName}_${id}_${Date.now()}`,
        storeName,
        operation: 'delete',
        data: { id },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      syncStore.put(syncItem);
    }
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Erreur de suppression: ${request.error?.message}`));
  });
}

/**
 * Supprime tous les éléments d'un store
 */
export async function clear(storeName: StoreName): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => {
      console.log(`🗑️ [IndexedDB] Store "${storeName}" vidé`);
      resolve();
    };
    request.onerror = () => reject(new Error(`Erreur de vidage: ${request.error?.message}`));
  });
}

/**
 * Compte le nombre d'éléments dans un store
 */
export async function count(storeName: StoreName): Promise<number> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Erreur de comptage: ${request.error?.message}`));
  });
}

/**
 * Ajoute plusieurs éléments en une seule transaction (batch)
 */
export async function putMany<T extends { id: string }>(
  storeName: StoreName, 
  items: T[]
): Promise<T[]> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const results: T[] = [];
    
    for (const item of items) {
      const itemWithTimestamp = {
        ...item,
        updated_at: now,
        created_at: (item as { created_at?: string }).created_at || now,
      };
      
      const request = store.put(itemWithTimestamp);
      request.onsuccess = () => results.push(itemWithTimestamp as T);
    }
    
    transaction.oncomplete = () => {
      console.log(`✅ [IndexedDB] ${items.length} éléments ajoutés/mis à jour dans "${storeName}"`);
      resolve(results);
    };
    
    transaction.onerror = () => {
      reject(new Error(`Erreur de transaction batch: ${transaction.error?.message}`));
    };
  });
}

// ============================================
// Fonctions de cache avec TTL
// ============================================

/**
 * Stocke une valeur dans le cache avec TTL
 */
export async function setCache<T>(
  key: string, 
  data: T, 
  ttlMinutes = 30
): Promise<void> {
  const db = await openDatabase();
  
  const cacheItem: CacheItem<T> = {
    key,
    data,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);
    const request = store.put(cacheItem);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Erreur de cache: ${request.error?.message}`));
  });
}

/**
 * Récupère une valeur du cache (null si expirée ou inexistante)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CACHE, 'readonly');
    const store = transaction.objectStore(STORES.CACHE);
    const request = store.get(key);
    
    request.onsuccess = () => {
      const item = request.result as CacheItem<T> | undefined;
      
      if (!item) {
        resolve(null);
        return;
      }
      
      // Vérifier si le cache est expiré
      if (new Date(item.expiresAt) < new Date()) {
        // Supprimer le cache expiré de manière asynchrone
        remove(STORES.CACHE, key).catch(console.error);
        resolve(null);
        return;
      }
      
      resolve(item.data);
    };
    
    request.onerror = () => reject(new Error(`Erreur de lecture cache: ${request.error?.message}`));
  });
}

/**
 * Supprime les entrées de cache expirées
 */
export async function cleanExpiredCache(): Promise<number> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);
    
    let deletedCount = 0;
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      }
    };
    
    transaction.oncomplete = () => {
      if (deletedCount > 0) {
        console.log(`🧹 [IndexedDB] ${deletedCount} entrées de cache expirées supprimées`);
      }
      resolve(deletedCount);
    };
    
    transaction.onerror = () => {
      reject(new Error(`Erreur de nettoyage cache: ${transaction.error?.message}`));
    };
  });
}

// ============================================
// Fonctions pour la queue de synchronisation
// ============================================

/**
 * Récupère tous les éléments en attente de synchronisation
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return getAll<SyncQueueItem>(STORES.SYNC_QUEUE);
}

/**
 * Marque un élément comme synchronisé (le supprime de la queue)
 */
export async function markAsSynced(syncItemId: string): Promise<void> {
  return remove(STORES.SYNC_QUEUE, syncItemId);
}

/**
 * Incrémente le compteur de retry pour un élément
 */
export async function incrementRetryCount(
  syncItemId: string, 
  error: string
): Promise<void> {
  const item = await getById<SyncQueueItem>(STORES.SYNC_QUEUE, syncItemId);
  if (item) {
    await put(STORES.SYNC_QUEUE, {
      ...item,
      retryCount: item.retryCount + 1,
      lastError: error,
    });
  }
}

/**
 * Ajoute manuellement un élément à la queue de synchronisation
 */
export async function addToSyncQueue(
  storeName: StoreName,
  operation: 'create' | 'update' | 'delete',
  data: unknown
): Promise<void> {
  const db = await openDatabase();
  const id = (data as { id?: string })?.id || crypto.randomUUID();
  
  const syncItem: SyncQueueItem = {
    id: `${storeName}_${id}_${Date.now()}`,
    storeName,
    operation,
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.put(syncItem);
    
    request.onsuccess = () => {
      console.log(`📤 [SyncQueue] Élément ajouté: ${syncItem.id}`);
      resolve();
    };
    request.onerror = () => reject(new Error(`Erreur d'ajout à la queue: ${request.error?.message}`));
  });
}
