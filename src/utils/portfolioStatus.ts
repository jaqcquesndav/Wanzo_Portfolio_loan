import type { PortfolioStatus, PortfolioCurrency } from '../types/portfolio';

export interface PortfolioStatusInfo {
  label: string;
  color: string;
  badgeVariant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline';
  icon?: string;
  description: string;
  canEdit: boolean; // Peut-on modifier le portefeuille dans cet état?
  nextStatuses: PortfolioStatus[]; // Transitions possibles
}

/**
 * Mapping des statuts de portefeuille conformes à l'espace OHADA/RDC
 * Respecte le cycle de vie d'un portefeuille de crédit traditionnel
 */
export const PORTFOLIO_STATUS_MAP: Record<PortfolioStatus, PortfolioStatusInfo> = {
  draft: {
    label: 'Brouillon',
    color: 'slate',
    badgeVariant: 'secondary',
    icon: 'FileEdit',
    description: 'Le portefeuille est en cours de configuration',
    canEdit: true,
    nextStatuses: ['active', 'archived']
  },
  pending: {
    label: 'En attente',
    color: 'amber',
    badgeVariant: 'warning',
    icon: 'Clock',
    description: 'Le portefeuille est en attente de validation',
    canEdit: false,
    nextStatuses: ['active', 'draft']
  },
  active: {
    label: 'Actif',
    color: 'emerald',
    badgeVariant: 'success',
    icon: 'CheckCircle',
    description: 'Le portefeuille est opérationnel et peut recevoir des crédits',
    canEdit: true,
    nextStatuses: ['suspended', 'inactive', 'closing', 'for_sale']
  },
  suspended: {
    label: 'Suspendu',
    color: 'orange',
    badgeVariant: 'warning',
    icon: 'PauseCircle',
    description: 'Le portefeuille est temporairement gelé (pas de nouvelles opérations)',
    canEdit: false,
    nextStatuses: ['active', 'closing']
  },
  inactive: {
    label: 'Inactif',
    color: 'gray',
    badgeVariant: 'default',
    icon: 'XCircle',
    description: 'Le portefeuille est arrêté mais non clôturé',
    canEdit: false,
    nextStatuses: ['active', 'closing', 'for_sale']
  },
  for_sale: {
    label: 'En vente',
    color: 'blue',
    badgeVariant: 'outline',
    icon: 'Tag',
    description: 'Le portefeuille est disponible à la cession',
    canEdit: false,
    nextStatuses: ['sold', 'active', 'inactive']
  },
  closing: {
    label: 'En clôture',
    color: 'red',
    badgeVariant: 'destructive',
    icon: 'AlertTriangle',
    description: 'Le portefeuille est en cours de clôture (recouvrement en cours)',
    canEdit: false,
    nextStatuses: ['archived', 'sold']
  },
  sold: {
    label: 'Cédé',
    color: 'purple',
    badgeVariant: 'secondary',
    icon: 'ArrowRightLeft',
    description: 'Le portefeuille a été cédé à une autre institution',
    canEdit: false,
    nextStatuses: ['archived']
  },
  archived: {
    label: 'Archivé',
    color: 'stone',
    badgeVariant: 'secondary',
    icon: 'Archive',
    description: 'Le portefeuille est définitivement clôturé et archivé',
    canEdit: false,
    nextStatuses: []
  }
};

export function getPortfolioStatusInfo(status: PortfolioStatus): PortfolioStatusInfo {
  return PORTFOLIO_STATUS_MAP[status] || PORTFOLIO_STATUS_MAP.draft;
}

export function getPortfolioStatusLabel(status: PortfolioStatus): string {
  return getPortfolioStatusInfo(status).label;
}

export function getPortfolioStatusColor(status: PortfolioStatus): string {
  return getPortfolioStatusInfo(status).color;
}

export function getPortfolioStatusBadgeVariant(status: PortfolioStatus): string {
  return getPortfolioStatusInfo(status).badgeVariant;
}

export function canTransitionTo(currentStatus: PortfolioStatus, targetStatus: PortfolioStatus): boolean {
  const info = getPortfolioStatusInfo(currentStatus);
  return info.nextStatuses.includes(targetStatus);
}

export function getAvailableTransitions(currentStatus: PortfolioStatus): PortfolioStatus[] {
  return getPortfolioStatusInfo(currentStatus).nextStatuses;
}

/**
 * Configuration des devises supportées (espace OHADA - RDC)
 */
export const PORTFOLIO_CURRENCIES: Record<PortfolioCurrency, { label: string; symbol: string; flag: string }> = {
  CDF: { label: 'Franc Congolais', symbol: 'FC', flag: '🇨🇩' },
  USD: { label: 'Dollar US', symbol: '$', flag: '🇺🇸' },
  EUR: { label: 'Euro', symbol: '€', flag: '🇪🇺' }
};

export function formatCurrency(amount: number, currency: PortfolioCurrency = 'CDF'): string {
  const config = PORTFOLIO_CURRENCIES[currency];
  return `${amount.toLocaleString('fr-FR')} ${config.symbol}`;
}
