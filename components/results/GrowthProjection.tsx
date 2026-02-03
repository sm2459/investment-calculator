'use client';

import { useEffect, useRef, memo } from 'react';
import { Chart, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler } from 'chart.js';
import { GrowthData, Scenarios } from '@/types';
import { TrendingUp } from '@/components/icons/Icons';

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler);

interface GrowthProjectionProps {
  growthDataExpected: GrowthData;
  growthDataConservative: GrowthData;
  growthDataOptimistic: GrowthData;
  growthDataCrisis: GrowthData;
  scenarios: Scenarios;
  timeHorizon: number;
  finalValue: number;
  totalContributed: number;
  totalReturn: number;
  totalDividends: number;
  capitalGains: number;
}

export default memo(function GrowthProjection({
  growthDataExpected,
  growthDataConservative,
  growthDataOptimistic,
  growthDataCrisis,
  scenarios,
  timeHorizon,
  finalValue,
  totalContributed,
  totalReturn,
  totalDividends,
  capitalGains
}: GrowthProjectionProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: growthDataExpected.years,
        datasets: [
          {
            label: 'Optimistic (' + scenarios.optimistic.toFixed(1) + '%)',
            data: growthDataOptimistic.values,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5]
          },
          {
            label: 'Expected (' + scenarios.expected.toFixed(1) + '%)',
            data: growthDataExpected.values,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          },
          {
            label: 'Conservative (' + scenarios.conservative.toFixed(1) + '%)',
            data: growthDataConservative.values,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5]
          },
          {
            label: 'Market Crisis (' + scenarios.crisis.toFixed(1) + '%)',
            data: growthDataCrisis.values,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.05)',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [10, 5]
          },
          {
            label: 'Total Contributions',
            data: growthDataExpected.totalContributions,
            borderColor: '#6b7280',
            backgroundColor: 'rgba(107, 114, 128, 0.05)',
            fill: false,
            tension: 0.4,
            borderDash: [2, 2],
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': $' + (context.parsed.y ?? 0).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                const numValue = Number(value);
                if (numValue >= 1000000) {
                  return '$' + (numValue / 1000000).toFixed(1) + 'M';
                } else if (numValue >= 1000) {
                  return '$' + (numValue / 1000).toFixed(0) + 'k';
                } else {
                  return '$' + numValue.toFixed(0);
                }
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Years'
            }
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [growthDataExpected, growthDataConservative, growthDataOptimistic, growthDataCrisis, scenarios]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Growth Projection
      </h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Invested</div>
          <div className="text-lg font-bold text-gray-800 truncate">
            ${totalContributed.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Value ({timeHorizon}Y)</div>
          <div className="text-lg font-bold text-green-600 truncate">
            ${finalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Growth</div>
          <div className="text-lg font-bold text-purple-600 truncate">
            ${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Return</div>
          <div className="text-lg font-bold text-indigo-600">
            {totalContributed > 0 ? ((totalReturn / totalContributed) * 100).toFixed(1) : 'N/A'}%
          </div>
        </div>
      </div>

      {/* Narrative summary */}
      {totalContributed > 0 && totalReturn > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-gray-700">
            Over {timeHorizon} years, your ${totalContributed.toLocaleString('en-US', { minimumFractionDigits: 0 })} investment
            could grow to <span className="font-bold text-green-600">${finalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span> —
            that&apos;s <span className="font-bold text-purple-600">${totalReturn.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span> in
            growth from compound returns working for you.
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="relative w-full overflow-hidden" style={{ height: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Earnings breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-teal-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Dividend Income</div>
          <div className="text-lg font-bold text-teal-600 truncate">
            ${totalDividends.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Avg {growthDataExpected.weightedDividendYield.toFixed(2)}% yield
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Capital Gains</div>
          <div className="text-lg font-bold text-amber-600 truncate">
            ${capitalGains.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          {totalReturn > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {((capitalGains / totalReturn) * 100).toFixed(1)}% of growth
            </div>
          )}
        </div>
        <div className="bg-rose-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Last Year Income</div>
          <div className="text-lg font-bold text-rose-600 truncate">
            ${growthDataExpected.dividendIncome[growthDataExpected.dividendIncome.length - 1].toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Annual (Year {timeHorizon})
          </div>
        </div>
      </div>
    </div>
  );
});
