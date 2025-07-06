import React from 'react';
import { FormField, Select, Input } from '../../ui/Form';
import { Button } from '../../ui/Button';
import type { Widget, WidgetType } from '../../../types/analytics';

interface WidgetConfigurationProps {
  type: WidgetType;
  config: Widget['config'];
  onConfigChange: (config: Widget['config']) => void;
  onClose: () => void;
}

export function WidgetConfiguration({ type, config, onConfigChange, onClose }: WidgetConfigurationProps) {
  const handleChange = (key: string, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  const renderMetricsSelection = () => {
    const availableMetrics = {
      performance: ['value', 'benchmark', 'volatility', 'alpha', 'beta', 'sharpe'],
      risk: ['var', 'volatility', 'sharpe', 'sortino', 'beta'],
      allocation: ['equity', 'fixed_income', 'cash', 'alternatives'],
      trend: ['value', 'moving_average', 'volume']
    };

    return (
      <FormField label="Métriques à afficher">
        <div className="space-y-2">
          {availableMetrics[type]?.map(metric => (
            <label key={metric} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.metrics?.includes(metric)}
                onChange={(e) => {
                  const metrics = e.target.checked
                    ? [...(config.metrics || []), metric]
                    : (config.metrics || []).filter(m => m !== metric);
                  handleChange('metrics', metrics);
                }}
                className="rounded border-gray-300"
              />
              <span className="capitalize">{metric.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </FormField>
    );
  };

  const renderVisualizationSelection = () => {
    const visualizations = {
      performance: ['line', 'bar', 'area'],
      risk: ['radar', 'bar', 'line'],
      allocation: ['pie', 'donut', 'treemap'],
      trend: ['line', 'area', 'candlestick']
    };

    return (
      <FormField label="Type de visualisation">
        <Select
          value={config.visualization}
          onChange={(e) => handleChange('visualization', e.target.value)}
        >
          {visualizations[type]?.map(viz => (
            <option key={viz} value={viz}>
              {viz.charAt(0).toUpperCase() + viz.slice(1)}
            </option>
          ))}
        </Select>
      </FormField>
    );
  };

  const renderTimeRangeSelection = () => (
    <FormField label="Période">
      <Select
        value={config.timeRange}
        onChange={(e) => handleChange('timeRange', e.target.value)}
      >
        <option value="1D">1 Jour</option>
        <option value="1W">1 Semaine</option>
        <option value="1M">1 Mois</option>
        <option value="3M">3 Mois</option>
        <option value="6M">6 Mois</option>
        <option value="1Y">1 An</option>
        <option value="YTD">Année en cours</option>
      </Select>
    </FormField>
  );

  const renderComparisonSelection = () => (
    <FormField label="Comparaison">
      <Select
        value={config.comparison}
        onChange={(e) => handleChange('comparison', e.target.value)}
      >
        <option value="none">Aucune</option>
        <option value="benchmark">Benchmark</option>
        <option value="previous">Période précédente</option>
      </Select>
    </FormField>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderTimeRangeSelection()}
        {renderVisualizationSelection()}
        {type !== 'allocation' && renderComparisonSelection()}
      </div>

      {renderMetricsSelection()}

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={() => onClose()}>
          Appliquer
        </Button>
      </div>
    </div>
  );
}