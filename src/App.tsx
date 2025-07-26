import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { optimizedRouter } from './routes/optimizedRouter';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { useInitMockData } from './hooks/useInitMockData';
import { syncService } from './services/sync/syncService';
import { SYNC_ENABLED } from './config/sync';
import { PaymentOrderProvider } from './contexts/PaymentOrderContext';
import { GlobalPaymentOrderModal } from './components/payment/GlobalPaymentOrderModal';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { Toaster } from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AppLoading } from './components/ui/AppLoading';
import { auth0Service } from './services/api/auth/auth0Service';
import { ConnectivityProvider } from './contexts/ConnectivityContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/api/reactQueryConfig';
import { storageManager } from './utils/storageManager';
// Import de l'intercepteur de token pour s'assurer qu'il est bien initialisé
import './services/api/tokenInterceptor';

export default function App() {
  // Utilisation du hook pour initialiser les données mock
  const { loading, error, resetMockData, validationIssues } = useInitMockData();

  // Nettoyer le stockage au démarrage pour éviter les problèmes de quota
  React.useEffect(() => {
    try {
      // Essayer de détecter si on approche de la limite
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          totalSize += key.length + value.length;
        }
      }
      
      // Si on dépasse 3 Mo (approx.), nettoyer le stockage
      if (totalSize > 3 * 1024 * 1024) {
        storageManager.clearOldData();
        console.log("Nettoyage du stockage effectué pour libérer de l'espace.");
      }
    } catch (error) {
      console.warn("Erreur lors de la vérification du stockage:", error);
    }
  }, []);

  // Démarrer le service de synchronisation si activée
  React.useEffect(() => {
    if (SYNC_ENABLED) {
      // Utiliser auth0Service pour récupérer le token
      const token = auth0Service.getAccessToken();
                   
      if (token) {
        // Log pour déboguer
        console.log('Token trouvé, démarrage de la synchronisation');
        syncService.startSync();
      } else {
        console.warn('Aucun token trouvé, la synchronisation ne démarrera pas');
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

  // Afficher l'écran de chargement pendant l'initialisation
  if (loading) {
    return <AppLoading message="Préparation de votre environnement..." />;
  }

  // Afficher un indicateur de chargement si nécessaire
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Si des problèmes de validation sont détectés, afficher un avertissement discret
  const hasValidationIssues = validationIssues && validationIssues.length > 0;

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectivityProvider>
        <PortfolioProvider>
          <NotificationProvider>
            <CurrencyProvider>
              <PaymentOrderProvider>
                {hasValidationIssues && (
                  <div className="fixed top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-2 z-50">
                    <div className="container mx-auto flex items-center justify-between">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="text-amber-800 text-sm">
                          {validationIssues.length} problème(s) de données détecté(s). 
                        </span>
                      </div>
                      <button 
                        onClick={resetMockData}
                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded"
                      >
                        Réinitialiser les données
                      </button>
                    </div>
                  </div>
                )}
                <RouterProvider router={optimizedRouter} />
                {/* Modal d'ordre de paiement pour les portefeuilles */}
                <GlobalPaymentOrderModal />
                <Toaster position="top-right" />
              </PaymentOrderProvider>
            </CurrencyProvider>
          </NotificationProvider>
        </PortfolioProvider>
      </ConnectivityProvider>
    </QueryClientProvider>
  );
}