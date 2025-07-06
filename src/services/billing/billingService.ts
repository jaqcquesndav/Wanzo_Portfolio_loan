import { formatCurrency } from '../../utils/formatters';
import type { 
  Invoice, 
  InvoiceItem, 
  BillingAddress, 
  TokenUsage,
  SubscriptionPlan 
} from '../../types/billing';

class BillingService {
  private readonly companyInfo = {
    name: 'i-Kiotahub',
    address: {
      street: 'Avenue Kabanda',
      city: 'Goma',
      quarter: 'Lac Vert',
      commune: 'Goma',
      province: 'Nord-Kivu',
      country: 'RDC'
    },
    rccm: 'CD/GOMA/RCCM/23-B-00196',
    idNat: '19-H5300-N40995F',
    nif: 'A2321658S'
  };

  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  async generateInvoice(
    customerId: string,
    billingAddress: BillingAddress,
    plan: SubscriptionPlan,
    tokenUsage: TokenUsage[],
    period: { start: string; end: string }
  ): Promise<Invoice> {
    const items: InvoiceItem[] = [];

    // Ajout de l'abonnement mensuel
    items.push({
      description: `Abonnement ${plan.name} - ${formatDate(period.start)} au ${formatDate(period.end)}`,
      quantity: 1,
      unitPrice: plan.price.monthly,
      amount: plan.price.monthly,
      type: 'subscription'
    });

    // Calcul de l'utilisation des tokens
    if (tokenUsage.length > 0) {
      const totalTokens = tokenUsage.reduce((sum, usage) => sum + usage.count, 0);
      const tokenCost = tokenUsage.reduce((sum, usage) => sum + usage.cost, 0);

      if (totalTokens > plan.limits.baseTokens) {
        const extraTokens = totalTokens - plan.limits.baseTokens;
        items.push({
          description: 'Utilisation supplémentaire de tokens',
          quantity: extraTokens,
          unitPrice: this.calculateTokenPrice(extraTokens),
          amount: tokenCost,
          type: 'usage',
          details: {
            tokenCount: extraTokens,
            period: `${formatDate(period.start)} - ${formatDate(period.end)}`
          }
        });
      }
    }

    // Calcul des totaux
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.16; // TVA 16%
    const total = subtotal + tax;

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      number: this.generateInvoiceNumber(),
      date: new Date().toISOString(),
      dueDate: this.calculateDueDate(new Date(), 15), // 15 jours
      customerId,
      billingAddress,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
      period
    };

    // Sauvegarder la facture
    await this.saveInvoice(invoice);

    return invoice;
  }

  async processPayment(data: {
    amount: number;
    method: string;
    description: string;
  }): Promise<{ success: boolean; error?: string }> {
    // Vérifier si c'est un compte de démo
    const isDemoAccount = localStorage.getItem('user') === 'demo@financeflow.com';
    
    if (isDemoAccount) {
      // Simuler un délai pour le compte de démo
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    }

    try {
      // Dans un environnement de production, appeler l'API de paiement
      const response = await fetch('/api/billing/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Payment error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  private calculateTokenPrice(tokenCount: number): number {
    // Implémentation du calcul du prix des tokens avec remises par volume
    const pricing = {
      base: 0.01, // Prix de base par token
      discounts: [
        { threshold: 100000, discount: 0.1 },
        { threshold: 500000, discount: 0.2 },
        { threshold: 1000000, discount: 0.3 }
      ]
    };

    let discount = 0;
    for (const tier of pricing.discounts) {
      if (tokenCount >= tier.threshold) {
        discount = tier.discount;
      }
    }

    return pricing.base * (1 - discount);
  }

  private calculateDueDate(date: Date, days: number): string {
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString();
  }

  private async saveInvoice(invoice: Invoice): Promise<void> {
    // Vérifier si c'est un compte de démo
    const isDemoAccount = localStorage.getItem('user') === 'demo@financeflow.com';
    
    if (isDemoAccount) {
      // Simuler la sauvegarde pour le compte de démo
      console.log('Demo account - Invoice saved:', invoice);
      return;
    }

    try {
      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(invoice)
      });

      if (!response.ok) {
        throw new Error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  }

  async generatePDF(invoice: Invoice): Promise<Blob> {
    try {
      // Vérifier si c'est un compte de démo ou en développement
      const isDemoAccount = localStorage.getItem('user') === 'demo@financeflow.com';
      const isDevelopment = import.meta.env.DEV;
      
      if (isDemoAccount || isDevelopment) {
        // Simuler la génération de PDF pour le compte de démo ou en développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        return new Blob(['Demo PDF content'], { type: 'application/pdf' });
      }

      // Génération du PDF avec les informations de l'entreprise
      const content = {
        header: {
          company: this.companyInfo.name,
          address: [
            this.companyInfo.address.street,
            `${this.companyInfo.address.commune} de ${this.companyInfo.address.city}`,
            `${this.companyInfo.address.quarter}`,
            `${this.companyInfo.address.province}, ${this.companyInfo.address.country}`
          ].join('\n'),
          registration: [
            `RCCM: ${this.companyInfo.rccm}`,
            `ID NAT: ${this.companyInfo.idNat}`,
            `NIF: ${this.companyInfo.nif}`
          ].join('\n')
        },
        invoice: {
          number: invoice.number,
          date: formatDate(invoice.date),
          dueDate: formatDate(invoice.dueDate)
        },
        customer: invoice.billingAddress,
        items: invoice.items,
        totals: {
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total
        }
      };

      const response = await fetch('/api/billing/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(content)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Return a fallback PDF with basic invoice information
      const fallbackContent = `
        Invoice ${invoice.number}
        Date: ${formatDate(invoice.date)}
        Amount: ${formatCurrency(invoice.total)}
        
        Error generating PDF. Please try again later.
      `;
      return new Blob([fallbackContent], { type: 'text/plain' });
    }
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export const billingService = new BillingService();