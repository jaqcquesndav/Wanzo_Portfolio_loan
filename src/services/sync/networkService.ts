class NetworkService {
  private online: boolean = navigator.onLine;
  private baseUrl: string = import.meta.env.VITE_API_URL;
  private listeners: { [key: string]: (() => void)[] } = {
    online: [],
    offline: []
  };

  constructor() {
    window.addEventListener('online', () => {
      this.online = true;
      this.notifyListeners('online');
    });

    window.addEventListener('offline', () => {
      this.online = false;
      this.notifyListeners('offline');
    });
  }

  isOnline(): boolean {
    return this.online;
  }

  addListener(event: 'online' | 'offline', callback: () => void) {
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  private notifyListeners(event: 'online' | 'offline') {
    this.listeners[event].forEach(callback => callback());
  }

  async checkConnectivity(): Promise<boolean> {
    if (!this.online) return false;

    // Rate limiting : ne pas vérifier plus d'une fois toutes les 30 secondes
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem('lastConnectivityCheck') || '0');
    if (now - lastCheck < 30000) {
      const lastResult = localStorage.getItem('lastConnectivityResult') === 'true';
      console.log('⏰ Connectivité: utilisation du cache (dernière vérification il y a', Math.round((now - lastCheck) / 1000), 's)');
      return lastResult;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout plus long

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      clearTimeout(timeoutId);
      const isConnected = response.ok;
      
      // Mettre en cache le résultat
      localStorage.setItem('lastConnectivityCheck', now.toString());
      localStorage.setItem('lastConnectivityResult', isConnected.toString());
      
      return isConnected;
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error('Connectivity check failed:', error);
      
      // En cas d'erreur 429, considérer comme connecté mais rate limité
      if (errorObj.message?.includes('429')) {
        localStorage.setItem('lastConnectivityCheck', now.toString());
        localStorage.setItem('lastConnectivityResult', 'true');
        return true;
      }
      
      // Cache le résultat négatif
      localStorage.setItem('lastConnectivityCheck', now.toString());
      localStorage.setItem('lastConnectivityResult', 'false');
      return false;
    }
  }

  async checkApiStatus(): Promise<{
    status: 'up' | 'down' | 'degraded';
    latency: number;
  }> {
    if (!this.online) {
      return { status: 'down', latency: 0 };
    }

    try {
      const start = performance.now();
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const latency = performance.now() - start;

      if (!response.ok) {
        return { status: 'down', latency };
      }

      const data = await response.json();
      return {
        status: data.status,
        latency
      };
    } catch (error) {
      console.error('API status check failed:', error);
      return { status: 'down', latency: 0 };
    }
  }
}

export const networkService = new NetworkService();