import { useEffect, useState } from 'react';
import { useInitMockData } from '../hooks/useInitMockData';
import { Button } from './ui/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function ResetMockDataButton() {
  const { resetMockData, validationIssues } = useInitMockData();
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [showIssues, setShowIssues] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    setResetDone(false);
    setShowIssues(false);
    
    try {
      await resetMockData();
      setResetDone(true);
      // Recharger la page après 1 seconde pour s'assurer que les données sont bien prises en compte
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des données:', error);
    } finally {
      setIsResetting(false);
    }
  };

  // Effacer le message de succès après 3 secondes
  useEffect(() => {
    if (resetDone) {
      const timer = setTimeout(() => {
        setResetDone(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [resetDone]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleReset} 
          variant="outline" 
          size="sm"
          disabled={isResetting}
        >
          {isResetting ? 'Réinitialisation...' : 'Réinitialiser les données'}
        </Button>
        {resetDone && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Données réinitialisées avec succès!
          </span>
        )}
        
        {validationIssues && validationIssues.length > 0 && (
          <button 
            onClick={() => setShowIssues(!showIssues)}
            className="flex items-center text-amber-600 dark:text-amber-400 text-sm"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {showIssues ? 'Masquer les problèmes' : `${validationIssues.length} problème(s) détecté(s)`}
          </button>
        )}
      </div>
      
      {showIssues && validationIssues && validationIssues.length > 0 && (
        <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-sm">
          <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Problèmes de validation des données :</h4>
          <ul className="list-disc pl-5 text-amber-700 dark:text-amber-400">
            {validationIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-500">
            Cliquez sur "Réinitialiser les données" pour tenter de résoudre ces problèmes.
          </div>
        </div>
      )}
    </div>
  );
}
