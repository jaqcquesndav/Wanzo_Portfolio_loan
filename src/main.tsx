import { initializeMockData } from './services/storage/mockDataInitializer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/colors.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';


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