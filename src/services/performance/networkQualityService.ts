/**
 * Service de détection de qualité réseau
 * Inspiré de l'approche YouTube pour adapter le chargement à la connexion
 */

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

export interface NetworkInfo {
  quality: NetworkQuality;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  online: boolean;
}

interface NetworkConnection {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

type NetworkChangeCallback = (info: NetworkInfo) => void;

class NetworkQualityService {
  private listeners: Set<NetworkChangeCallback> = new Set();
  private currentInfo: NetworkInfo;
  private connection: NetworkConnection | null = null;

  constructor() {
    this.currentInfo = this.detectNetworkQuality();
    this.setupListeners();
  }

  /**
   * Détecte la qualité du réseau en utilisant l'API Network Information
   */
  private detectNetworkQuality(): NetworkInfo {
    const nav = navigator as Navigator & { connection?: NetworkConnection };
    this.connection = nav.connection || null;

    if (!navigator.onLine) {
      return {
        quality: 'offline',
        effectiveType: 'offline',
        downlink: 0,
        rtt: 0,
        saveData: false,
        online: false,
      };
    }

    if (!this.connection) {
      // Fallback si l'API n'est pas disponible - supposer une bonne connexion
      return {
        quality: 'good',
        effectiveType: 'unknown',
        downlink: 10,
        rtt: 100,
        saveData: false,
        online: true,
      };
    }

    const effectiveType = this.connection.effectiveType || '4g';
    const downlink = this.connection.downlink || 10;
    const rtt = this.connection.rtt || 100;
    const saveData = this.connection.saveData || false;

    // Déterminer la qualité basée sur plusieurs facteurs
    let quality: NetworkQuality;

    if (saveData) {
      quality = 'poor'; // L'utilisateur a activé l'économie de données
    } else if (effectiveType === '4g' && downlink >= 5 && rtt < 100) {
      quality = 'excellent';
    } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink >= 1.5)) {
      quality = 'good';
    } else if (effectiveType === '3g' || (effectiveType === '2g' && downlink >= 0.5)) {
      quality = 'fair';
    } else {
      quality = 'poor';
    }

    return {
      quality,
      effectiveType,
      downlink,
      rtt,
      saveData,
      online: true,
    };
  }

  /**
   * Configure les listeners pour détecter les changements de réseau
   */
  private setupListeners(): void {
    // Écouter les changements online/offline
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);

    // Écouter les changements de qualité réseau
    if (this.connection?.addEventListener) {
      this.connection.addEventListener('change', this.handleNetworkChange);
    }
  }

  private handleNetworkChange = (): void => {
    const newInfo = this.detectNetworkQuality();
    
    // Notifier seulement si la qualité a changé
    if (newInfo.quality !== this.currentInfo.quality || newInfo.online !== this.currentInfo.online) {
      this.currentInfo = newInfo;
      this.notifyListeners();
    }
  };

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentInfo));
  }

  /**
   * Obtenir les informations réseau actuelles
   */
  getNetworkInfo(): NetworkInfo {
    return this.currentInfo;
  }

  /**
   * Obtenir la qualité actuelle du réseau
   */
  getQuality(): NetworkQuality {
    return this.currentInfo.quality;
  }

  /**
   * Vérifier si on est en ligne
   */
  isOnline(): boolean {
    return this.currentInfo.online;
  }

  /**
   * S'abonner aux changements de qualité réseau
   */
  subscribe(callback: NetworkChangeCallback): () => void {
    this.listeners.add(callback);
    // Retourner une fonction de désabonnement
    return () => this.listeners.delete(callback);
  }

  /**
   * Obtenir les recommandations de chargement basées sur la qualité
   */
  getLoadingStrategy(): {
    preloadImages: boolean;
    enableAnimations: boolean;
    batchSize: number;
    timeout: number;
    retryCount: number;
  } {
    switch (this.currentInfo.quality) {
      case 'excellent':
        return {
          preloadImages: true,
          enableAnimations: true,
          batchSize: 20,
          timeout: 10000,
          retryCount: 3,
        };
      case 'good':
        return {
          preloadImages: true,
          enableAnimations: true,
          batchSize: 15,
          timeout: 15000,
          retryCount: 3,
        };
      case 'fair':
        return {
          preloadImages: false,
          enableAnimations: true,
          batchSize: 10,
          timeout: 20000,
          retryCount: 2,
        };
      case 'poor':
        return {
          preloadImages: false,
          enableAnimations: false,
          batchSize: 5,
          timeout: 30000,
          retryCount: 1,
        };
      case 'offline':
      default:
        return {
          preloadImages: false,
          enableAnimations: false,
          batchSize: 0,
          timeout: 0,
          retryCount: 0,
        };
    }
  }

  /**
   * Nettoyer les listeners
   */
  cleanup(): void {
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    
    if (this.connection?.removeEventListener) {
      this.connection.removeEventListener('change', this.handleNetworkChange);
    }
    
    this.listeners.clear();
  }
}

// Export d'une instance singleton
export const networkQualityService = new NetworkQualityService();
