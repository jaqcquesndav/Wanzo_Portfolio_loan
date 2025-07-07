import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { router } from './routes';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { initializeMockData } from './services/db/mockDataInitializer';
import { db } from './services/db/indexedDB';
import { syncService } from './services/sync/syncService';
import { SYNC_ENABLED } from './config/sync';

export default function App() {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialiser IndexedDB
        await db.init();
        
        // Charger les données de mock
        await initializeMockData();
        
        // Démarrer le service de synchronisation si activée
        if (SYNC_ENABLED) {
          const token = localStorage.getItem('token');
          if (token) {
            syncService.startSync();
          }
        } else {
          console.info('Synchronisation réseau désactivée (mode offline)');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initApp();

    return () => {
      syncService.stopSync();
    };
  }, []);

  return (
    <PortfolioProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </PortfolioProvider>
  );
}