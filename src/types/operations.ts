export type OperationType = 'credit' | 'leasing' | 'equity' | 'grant' | 'bond' | 'share' | 'investment';
export type OperationStatus = 'pending' | 'active' | 'completed' | 'rejected' | 'archived' | 'cancelled';
export type OperationView = 'list' | 'pending' | 'archive';

export interface Operation {
  id: string;
  type: OperationType;
  amount: number;
  status: OperationStatus;
  startDate: string;
  duration: number;
  interestRate?: number;
  description: string;
  workflowId?: string;
  currentStep?: string;
  validatedTokens?: string[];
  securityDetails?: {
    unitPrice: number;
    quantity: number;
    maturityDate?: string;
    minInvestment: number;
  };
  created_at: string;
  updated_at: string;
}

export interface OperationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface OperationHistory {
  id: string;
  type: 'credit' | 'leasing' | 'investment';
  amount: number;
  company: string;
  date: string;
  status: 'completed' | 'cancelled';
  processor: string;
  details: string;
  workflow?: Workflow;
}

export interface OperationStep {
  id: string;
  label: string;
  status: 'pending' | 'current' | 'completed' | 'blocked';
  description: string;
  requiresToken?: boolean;
}

export interface LeasingEquipmentRequest {
  equipment: {
    id: string;
    name: string;
    category: string;
    condition: string;
    price: number;
    imageUrl: string;
    specifications: Record<string, string>;
  };
  quantity: number;
  duration: number;
  maintenanceIncluded: boolean;
  insuranceIncluded: boolean;
}

export interface OperationRequest {
  id: string;
  type: OperationType;
  amount: number; // Total value for leasing requests
  company: Company;
  product: {
    id: string;
    name: string;
    portfolio: {
      id: string;
      name: string;
    };
  };
  submittedDate: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  details: {
    creditScore?: number;
    interestRate?: number;
    duration?: number;
    leasingEquipment?: LeasingEquipmentRequest[]; // Array for multiple equipment
    securities?: {
      type: 'bond' | 'share';
      unitPrice: number;
      quantity: number;
      maturityDate?: string;
      interestRate?: number;
      dividendYield?: number;
    };
  };
}