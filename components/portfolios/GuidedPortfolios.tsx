'use client';

import { guidedPortfolios } from '@/lib/etf-data';
import { Check } from '@/components/icons/Icons';

interface GuidedPortfoliosProps {
  selectedPortfolio: number;
  setSelectedPortfolio: (index: number) => void;
}

export default function GuidedPortfolios({
  selectedPortfolio,
  setSelectedPortfolio
}: GuidedPortfoliosProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Select a Portfolio Strategy</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guidedPortfolios.map((portfolio, index) => (
          <button
            key={index}
            onClick={() => setSelectedPortfolio(index)}
            className={`relative p-5 rounded-xl border-2 text-left transition-all ${
              selectedPortfolio === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {/* Selected indicator */}
            {selectedPortfolio === index && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Portfolio name and persona */}
            <h4 className={`font-semibold ${selectedPortfolio === index ? 'text-blue-700' : 'text-gray-800'}`}>
              {portfolio.name}
            </h4>
            {portfolio.persona && (
              <p className={`text-xs font-medium mt-1 ${selectedPortfolio === index ? 'text-blue-600' : 'text-indigo-500'}`}>
                {portfolio.persona}
              </p>
            )}

            {/* Best for description */}
            {portfolio.bestFor && (
              <p className="text-xs text-gray-500 mt-2">{portfolio.bestFor}</p>
            )}

            {/* Funds */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {portfolio.funds.map((fund, fIndex) => (
                <span
                  key={fIndex}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedPortfolio === index
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {fund.ticker}
                </span>
              ))}
            </div>

            {/* Complexity badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs ${
                selectedPortfolio === index ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {portfolio.complexity}
              </span>
              {portfolio.hasBonds && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                  + Bonds
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
