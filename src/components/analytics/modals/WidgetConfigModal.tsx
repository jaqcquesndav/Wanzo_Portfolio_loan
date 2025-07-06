import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { FormField, Select, Input } from '../../ui/Form';
import type { Widget } from '../../../types/analytics';

interface WidgetConfigModalProps {
  widget: Widget;
  onClose: () => void;
  onSave: (config: Widget['config']) => void;
}

export function WidgetConfigModal({ widget, onClose, onSave }: WidgetConfigModalProps) {
  const [config, setConfig] = React.useState(widget.config);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Configure Widget</h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X className="h-5 w-5" />} />
        </div>

        <div className="p-6 space-y-4">
          {widget.type === 'performance' && (
            <>
              <FormField label="Time Range">
                <Select 
                  value={config.timeRange}
                  onChange={(e) => setConfig({...config, timeRange: e.target.value})}
                >
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="YTD">Year to Date</option>
                </Select>
              </FormField>

              <FormField label="Visualization">
                <Select
                  value={config.visualization}
                  onChange={(e) => setConfig({...config, visualization: e.target.value})}
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="area">Area Chart</option>
                </Select>
              </FormField>
            </>
          )}

          {widget.type === 'risk' && (
            <FormField label="Metrics">
              <div className="space-y-2">
                {['var', 'volatility', 'sharpe', 'sortino'].map(metric => (
                  <label key={metric} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.metrics?.includes(metric)}
                      onChange={(e) => {
                        const metrics = e.target.checked
                          ? [...(config.metrics || []), metric]
                          : (config.metrics || []).filter(m => m !== metric);
                        setConfig({...config, metrics});
                      }}
                      className="mr-2"
                    />
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </label>
                ))}
              </div>
            </FormField>
          )}

          {/* Add more configuration options based on widget type */}
        </div>

        <div className="flex justify-end p-6 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}