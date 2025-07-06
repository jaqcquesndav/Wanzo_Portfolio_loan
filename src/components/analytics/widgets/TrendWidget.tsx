import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Widget } from '../../../types/analytics';
import { WidgetHeader } from './WidgetHeader';

export function TrendWidget({ widget, onUpdate }: { widget: Widget; onUpdate: (updates: Partial<Widget>) => void }) {
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
          <AreaChart data={widget.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}