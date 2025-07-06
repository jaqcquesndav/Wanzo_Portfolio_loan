// Exemple de mock data détaillée pour chaque indicateur par portefeuille
// À adapter selon les besoins réels et les types d'indicateurs
import { KPIIndicatorType, KPIDetailRow } from '../types/kpi';

// Structure : { [portfolioId]: { [indicator]: KPIDetailRow[] } }
export const mockKPIDetails: Record<string, Record<KPIIndicatorType, KPIDetailRow[]>> = {
  'trad-1': {
    balance_AGE: [
      { echeance: '0-30j', montant: 12000, nombre_clients: 8 },
      { echeance: '31-60j', montant: 3500, nombre_clients: 2 },
      { echeance: '61-90j', montant: 900, nombre_clients: 1 },
      { echeance: '90j+', montant: 200, nombre_clients: 1 },
    ],
    impayes: [
      { client: 'Société Alpha', montant: 2000, date_echeance: '2024-05-01', statut: 'En retard' },
      { client: 'Entreprise Beta', montant: 1500, date_echeance: '2024-04-15', statut: 'En retard' },
    ],
    couverture: [
      { type: 'Garantie bancaire', montant: 8000, taux_couverture: '80%' },
      { type: 'Assurance crédit', montant: 2000, taux_couverture: '20%' },
    ],
    valeur: [
      { date: '2024-01-31', valeur: 100000 },
      { date: '2024-02-29', valeur: 102500 },
      { date: '2024-03-31', valeur: 104000 },
    ],
    rendement: [
      { date: '2024-01-31', rendement: '2.5%' },
      { date: '2024-02-29', rendement: '2.7%' },
      { date: '2024-03-31', rendement: '2.8%' },
    ],
    benchmark: [
      { date: '2024-01-31', benchmark: '2.0%' },
      { date: '2024-02-29', benchmark: '2.1%' },
      { date: '2024-03-31', benchmark: '2.3%' },
    ],
  },
  'trad-2': {
    balance_AGE: [
      { echeance: '0-30j', montant: 8000, nombre_clients: 5 },
      { echeance: '31-60j', montant: 1200, nombre_clients: 1 },
    ],
    impayes: [
      { client: 'Client X', montant: 500, date_echeance: '2024-03-10', statut: 'En retard' },
    ],
    couverture: [
      { type: 'Garantie bancaire', montant: 4000, taux_couverture: '50%' },
    ],
    valeur: [
      { date: '2024-01-31', valeur: 50000 },
      { date: '2024-02-29', valeur: 51000 },
      { date: '2024-03-31', valeur: 52000 },
    ],
    rendement: [
      { date: '2024-01-31', rendement: '1.5%' },
      { date: '2024-02-29', rendement: '1.7%' },
      { date: '2024-03-31', rendement: '1.8%' },
    ],
    benchmark: [
      { date: '2024-01-31', benchmark: '1.2%' },
      { date: '2024-02-29', benchmark: '1.3%' },
      { date: '2024-03-31', benchmark: '1.4%' },
    ],
  },
};
