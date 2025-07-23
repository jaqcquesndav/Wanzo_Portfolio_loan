// Helpers pour formater les données de manière uniforme


export const formatters = {
  // Format currency with custom options
  currency: (value: number, options: Intl.NumberFormatOptions = {}) => {
    // Déterminer la devise à utiliser (préférence utilisateur ou XOF par défaut)
    let currency = 'XOF';
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.currency) {
          currency = preferences.currency;
        }
      }
    } catch {
      // Fallback en cas d'erreur
    }
    
    // Pour FCFA, format spécial car non standard dans Intl
    if (currency === 'FCFA' || currency === 'XOF') {
      const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        ...options,
      }).format(value);
      return `${formatted} FCFA`;
    }
    
    // Pour les autres devises, utiliser le format standard
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      ...options,
    }).format(value);
  },
  
  // Format date with custom options
  date: (value: string | Date, options: Intl.DateTimeFormatOptions = {}) => {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options,
    }).format(date);
  },
  
  // Create styled status badge
  badge: (
    value: string,
    variant: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default',
    label?: string
  ) => {
    const variantClasses = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
        {label || value}
      </span>
    );
  }
};
