// components/portfolio/traditional/contract/ContractDetails.tsx
import { useState } from 'react';
import { CreditContract } from '../../../../types/credit';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Separator } from '../../../ui/Separator';
import { CalendarIcon, DocumentIcon, UserIcon, BuildingOfficeIcon, CurrencyDollarIcon, ScaleIcon } from '@heroicons/react/24/outline';

// Fonction utilitaire pour le formatage des dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Fonction utilitaire pour le formatage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

interface ContractDetailsProps {
  contract: CreditContract;
}

export function ContractDetails({ contract }: ContractDetailsProps) {
  const [showAllDetails, setShowAllDetails] = useState(false);
  
  // Calculer la durée en mois entre la date de début et la date de fin
  const calculateTermInMonths = (): number => {
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  };
  
  // Organiser les détails en sections
  const generalInfo = [
    { label: 'Référence du contrat', value: contract.reference, icon: <DocumentIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Type de produit', value: contract.productName, icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Date de signature', value: formatDate(contract.startDate), icon: <CalendarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Date d\'échéance', value: formatDate(contract.endDate), icon: <CalendarIcon className="h-5 w-5 text-gray-500" /> },
  ];
  
  const financialInfo = [
    { label: 'Montant accordé', value: formatAmount(contract.amount), icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Montant restant dû', value: formatAmount(contract.remainingAmount || 0), icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Taux d\'intérêt', value: `${contract.interestRate}%`, icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Durée (mois)', value: calculateTermInMonths().toString(), icon: <CalendarIcon className="h-5 w-5 text-gray-500" /> },
  ];
  
  const clientInfo = [
    { label: 'Client', value: contract.memberName, icon: <UserIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'ID du client', value: contract.memberId, icon: <BuildingOfficeIcon className="h-5 w-5 text-gray-500" /> },
  ];
  
  const legalInfo = [
    { label: 'Statut du contrat', value: contract.status, icon: <ScaleIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Classe de risque', value: contract.riskClass, icon: <DocumentIcon className="h-5 w-5 text-gray-500" /> },
  ];
  
  // Informations supplémentaires (affichées uniquement si showAllDetails est vrai)
  const additionalInfo = [
    { label: 'Montant décaissé', value: formatAmount(contract.disbursedAmount || 0), icon: <CurrencyDollarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Date dernier paiement', value: formatDate(contract.lastPaymentDate), icon: <CalendarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Prochain paiement', value: formatDate(contract.nextPaymentDate), icon: <CalendarIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'Jours de retard', value: contract.delinquencyDays.toString(), icon: <UserIcon className="h-5 w-5 text-gray-500" /> },
    { label: 'ID de la demande', value: contract.creditRequestId, icon: <DocumentIcon className="h-5 w-5 text-gray-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Détails du contrat</h2>
        <Button 
          variant="ghost"
          onClick={() => setShowAllDetails(!showAllDetails)}
        >
          {showAllDetails ? 'Afficher moins' : 'Afficher plus'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations générales</h3>
          <dl className="grid grid-cols-1 gap-3">
            {generalInfo.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="mr-2">{item.icon}</div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
        
        {/* Informations financières */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations financières</h3>
          <dl className="grid grid-cols-1 gap-3">
            {financialInfo.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="mr-2">{item.icon}</div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
        
        {/* Informations client */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations client</h3>
          <dl className="grid grid-cols-1 gap-3">
            {clientInfo.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="mr-2">{item.icon}</div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
        
        {/* Informations légales */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Informations légales</h3>
          <dl className="grid grid-cols-1 gap-3">
            {legalInfo.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="mr-2">{item.icon}</div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
      </div>
      
      {/* Informations supplémentaires (affichées uniquement si showAllDetails est vrai) */}
      {showAllDetails && (
        <>
          <Separator className="my-6" />
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Informations supplémentaires</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {additionalInfo.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="mr-2">{item.icon}</div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>
          
          {/* Section des commentaires (si l'ID est un document) */}
          {contract.documentUrl && (
            <Card className="p-4 mt-4">
              <h3 className="text-lg font-medium mb-4">Documents associés</h3>
              <p className="text-sm text-gray-700">
                <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  <DocumentIcon className="h-5 w-5 mr-2" />
                  Ouvrir le document du contrat
                </a>
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
