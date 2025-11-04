// components/portfolio/traditional/contract/ContractOverview.tsx
import { Button } from '../../../ui/Button';
import { StatusBadge } from '../../../ui/StatusBadge';
import { CreditContract } from '../../../../types/credit-contract';
import { useCurrencyContext } from '../../../../hooks/useCurrencyContext';

interface ContractOverviewProps {
  contract: CreditContract;
}

export function ContractOverview({ contract }: ContractOverviewProps) {
  // Utiliser le contexte de devise pour le formatage des montants
  const { formatAmount } = useCurrencyContext();
  
  // Calculer le pourcentage restant à payer
  const remainingPercentage = contract.remainingAmount 
    ? Math.round((contract.remainingAmount / contract.amount) * 100) 
    : 0;
  
  // Calculer le nombre de jours depuis le dûbut du contrat
  const daysSinceStart = contract.startDate 
    ? Math.round((new Date().getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Contrat {contract.reference}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-500">{contract.memberName}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">{formatAmount(contract.amount)}</span>
            <span className="text-gray-300">•</span>
            <StatusBadge status={contract.status} />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exporter
          </Button>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Montant restant dû</h3>
          <div className="mt-1">
            <div className="text-lg font-semibold">{formatAmount(contract.remainingAmount || 0)}</div>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${remainingPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${remainingPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 ml-2">{remainingPercentage}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Valeur des garanties</h3>
          <div className="flex items-end justify-between mt-1">
            <div className="text-lg font-semibold">{formatAmount(contract.guaranteesTotalValue || 0)}</div>
            <div className="text-xs text-gray-500">
              {Math.round(((contract.guaranteesTotalValue || 0) / contract.amount) * 100)}% du montant
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Durée écoulée</h3>
          <div className="mt-1">
            <div className="text-lg font-semibold">{daysSinceStart} jours</div>
            <div className="text-xs text-gray-500">
              dûbut: {new Date(contract.startDate || '').toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Classe de risque</h3>
          <div className="flex items-center justify-between mt-1">
            <div className="text-lg font-semibold">{contract.riskClass}</div>
            <div 
              className={`px-2 py-1 rounded text-xs ${
                contract.riskClass === 'standard' ? 'bg-green-100 text-green-800' :
                contract.riskClass === 'watch' ? 'bg-yellow-100 text-yellow-800' :
                contract.riskClass === 'substandard' ? 'bg-orange-100 text-orange-800' :
                contract.riskClass === 'doubtful' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}
            >
              {contract.delinquencyDays} jours de retard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



