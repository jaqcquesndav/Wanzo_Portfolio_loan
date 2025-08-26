// src/components/dashboard/OHADACharts.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { OHADAMetrics } from '../../types/dashboard/ohada';
import { TrendingUpIcon, PieChartIcon, BarChart3Icon, ActivityIcon } from 'lucide-react';

interface OHADAChartsProps {
  metrics: OHADAMetrics[];
  selectedMetrics: OHADAMetrics | null;
}

/**
 * Composant de graphiques pour les métriques OHADA
 * Visualisations conformes aux standards du financement PME
 */
export const OHADACharts: React.FC<OHADAChartsProps> = ({ metrics, selectedMetrics }) => {
  if (!selectedMetrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez un portefeuille pour voir les graphiques</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcul des données pour les graphiques
  const nplEvolution = selectedMetrics.monthlyPerformance.map((value, index) => ({
    month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][index],
    value: value
  }));

  const portfolioComparison = metrics.map(m => ({
    name: m.name.substring(0, 15) + (m.name.length > 15 ? '...' : ''),
    npl: m.nplRatio,
    roa: m.roa,
    yield: m.portfolioYield
  }));

  return (
    <div className="space-y-6">
      {/* Graphique NPL vs ROA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3Icon className="h-5 w-5" />
            <span>Matrice Risque/Rendement (NPL vs ROA)</span>
            <Badge variant="secondary" className="ml-auto">Standards OHADA</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 border rounded-lg bg-gray-50 p-4">
            {/* Axes */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-600">NPL 0%</div>
            <div className="absolute top-4 left-4 text-xs text-gray-600">NPL 10%</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">ROA 5%</div>
            
            {/* Zones de conformité */}
            <div className="absolute top-4 right-4 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Zone BCEAO Conforme
            </div>
            
            {/* Seuils réglementaires */}
            <div 
              className="absolute border-t-2 border-dashed border-red-400 w-full" 
              style={{ top: '20%' }}
              title="Seuil BCEAO NPL 5%"
            ></div>
            
            {/* Points des portefeuilles */}
            <div className="relative h-full">
              {portfolioComparison.map((portfolio, index) => {
                const x = Math.min(Math.max((portfolio.roa / 8) * 100, 5), 95);
                const y = Math.min(Math.max(100 - (portfolio.npl / 10) * 100, 5), 95);
                
                return (
                  <div
                    key={index}
                    className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 ${
                      portfolio.npl <= 5 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={`${portfolio.name}: NPL ${portfolio.npl}%, ROA ${portfolio.roa}%`}
                  ></div>
                );
              })}
            </div>
            
            {/* Légende */}
            <div className="absolute bottom-16 right-4 text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                <span>Conforme BCEAO</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                <span>Non conforme</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUpIcon className="h-5 w-5" />
              <span>Performance Mensuelle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2 px-4">
              {nplEvolution.slice(-12).map((item, index) => {
                const height = Math.max((item.value / 25) * 100, 5);
                const isGood = item.value >= 15;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t-sm ${
                        isGood ? 'bg-green-500' : 'bg-red-400'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${item.month}: ${item.value.toFixed(1)}%`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2 transform rotate-45 origin-bottom-left">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-600">
              <span>0%</span>
              <span>Performance du portefeuille</span>
              <span>25%</span>
            </div>
          </CardContent>
        </Card>

        {/* Répartition Balance AGE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Répartition Balance AGE</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {/* Graphique en anneau simplifié */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Arrière-plan */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="10"
                  />
                  
                  {/* Segments */}
                  {(() => {
                    const total = selectedMetrics.balanceAGE.current + 
                                  selectedMetrics.balanceAGE.days30 + 
                                  selectedMetrics.balanceAGE.days60 + 
                                  selectedMetrics.balanceAGE.days90Plus;
                    
                    let offset = 0;
                    const segments = [
                      { value: selectedMetrics.balanceAGE.current, color: '#10b981', label: 'Courant' },
                      { value: selectedMetrics.balanceAGE.days30, color: '#f59e0b', label: '31-60j' },
                      { value: selectedMetrics.balanceAGE.days60, color: '#f97316', label: '61-90j' },
                      { value: selectedMetrics.balanceAGE.days90Plus, color: '#ef4444', label: '90+j' }
                    ];
                    
                    return segments.map((segment, index) => {
                      const percentage = (segment.value / total) * 100;
                      const strokeDasharray = `${percentage * 2.199} ${219.9 - percentage * 2.199}`;
                      const strokeDashoffset = -offset * 2.199;
                      offset += percentage;
                      
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="10"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      );
                    });
                  })()}
                </svg>
                
                {/* Centre du graphique */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedMetrics.balanceAGE.current}%
                    </div>
                    <div className="text-xs text-gray-600">Courant</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Légende */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs">Courant ({selectedMetrics.balanceAGE.current}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs">31-60j ({selectedMetrics.balanceAGE.days30}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs">61-90j ({selectedMetrics.balanceAGE.days60}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs">90+j ({selectedMetrics.balanceAGE.days90Plus}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparaison des portefeuilles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ActivityIcon className="h-5 w-5" />
            <span>Comparaison des Portefeuilles</span>
            <Badge variant="secondary" className="ml-auto">
              {metrics.length} portefeuilles
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioComparison.slice(0, 5).map((portfolio, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{portfolio.name}</h4>
                  <div className="flex space-x-4 mt-1 text-xs text-gray-600">
                    <span>NPL: {portfolio.npl}%</span>
                    <span>ROA: {portfolio.roa}%</span>
                    <span>Rendement: {portfolio.yield}%</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {/* Barre NPL */}
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${portfolio.npl <= 3 ? 'bg-green-500' : portfolio.npl <= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min((portfolio.npl / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      portfolio.npl <= 5 ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                    }`}
                  >
                    {portfolio.npl <= 5 ? 'Conforme' : 'Risque'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
