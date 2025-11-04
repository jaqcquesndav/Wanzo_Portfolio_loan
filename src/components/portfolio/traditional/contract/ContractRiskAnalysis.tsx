// components/portfolio/traditional/contract/ContractRiskAnalysis.tsx
import { useState, useEffect } from 'react';
import { Card } from '../../../ui/Card';
import { CreditContract } from '../../../../types/credit-contract';

// Fonction utilitaire pour le formatage des montants
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

// Fonction utilitaire pour le formatage des pourcentages
const formatPercent = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
};

interface RiskIndicator {
  name: string;
  value: number;
  description: string;
  status: 'good' | 'warning' | 'danger';
  details?: string;
}

interface ContractRiskAnalysisProps {
  contract: CreditContract;
}

export function ContractRiskAnalysis({ contract }: ContractRiskAnalysisProps) {
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    // Simulation de données pour la démo
    const calculateRiskIndicators = () => {
      setLoading(true);
      
      // Simuler un délai de calcul
      setTimeout(() => {
        // Calcul du ratio de couverture des garanties
        const collateralCoverage = ((contract.guaranteesTotalValue || 0) / contract.amount) * 100;
        
        // Calculer le ratio de remboursement (payé / total)
        const repaymentRatio = ((contract.amount - (contract.remainingAmount || 0)) / contract.amount) * 100;
        
        // Simuler un score de crédit basé sur l'historique
        const creditScore = 70 + Math.floor(Math.random() * 25);
        
        // Simuler un ratio d'endettement
        const debtToIncomeRatio = 35 + Math.floor(Math.random() * 20);
        
        // Créer les indicateurs de risque
        const indicators: RiskIndicator[] = [
          {
            name: 'Couverture des garanties',
            value: collateralCoverage,
            description: 'Ratio entre la valeur des garanties et le montant du prêt',
            status: collateralCoverage >= 100 ? 'good' : collateralCoverage >= 80 ? 'warning' : 'danger',
            details: `${formatAmount(contract.guaranteesTotalValue || 0)} / ${formatAmount(contract.amount)}`
          },
          {
            name: 'Progression du remboursement',
            value: repaymentRatio,
            description: 'Pourcentage du prêt déjà remboursé',
            status: repaymentRatio >= 50 ? 'good' : repaymentRatio >= 20 ? 'warning' : 'danger',
            details: `${formatAmount(contract.amount - (contract.remainingAmount || 0))} / ${formatAmount(contract.amount)}`
          },
          {
            name: 'Score crédit',
            value: creditScore,
            description: 'Évaluation de la solvabilité du client basée sur son historique',
            status: creditScore >= 80 ? 'good' : creditScore >= 60 ? 'warning' : 'danger',
            details: `${creditScore}/100`
          },
          {
            name: 'Ratio d\'endettement',
            value: debtToIncomeRatio,
            description: 'Ratio entre les dettes et les revenus du client',
            status: debtToIncomeRatio <= 30 ? 'good' : debtToIncomeRatio <= 50 ? 'warning' : 'danger',
            details: `${debtToIncomeRatio}%`
          },
          {
            name: 'Jours de retard',
            value: contract.delinquencyDays || 0,
            description: 'Nombre de jours de retard sur les échéances',
            status: (contract.delinquencyDays || 0) === 0 ? 'good' : (contract.delinquencyDays || 0) <= 30 ? 'warning' : 'danger',
            details: `${contract.delinquencyDays || 0} jours`
          }
        ];
        
        setRiskIndicators(indicators);
        setLoading(false);
      }, 1000);
    };
    
    calculateRiskIndicators();
  }, [contract]);

  // Calculer le niveau de risque global
  const calculateOverallRisk = () => {
    if (riskIndicators.length === 0) return { level: 'N/A', color: 'bg-gray-200' };
    
    const dangerCount = riskIndicators.filter(i => i.status === 'danger').length;
    const warningCount = riskIndicators.filter(i => i.status === 'warning').length;
    
    if (dangerCount >= 2) return { level: 'Élevé', color: 'bg-red-500' };
    if (dangerCount === 1 || warningCount >= 2) return { level: 'Modéré', color: 'bg-yellow-500' };
    return { level: 'Faible', color: 'bg-green-500' };
  };
  
  const overallRisk = calculateOverallRisk();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Analyse de risque</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Niveau de risque global:</span>
          <span 
            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${overallRisk.color}`}
          >
            {overallRisk.level}
          </span>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {riskIndicators.map((indicator, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{indicator.name}</h3>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    indicator.status === 'good' ? 'bg-green-100 text-green-800' :
                    indicator.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {indicator.status === 'good' ? 'Bon' :
                   indicator.status === 'warning' ? 'Attention' :
                   'Risque'}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">{indicator.description}</p>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {indicator.name === 'Couverture des garanties' || indicator.name === 'Progression du remboursement' 
                      ? formatPercent(indicator.value) 
                      : indicator.details}
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: `${Math.min(100, indicator.value)}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      indicator.status === 'good' ? 'bg-green-500' :
                      indicator.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  ></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Recommandations */}
      <Card className="p-4 mt-6 bg-blue-50">
        <h3 className="text-lg font-medium mb-2">Recommandations</h3>
        <ul className="list-disc pl-5 space-y-2">
          {contract.riskClass === 'standard' && (
            <li className="text-sm text-blue-700">Le contrat présente un risque faible. Surveillance standard recommandée.</li>
          )}
          {contract.riskClass === 'watch' && (
            <>
              <li className="text-sm text-blue-700">Augmenter la fréquence des visites de suivi du client.</li>
              <li className="text-sm text-blue-700">Vérifier régulièrement la valeur des garanties.</li>
            </>
          )}
          {contract.riskClass === 'substandard' && (
            <>
              <li className="text-sm text-blue-700">Envisager une restructuration du prêt pour ajuster les échéances.</li>
              <li className="text-sm text-blue-700">Mettre en place un suivi mensuel de l'activité du client.</li>
              <li className="text-sm text-blue-700">Vérifier l'état des garanties et leur liquidité.</li>
            </>
          )}
          {(contract.riskClass === 'doubtful' || contract.riskClass === 'loss') && (
            <>
              <li className="text-sm text-blue-700">Initier une procédure de recouvrement préventif.</li>
              <li className="text-sm text-blue-700">Évaluer la possibilité de renforcer les garanties.</li>
              <li className="text-sm text-blue-700">Établir un plan de remboursement adapté avec le client.</li>
              <li className="text-sm text-blue-700">Préparer les documents pour une éventuelle procédure contentieuse.</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
}
