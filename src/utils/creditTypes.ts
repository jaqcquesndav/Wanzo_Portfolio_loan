// Utilitaires pour les types de produits de crédit

export type CreditType = 'credit_personnel' | 'credit_immobilier' | 'credit_auto' | 'credit_professionnel' | 'microcredit' | 'credit_consommation';

export const getCreditTypeLabel = (type: CreditType): string => {
  const labels: Record<CreditType, string> = {
    credit_personnel: 'Crédit Personnel',
    credit_immobilier: 'Crédit Immobilier',
    credit_auto: 'Crédit Automobile',
    credit_professionnel: 'Crédit Professionnel',
    microcredit: 'Microcrédit',
    credit_consommation: 'Crédit à la Consommation'
  };
  
  return labels[type] || type;
};

export const getCreditTypeDescription = (type: CreditType): string => {
  const descriptions: Record<CreditType, string> = {
    credit_personnel: 'Financement pour projets personnels sans justificatif d\'utilisation',
    credit_immobilier: 'Financement pour l\'acquisition ou la construction d\'un bien immobilier',
    credit_auto: 'Financement pour l\'achat d\'un véhicule neuf ou d\'occasion',
    credit_professionnel: 'Financement pour les besoins d\'investissement ou de trésorerie des entreprises',
    microcredit: 'Petits prêts destinés aux micro-entrepreneurs et populations à faibles revenus',
    credit_consommation: 'Financement pour l\'achat de biens de consommation courante'
  };
  
  return descriptions[type] || '';
};

export const creditTypes: Array<{ value: CreditType; label: string; description: string }> = [
  {
    value: 'credit_personnel',
    label: 'Crédit Personnel',
    description: 'Financement pour projets personnels sans justificatif d\'utilisation'
  },
  {
    value: 'credit_immobilier',
    label: 'Crédit Immobilier',
    description: 'Financement pour l\'acquisition ou la construction d\'un bien immobilier'
  },
  {
    value: 'credit_auto',
    label: 'Crédit Automobile',
    description: 'Financement pour l\'achat d\'un véhicule neuf ou d\'occasion'
  },
  {
    value: 'credit_professionnel',
    label: 'Crédit Professionnel',
    description: 'Financement pour les besoins d\'investissement ou de trésorerie des entreprises'
  },
  {
    value: 'microcredit',
    label: 'Microcrédit',
    description: 'Petits prêts destinés aux micro-entrepreneurs et populations à faibles revenus'
  },
  {
    value: 'credit_consommation',
    label: 'Crédit à la Consommation',
    description: 'Financement pour l\'achat de biens de consommation courante'
  }
];