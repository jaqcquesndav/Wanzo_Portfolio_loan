import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { WIDGET_TEMPLATES } from './constants';
import { WidgetConfiguration } from './widgets/WidgetConfiguration';
import type { Widget, WidgetTemplate } from '../../types/analytics';

interface WidgetGalleryProps {
  onClose: () => void;
  onSelectWidget: (widget: Widget) => void;
}

export function WidgetGallery({ onClose, onSelectWidget }: WidgetGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<Widget['config'] | null>(null);

  const createWidget = (template: WidgetTemplate) => {
    if (!widgetConfig) {
      setSelectedTemplate(template);
      setWidgetConfig(template.defaultConfig);
      return;
    }

    const widget: Widget = {
      id: Math.random().toString(36).substr(2, 9),
      type: template.type,
      title: template.name,
      data: [],
      config: widgetConfig,
      layout: {
        x: 0,
        y: 0,
        w: 6,
        h: 4
      }
    };
    onSelectWidget(widget);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {selectedTemplate ? 'Configuration du widget' : 'Ajouter un widget'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          {selectedTemplate ? (
            <WidgetConfiguration
              type={selectedTemplate.type}
              config={widgetConfig || selectedTemplate.defaultConfig}
              onConfigChange={setWidgetConfig}
              onClose={() => {
                createWidget(selectedTemplate);
                onClose();
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WIDGET_TEMPLATES.map(template => (
                <button
                  key={template.type}
                  onClick={() => setSelectedTemplate(template)}
                  className="text-left p-6 border rounded-lg hover:border-primary transition-colors"
                >
                  <h3 className="font-medium text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">{template.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}