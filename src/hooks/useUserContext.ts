// src/hooks/useUserContext.ts
import { useState, useEffect } from 'react';

export function useUserContext() {
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a des données existantes
    const hasPortfolios = localStorage.getItem('portfolios');
    const hasContracts = localStorage.getItem('creditContracts');
    const hasRequests = localStorage.getItem('creditRequests');
    const firstUse = localStorage.getItem('firstUseDate');
    
    // Marquer comme nouveau si aucune donnée ET pas de date de première utilisation
    const noData = !hasPortfolios && !hasContracts && !hasRequests;
    const noFirstUse = !firstUse;
    
    if (noData && noFirstUse) {
      setIsNewUser(true);
      localStorage.setItem('firstUseDate', new Date().toISOString());
    }
  }, []);

  return { isNewUser };
}