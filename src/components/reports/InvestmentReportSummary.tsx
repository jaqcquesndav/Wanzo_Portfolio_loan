// src/components/reports/InvestmentReportSummary.tsx
import React from 'react';
import { CalendarRange, CreditCard, TrendingUp, Briefcase, Users, BarChart3, Map, AlertCircle } from 'lucide-react';

interface InvestmentReportSummaryProps {
  metrics: {
    totalInvestment: number;
    totalCurrentValue: number;
    averageMultiple: number;
    averageIRR: number;
    averageHoldingPeriod: number;
    totalCompanies: number;
    activeCompanies: number;
    jobsCreated: number;
    mostCommonSector: string;
    mostCommonCountry: string;
    exitedDeals: number;
    lossPercentage: number;
  };
}

export const InvestmentReportSummary: React.FC<InvestmentReportSummaryProps> = ({ metrics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total investi</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(metrics.totalInvestment)}
            </h3>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Valuation actuelle:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{formatCurrency(metrics.totalCurrentValue)}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Multiple moyen</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.averageMultiple.toFixed(2)}x
            </h3>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">TRI moyen:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{metrics.averageIRR.toFixed(2)}%</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Durée moyenne de détention</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.averageHoldingPeriod.toFixed(1)} ans
            </h3>
          </div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
            <CalendarRange className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Investissements actifs:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{metrics.activeCompanies} sur {metrics.totalCompanies}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Entreprises financées</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.totalCompanies}
            </h3>
          </div>
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-md">
            <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Sorties réalisées:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{metrics.exitedDeals}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emplois créés</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {new Intl.NumberFormat('fr-FR').format(metrics.jobsCreated)}
            </h3>
          </div>
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-md">
            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Par entreprise:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
            ~{new Intl.NumberFormat('fr-FR').format(Math.round(metrics.jobsCreated / metrics.totalCompanies))}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Secteur principal</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
              {metrics.mostCommonSector || "-"}
            </h3>
          </div>
          <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-md">
            <BarChart3 className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Diversification:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">Moyenne</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pays principal</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
              {metrics.mostCommonCountry || "-"}
            </h3>
          </div>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-md">
            <Map className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Présence:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">Zone CEMAC</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de perte</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.lossPercentage.toFixed(1)}%
            </h3>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-md">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Investissements &lt;1x:</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
            {Math.round(metrics.totalCompanies * metrics.lossPercentage / 100)}
          </span>
        </div>
      </div>
    </div>
  );
};
