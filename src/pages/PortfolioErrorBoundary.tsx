import React from 'react';
import { useRouteError } from 'react-router-dom';
import { ResetMockDataButton } from '../components/ResetMockDataButton';

export default function PortfolioErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Erreur lors du chargement du portefeuille</h1>
      <p className="mb-4 text-gray-600">Le portefeuille demandé n'a pas pu être trouvé ou une erreur est survenue.</p>
      
      {error instanceof Error && (
        <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md max-w-lg overflow-auto">
          <p className="font-medium">Message d'erreur:</p>
          <p className="font-mono">{error.message}</p>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4 mb-8">
        <p className="text-sm text-gray-600">
          Si vous rencontrez des problèmes avec les données mock, vous pouvez essayer de les réinitialiser:
        </p>
        <ResetMockDataButton />
      </div>
      
      <a href="/app" className="text-primary underline">Retour à la liste des portefeuilles</a>
    </div>
  );
}
