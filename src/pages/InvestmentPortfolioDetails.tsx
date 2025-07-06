// import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PortfolioMetrics } from '../components/portfolio/PortfolioMetrics';
import { useInvestmentPortfolios } from '../hooks/useInvestmentPortfolios';

export default function InvestmentPortfolioDetails() {
  const { id, portfolioType = 'investment' } = useParams();
  const navigate = useNavigate();
  const { portfolios } = useInvestmentPortfolios();
  const portfolio = portfolios.find(p => p.id === id);

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Portefeuille non trouvé</h2>
        <Button
          variant="outline"
          onClick={() => navigate(`/app/${portfolioType}/portfolios/investment`)}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/app/${portfolioType}/portfolios/investment`)}
          icon={<ArrowLeft className="h-5 w-5" />} 
        >
          Retour
        </Button>
          <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Détails du portefeuille</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Montant cible</p>
                <p className="font-medium">{portfolio.target_amount.toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rendement cible</p>
                <p className="font-medium">{portfolio.target_return}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Profil de risque</p>
                <p className="font-medium capitalize">{portfolio.risk_profile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Secteurs cibles</p>
                <div className="flex flex-wrap gap-2">
                  {portfolio.target_sectors.map((sector) => (
                    <span key={sector} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <PortfolioMetrics portfolio={portfolio} />
        </div>
      </div>
    </div>
  );
}
