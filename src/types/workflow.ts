// Ajout de l'attribut assignedRole dans WorkflowStep
export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  label: string;
  description: string;
  order: number;
  requiresToken?: boolean;
  generatesToken?: boolean;
  assignedRole?: 'client' | 'institution'; // Qui doit effectuer l'action
  status?: 'completed' | 'current' | 'blocked' | 'pending' | 'waiting';
  attachments?: {
    required?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
    description?: string;
  };
  validationCriteria?: {
    requiredDocuments?: string[];
    requiredFields?: string[];
    conditions?: Record<string, any>;
  };
  monitoringConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    metrics: string[];
    alerts: {
      type: string;
      threshold: number;
      condition: 'above' | 'below' | 'equals';
    }[];
  };
  paymentConfig?: {
    type: 'disbursement' | 'repayment' | 'rent' | 'transfer';
    amount?: number;
    currency?: 'CDF' | 'USD';
    schedule?: {
      frequency: 'one-time' | 'monthly' | 'quarterly' | 'annual';
      startDate?: string;
      endDate?: string;
      gracePeriod?: number;
    };
    validationRules?: {
      minAmount?: number;
      maxAmount?: number;
      requiredApprovers?: number;
      allowedMethods?: ('mobile_money' | 'bank_transfer' | 'card')[];
    };
  };
}