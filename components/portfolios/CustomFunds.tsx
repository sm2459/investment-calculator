'use client';

import { CustomFund } from '@/types';
import { etfs } from '@/lib/etf-data';
import { Plus, X, Sliders } from '@/components/icons/Icons';

interface CustomFundsProps {
  customFunds: CustomFund[];
  setCustomFunds: (funds: CustomFund[]) => void;
}

export default function CustomFunds({
  customFunds,
  setCustomFunds
}: CustomFundsProps) {
  const totalAllocation = customFunds.reduce((sum, f) => sum + f.allocation, 0);
  const availableFunds = Object.keys(etfs).filter(
    key => !customFunds.some(f => f.ticker.toLowerCase() === key)
  );

  const addCustomFund = () => {
    if (availableFunds.length > 0) {
      setCustomFunds([
        ...customFunds,
        { ticker: availableFunds[0].toUpperCase(), allocation: 0 }
      ]);
    }
  };

  const removeCustomFund = (index: number) => {
    if (customFunds.length > 1) {
      setCustomFunds(customFunds.filter((_, i) => i !== index));
    }
  };

  const updateCustomFund = (index: number, field: keyof CustomFund, value: string | number) => {
    const updated = [...customFunds];
    if (field === 'ticker') {
      updated[index].ticker = value as string;
    } else {
      updated[index].allocation = value as number;
    }
    setCustomFunds(updated);
  };

  const normalizeAllocations = () => {
    const numFunds = customFunds.length;
    const baseAllocation = Math.floor(100 / numFunds);
    const remainder = 100 - (baseAllocation * numFunds);

    const normalized = customFunds.map((fund, index) => ({
      ...fund,
      allocation: baseAllocation + (index < remainder ? 1 : 0)
    }));

    setCustomFunds(normalized);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Custom Fund Mix</h3>
        <button
          onClick={normalizeAllocations}
          className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1.5"
        >
          <Sliders className="w-3 h-3" />
          Split Evenly
        </button>
      </div>

      {/* Allocation warning */}
      {totalAllocation !== 100 && (
        <div className={`p-3 rounded-lg text-sm ${
          totalAllocation > 100 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          Total allocation: {totalAllocation}% {totalAllocation > 100 ? '(exceeds 100%)' : `(${100 - totalAllocation}% remaining)`}
        </div>
      )}

      {/* Fund list */}
      <div className="space-y-4">
        {customFunds.map((fund, index) => {
          const etf = etfs[fund.ticker.toLowerCase()];
          return (
            <div key={index} className="p-4 border rounded-xl bg-white">
              <div className="flex items-start gap-4">
                {/* Fund selector */}
                <div className="flex-1 min-w-0">
                  <select
                    value={fund.ticker}
                    onChange={(e) => updateCustomFund(index, 'ticker', e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(etfs).map(([key, etfData]) => (
                      <option
                        key={key}
                        value={etfData.name}
                        disabled={customFunds.some(f => f.ticker.toLowerCase() === key && f.ticker !== fund.ticker)}
                      >
                        {etfData.name} - {etfData.fullName} ({etfData.expenseRatio}%)
                      </option>
                    ))}
                  </select>
                  {etf && (
                    <div className="mt-1 flex gap-2 text-xs text-gray-500">
                      <span>{etf.assetClass}</span>
                      <span>&bull;</span>
                      <span>{etf.provider}</span>
                      <span>&bull;</span>
                      <span>Yield: {etf.dividendYield}%</span>
                    </div>
                  )}
                </div>

                {/* Allocation input */}
                <div className="w-28 shrink-0">
                  <div className="relative">
                    <input
                      type="number"
                      value={fund.allocation}
                      onChange={(e) => updateCustomFund(index, 'allocation', Number(e.target.value))}
                      className="w-full px-3 py-2.5 pr-8 border rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeCustomFund(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                  disabled={customFunds.length === 1}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Allocation slider */}
              <div className="mt-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fund.allocation}
                  onChange={(e) => updateCustomFund(index, 'allocation', Number(e.target.value))}
                  className="w-full range-slider"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add fund button */}
      {availableFunds.length > 0 && (
        <button
          onClick={addCustomFund}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Fund
        </button>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="text-xs font-medium text-gray-500 mb-3">Portfolio Summary</div>
        <div className="flex flex-wrap gap-2">
          {customFunds.map((fund, index) => (
            <div
              key={index}
              className="px-3 py-1.5 bg-white border rounded-lg text-sm"
            >
              <span className="font-medium text-gray-700">{fund.ticker}</span>
              <span className="text-gray-400 ml-1.5">{fund.allocation}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
