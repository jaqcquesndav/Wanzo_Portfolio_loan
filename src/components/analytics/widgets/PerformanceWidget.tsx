import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Widget } from '../../../types/analytics';
import { WidgetHeader } from './WidgetHeader';

interface PerformanceWidgetProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
}

export function PerformanceWidget({ widget, onUpdate }: PerformanceWidgetProps) {
  return (
    <div className="h-full flex flex-col">
      <WidgetHeader
        title={widget.title}
        onTitleChange={(title) => onUpdate({ title })}
        onRemove={() => onUpdate({ deleted: true })}
        onConfigure={() => {/* Open configuration modal */}}
      />
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={widget.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#4F46E5" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="benchmark" 
              stroke="#10B981" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}