
export const formatAmount = (amount: number, options: { 
  currency?: string; 
  locale?: string;
  showCurrency?: boolean;
  showDecimals?: boolean;
  spaceBetweenAmountAndCurrency?: boolean;
} = {}) => {
  const { 
    currency = 'XOF', 
    locale = 'fr-FR',
    showCurrency = true,
    showDecimals = false,
    spaceBetweenAmountAndCurrency = true
  } = options;

  const formatter = new Intl.NumberFormat(locale, { 
    style: showCurrency ? 'currency' : 'decimal', 
    currency,
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0
  });

  let formatted = formatter.format(amount);
  
  // Si demandé, ajouter un espace entre le montant et la devise (pour PDF)
  if (showCurrency && spaceBetweenAmountAndCurrency) {
    // Remplacer le collage entre chiffre et devise par un espace
    formatted = formatted.replace(/(\d)([A-Z]{3})/, '$1 $2');
  }
  
  return formatted;
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
  'in_litigation': { label: 'En contentieux', variant: 'danger' },
  // Statuts d'échéancier
  'paid': { label: 'Payé', variant: 'success' },
  'partial': { label: 'Partiel', variant: 'warning' },
  'pending': { label: 'En attente', variant: 'secondary' },
  'late': { label: 'En retard', variant: 'danger' },
};

/**
 * Formate un statut pour l'affichage
 */
export const formatStatus = (status: string): string => {
  return statusConfig[status]?.label || status.charAt(0).toUpperCase() + status.slice(1);
};
