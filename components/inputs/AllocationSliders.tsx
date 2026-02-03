'use client';

import { Sliders, Info } from '@/components/icons/Icons';

interface AllocationSlidersProps {
  usAllocation: number;
  setUsAllocation: (value: number) => void;
  bondAllocation: number;
  setBondAllocation: (value: number) => void;
  recommendedBondAllocation: number;
  showBonds: boolean;
}

export default function AllocationSliders({
  usAllocation,
  setUsAllocation,
  bondAllocation,
  setBondAllocation,
  recommendedBondAllocation,
  showBonds
}: AllocationSlidersProps) {
  const stockAllocation = 100 - bondAllocation;
  const internationalAllocation = stockAllocation - usAllocation;

  return (
    <div className="space-y-5">
      {/* US vs International Slider */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Sliders className="w-4 h-4 text-blue-500" />
          US vs International Stocks
        </label>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 w-14 shrink-0">0% US</span>
          <input
            type="range"
            min="0"
            max={stockAllocation}
            value={usAllocation}
            onChange={(e) => setUsAllocation(Number(e.target.value))}
            className="flex-1 range-slider"
          />
          <span className="text-xs text-gray-500 w-16 shrink-0 text-right">100% US</span>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-blue-600 font-semibold">{usAllocation}% US</span>
          <span className="text-indigo-600 font-semibold">{internationalAllocation}% Intl</span>
        </div>
      </div>

      {/* Bond Allocation Slider */}
      {showBonds && (
        <div>
          <label className="flex items-center flex-wrap gap-2 text-sm font-medium text-gray-700 mb-3">
            <Sliders className="w-4 h-4 text-green-500" />
            <span>Bond Allocation</span>
            <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Recommended: {recommendedBondAllocation}%
            </span>
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-14 shrink-0">0%</span>
            <input
              type="range"
              min="0"
              max="60"
              value={bondAllocation}
              onChange={(e) => {
                const newBondAllocation = Number(e.target.value);
                setBondAllocation(newBondAllocation);
                // Ensure US allocation doesn't exceed stock allocation
                const newStockAllocation = 100 - newBondAllocation;
                if (usAllocation > newStockAllocation) {
                  setUsAllocation(newStockAllocation);
                }
              }}
              className="flex-1 range-slider range-slider-green"
            />
            <span className="text-xs text-gray-500 w-16 shrink-0 text-right">60%</span>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-green-600 font-semibold">{bondAllocation}% Bonds</span>
            <span className="text-gray-600 font-medium">{stockAllocation}% Stocks</span>
          </div>
        </div>
      )}

      {/* Allocation Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mt-2">
        <div className="text-xs font-medium text-gray-500 mb-3">Your Allocation</div>
        <div className="flex gap-3">
          <div className="flex-1 bg-blue-100 rounded-lg p-3 text-center min-w-0">
            <div className="text-xl font-bold text-blue-600">{usAllocation}%</div>
            <div className="text-xs text-blue-500 mt-1">US Stocks</div>
          </div>
          <div className="flex-1 bg-indigo-100 rounded-lg p-3 text-center min-w-0">
            <div className="text-xl font-bold text-indigo-600">{internationalAllocation}%</div>
            <div className="text-xs text-indigo-500 mt-1">Intl Stocks</div>
          </div>
          {showBonds && (
            <div className="flex-1 bg-green-100 rounded-lg p-3 text-center min-w-0">
              <div className="text-xl font-bold text-green-600">{bondAllocation}%</div>
              <div className="text-xs text-green-500 mt-1">Bonds</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
