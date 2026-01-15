/**
 * Service de préchargement des routes en arrière-plan
 * Charge les composants de manière progressive pour éviter les rechargements
 */

type PreloadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface RouteModule {
  default: React.ComponentType;
}

interface PreloadedRoute {
  path: string;
  status: PreloadStatus;
  module?: RouteModule;
  priority: number;
}

class RoutePrefetchService {
  private preloadedRoutes: Map<string, PreloadedRoute> = new Map();
  private preloadQueue: string[] = [];
  private isPreloading = false;
  private observers: Set<() => void> = new Set();

  // Routes à précharger par ordre de priorité
  private readonly routeImports: Record<string, { loader: () => Promise<RouteModule>; priority: number }> = {
    // Routes principales (priorité haute)
    '/dashboard': {
      loader: () => import('../../pages/Dashboard') as Promise<RouteModule>,
      priority: 1,
    },
    '/prospection': {
      loader: () => import('../../pages/Prospection') as Promise<RouteModule>,
      priority: 2,
    },
    '/central-risque': {
      loader: () => import('../../pages/CentralRisque') as Promise<RouteModule>,
      priority: 3,
    },
    
    // Portefeuilles (priorité moyenne)
    '/traditional': {
      loader: () => import('../../pages/TraditionalPortfolio') as Promise<RouteModule>,
      priority: 4,
    },
    '/traditional/view': {
      loader: () => import('../../pages/TraditionalPortfolioView').then(m => ({ default: (m as { TraditionalPortfolioView: React.ComponentType }).TraditionalPortfolioView })),
      priority: 5,
    },
    '/traditional/details': {
      loader: () => import('../../pages/TraditionalPortfolioDetails') as Promise<RouteModule>,
      priority: 6,
    },
    
    // Pages de détails (priorité basse)
    '/credit-request': {
      loader: () => import('../../pages/CreditRequestDetails') as Promise<RouteModule>,
      priority: 10,
    },
    '/contract': {
      loader: () => import('../../pages/CreditContractDetail') as Promise<RouteModule>,
      priority: 11,
    },
    '/disbursement': {
      loader: () => import('../../pages/DisbursementDetails') as Promise<RouteModule>,
      priority: 12,
    },
    '/repayment': {
      loader: () => import('../../pages/RepaymentDetails') as Promise<RouteModule>,
      priority: 13,
    },
    '/guarantee': {
      loader: () => import('../../pages/GuaranteeDetails') as Promise<RouteModule>,
      priority: 14,
    },
    
    // Administration
    '/settings': {
      loader: () => import('../../pages/Settings') as Promise<RouteModule>,
      priority: 20,
    },
    '/users': {
      loader: () => import('../../pages/Users') as Promise<RouteModule>,
      priority: 21,
    },
    '/organization': {
      loader: () => import('../../pages/Organization') as Promise<RouteModule>,
      priority: 22,
    },
    '/documentation': {
      loader: () => import('../../pages/Documentation') as Promise<RouteModule>,
      priority: 23,
    },
    '/help': {
      loader: () => import('../../pages/Help') as Promise<RouteModule>,
      priority: 24,
    },
    
    // Chat et Company
    '/chat': {
      loader: () => import('../../pages/chat/ChatPage').then(m => ({ default: (m as { ChatPage: React.ComponentType }).ChatPage })),
      priority: 7,
    },
    '/company': {
      loader: () => import('../../pages/CompanyViewPage') as Promise<RouteModule>,
      priority: 8,
    },
  };

  /**
   * Démarre le préchargement en arrière-plan
   */
  startBackgroundPreload(): void {
    if (this.isPreloading) return;

    // Trier les routes par priorité
    const sortedRoutes = Object.entries(this.routeImports)
      .sort(([, a], [, b]) => a.priority - b.priority)
      .map(([path]) => path);

    this.preloadQueue = sortedRoutes.filter(
      path => !this.preloadedRoutes.has(path) || this.preloadedRoutes.get(path)?.status === 'error'
    );

    this.processQueue();
  }

  /**
   * Traite la file de préchargement
   */
  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return;

    this.isPreloading = true;

    // Attendre que le navigateur soit idle
    await this.waitForIdle();

    while (this.preloadQueue.length > 0) {
      const path = this.preloadQueue.shift();
      if (!path) break;

      await this.preloadRoute(path);
      
      // Pause entre chaque préchargement pour ne pas bloquer le thread principal
      await this.delay(100);
    }

    this.isPreloading = false;
  }

  /**
   * Précharge une route spécifique
   */
  private async preloadRoute(path: string): Promise<void> {
    const routeConfig = this.routeImports[path];
    if (!routeConfig) return;

    this.preloadedRoutes.set(path, {
      path,
      status: 'loading',
      priority: routeConfig.priority,
    });

    try {
      const module = await routeConfig.loader();
      
      this.preloadedRoutes.set(path, {
        path,
        status: 'loaded',
        module,
        priority: routeConfig.priority,
      });

      this.notifyObservers();
    } catch (error) {
      console.warn(`[Prefetch] Failed to preload ${path}:`, error);
      
      this.preloadedRoutes.set(path, {
        path,
        status: 'error',
        priority: routeConfig.priority,
      });
    }
  }

  /**
   * Précharge une route immédiatement (pour la navigation)
   */
  async preloadImmediate(path: string): Promise<RouteModule | null> {
    // Trouver la meilleure correspondance de route
    const routeKey = this.findMatchingRoute(path);
    if (!routeKey) return null;
    
    const existing = this.preloadedRoutes.get(routeKey);
    
    if (existing?.status === 'loaded' && existing.module) {
      return existing.module;
    }

    const routeConfig = this.routeImports[routeKey];
    if (!routeConfig) return null;

    try {
      const module = await routeConfig.loader();
      
      this.preloadedRoutes.set(routeKey, {
        path: routeKey,
        status: 'loaded',
        module,
        priority: routeConfig.priority,
      });

      return module;
    } catch (error) {
      console.error(`[Prefetch] Failed to load ${routeKey}:`, error);
      return null;
    }
  }
  
  /**
   * Trouve la meilleure correspondance de route pour un chemin
   */
  private findMatchingRoute(pathname: string): string | null {
    // Correspondance exacte
    if (this.routeImports[pathname]) {
      return pathname;
    }
    
    // Recherche par segment
    const segments = pathname.split('/').filter(Boolean);
    
    for (const segment of segments) {
      const routeKey = `/${segment}`;
      if (this.routeImports[routeKey]) {
        return routeKey;
      }
    }
    
    // Patterns spécifiques
    if (pathname.includes('traditional')) return '/traditional';
    if (pathname.includes('islamic')) return '/traditional'; // Même composant
    if (pathname.includes('prospection')) return '/prospection';
    if (pathname.includes('central-risque')) return '/central-risque';
    if (pathname.includes('dashboard')) return '/dashboard';
    if (pathname.includes('chat')) return '/chat';
    if (pathname.includes('company')) return '/company';
    if (pathname.includes('settings')) return '/settings';
    if (pathname.includes('users')) return '/users';
    if (pathname.includes('organization')) return '/organization';
    if (pathname.includes('help')) return '/help';
    if (pathname.includes('documentation')) return '/documentation';
    if (pathname.includes('contract')) return '/contract';
    if (pathname.includes('disbursement')) return '/disbursement';
    if (pathname.includes('repayment')) return '/repayment';
    if (pathname.includes('guarantee')) return '/guarantee';
    if (pathname.includes('credit-request')) return '/credit-request';
    
    return null;
  }

  /**
   * Vérifie si une route est préchargée
   */
  isPreloaded(path: string): boolean {
    return this.preloadedRoutes.get(path)?.status === 'loaded';
  }

  /**
   * Obtient le statut de préchargement
   */
  getStatus(path: string): PreloadStatus {
    return this.preloadedRoutes.get(path)?.status || 'idle';
  }

  /**
   * Obtient le module préchargé
   */
  getModule(path: string): RouteModule | undefined {
    return this.preloadedRoutes.get(path)?.module;
  }

  /**
   * S'abonner aux changements
   */
  subscribe(callback: () => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(cb => cb());
  }

  /**
   * Attend que le navigateur soit idle
   */
  private waitForIdle(): Promise<void> {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => resolve());
      } else {
        setTimeout(resolve, 50);
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtient les statistiques de préchargement
   */
  getStats(): { total: number; loaded: number; loading: number; error: number } {
    const routes = Array.from(this.preloadedRoutes.values());
    return {
      total: Object.keys(this.routeImports).length,
      loaded: routes.filter(r => r.status === 'loaded').length,
      loading: routes.filter(r => r.status === 'loading').length,
      error: routes.filter(r => r.status === 'error').length,
    };
  }
}

export const routePrefetchService = new RoutePrefetchService();
