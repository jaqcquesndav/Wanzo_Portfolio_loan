import React from 'react';
import { Button } from '../ui/Button';

interface ConnectionErrorProps {
  onRetry: () => void;
  message?: string;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({ onRetry, message }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-red-600 dark:text-red-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Problème de connexion
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message || "Nous n'avons pas pu nous connecter au serveur. Vérifiez votre connexion internet et réessayez."}
          </p>
          
          <div className="space-y-3 w-full max-w-xs">
            <Button 
              variant="primary"
              onClick={onRetry}
              className="w-full"
            >
              Réessayer
            </Button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              Si le problème persiste, contactez l'administrateur système ou utilisez l'application en mode hors ligne.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
