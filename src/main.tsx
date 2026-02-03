import { initializeMockData } from './services/storage/mockDataInitializer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import './index.css';
import './styles/colors.css';
import './i18n'; // Import i18n configuration
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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
];

// Fonction pour vérifier si une erreur doit être ignorée
const shouldIgnoreError = (error: string | Error | Event | undefined): boolean => {
  if (!error) return true;
  const errorString = typeof error === 'string' ? error : (error as Error).message || String(error);
  return IGNORED_ERROR_PATTERNS.some(pattern => errorString.includes(pattern));
};

// 🛡️ Gestionnaire d'erreurs globales JavaScript
window.onerror = function(message, source, lineno, colno, error) {
  // Ignorer les erreurs d'extensions et erreurs réseau bénignes
  if (shouldIgnoreError(message?.toString()) || shouldIgnoreError(source)) {
    console.warn('[WanzoPortfolio] Erreur ignorée (extension/réseau):', message);
    return true; // Empêche la propagation
  }
  console.error('[WanzoPortfolio] Erreur globale:', { message, source, lineno, colno, error });
  return false;
};

// 🛡️ Gestionnaire de rejets de promesses non gérés
window.onunhandledrejection = function(event) {
  const reason = event.reason;
  if (shouldIgnoreError(reason?.message) || shouldIgnoreError(reason?.toString())) {
    console.warn('[WanzoPortfolio] Promesse rejetée ignorée (extension/réseau):', reason);
    event.preventDefault(); // Empêche le log dans la console
    return;
  }
  console.error('[WanzoPortfolio] Promesse non gérée:', reason);
};

// 🔧 Diagnostic de démarrage - Variables d'environnement
console.log('🚀 [Portfolio] Démarrage de l\'application...');
console.log('🔧 [Portfolio] Configuration:', {
  VITE_GATEWAY_URL: import.meta.env.VITE_GATEWAY_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_USE_API: import.meta.env.VITE_USE_API,
  MODE: import.meta.env.MODE
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  // Fallback en cas d'erreur critique
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui;">
      <h1 style="color:#ef4444;">Erreur de chargement</h1>
      <p>Impossible d'initialiser l'application.</p>
      <button onclick="location.reload()" style="margin-top:16px;padding:8px 16px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;">Recharger</button>
    </div>
  `;
  throw new Error('Failed to find the root element');
}

// Initialise les mockdata dans localStorage avant de lancer l'app
initializeMockData().finally(() => {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>
  );
});