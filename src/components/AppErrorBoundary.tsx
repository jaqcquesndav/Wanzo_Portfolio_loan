import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// 🛡️ Liste des erreurs à ignorer (extensions navigateur, erreurs réseau bénignes)
const IGNORED_ERROR_PATTERNS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'extensions/',
  'onboarding',
  'ResizeObserver loop',
  'ResizeObserver loop limit exceeded',
  'Loading chunk',
  'ChunkLoadError',
  'ERR_CONNECTION_RESET',
  'ERR_NETWORK',
  'ERR_INTERNET_DISCONNECTED',
  'ERR_NAME_NOT_RESOLVED',
  'Failed to fetch',
  'NetworkError',
  'Load failed',
  'Script error',
  'Non-Error promise rejection',
  'instantSearchSDKJSBridgeClearHighlight',
  'ibFindAllVideos',
  'dynamically imported module',
];

/**
 * AppErrorBoundary - Composant Error Boundary React pour capturer les erreurs de rendu
 * 
 * Fonctionnalités:
 * - Capture les erreurs React au niveau global
 * - Filtre automatiquement les erreurs d'extensions de navigateur
 * - Filtre les erreurs réseau bénignes
 * - Affiche une UI de fallback élégante avec options de récupération
 */
class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  /**
   * Vérifie si une erreur doit être ignorée (extensions, erreurs réseau bénignes)
   */
  private shouldIgnoreError(error: Error | null, errorInfo: ErrorInfo | null): boolean {
    if (!error) return true;

    const errorString = error.message + (error.stack || '') + (errorInfo?.componentStack || '');
    
    return IGNORED_ERROR_PATTERNS.some(pattern => 
      errorString.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Vérifier si l'erreur doit être ignorée
    if (this.shouldIgnoreError(error, errorInfo)) {
      console.warn('[WanzoPortfolio] Erreur ignorée (extension/réseau):', error.message);
      // Réinitialiser l'état pour permettre à l'app de continuer
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    // Logger l'erreur pour le debugging
    console.error('[WanzoPortfolio] Erreur React capturée:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const { error, errorInfo } = this.state;

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8 max-w-2xl w-full">
            <div className="flex items-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Oups ! Une erreur est survenue
              </h1>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              L'application a rencontré un problème inattendu. Vous pouvez essayer de recharger la page 
              ou revenir à l'accueil.
            </p>

            {/* Afficher les détails techniques en mode développement */}
            {isDev && error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6 overflow-auto">
                <p className="font-medium text-sm mb-2 text-red-800 dark:text-red-200">
                  Détails techniques (dev uniquement):
                </p>
                <p className="font-mono text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-500 dark:text-red-400 overflow-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      {error.stack}
                    </pre>
                  </details>
                )}
                {errorInfo?.componentStack && (
                  <details className="mt-3">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                      Component stack
                    </summary>
                    <pre className="mt-2 text-xs text-red-500 dark:text-red-400 overflow-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger la page
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </button>
            </div>
          </div>

          {/* Footer avec info de support */}
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
            Si le problème persiste, veuillez contacter le support technique.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
