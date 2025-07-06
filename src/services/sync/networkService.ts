class NetworkService {
  private online: boolean = navigator.onLine;
  private baseUrl: string = import.meta.env.VITE_API_URL;
  private listeners: { [key: string]: Function[] } = {
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

  addListener(event: 'online' | 'offline', callback: Function) {
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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Connectivity check failed:', error);
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