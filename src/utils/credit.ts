
export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const statusConfig: Record<string, { label: string; variant: "success" | "secondary" | "danger" | "warning" }> = {
  'active': { label: 'Actif', variant: 'success' },
  'closed': { label: 'Clôturé', variant: 'secondary' },
  'defaulted': { label: 'En défaut', variant: 'danger' },
  'suspended': { label: 'Suspendu', variant: 'warning' },
  'in_litigation': { label: 'En contentieux', variant: 'danger' }
};
