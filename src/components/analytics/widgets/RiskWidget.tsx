import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Widget } from '../../../types/analytics';
import { WidgetHeader } from './WidgetHeader';

export function RiskWidget({ widget, onUpdate }: { widget: Widget; onUpdate: (updates: Partial<Widget>) => void }) {
  return (
    <div className="h-full flex flex-col">
      <WidgetHeader
        title={widget.title}
        onTitleChange={(title) => onUpdate({ title })}
        onRemove={() => onUpdate({ deleted: true })}
        onConfigure={() => {}}
      />
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={widget.data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <Radar
              name="Risk Metrics"
              dataKey="value"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}