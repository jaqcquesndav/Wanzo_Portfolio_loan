// src/components/prospection/treasury/TreasuryMetricsCards.tsx
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import type { Company } from '../../../types/company';

interface TreasuryMetricsCardsProps {
  company: Company;
}

export function TreasuryMetricsCards({ company }: TreasuryMetricsCardsProps) {
  const { formatAmount } = useCurrencyContext();
  const metrics = company.financial_metrics;

  const cards = [
    {
      id: 'revenue',
      label: 'Chiffre d\'affaires',
      value: formatAmount(metrics.annual_revenue),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      change: metrics.revenue_growth,
    },
    {
      id: 'profit',
      label: 'Marge bénéficiaire',
      value: `${metrics.profit_margin.toFixed(2)}%`,
      icon: PieChart,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: null,
    },
    {
      id: 'cashflow',
      label: 'Flux de trésorerie',
      value: formatAmount(metrics.cash_flow),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      change: null,
    },
    {
      id: 'working_capital',
      label: 'Fonds de roulement',
      value: formatAmount(metrics.working_capital),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      change: null,
    },
    {
      id: 'debt',
      label: 'Ratio d\'endettement',
      value: `${(metrics.debt_ratio * 100).toFixed(1)}%`,
      icon: TrendingDown,
      color: metrics.debt_ratio > 0.7 ? 'text-red-600' : 'text-green-600',
      bgColor: metrics.debt_ratio > 0.7 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20',
      change: null,
    },
    {
      id: 'treasury',
      label: 'Solde de trésorerie',
      value: metrics.treasury_data 
        ? formatAmount(metrics.treasury_data.total_treasury_balance)
        : 'N/A',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`${card.bgColor} rounded-lg p-3 border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-4 h-4 ${card.color}`} />
              {card.change !== null && card.change !== undefined && (
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    card.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.change > 0 ? '+' : ''}{card.change.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {card.label}
            </div>
            <div className={`text-lg font-bold ${card.color}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
