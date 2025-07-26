import { useRouteError, Link } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

export default function ErrorBoundary() {
  const error = useRouteError() as Error;
  const isDynamicImportError = error.message?.includes('Failed to fetch dynamically imported module');
  
  const reloadPage = () => {
    window.location.reload();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-2xl w-full">
        <div className="flex items-center mb-6">
          <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Une erreur est survenue
          </h1>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {isDynamicImportError 
              ? "Un problème est survenu lors du chargement d'un module de l'application."
              : "Une erreur inattendue s'est produite lors du chargement de cette page."}
          </p>
          
          {error && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mt-4 overflow-auto">
              <p className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Détails de l'erreur:</p>
              <p className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                {error.message || 'Erreur inconnue'}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                    Informations techniques
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 dark:text-gray-400 overflow-auto p-2">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            className="flex items-center justify-center"
            onClick={reloadPage}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recharger la page
          </Button>
          
          <Link to="/" className="inline-flex">
            <Button variant="outline" className="flex items-center justify-center w-full">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
