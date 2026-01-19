// src/components/portfolio/CreatePortfolioModal.tsx
/**
 * Modal de création de portefeuille - Conforme OHADA/RDC
 * Utilise le PortfolioStepperForm (2 étapes)
 */
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { PortfolioStepperForm, type PortfolioStepperFormData } from './PortfolioStepperForm';
import type { Portfolio, PortfolioCurrency, AccountType } from '../../types/portfolio';
import type { BankAccount } from '../../types/bankAccount';
import type { MobileMoneyAccount } from '../../types/mobileMoneyAccount';
import { v4 as uuidv4 } from 'uuid';

// Type de données renvoyé par le modal
export type PortfolioModalData = Partial<Portfolio> & {
  bank_account?: Partial<BankAccount>;
  mobile_money_account?: Partial<MobileMoneyAccount>;
  // Arrays pour compatibilité avec le type Portfolio
  bank_accounts?: Partial<BankAccount>[];
  mobile_money_accounts?: Partial<MobileMoneyAccount>[];
};

interface CreatePortfolioModalProps {
  onClose: () => void;
  onSubmit: (data: PortfolioModalData) => Promise<void>;
}

export function CreatePortfolioModal({ onClose, onSubmit }: CreatePortfolioModalProps) {
  /**
   * Transforme les données du formulaire en structure Portfolio
   */
  const handleFormSubmit = async (formData: PortfolioStepperFormData) => {
    console.log('📝 handleFormSubmit appelé avec:', formData);
    
    // Créer l'objet Portfolio
    const portfolioData: PortfolioModalData = {
      id: uuidv4(),
      name: formData.name,
      type: 'traditional',
      status: 'draft', // Nouveau portefeuille commence en brouillon
      
      // Devise et capital
      currency: formData.currency as PortfolioCurrency,
      initial_capital: formData.initial_capital,
      
      // Période de validité
      start_date: formData.start_date,
      end_date: formData.is_permanent ? undefined : formData.end_date || undefined,
      is_permanent: formData.is_permanent,
      
      // Type de compte principal
      primary_account_type: formData.primary_account_type as AccountType,
      
      // Description optionnelle
      description: formData.description || undefined,
      
      // Valeurs par défaut pour les champs optionnels
      products: [],
      metrics: {
        net_value: formData.initial_capital,
        average_return: 0,
        risk_portfolio: 0,
        sharpe_ratio: 0,
        volatility: 0,
        alpha: 0,
        beta: 0,
        asset_allocation: []
      },
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Ajouter le compte bancaire si sélectionné
    if (formData.primary_account_type === 'bank' && formData.bankName) {
      const bankAccountId = uuidv4();
      const now = new Date().toISOString();
      portfolioData.primary_bank_account_id = bankAccountId;
      
      // Compte bancaire avec tous les champs requis par BankAccount
      const bankAccount = {
        id: bankAccountId,
        bank_name: formData.bankName,
        account_number: formData.accountNumber || '',
        account_name: formData.accountHolder || '', // Mapping accountHolder -> account_name
        swift_code: formData.bic || undefined,
        iban: formData.iban || undefined,
        is_primary: true,
        is_active: true,
        currency: formData.currency,
        purpose: 'general' as const,
        balance: formData.initial_capital, // Solde initial = capital du portefeuille
        created_at: now,
        updated_at: now,
      };
      
      // Ajouter aux deux propriétés pour compatibilité
      portfolioData.bank_account = bankAccount;
      portfolioData.bank_accounts = [bankAccount];
    }
    
    // Ajouter le compte Mobile Money si sélectionné
    if (formData.primary_account_type === 'mobile_money' && formData.momo_provider) {
      const momoAccountId = uuidv4();
      const now = new Date().toISOString();
      portfolioData.primary_mobile_money_account_id = momoAccountId;
      
      // Compte Mobile Money avec tous les champs requis par MobileMoneyAccount
      const mobileMoneyAccount = {
        id: momoAccountId,
        provider: formData.momo_provider as 'Orange Money' | 'M-Pesa' | 'Airtel Money' | 'Africell Money' | 'Vodacom M-Pesa',
        phone_number: formData.momo_phone || '',
        account_name: formData.momo_name || '',
        is_primary: true,
        is_active: true,
        currency: formData.currency,
        purpose: 'general' as const,
        balance: formData.initial_capital, // Solde initial = capital du portefeuille
        account_status: 'verified' as const,
        created_at: now,
        updated_at: now,
      };
      
      // Ajouter aux deux propriétés pour compatibilité
      portfolioData.mobile_money_account = mobileMoneyAccount;
      portfolioData.mobile_money_accounts = [mobileMoneyAccount];
    }
    
    console.log('📤 Données du portefeuille à envoyer:', portfolioData);
    return onSubmit(portfolioData);
  };

  // Portal target: document.body
  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999999999] bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-2 sm:mx-4 max-h-[95vh] flex flex-col border border-primary-dark relative"
          style={{
            boxShadow: '0 8px 40px 0 rgba(0,0,0,0.35)',
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nouveau portefeuille
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Créez un nouveau portefeuille de crédit traditionnel
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
              aria-label="Fermer"
            />
          </div>
          
          {/* Body - Formulaire */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-light scrollbar-track-transparent p-6">
            <PortfolioStepperForm onSubmit={handleFormSubmit} onCancel={onClose} />
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-primary-light::-webkit-scrollbar-thumb {
          background: #a3a3ff;
          border-radius: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #a3a3ff;
          border-radius: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </>,
    document.body
  );
}
