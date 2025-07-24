// Mock data pour les incidents de leasing
export const mockIncidents = [
  {
    id: 'INC-20250710-001',
    date: '2025-07-10T10:15:00Z',
    equipmentId: 'EQ-LEASE-001',
    equipmentName: 'Tracteur Agricole TX-500',
    clientName: 'Ferme Moderne SARL',
    portfolioId: 'leasing-1',
    portfolioName: 'Leasing Agricole',
    description: 'Panne moteur - Intervention urgente requise',
    status: 'en cours',
    severity: 'haute',
    cost: 250000,
    estimatedRepairTime: 48, // heures
    technician: 'Jean Dupont',
    location: 'Site client - Ferme Nord'
  },
  {
    id: 'INC-20250705-002',
    date: '2025-07-05T14:30:00Z',
    equipmentId: 'EQ-LEASE-005',
    equipmentName: 'Chariot Élévateur FT2000',
    clientName: 'Logistique Express',
    portfolioId: 'leasing-2',
    portfolioName: 'Leasing Industriel',
    description: 'Problème hydraulique - Fuite détectée',
    status: 'resolved',
    severity: 'moyenne',
    cost: 85000,
    estimatedRepairTime: 24, // heures
    technician: 'Marc Technicien',
    location: 'Entrepôt client'
  },
  {
    id: 'INC-20250715-003',
    date: '2025-07-15T09:00:00Z',
    equipmentId: 'EQ-LEASE-008',
    equipmentName: 'Camion Frigorifique MK-100',
    clientName: 'Transport Alimentaire SA',
    portfolioId: 'leasing-1',
    portfolioName: 'Leasing Agricole',
    description: 'Défaillance système de refroidissement',
    status: 'pending',
    severity: 'critique',
    cost: 320000,
    estimatedRepairTime: 72, // heures
    technician: 'Équipe technique spécialisée',
    location: 'Centre de maintenance principal'
  }
];
