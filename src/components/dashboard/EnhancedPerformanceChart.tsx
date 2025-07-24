import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js/auto';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EnhancedPerformanceChartProps {
  data: number[];
  labels: string[];
  benchmark?: number[];
  options?: {
    showBenchmark?: boolean;
    colors?: {
      primary: string;
      secondary: string;
      benchmark: string;
      gradient: string;
    };
    customTooltip?: boolean;
    smooth?: boolean;
    animated?: boolean;
  };
}

export const EnhancedPerformanceChart: React.FC<EnhancedPerformanceChartProps> = ({
  data,
  labels,
  benchmark = [],
  options = {}
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const {
    showBenchmark = true,
    colors = {
      primary: '#3b82f6',
      secondary: '#93c5fd',
      benchmark: '#94a3b8',
      gradient: 'from-blue-500/20 to-transparent'
    },
    customTooltip = true,
    smooth = true,
    animated = true
  } = options;

  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Détruire le graphique existant s'il y en a un
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Créer un dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colors.secondary + '40'); // Ajouter une transparence
    gradient.addColorStop(1, colors.secondary + '00'); // Transparent à la fin
    
    // Options communes pour les lignes
    const commonLineOptions = {
      tension: smooth ? 0.4 : 0, // Pour une courbe lisse
      borderWidth: 2,
      pointRadius: 0, // Masquer les points par défaut
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colors.primary,
      pointHitRadius: 10, // Zone de clic plus large
    };
    
    // Configuration du tooltip personnalisé
    const tooltipCallbacks = {
      title: function(tooltipItems: {label?: string}[]) {
        if (tooltipItems[0]?.label) {
          try {
            const date = new Date(tooltipItems[0].label);
            return format(date, 'MMMM yyyy', { locale: fr });
          } catch {
            return tooltipItems[0].label;
          }
        }
        return '';
      },
      label: function(tooltipItem: {dataset: {label?: string}, parsed: {y: number | null}}) {
        let label = tooltipItem.dataset.label || '';
        if (label) {
          label += ': ';
        }
        if (tooltipItem.parsed.y !== null) {
          label += new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2 }).format(tooltipItem.parsed.y / 100);
        }
        return label;
      }
    };
    
    // Options du graphique
    const chartOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: showBenchmark,
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            boxWidth: 6,
            padding: 20
          }
        },
        tooltip: {
          enabled: customTooltip,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1f2937',
          bodyColor: '#374151',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: tooltipCallbacks
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            color: '#9ca3af',
            callback: function(value, index) {
              if (typeof value !== 'number' || !labels[index]) return '';
              try {
                const date = new Date(labels[index]);
                // Afficher seulement le mois pour un affichage plus propre
                return format(date, 'MMM', { locale: fr });
              } catch {
                return labels[index];
              }
            }
          }
        },
        y: {
          grid: {
            color: '#f3f4f6'
          },
          border: {
            display: false
          },
          ticks: {
            color: '#9ca3af',
            padding: 10,
            callback: function(value) {
              return value + '%';
            }
          },
          // Ajouter une légère marge pour éviter que la courbe touche le bord
          suggestedMin: Math.min(...data) - Math.abs(Math.min(...data) * 0.1),
          suggestedMax: Math.max(...data) + Math.abs(Math.max(...data) * 0.1)
        }
      },
      elements: {
        line: {
          borderJoinStyle: 'round',
        }
      }
    };
    
    // Données du graphique
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Performance',
          data: data,
          borderColor: colors.primary,
          backgroundColor: gradient || 'rgba(59, 130, 246, 0.1)',
          ...commonLineOptions,
          fill: true
        }
      ]
    };
    
    // Ajouter l'indice de référence si demandé
    if (showBenchmark && benchmark.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const benchmarkDataset: any = {
        label: 'Indice de référence',
        data: benchmark,
        borderColor: colors.benchmark,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        tension: smooth ? 0.4 : 0,
        pointRadius: 2,
        pointHoverRadius: 5,
        // Supprimer les propriétés non reconnues par Chart.js
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: colors.benchmark,
        borderWidth: 3,
        borderDash: [5, 5],
        fill: false
      };
      chartData.datasets.push(benchmarkDataset);
    }
    
    // Configuration du graphique
    const config: ChartConfiguration = {
      type: 'line',
      data: chartData,
      options: chartOptions
    };
    
    // Créer le graphique
    chartInstance.current = new Chart(ctx, config);
    
    // Animation custom pour un effet plus professionnel
    if (animated && chartInstance.current) {
      chartInstance.current.options.animation = {
        duration: 1000,
        easing: 'easeOutQuart'
      };
      
      // Mise à jour du graphique après configuration
      chartInstance.current.update();
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, benchmark, showBenchmark, colors, customTooltip, smooth, animated]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default EnhancedPerformanceChart;
