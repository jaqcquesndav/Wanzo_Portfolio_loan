import React, { useState } from 'react';
import { Eye, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { FundingOfferModal } from './FundingOfferModal';
import { FundingApplicationModal } from './FundingApplicationModal';
import type { FundingOffer } from '../../types/funding';

interface FundingOfferCardProps {
  offer: FundingOffer;
}

export function FundingOfferCard({ offer }: FundingOfferCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showApplication, setShowApplication] = useState(false);

  const formatAmount = (amount: { min: number; max: number }) => {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    });
    return `${formatter.format(amount.min)} - ${formatter.format(amount.max)}`;
  };

  const getTypeStyle = (type: FundingOffer['type']) => {
    const styles = {
      equity: 'bg-purple-100 text-purple-800',
      credit: 'bg-blue-100 text-blue-800',
      leasing: 'bg-green-100 text-green-800',
      grant: 'bg-yellow-100 text-yellow-800'
    };
    return styles[type];
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
        <div className="p-4 sm:p-6 flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div className="w-full">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(offer.type)}`}>
                {offer.type === 'equity' ? 'Capital-investissement' :
                 offer.type === 'credit' ? 'Crédit' :
                 offer.type === 'leasing' ? 'Leasing' : 'Subvention'}
              </span>
              <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900 line-clamp-2">{offer.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{offer.provider}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500 flex justify-between">
              <span className="font-medium">Montant:</span>
              <span className="text-right">{formatAmount(offer.amount)}</span>
            </p>
            <p className="text-sm text-gray-500 flex justify-between">
              <span className="font-medium">Durée:</span>
              <span>{offer.duration.min}-{offer.duration.max} mois</span>
            </p>
            {offer.interestRate && (
              <p className="text-sm text-gray-500 flex justify-between">
                <span className="font-medium">Taux:</span>
                <span>{offer.interestRate}%</span>
              </p>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-600 line-clamp-3">
            {offer.description}
          </p>
        </div>

        <div className="p-4 sm:px-6 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              icon={<Eye className="h-4 w-4" />}
              onClick={() => setShowDetails(true)}
              className="w-full sm:w-auto"
            >
              Détails
            </Button>
            <Button 
              onClick={() => setShowApplication(true)}
              className="w-full sm:w-auto"
            >
              Postuler
            </Button>
          </div>
        </div>
      </div>

      {showDetails && (
        <FundingOfferModal
          offer={offer}
          onClose={() => setShowDetails(false)}
        />
      )}

      {showApplication && (
        <FundingApplicationModal
          offer={offer}
          onClose={() => setShowApplication(false)}
        />
      )}
    </>
  );
}