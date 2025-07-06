```typescript
import type { Operation, OperationType, OperationStatus } from '../../../types/operations';

export interface OperationCardProps {
  operation: Operation;
  onView: (operation: Operation) => void;
}

export interface OperationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: OperationType | 'all';
  onTypeChange: (type: OperationType | 'all') => void;
  selectedStatus: OperationStatus | 'all';
  onStatusChange: (status: OperationStatus | 'all') => void;
}

export interface OperationWorkflowProps {
  operationId: string;
}

export interface TokenValidationProps {
  stepLabel: string;
  onValidate: (token: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}
```