export type Currency = 'CDF' | 'USD';

export interface PaymentProvider {
  id: string;
  name: string;
  type: 'mobile_money' | 'card';
  logo_url: string;
  enabled: boolean;
}

export interface AppSettings {
  currency: Currency;
  language: string;
  theme: 'light' | 'dark';
  twoFactorEnabled: boolean;
  notificationsEnabled: boolean;
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'trial';
    expiryDate: string;
    autoRenew: boolean;
  };
  paymentMethods: {
    mobileMoney: {
      airtel: boolean;
      orange: boolean;
      mpesa: boolean;
    };
    cards: {
      visa: boolean;
      mastercard: boolean;
      paypal: boolean;
    };
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: {
    CDF: number;
    USD: number;
  };
  features: string[];
  duration: number; // en jours
}