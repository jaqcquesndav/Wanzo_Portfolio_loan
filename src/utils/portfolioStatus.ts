import type { PortfolioStatus } from '../types/portfolio';

export function getPortfolioStatusLabel(status: PortfolioStatus): string {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'pending':
      return 'En attente';
    case 'inactive':
      return 'Inactif';
    case 'archived':
      return 'Archivé';
    default:
      return status;
  }
}

export function getPortfolioStatusColor(status: PortfolioStatus): 'success' | 'warning' | 'danger' | 'primary' {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'archived':
      return 'danger';
    case 'inactive':
    default:
      return 'primary';
  }
}
