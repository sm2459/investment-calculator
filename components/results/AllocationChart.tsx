'use client';

import { useEffect, useRef, memo } from 'react';
import { Chart, ChartConfiguration, DoughnutController, ArcElement, Legend, Tooltip } from 'chart.js';
import { FundAllocation } from '@/types';
import { CHART_COLORS } from '@/lib/etf-data';

// Register Chart.js components
Chart.register(DoughnutController, ArcElement, Legend, Tooltip);

interface AllocationChartProps {
  fundAllocations: FundAllocation[];
  investmentAmount: number;
}

export default memo(function AllocationChart({
  fundAllocations,
  investmentAmount
}: AllocationChartProps) {
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

    // Only create chart if there's money to show
    if (investmentAmount > 0 && fundAllocations.length > 0) {
      const config: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: fundAllocations.map(fund => fund.ticker),
          datasets: [{
            data: fundAllocations.map(fund => fund.amount),
            backgroundColor: CHART_COLORS.slice(0, fundAllocations.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return label + ': $' + value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                }
              }
            }
          }
        }
      };

      chartInstance.current = new Chart(ctx, config);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [fundAllocations, investmentAmount]);

  // Show empty state if no allocations
  const hasData = fundAllocations.length > 0 && fundAllocations.some(f => f.amount > 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Portfolio Allocation</h3>

      {!hasData ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Add holdings with values to see your allocation</p>
        </div>
      ) : (
        <div className="relative" style={{ maxWidth: '300px', margin: '0 auto' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      )}

      {/* Fund details */}
      {hasData && (
      <div className="mt-6 space-y-2">
        {fundAllocations.filter(f => f.amount > 0).map((fund, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              ></div>
              <div className="min-w-0">
                <span className="font-medium text-gray-800">{fund.ticker}</span>
                <span className="text-xs text-gray-500 ml-2 hidden sm:inline">{fund.fullName}</span>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="font-medium text-gray-800">
                ${fund.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500">{fund.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
});
