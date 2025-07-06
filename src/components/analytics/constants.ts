import type { WidgetTemplate } from '../../types/analytics';

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'performance',
    name: 'Performance Chart',
    description: 'Track portfolio performance over time',
    defaultConfig: {
      timeRange: '1Y',
      metrics: ['value', 'benchmark'],
      visualization: 'line'
    },
    preview: 'performance.png'
  },
  {
    type: 'allocation',
    name: 'Asset Allocation',
    description: 'View asset distribution',
    defaultConfig: {
      visualization: 'pie'
    },
    preview: 'allocation.png'
  },
  {
    type: 'risk',
    name: 'Risk Analysis',
    description: 'Monitor risk metrics',
    defaultConfig: {
      metrics: ['var', 'volatility', 'sharpe', 'sortino'],
      visualization: 'radar'
    },
    preview: 'risk.png'
  },
  {
    type: 'trend',
    name: 'Market Trends',
    description: 'Analyze market trends',
    defaultConfig: {
      timeRange: '6M',
      visualization: 'area'
    },
    preview: 'trend.png'
  }
];