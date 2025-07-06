// src/components/portfolio/CreatePortfolioModal.tsx
// import React from 'react';
import { useLocation } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { PortfolioStepperForm, PortfolioStepperFormData } from './PortfolioStepperForm';
import { CreateLeasingPortfolioForm } from './leasing/CreateLeasingPortfolioForm';

import type { DefaultPortfolioFormData } from './DefaultPortfolioForm';
import type { LeasingPortfolioFormData } from './leasing/CreateLeasingPortfolioForm';

type PortfolioModalData = DefaultPortfolioFormData | LeasingPortfolioFormData;

interface CreatePortfolioModalProps {
  onClose: () => void;
  onSubmit: (data: PortfolioModalData) => Promise<void>;
}

export function CreatePortfolioModal({ onClose, onSubmit }: CreatePortfolioModalProps) {
  const location = useLocation();
  const portfolioType = location.pathname.split('/')[2]; // 'traditional', 'investment', ou 'leasing'

  // Pour chaque type, on force le bon typage du handler
  const handleDefaultSubmit = (data: PortfolioStepperFormData) => onSubmit(data);
  const handleLeasingSubmit = (data: LeasingPortfolioFormData) => onSubmit(data);

  // Portal target: document.body
  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999999999] bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl mx-2 sm:mx-4 max-h-[95vh] flex flex-col border border-primary-dark relative"
          style={{
            boxShadow: '0 8px 40px 0 rgba(0,0,0,0.35)',
          }}
        >
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {portfolioType === 'leasing' ? 'Nouveau portefeuille de leasing' : 'Nouveau portefeuille'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
              aria-label="Fermer"
            />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-light scrollbar-track-transparent p-6">
            {portfolioType === 'leasing' ? (
              <CreateLeasingPortfolioForm onSubmit={handleLeasingSubmit} onCancel={onClose} />
            ) : (
              <PortfolioStepperForm onSubmit={handleDefaultSubmit} onCancel={onClose} />
            )}
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
