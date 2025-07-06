import type { Operation, OperationType } from '../../../types/operations';

export function getStatusColor(status: Operation['status']) {
  switch (status) {
    case 'active': return 'success';
    case 'pending': return 'warning';
    case 'completed': return 'primary';
    case 'rejected': return 'error';
    case 'archived': return 'secondary';
    default: return 'primary';
  }
}

export function getOperationTypeColor(type: OperationType): string {
  switch (type) {
    case 'credit':
      return 'text-blue-600 dark:text-blue-400';
    case 'equity':
      return 'text-purple-600 dark:text-purple-400';
    case 'leasing':
      return 'text-green-600 dark:text-green-400';
    case 'grant':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'bond':
      return 'text-orange-600 dark:text-orange-400';
    case 'share':
      return 'text-indigo-600 dark:text-indigo-400';
    default:
      return 'text-gray-900 dark:text-gray-100';
  }
}

export function getOperationTypeLabel(type: OperationType): string {
  switch (type) {
    case 'credit': return 'Crédit';
    case 'equity': return 'Capital';
    case 'leasing': return 'Leasing';
    case 'grant': return 'Subvention';
    case 'bond': return 'Obligation';
    case 'share': return 'Action';
    default: return type;
  }
}

export function isSecurityOperation(type: OperationType): boolean {
  return type === 'bond' || type === 'share';
}

export function isArchived(operation: Operation): boolean {
  return operation.status === 'completed' || operation.status === 'rejected';
}

export function isPending(operation: Operation): boolean {
  return operation.status === 'pending';
}

export function isActive(operation: Operation): boolean {
  return operation.status === 'active';
}