import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface FundingStatusProps {
  status: 'pending' | 'approved' | 'rejected';
  type: string;
  amount: number;
  submissionDate: string;
}

export default function FundingStatus({
  status,
  type,
  amount,
  submissionDate
}: FundingStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Statut de la demande</h3>
        {getStatusIcon()}
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Type de financement</p>
          <p className="font-medium">{type}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Montant demandé</p>
          <p className="font-medium">{amount.toLocaleString('fr-FR')} FCFA</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Date de soumission</p>
          <p className="font-medium">{new Date(submissionDate).toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Statut</p>
          <p className={`font-medium ${
            status === 'approved' ? 'text-green-600' :
            status === 'rejected' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {getStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
}