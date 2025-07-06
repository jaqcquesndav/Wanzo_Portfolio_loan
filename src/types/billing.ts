export type BillingPeriod = 'monthly' | 'yearly';
export type BillingCycle = 'advance' | 'arrears';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type PaymentMethod = 'mobile_money' | 'card' | 'bank_transfer';

export interface BillingAddress {
  company: string;
  street: string;
  city: string;
  country: string;
  postalCode?: string;
  rccm?: string;
  idNat?: string;
  nif?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: PaymentMethod;
  logo: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface TokenUsage {
  date: string;
  count: number;
  cost: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  customerId: string;
  billingAddress: BillingAddress;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: PaymentStatus;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  period: {
    start: string;
    end: string;
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'subscription' | 'usage';
  details?: {
    tokenCount?: number;
    period?: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    users: number;
    storage: number;
    baseTokens: number;
  };
}

export interface TokenPricing {
  basePrice: number;
  volumeDiscounts: {
    threshold: number;
    price: number;
  }[];
}