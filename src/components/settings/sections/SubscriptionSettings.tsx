import React, { useState } from 'react';
import { DollarSign, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { PaymentModal } from '../../payment/PaymentModal';
import { useSubscription } from '../../../hooks/useSubscription';
import { useNotification } from '../../../contexts/NotificationContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { SUBSCRIPTION_PLANS } from '../../../constants/subscription';
import type { SubscriptionPlan, Invoice } from '../../../types/billing';

const mockInvoices = [
  {
    id: '1',
    number: 'INV-202403-0001',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    total: 116580,
    status: 'paid'
  },
  {
    id: '2',
    number: 'INV-202402-0001',
    date: '2024-02-01',
    dueDate: '2024-02-15',
    total: 116580,
    status: 'paid'
  }
];

export function SubscriptionSettings() {
  const [selectedCurrency, setSelectedCurrency] = useState<'CDF' | 'USD'>('USD');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { currentPlan, isLoading } = useSubscription();
  const { showNotification } = useNotification();

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    showNotification('Abonnement activé avec succès', 'success');
    setShowPaymentModal(false);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoice.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      {/* Sélection de la période de facturation */}
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button
          variant={billingPeriod === 'monthly' ? 'primary' : 'outline'}
          onClick={() => setBillingPeriod('monthly')}
          className="w-full sm:w-auto"
        >
          Mensuel
        </Button>
        <Button
          variant={billingPeriod === 'yearly' ? 'primary' : 'outline'}
          onClick={() => setBillingPeriod('yearly')}
          className="w-full sm:w-auto"
        >
          Annuel
          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
            -17%
          </span>
        </Button>
      </div>

      {/* Plans d'abonnement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-2 ${
              currentPlan?.id === plan.id
                ? 'border-primary dark:border-primary-light'
                : 'border-transparent'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {plan.description}
                </p>

                <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(
                    plan.price[billingPeriod] * (selectedCurrency === 'CDF' ? 2500 : 1),
                    selectedCurrency
                  )}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                  </span>
                </p>

                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <DollarSign className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="w-full mt-6"
                variant={currentPlan?.id === plan.id ? 'outline' : 'primary'}
                onClick={() => handleSubscribe(plan)}
                disabled={currentPlan?.id === plan.id}
              >
                {currentPlan?.id === plan.id ? 'Plan actuel' : 'Souscrire'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Factures récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Factures récentes
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(invoice.total, selectedCurrency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice as Invoice)}
                      icon={<Download className="h-4 w-4" />}
                    >
                      Télécharger
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          amount={selectedPlan.price[billingPeriod] * (selectedCurrency === 'CDF' ? 2500 : 1)}
          currency={selectedCurrency}
          description={`Abonnement ${selectedPlan.name} - ${billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}`}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}