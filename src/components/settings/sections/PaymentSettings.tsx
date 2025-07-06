import React, { useState } from 'react';
import { CreditCard, Smartphone, DollarSign, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Switch } from '../../ui/Switch';
import { useNotification } from '../../../contexts/NotificationContext';
import { billingService } from '../../../services/billing/billingService';
import type { PaymentProvider, Invoice } from '../../../types/billing';
import { formatCurrency } from '../../../utils/formatters';

const MOBILE_MONEY_PROVIDERS: PaymentProvider[] = [
  {
    id: 'airtel',
    name: 'Airtel Money',
    type: 'mobile_money',
    logo: 'https://example.com/airtel.png',
    enabled: true,
    config: {}
  },
  {
    id: 'orange',
    name: 'Orange Money',
    type: 'mobile_money',
    logo: 'https://example.com/orange.png',
    enabled: true,
    config: {}
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    type: 'mobile_money',
    logo: 'https://example.com/mpesa.png',
    enabled: true,
    config: {}
  }
];

const CARD_PROVIDERS: PaymentProvider[] = [
  {
    id: 'visa',
    name: 'Visa',
    type: 'card',
    logo: 'https://example.com/visa.png',
    enabled: true,
    config: {}
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    type: 'card',
    logo: 'https://example.com/mastercard.png',
    enabled: true,
    config: {}
  }
];

export function PaymentSettings() {
  const { showNotification } = useNotification();
  const [selectedCurrency, setSelectedCurrency] = useState<'CDF' | 'USD'>('USD');

  const handleProviderToggle = async (provider: PaymentProvider) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification(`${provider.name} ${provider.enabled ? 'désactivé' : 'activé'}`, 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const pdfBlob = await billingService.generatePDF(invoice);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showNotification('Erreur lors du téléchargement de la facture', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélection de la devise */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Devise
        </h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            variant={selectedCurrency === 'USD' ? 'primary' : 'outline'}
            onClick={() => setSelectedCurrency('USD')}
            className="w-full sm:w-auto"
          >
            USD
          </Button>
          <Button
            variant={selectedCurrency === 'CDF' ? 'primary' : 'outline'}
            onClick={() => setSelectedCurrency('CDF')}
            className="w-full sm:w-auto"
          >
            CDF
          </Button>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Méthodes de paiement
        </h3>

        <div className="space-y-6">
          {/* Mobile Money */}
          <div>
            <div className="flex items-center mb-4">
              <Smartphone className="h-5 w-5 text-primary mr-2" />
              <h4 className="text-base font-medium">Mobile Money</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOBILE_MONEY_PROVIDERS.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      className="h-8 w-8 mr-3"
                    />
                    <span className="text-sm font-medium">{provider.name}</span>
                  </div>
                  <Switch
                    checked={provider.enabled}
                    onChange={() => handleProviderToggle(provider)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cartes bancaires */}
          <div>
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-primary mr-2" />
              <h4 className="text-base font-medium">Cartes bancaires</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CARD_PROVIDERS.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      className="h-8 w-8 mr-3"
                    />
                    <span className="text-sm font-medium">{provider.name}</span>
                  </div>
                  <Switch
                    checked={provider.enabled}
                    onChange={() => handleProviderToggle(provider)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Factures récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Factures récentes
        </h3>

        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Mock invoice data */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      INV-202403-0001
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      01/03/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(116580, selectedCurrency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Payée
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice({
                          id: '1',
                          number: 'INV-202403-0001',
                          date: '2024-03-01',
                          dueDate: '2024-03-15',
                          total: 116580,
                          status: 'paid'
                        } as Invoice)}
                        icon={<Download className="h-4 w-4" />}
                      >
                        Télécharger
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}