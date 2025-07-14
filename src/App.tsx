import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { router } from './routes';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { useInitMockData } from './hooks/useInitMockData';
import { syncService } from './services/sync/syncService';
import { SYNC_ENABLED } from './config/sync';
import { PaymentOrderProvider } from './contexts/PaymentOrderContext';
import { GlobalPaymentOrderModal } from './components/payment/GlobalPaymentOrderModal';
import { Toaster } from 'react-hot-toast';

export default function App() {
  // Utilisation du nouveau hook pour initialiser les données mock
  const { loading, error, resetMockData } = useInitMockData();

  // Démarrer le service de synchronisation si activée
  React.useEffect(() => {
    if (SYNC_ENABLED) {
      const token = localStorage.getItem('token');
      if (token) {
        syncService.startSync();
      }
    } else {
      console.info('Synchronisation réseau désactivée (mode offline)');
    }

    return () => {
      syncService.stopSync();
    };
  }, []);

  // En cas d'erreur d'initialisation, afficher un bouton de réinitialisation
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-xl font-bold text-red-700 mb-4">Erreur d'initialisation</h1>
          <p className="text-gray-700 mb-6">{error.message}</p>
          <button 
            onClick={resetMockData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Réinitialiser les données
          </button>
        </div>
      </div>
    );
  }

  // Afficher un indicateur de chargement si nécessaire
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <PortfolioProvider>
      <NotificationProvider>
        <PaymentOrderProvider>
          <RouterProvider router={router} />
          {/* Rendre le modal d'ordre de paiement disponible globalement */}
          <GlobalPaymentOrderModal />
          <Toaster position="top-right" />
        </PaymentOrderProvider>
      </NotificationProvider>
    </PortfolioProvider>
  );
}