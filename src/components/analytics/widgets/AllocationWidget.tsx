import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Widget } from '../../../types/analytics';
import { WidgetHeader } from './WidgetHeader';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'];

export function AllocationWidget({ widget, onUpdate }: { widget: Widget; onUpdate: (updates: Partial<Widget>) => void }) {
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
          <PieChart>
            <Pie
              data={widget.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
            >
              {widget.data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}