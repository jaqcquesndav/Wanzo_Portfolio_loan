// Types pour les indicateurs KPI et les lignes de détail

export type KPIIndicatorType = 'balance_AGE' | 'impayes' | 'couverture' | 'valeur' | 'rendement' | 'benchmark';

// Lignes de détail pour chaque indicateur (adapter selon les besoins réels)
export type KPIDetailRow =
  | { echeance: string; montant: number; nombre_clients: number } // balance_AGE
  | { client: string; montant: number; date_echeance: string; statut: string } // impayes
  | { type: string; montant: number; taux_couverture: string } // couverture
  | { date: string; valeur: number } // valeur
  | { date: string; rendement: string } // rendement
  | { date: string; benchmark: string }; // benchmark
