import React from 'react';
import { Eye, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { FundingOffer } from '../../types/funding';

interface FundingOffersTableProps {
  offers: FundingOffer[];
  onViewDetails: (offer: FundingOffer) => void;
  onApply: (offer: FundingOffer) => void;
}

export function FundingOffersTable({ offers, onViewDetails, onApply }: FundingOffersTableProps) {
  const formatAmount = (amount: { min: number; max: number }) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount.min);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Offre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant min.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durée
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fournisseur
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {offers.map((offer) => (
            <tr key={offer.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{offer.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {offer.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatAmount(offer.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {offer.duration.min}-{offer.duration.max} mois
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {offer.provider}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(offer)}
                  icon={<Eye className="h-4 w-4" />}
                  className="mr-2"
                >
                  Détails
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApply(offer)}
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Postuler
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}