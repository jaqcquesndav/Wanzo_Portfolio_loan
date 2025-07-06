import type { PaymentMethod, PaymentProvider } from '../../types/billing';

class PaymentService {
  private readonly API_BASE = '/api/payments';

  async processPayment(data: {
    amount: number;
    currency: 'USD' | 'CDF';
    method: PaymentMethod;
    details: Record<string, string>;
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  async validateMobileMoneyPin(provider: string, phoneNumber: string, pin: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/validate-pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider, phoneNumber, pin })
      });

      return response.ok;
    } catch (error) {
      console.error('PIN validation error:', error);
      return false;
    }
  }

  async validateCardDetails(cardNumber: string, expiryDate: string, cvv: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/validate-card`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardNumber, expiryDate, cvv })
      });

      return response.ok;
    } catch (error) {
      console.error('Card validation error:', error);
      return false;
    }
  }

  async getEnabledProviders(): Promise<PaymentProvider[]> {
    try {
      const response = await fetch(`${this.API_BASE}/providers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.json();
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  async toggleProvider(providerId: string, enabled: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/providers/${providerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      return response.ok;
    } catch (error) {
      console.error('Error toggling provider:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();