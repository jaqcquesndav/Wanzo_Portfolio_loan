import { useState } from 'react';
import type { Operation } from '../types/operations';

// Ce hook retourne les opérations associées à un portefeuille donné (mock ou vide)
export function usePortfolioOperations() {
  // À remplacer par une vraie récupération des opérations liées au portefeuille
  const [operations] = useState<Operation[]>([]);

  // Handler pour cliquer sur une opération (à adapter selon besoin)
  const onOperationClick = () => {
    // Par exemple, naviguer vers le détail d'une opération
    // navigate(`/operations/${_operationId}`);
  };

  return {
    operations,
    onOperationClick
  };
}
