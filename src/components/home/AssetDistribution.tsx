import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AssetDistribution as AssetDistributionType } from '../../types/portfolio';

interface AssetDistributionProps {
  distribution: AssetDistributionType;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'];

export function AssetDistribution({ distribution }: AssetDistributionProps) {
  const data = Object.entries(distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Répartition des actifs
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}