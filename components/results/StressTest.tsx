'use client';

import { useState, memo } from 'react';
import { CrisisResult, WhatIfResult, GrowthData } from '@/types';
import { ChevronDown, ChevronUp, AlertTriangle } from '@/components/icons/Icons';
import { formatCurrency } from '@/lib/calculations';

interface StressTestProps {
  crisis2008: CrisisResult;
  crisisDotCom: CrisisResult;
  crisisDepression: CrisisResult;
  whatIfSmallCap: WhatIfResult;
  whatIfBondCrisis: WhatIfResult;
  whatIfIntlCollapse: WhatIfResult;
  whatIfArmageddon: WhatIfResult;
  cashScenario: GrowthData;
  inflationLoss: GrowthData;
  investmentAmount: number;
  expanded: boolean;
  setExpanded: (value: boolean) => void;
}

export default memo(function StressTest({
  crisis2008,
  crisisDotCom,
  crisisDepression,
  whatIfSmallCap,
  whatIfBondCrisis,
  whatIfIntlCollapse,
  whatIfArmageddon,
  cashScenario,
  inflationLoss,
  investmentAmount,
  expanded,
  setExpanded
}: StressTestProps) {
  const [tab, setTab] = useState<'historical' | 'what-if' | 'vs-cash'>('historical');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header - clickable to expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">Stress Test & Crisis Scenarios</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content - only show when expanded */}
      {expanded && (
        <div className="p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setTab('historical')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === 'historical'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Historical Crises
            </button>
            <button
              onClick={() => setTab('what-if')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === 'what-if'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              What-If Scenarios
            </button>
            <button
              onClick={() => setTab('vs-cash')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === 'vs-cash'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              vs Cash
            </button>
          </div>

          {/* Historical Crises Tab */}
          {tab === 'historical' && (
            <div className="space-y-5">
              {/* 2008 Financial Crisis */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                <h4 className="font-semibold text-red-800">2008 Financial Crisis</h4>
                <p className="text-xs text-gray-600 mt-2">
                  Year 1: -37% crash, then gradual recovery (actual S&P 500 returns 2008-2017)
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-lg font-bold text-red-700">
                      {formatCurrency(crisis2008.finalValue, true)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">Final Value</span>
                  </div>
                  <div className="text-green-600 text-sm">
                    Still grew: {formatCurrency(crisis2008.finalValue - crisis2008.totalInvested, true)}
                  </div>
                </div>
              </div>

              {/* Dot-com Crash */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                <h4 className="font-semibold text-purple-800">Dot-com Crash (2000-2002)</h4>
                <p className="text-xs text-gray-600 mt-2">
                  3 years of losses (-43% cumulative), then recovery (actual 2000-2009)
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-lg font-bold text-purple-700">
                      {formatCurrency(crisisDotCom.finalValue, true)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">Final Value</span>
                  </div>
                  <div className="text-green-600 text-sm">
                    Still grew: {formatCurrency(crisisDotCom.finalValue - crisisDotCom.totalInvested, true)}
                  </div>
                </div>
              </div>

              {/* Great Depression */}
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
                <h4 className="font-semibold text-gray-700">Great Depression Style (1929-1933)</h4>
                <p className="text-xs text-gray-600 mt-2">
                  4 years catastrophic losses (-80% total), then slow recovery. Worst-case scenario.
                </p>
                <div className="mt-3">
                  <span className="text-lg font-bold text-gray-700">
                    {formatCurrency(crisisDepression.finalValue, true)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">Final Value</span>
                </div>
              </div>

              {/* Key takeaway */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                <h4 className="font-semibold text-green-800">Key Takeaway</h4>
                <p className="text-sm text-green-700 mt-2 leading-relaxed">
                  Even through the worst historical market crashes, staying invested and continuing
                  contributions resulted in portfolio growth. Time in the market beats timing the market.
                </p>
              </div>
            </div>
          )}

          {/* What-If Tab */}
          {tab === 'what-if' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <h4 className="font-semibold text-amber-800">Small-Cap Wipeout (-60%)</h4>
                <p className="text-xs text-gray-600 mt-2">US stocks drop 60%</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="text-sm text-red-600">
                    Immediate Impact: {whatIfSmallCap.impactPercent.toFixed(1)}%
                  </span>
                  <span className="text-lg font-bold text-amber-700">
                    Final: {formatCurrency(whatIfSmallCap.finalValue, true)}
                  </span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                <h4 className="font-semibold text-red-800">Bond Crisis (-20%)</h4>
                <p className="text-xs text-gray-600 mt-2">Bonds lose 20% (rate spike)</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="text-sm text-red-600">
                    Immediate Impact: {whatIfBondCrisis.impactPercent.toFixed(1)}%
                  </span>
                  <span className="text-lg font-bold text-red-700">
                    Final: {formatCurrency(whatIfBondCrisis.finalValue, true)}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <h4 className="font-semibold text-indigo-800">International Collapse (-100%)</h4>
                <p className="text-xs text-gray-600 mt-2">International stocks go to zero</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="text-sm text-red-600">
                    Immediate Impact: {whatIfIntlCollapse.impactPercent.toFixed(1)}%
                  </span>
                  <span className="text-lg font-bold text-indigo-700">
                    Final: {formatCurrency(whatIfIntlCollapse.finalValue, true)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-800 text-white rounded-xl p-5">
                <h4 className="font-semibold">Armageddon Scenario</h4>
                <p className="text-xs text-gray-300 mt-2">
                  All three at once: US -60%, Intl -100%, Bonds -20%
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="text-sm text-red-400">
                    Immediate Impact: {whatIfArmageddon.impactPercent.toFixed(1)}%
                  </span>
                  <span className="text-lg font-bold text-white">
                    Final: {formatCurrency(whatIfArmageddon.finalValue, true)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* vs Cash Tab */}
          {tab === 'vs-cash' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h4 className="font-semibold text-blue-800">Keeping Cash (0% Return)</h4>
                <p className="text-xs text-gray-600 mt-2">
                  What if you kept your money in cash earning nothing?
                </p>
                <div className="mt-3">
                  <span className="text-lg font-bold text-blue-700">
                    {formatCurrency(cashScenario.values[cashScenario.values.length - 1], true)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    (just your contributions)
                  </span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                <h4 className="font-semibold text-red-800">Inflation Erosion (-3%/year)</h4>
                <p className="text-xs text-gray-600 mt-2">
                  Real purchasing power of cash after inflation
                </p>
                <div className="mt-3">
                  <span className="text-lg font-bold text-red-700">
                    {formatCurrency(inflationLoss.values[inflationLoss.values.length - 1], true)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    in today&apos;s dollars
                  </span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                <h4 className="font-semibold text-green-800">Investment Advantage</h4>
                <p className="text-sm text-green-700 mt-2 leading-relaxed">
                  By investing instead of holding cash, you could earn{' '}
                  <span className="font-bold">
                    {formatCurrency(
                      cashScenario.values[cashScenario.values.length - 1] -
                      inflationLoss.values[inflationLoss.values.length - 1],
                      true
                    )}
                  </span>{' '}
                  more in real purchasing power.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
