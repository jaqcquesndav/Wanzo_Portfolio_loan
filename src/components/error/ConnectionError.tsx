import { Button } from '../ui/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConnectionErrorProps {
  onRetry: () => void;
  message?: string;
}

export default function ConnectionError({ onRetry, message }: ConnectionErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full text-center border-t-4 border-red-500">
        <div className="flex justify-center mb-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Erreur de connexion au serveur
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {message || "Nous n'avons pas pu établir une connexion avec le serveur. Veuillez vérifier votre connexion internet ou réessayer plus tard."}
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button 
            onClick={onRetry}
            className="bg-primary hover:bg-primary-dark"
          >
            Réessayer la connexion
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Rafraîchir la page
          </Button>
        </div>
        
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Si le problème persiste, contactez l'administrateur système.
        </p>
      </div>
    </div>
  );
}
