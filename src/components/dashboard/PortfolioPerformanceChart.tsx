import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);


interface PortfolioPerformanceChartProps {
  data: number[];
  labels: string[];
  color?: string;
}

export function PortfolioPerformanceChart({ data, labels, color = '#2563eb' }: PortfolioPerformanceChartProps) {
  // (Gradient inutilisé en mode fallback universel)

  // Prépare les données avec gradient dynamique ou fallback couleur si canvas non dispo
  const chartDataObj = {
    labels: labels,
    datasets: [
      {
        label: 'Performance',
        data: data,
        borderColor: color,
        backgroundColor: color + '22', // fallback couleur (statique, pas de gradient)
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 7,
        pointBackgroundColor: color,
        pointBorderWidth: 2,
      },
    ],
  };

  // Options dynamiques et illustratives
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#fff',
        titleColor: '#111',
        bodyColor: '#111',
        borderColor: color,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => ` ${ctx.parsed.y}`,
        },
      },
    },
    hover: {
      mode: 'nearest' as const,
      intersect: false,
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { color: '#64748b', font: { weight: 500 } },
      },
      y: {
        display: true,
        grid: { color: '#e5e7eb22' },
        ticks: { color: '#64748b', font: { weight: 500 } },
      },
    },
  };

  return (
    <div className="w-full flex items-start justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 w-full h-64 flex items-center justify-center">
        <div className="w-full h-full">
          <Line
            data={chartDataObj}
            options={options}
          />
        </div>
      </div>
    </div>
  );
}