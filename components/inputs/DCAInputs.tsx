'use client';

import { Calendar, Info } from '@/components/icons/Icons';
import { ContributionFrequency } from '@/types';

interface DCAInputsProps {
  recurringContribution: number;
  setRecurringContribution: (value: number) => void;
  contributionFrequency: ContributionFrequency;
  setContributionFrequency: (value: ContributionFrequency) => void;
}

export default function DCAInputs({
  recurringContribution,
  setRecurringContribution,
  contributionFrequency,
  setContributionFrequency
}: DCAInputsProps) {
  const frequencies: { value: ContributionFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];

  return (
    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-800">
          <Calendar className="w-4 h-4" />
          Recurring Contributions (DCA)
        </h3>
        <div className="group relative">
          <Info className="w-4 h-4 text-blue-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
            <p className="font-medium mb-1">Dollar-Cost Averaging</p>
            <p>Investing a fixed amount regularly helps reduce the impact of market volatility. You buy more shares when prices are low and fewer when high, potentially lowering your average cost over time.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              value={recurringContribution}
              onChange={(e) => setRecurringContribution(Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              min="0"
              step="50"
            />
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Frequency</label>
          <select
            value={contributionFrequency}
            onChange={(e) => setContributionFrequency(e.target.value as ContributionFrequency)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {frequencies.map(freq => (
              <option key={freq.value} value={freq.value}>{freq.label}</option>
            ))}
          </select>
        </div>
      </div>

      {recurringContribution > 0 && (
        <p className="mt-3 text-sm text-blue-600 font-medium">
          You&apos;ll invest ${recurringContribution.toLocaleString()} {contributionFrequency}
        </p>
      )}
    </div>
  );
}
