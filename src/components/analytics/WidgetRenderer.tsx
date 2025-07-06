import React, { useState } from 'react';
import { Settings, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { PerformanceWidget } from './widgets/PerformanceWidget';
import { AllocationWidget } from './widgets/AllocationWidget';
import { RiskWidget } from './widgets/RiskWidget';
import { TrendWidget } from './widgets/TrendWidget';
import { WidgetConfigurationModal } from './widgets/WidgetConfigurationModal';
import { Button } from '../ui/Button';
import type { Widget } from '../../types/analytics';

interface WidgetRendererProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
  onDelete: () => void;
}

export function WidgetRenderer({ widget, onUpdate, onDelete }: WidgetRendererProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const components = {
    performance: PerformanceWidget,
    allocation: AllocationWidget,
    risk: RiskWidget,
    trend: TrendWidget
  };

  const Component = components[widget.type];
  if (!Component) return null;

  const handleConfigChange = (newConfig: Widget['config']) => {
    onUpdate({ config: newConfig });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <input
          type="text"
          value={widget.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="text-lg font-medium bg-transparent border-none focus:outline-none"
        />
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            icon={<MoreVertical className="h-4 w-4" />}
          />
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowConfig(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurer
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <Component widget={widget} onUpdate={onUpdate} />
      </div>

      {showConfig && (
        <WidgetConfigurationModal
          type={widget.type}
          config={widget.config}
          onConfigChange={handleConfigChange}
          onClose={() => setShowConfig(false)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}