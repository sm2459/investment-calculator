'use client';

import { memo } from 'react';
import { Scale, Check, TrendingUp } from '@/components/icons/Icons';

interface ComparisonCardProps {
  selectedPortfolioIndex: number;
  lowestFeeIndex: number;
  lowestFee: number;
  currentFee: number;
  mode: 'guided' | 'custom' | 'rebalance';
}

// Benchmark expense ratios for comparison
const BENCHMARKS = {
  targetDateFund: 0.0012, // 0.12% - typical target date fund
  activelyManaged: 0.0075, // 0.75% - average actively managed fund
  advisor: 0.01, // 1% - typical advisor fee
};

export default memo(function ComparisonCard({
  selectedPortfolioIndex,
  lowestFeeIndex,
  lowestFee,
  currentFee,
  mode
}: ComparisonCardProps) {
  // Show for both guided and custom modes
  if (mode === 'rebalance') return null;

  const isLowestFee = mode === 'guided' && selectedPortfolioIndex === lowestFeeIndex;
  const feeDifference = currentFee - lowestFee;
  const vsTargetDate = currentFee - BENCHMARKS.targetDateFund;
  const vsActivelyManaged = currentFee - BENCHMARKS.activelyManaged;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
        <Scale className="w-5 h-5 text-blue-500" />
        How You Compare
      </h3>

      {isLowestFee ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-3 text-green-700">
            <Check className="w-5 h-5 shrink-0" />
            <span className="font-semibold">You have the lowest-fee option!</span>
          </div>
          <p className="text-sm text-green-600 mt-2">
            Your selected portfolio has the lowest expense ratio among the guided options.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-yellow-800">
                A lower-fee option is available
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Portfolio #{lowestFeeIndex + 1} has lower fees
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-yellow-700">
                +{(feeDifference * 100).toFixed(3)}%
              </div>
              <div className="text-xs text-yellow-600">extra fees/year</div>
            </div>
          </div>
        </div>
      )}

      {/* Fee comparison bars */}
      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Your Portfolio</span>
            <span className="font-medium">{(currentFee * 100).toFixed(3)}%</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${Math.min((currentFee / 0.1) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        {!isLowestFee && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Lowest Fee Option</span>
              <span className="font-medium text-green-600">{(lowestFee * 100).toFixed(3)}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min((lowestFee / 0.1) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">1% Advisor Fee</span>
            <span className="font-medium text-red-600">1.000%</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-gray-500 leading-relaxed">
        Even small fee differences compound significantly over time. A 0.05% difference on a $100K portfolio
        is $50/year, but becomes thousands over decades.
      </p>

      {/* Custom mode comparison */}
      {mode === 'custom' && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <TrendingUp className="w-4 h-4 text-green-500" />
            How Your Custom Mix Compares
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your Portfolio</span>
              <span className="font-bold text-blue-600">{(currentFee * 100).toFixed(3)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Target Date Fund (avg)</span>
              <span className={`font-medium ${vsTargetDate < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {(BENCHMARKS.targetDateFund * 100).toFixed(2)}%
                {vsTargetDate < 0 && <span className="ml-1 text-xs">(you save {Math.abs(vsTargetDate * 100).toFixed(3)}%)</span>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actively Managed Fund (avg)</span>
              <span className={`font-medium ${vsActivelyManaged < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {(BENCHMARKS.activelyManaged * 100).toFixed(2)}%
                {vsActivelyManaged < 0 && <span className="ml-1 text-xs">(you save {Math.abs(vsActivelyManaged * 100).toFixed(3)}%)</span>}
              </span>
            </div>
          </div>
          {vsActivelyManaged < 0 && (
            <p className="mt-4 text-xs text-green-700 bg-green-50 p-3 rounded-lg">
              Your custom portfolio costs less than the average actively managed fund —
              great job keeping costs low!
            </p>
          )}
        </div>
      )}
    </div>
  );
});
