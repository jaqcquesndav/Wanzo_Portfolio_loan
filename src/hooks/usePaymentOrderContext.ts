// src/hooks/usePaymentOrderContext.ts
import { useContext } from 'react';
import { PaymentOrderContext } from '../contexts/PaymentOrderContext';
import type { PaymentOrderContextType } from '../contexts/PaymentOrderContext';

export const usePaymentOrder = (): PaymentOrderContextType => {
  const context = useContext(PaymentOrderContext);
  if (!context) {
    throw new Error('usePaymentOrder must be used within a PaymentOrderProvider');
  }
  return context;
};
