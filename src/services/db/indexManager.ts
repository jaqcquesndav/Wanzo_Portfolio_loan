// Gestionnaire de base de données IndexedDB avec gestion des versions
class IndexManager {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string, storeName: string, version: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  /**
   * Ouvre la base de données et vérifie/crée l'index si nécessaire
   * @returns Promise<IDBDatabase>
   */
  openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // Ouvrir la base avec la version actuelle
      const request = indexedDB.open(this.dbName, this.version);

      // Gérer la mise à niveau de la base
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;

        // Créer le store s'il n'existe pas
        if (!db.objectStoreNames.contains(this.storeName)) {
          console.log(`Création du store ${this.storeName}`);
          const store = db.createObjectStore(this.storeName, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
        }

        // Récupérer le store
        const store = transaction?.objectStore(this.storeName);
        if (!store) {
          throw new Error(`Store ${this.storeName} non trouvé`);
        }

        // Vérifier si l'index existe déjà
        if (!store.indexNames.contains('monIndex')) {
          console.log('Création de l\'index monIndex');
          store.createIndex('monIndex', 'maCle', { unique: false });
        }
      };

      // Gérer le succès
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      // Gérer les erreurs
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * Vérifie si l'index existe et met à jour la version si nécessaire
   * @returns Promise<boolean>
   */
  async ensureIndexExists(): Promise<boolean> {
    try {
      // Ouvrir la base
      const db = await this.openDatabase();
      
      // Vérifier si l'index existe
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const indexExists = store.indexNames.contains('monIndex');

      if (!indexExists) {
        // Fermer la connexion actuelle
        db.close();
        
        // Incrémenter la version et rouvrir la base
        this.version++;
        await this.openDatabase();
        return true;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'index:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion à la base de données
   */
  closeDatabase(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Exemple d'utilisation
export async function initializeDatabase(): Promise<void> {
  const indexManager = new IndexManager('maBase', 'monStore');

  try {
    // Vérifier et créer l'index si nécessaire
    await indexManager.ensureIndexExists();
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    // Fermer la connexion
    indexManager.closeDatabase();
  }
}