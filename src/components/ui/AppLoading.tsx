import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface AppLoadingProps {
  message?: string;
}

export const AppLoading: React.FC<AppLoadingProps> = ({ message = 'Initialisation de l\'application...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Banque Congolaise de Développement</h2>
        <LoadingSpinner size="large" message={message} />
        <p className="mt-6 text-sm text-gray-500">
          Veuillez patienter pendant le chargement des données...
        </p>
      </div>
    </div>
  );
};
