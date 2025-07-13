import { useEffect, useState } from 'react';
import { useInitMockData } from '../hooks/useInitMockData';
import { Button } from './ui/Button';

export function ResetMockDataButton() {
  const { resetMockData } = useInitMockData();
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    setResetDone(false);
    
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
    </div>
  );
}
