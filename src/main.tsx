import { initializeMockData } from './services/storage/mockDataInitializer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/colors.css';
import './i18n'; // Import i18n configuration
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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
if (!rootElement) throw new Error('Failed to find the root element');

// Initialise les mockdata dans localStorage avant de lancer l'app
initializeMockData().finally(() => {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});