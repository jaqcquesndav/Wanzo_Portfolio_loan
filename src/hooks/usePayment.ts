import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { paymentService } from '../services/billing/paymentService';
import type { PaymentMethod } from '../types/billing';

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useNotification();

  const processPayment = async (
    amount: number,
    currency: 'USD' | 'CDF',
    method: PaymentMethod,
    details: Record<string, string>
  ) => {
    setIsProcessing(true);
    try {
      // Validation des détails selon la méthode
      let isValid = false;
      if (method === 'mobile_money') {
        isValid = await paymentService.validateMobileMoneyPin(
          details.provider,
          details.phoneNumber,
          details.pin
        );
      } else if (method === 'card') {
        isValid = await paymentService.validateCardDetails(
          details.cardNumber,
          details.expiryDate,
          details.cvv
        );
      }

      if (!isValid) {
        throw new Error('Informations de paiement invalides');
      }

      // Traitement du paiement
      const result = await paymentService.processPayment({
        amount,
        currency,
        method,
        details
      });

      if (!result.success) {
        throw new Error(result.error || 'Échec du paiement');
      }

      showNotification('Paiement effectué avec succès', 'success');
      return result.transactionId;
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors du paiement',
        'error'
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing
  };
}