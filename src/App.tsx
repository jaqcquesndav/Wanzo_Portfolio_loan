import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { router } from './routes';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { initializeMockData } from './services/db/mockDataInitializer';
import { db } from './services/db/indexedDB';
import { syncService } from './services/sync/syncService';

export default function App() {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialiser IndexedDB
        await db.init();
        
        // Charger les données de mock
        await initializeMockData();
        
        // Démarrer le service de synchronisation
        const token = localStorage.getItem('token');
        if (token) {
          syncService.startSync();
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