import React, { createContext, useState, ReactNode } from 'react';
import { PaymentOrderData } from '../components/payment/PaymentOrderModal';
import { PortfolioType } from './portfolioTypes';

export interface PaymentOrderContextType {
  isModalOpen: boolean;
  currentOrder: PaymentOrderData | null;
  portfolioType: PortfolioType;
  showPaymentOrderModal: (data: PaymentOrderData, portfolioType?: PortfolioType) => void;
  closePaymentOrderModal: () => void;
  savePaymentOrder: (data: PaymentOrderData) => void;
}

export const PaymentOrderContext = createContext<PaymentOrderContextType>({
  isModalOpen: false,
  currentOrder: null,
  portfolioType: null,
  showPaymentOrderModal: () => {},
  closePaymentOrderModal: () => {},
  savePaymentOrder: () => {},
});

export const PaymentOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrderData | null>(null);
  const [portfolioType, setPortfolioType] = useState<PortfolioType>(null);

  const showPaymentOrderModal = (data: PaymentOrderData, type: PortfolioType = null) => {
    setCurrentOrder(data);
    setPortfolioType(type);
    setIsModalOpen(true);
  };

  const closePaymentOrderModal = () => {
    setIsModalOpen(false);
    setCurrentOrder(null);
  };

  const savePaymentOrder = (data: PaymentOrderData) => {
    // Ici, vous pourriez ajouter la logique pour enregistrer l'ordre de paiement dans votre système
    console.log(`Saving payment order for ${portfolioType} portfolio:`, data);
    
    // Adapter le libellé selon le type de portefeuille
    const operationLabel = portfolioType === 'investment' ? 'Achat de valeurs' :
                          portfolioType === 'leasing' ? 'Achat d\'équipement' :
                          'Virement';
    
    console.log(`Opération de ${operationLabel} confirmée`);
    
    // Fermer le modal après l'enregistrement
    closePaymentOrderModal();
  };

  return (
    <PaymentOrderContext.Provider
      value={{
        isModalOpen,
        currentOrder,
        portfolioType,
        showPaymentOrderModal,
        closePaymentOrderModal,
        savePaymentOrder,
      }}
    >
      {children}
    </PaymentOrderContext.Provider>
  );
};

// Hook déplacé dans hooks/usePaymentOrderContext.ts
