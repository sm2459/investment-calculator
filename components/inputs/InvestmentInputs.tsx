'use client';

import { DollarSign, Calendar } from '@/components/icons/Icons';

interface InvestmentInputsProps {
  investmentAmount: number;
  setInvestmentAmount: (value: number) => void;
  age: number;
  setAge: (value: number) => void;
  timeHorizon: number;
  setTimeHorizon: (value: number) => void;
  mode: 'guided' | 'custom' | 'rebalance';
}

export default function InvestmentInputs({
  investmentAmount,
  setInvestmentAmount,
  age,
  setAge,
  timeHorizon,
  setTimeHorizon,
  mode
}: InvestmentInputsProps) {
  return (
    <div className="space-y-5">
      {/* Investment Amount - only show for non-rebalance modes */}
      {mode !== 'rebalance' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            Initial Investment
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base">$</span>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              min="0"
              step="100"
            />
          </div>
          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[1000, 5000, 10000, 25000, 50000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setInvestmentAmount(amount)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  investmentAmount === amount
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ${amount >= 1000 ? `${amount / 1000}K` : amount}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Age */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Your Age
        </label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          min="18"
          max="100"
        />
        <p className="mt-2 text-xs text-gray-500">Used to recommend bond allocation</p>
      </div>

      {/* Time Horizon */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Investment Timeline
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="range"
              min="1"
              max="40"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full h-2 cursor-pointer range-slider"
            />
          </div>
          <span className="w-20 text-right font-semibold text-gray-700 text-lg">{timeHorizon} yrs</span>
        </div>
      </div>
    </div>
  );
}
