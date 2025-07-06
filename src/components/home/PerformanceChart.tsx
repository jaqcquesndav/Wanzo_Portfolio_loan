import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PerformanceData } from '../../types/portfolio';

interface PerformanceChartProps {
  data: PerformanceData;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Évolution des rendements
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Performance"
              stroke="#4F46E5"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="benchmark"
              name="Benchmark"
              stroke="#10B981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Performance YTD</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {data.ytd}%
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">vs Benchmark</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            +{data.benchmarkDiff}%
          </p>
        </div>
      </div>
    </div>
  );
}