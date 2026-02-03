'use client';

import { memo } from 'react';
import { FundAllocation } from '@/types';
import { Percent, AlertTriangle } from '@/components/icons/Icons';

interface CostAnalysisProps {
  fundAllocations: FundAllocation[];
  weightedExpenseRatio: number;
  totalCost: number;
  totalFeesLost: number;
  totalAdvisorFeesLost: number;
  timeHorizon: number;
}

export default memo(function CostAnalysis({
  fundAllocations,
  weightedExpenseRatio,
  totalCost,
  totalFeesLost,
  totalAdvisorFeesLost,
  timeHorizon
}: CostAnalysisProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Cost Analysis</h3>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-2">Weighted Expense Ratio</div>
          <div className="text-2xl font-bold text-blue-600">{weightedExpenseRatio.toFixed(3)}%</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-2">Annual Cost</div>
          <div className="text-2xl font-bold text-yellow-600">
            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-2">Fees Lost ({timeHorizon}Y)</div>
          <div className="text-2xl font-bold text-red-600">
            ${totalFeesLost.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Fund breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Fund-by-Fund Breakdown</h4>
        <div className="space-y-2">
          {fundAllocations.map((fund, index) => (
            <div key={index} className="flex items-center justify-between py-3 px-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded font-medium">{fund.provider}</span>
                <span className="font-medium text-gray-800">{fund.ticker}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {fund.expenseRatio}%
                </span>
                <span className="text-gray-700 font-semibold min-w-[80px] text-right">
                  ${fund.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}/yr
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisor comparison */}
      <div className="bg-red-50 rounded-xl p-5 border border-red-100">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800 text-base">Cost of 1% Financial Advisor Fee</h4>
            <p className="text-3xl font-bold text-red-600 mt-2">
              ${totalAdvisorFeesLost.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-red-700 mt-2">
              Additional cost vs. self-managing these ETFs over {timeHorizon} years
            </p>
          </div>
        </div>
      </div>

      {/* Empowering message */}
      <div className="bg-green-50 rounded-xl p-5 border border-green-100 mt-4">
        <p className="text-sm text-green-800">
          <span className="font-semibold">You&apos;re making a smart choice.</span> By self-managing a low-cost ETF portfolio,
          you&apos;re keeping more of your returns. Even small fee differences compound dramatically over time —
          the ${totalAdvisorFeesLost.toLocaleString('en-US', { minimumFractionDigits: 0 })} you&apos;re saving could mean years of extra retirement income.
        </p>
      </div>

      {/* Tax efficiency note */}
      <div className="mt-5 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tax Efficiency</h4>
        <div className="flex flex-wrap gap-2">
          {fundAllocations.map((fund, index) => (
            <span
              key={index}
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                fund.taxEfficiency === 'Excellent' ? 'bg-green-100 text-green-700' :
                fund.taxEfficiency === 'Very Good' ? 'bg-blue-100 text-blue-700' :
                fund.taxEfficiency === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}
            >
              {fund.ticker}: {fund.taxEfficiency}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});
