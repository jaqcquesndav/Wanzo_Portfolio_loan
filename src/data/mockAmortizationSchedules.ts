// src/data/mockAmortizationSchedules.ts
import { AmortizationScheduleItem, AmortizationScheduleStatus } from '../types/amortization';

// Fonction pour générer des données d'échéancier simulées
export const generateAmortizationSchedule = (
  contractId: string,
  amount: number,
  interestRate: number,
  startDate: string,
  endDate: string
): AmortizationScheduleItem[] => {
  const items: AmortizationScheduleItem[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculer la durée en mois entre la date de début et la date de fin
  const termInMonths = 
    (end.getFullYear() - start.getFullYear()) * 12 + 
    (end.getMonth() - start.getMonth());
  
  // Calcul simple d'un échéancier à amortissement constant
  const monthlyPrincipal = amount / termInMonths;
  let remainingBalance = amount;
  
  for (let i = 0; i < termInMonths; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    
    const monthlyInterest = remainingBalance * (interestRate / 100 / 12);
    const payment = monthlyPrincipal + monthlyInterest;
    remainingBalance -= monthlyPrincipal;
    
    // Déterminer le statut en fonction de la date d'échéance
    const now = new Date();
    let status: AmortizationScheduleStatus = 'pending';
    
    if (dueDate < now) {
      // Simuler que les premières échéances sont payées
      if (i < 3) {
        status = 'paid';
      } else if (i === 3) {
        status = 'rescheduled';
      } else {
        status = 'overdue';
      }
    } else if (dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear()) {
      status = 'due';
    }
    
    items.push({
      id: `schedule-${contractId}-${i + 1}`,
      contractId,
      number: i + 1,
      dueDate: dueDate.toISOString(),
      principal: monthlyPrincipal,
      interest: monthlyInterest,
      totalPayment: payment,
      remainingBalance: Math.max(0, remainingBalance),
      status,
      paymentDate: status === 'paid' ? new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      paymentAmount: status === 'paid' ? payment : undefined,
      comments: status === 'rescheduled' ? 'Échéance rééchelonnée suite à la demande du client' : undefined
    });
  }
  
  return items;
};

// Exemple de données pré-générées pour certains contrats
export const mockAmortizationSchedules: Record<string, AmortizationScheduleItem[]> = {
  'contract-1': generateAmortizationSchedule('contract-1', 5000000, 10, '2023-01-01', '2025-01-01'),
  'contract-2': generateAmortizationSchedule('contract-2', 8000000, 12, '2023-03-15', '2026-03-15'),
  'contract-3': generateAmortizationSchedule('contract-3', 12000000, 8.5, '2023-06-10', '2027-06-10'),
};

// Fonction pour persister les données dans le localStorage
export const saveAmortizationSchedulesToLocalStorage = (schedules: Record<string, AmortizationScheduleItem[]>) => {
  localStorage.setItem('amortizationSchedules', JSON.stringify(schedules));
};

// Fonction pour récupérer les données du localStorage
export const getAmortizationSchedulesFromLocalStorage = (): Record<string, AmortizationScheduleItem[]> => {
  try {
    const storedData = localStorage.getItem('amortizationSchedules');
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // Si aucune donnée n'est trouvée, initialiser avec les données mock
    console.warn('Aucune donnée d\'échéanciers trouvée dans le localStorage, initialisation avec les données mock');
    saveAmortizationSchedulesToLocalStorage(mockAmortizationSchedules);
    return mockAmortizationSchedules;
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'échéanciers:', error);
    return {};
  }
};
