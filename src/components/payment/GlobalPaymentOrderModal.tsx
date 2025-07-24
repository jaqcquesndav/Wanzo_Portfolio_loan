import React from 'react';
// Importation directe du composant et de l'interface
import { PaymentOrderModal, PaymentOrderData } from './PaymentOrderModal';
import { usePaymentOrder } from '../../hooks/usePaymentOrderContext';
import { exportPaymentOrderToPDF } from '../../utils/export';

export const GlobalPaymentOrderModal: React.FC = () => {
  const { isModalOpen, currentOrder, closePaymentOrderModal, savePaymentOrder } = usePaymentOrder();

  const handleExport = (data: PaymentOrderData) => {
    // Appeler la fonction d'export PDF
    exportPaymentOrderToPDF(data);
  };

  // Si aucune donnée ou modal fermé, ne rien rendre
  if (!isModalOpen || !currentOrder) return null;

  // Déterminer si c'est en mode lecture seule basé sur le statut
  const isReadOnly = currentOrder.status === 'paid' || currentOrder.status === 'approved';

  return (
    <PaymentOrderModal
      isOpen={isModalOpen}
      onClose={closePaymentOrderModal}
      onSave={savePaymentOrder}
      onExport={handleExport}
      initialData={currentOrder}
      readOnly={isReadOnly}
    />
  );
};
