import {
  ContributionFrequency,
  FundAllocation,
  GrowthData,
  Scenarios,
  CrisisResult,
  WhatIfResult,
  Holding,
  CustomFund,
  PriceResult,
  ETF
} from '@/types';
import { etfs, guidedPortfolios } from './etf-data';
import { STOCK_RETURN, BOND_RETURN, ADVISOR_FEE_RATE } from './scenarios';

// Safe ETF lookup with fallback for unknown tickers
function getETF(ticker: string): ETF {
  const etf = etfs[ticker.toLowerCase()];
  if (etf) return etf;

  // Return a default ETF object for unknown tickers
  return {
    name: ticker.toUpperCase(),
    fullName: `${ticker.toUpperCase()} (Unknown ETF)`,
    expenseRatio: 0.1, // Conservative estimate
    assetClass: 'Unknown',
    provider: 'Unknown',
    dividendYield: 0,
    taxEfficiency: 'Unknown',
    turnover: 0
  };
}

// Get periods per year based on contribution frequency
export function getPeriodsPerYear(frequency: ContributionFrequency): number {
  switch (frequency) {
    case 'daily': return 252; // Business days
    case 'weekly': return 52;
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'annually': return 1;
    default: return 12;
  }
}

// Calculate recommended bond allocation based on age
export function getRecommendedBondAllocation(age: number): number {
  if (isNaN(age) || age < 18) return 20;

  // Rule of 120 for under 50: 120 - age = % in stocks, remainder in bonds
  // Rule of 110 for 50+: 110 - age = % in stocks, remainder in bonds
  if (age < 50) {
    return Math.max(0, Math.min(60, age - 20)); // Rule of 120: bonds = age - 20
  } else {
    return Math.max(0, Math.min(60, age - 10)); // Rule of 110: bonds = age - 10
  }
}

// Calculate scenarios based on portfolio allocation
export function calculateScenarios(stockAllocation: number, bondAllocation: number): Scenarios {
  const baseExpectedReturn = ((stockAllocation / 100) * STOCK_RETURN) + ((bondAllocation / 100) * BOND_RETURN);

  return {
    conservative: Math.max(3, baseExpectedReturn - 2),
    expected: baseExpectedReturn,
    optimistic: Math.min(12, baseExpectedReturn + 2),
    crisis: 2.5
  };
}

// Calculate weighted expense ratio
export function calculateWeightedExpenseRatio(
  fundAllocations: FundAllocation[],
  totalValue: number
): number {
  if (totalValue <= 0) {
    return fundAllocations.reduce((sum, fund) => sum + fund.expenseRatio, 0) / fundAllocations.length;
  }
  return fundAllocations.reduce((sum, fund) => sum + (fund.amount * fund.expenseRatio), 0) / totalValue;
}

// Get current funds based on mode
export function getCurrentFunds(
  mode: 'guided' | 'custom' | 'rebalance',
  investmentAmount: number,
  usAllocation: number,
  internationalAllocation: number,
  bondAllocation: number,
  selectedPortfolio: number,
  customFunds: CustomFund[],
  currentHoldings: Holding[]
): FundAllocation[] {
  if (mode === 'guided') {
    const portfolio = guidedPortfolios[selectedPortfolio];
    const usAmount = (investmentAmount * usAllocation) / 100;
    const intAmount = (investmentAmount * internationalAllocation) / 100;
    const bondsAmount = (investmentAmount * bondAllocation) / 100;

    return portfolio.funds.map(fund => {
      const etf = getETF(fund.ticker);
      let baseAmount: number;
      if (fund.allocation === 'us') {
        baseAmount = usAmount;
      } else if (fund.allocation === 'international') {
        baseAmount = intAmount;
      } else {
        baseAmount = bondsAmount;
      }
      const weight = fund.weight || 1;
      const amount = baseAmount * weight;
      const cost = amount * (etf.expenseRatio / 100);

      return {
        ...etf,
        ticker: fund.ticker,
        amount,
        cost,
        percentage: (amount / investmentAmount) * 100
      };
    });
  } else if (mode === 'rebalance') {
    const totalValue = currentHoldings.reduce((sum, h) => sum + (h.amount || 0), 0);
    return currentHoldings.filter(h => h.amount > 0).map(holding => {
      if (holding.type === 'etf') {
        const etf = getETF(holding.ticker);
        return {
          ...etf,
          ticker: holding.ticker,
          amount: holding.amount,
          cost: holding.amount * (etf.expenseRatio / 100),
          percentage: (holding.amount / totalValue) * 100,
          holdingType: 'etf' as const
        };
      } else {
        return {
          ticker: holding.ticker,
          fullName: holding.ticker + ' (Individual Stock)',
          provider: 'Stock',
          expenseRatio: 0,
          dividendYield: 0,
          taxEfficiency: 'Variable',
          turnover: 0,
          amount: holding.amount,
          cost: 0,
          percentage: (holding.amount / totalValue) * 100,
          holdingType: 'stock' as const,
          name: holding.ticker
        };
      }
    });
  } else {
    // Custom mode
    return customFunds.map(fund => {
      const etf = getETF(fund.ticker);
      const amount = (investmentAmount * fund.allocation) / 100;
      const cost = amount * (etf.expenseRatio / 100);

      return {
        ...etf,
        ticker: fund.ticker,
        amount,
        cost,
        percentage: fund.allocation
      };
    });
  }
}

// Calculate growth projection with DCA
export function calculateGrowth(
  returnRate: number,
  totalPortfolioValue: number,
  timeHorizon: number,
  recurringContribution: number,
  contributionFrequency: ContributionFrequency,
  weightedExpenseRatio: number,
  fundAllocations: FundAllocation[]
): GrowthData {
  const years: number[] = [];
  const values: number[] = [];
  const costImpact: number[] = [];
  const totalContributions: number[] = [];
  const dividendIncome: number[] = [];

  // Calculate weighted average dividend yield
  const weightedDividendYield = totalPortfolioValue > 0
    ? fundAllocations.reduce((sum, fund) => sum + ((fund.amount / totalPortfolioValue) * fund.dividendYield), 0)
    : fundAllocations.reduce((sum, fund) => sum + fund.dividendYield, 0) / fundAllocations.length;

  const periodsPerYear = getPeriodsPerYear(contributionFrequency);

  for (let year = 0; year <= timeHorizon; year++) {
    years.push(year);

    let portfolioValue = totalPortfolioValue;
    let portfolioValueNoFees = totalPortfolioValue;
    let totalInvested = totalPortfolioValue;
    let yearlyDividends = 0;

    const netReturn = (returnRate - weightedExpenseRatio) / 100;
    const grossReturn = returnRate / 100;

    // Calculate compound interest with regular contributions
    for (let period = 1; period <= year * periodsPerYear; period++) {
      portfolioValue += recurringContribution;
      portfolioValueNoFees += recurringContribution;
      totalInvested += recurringContribution;

      portfolioValue *= (1 + netReturn / periodsPerYear);
      portfolioValueNoFees *= (1 + grossReturn / periodsPerYear);
    }

    // Calculate dividends for the year
    if (year > 0) {
      const avgPortfolioValue = (values[year - 1] + portfolioValue) / 2;
      yearlyDividends = avgPortfolioValue * (weightedDividendYield / 100);
    }

    // If year 0, just use initial investment
    if (year === 0) {
      portfolioValue = totalPortfolioValue;
      portfolioValueNoFees = totalPortfolioValue;
      totalInvested = totalPortfolioValue;
      yearlyDividends = totalPortfolioValue * (weightedDividendYield / 100);
    }

    values.push(portfolioValue);
    costImpact.push(portfolioValueNoFees - portfolioValue);
    totalContributions.push(totalInvested);
    dividendIncome.push(yearlyDividends);
  }

  return { years, values, costImpact, totalContributions, dividendIncome, weightedDividendYield };
}

// Calculate historical crisis scenario
export function calculateHistoricalCrisis(
  annualReturns: number[],
  investmentAmount: number,
  timeHorizon: number,
  recurringContribution: number,
  contributionFrequency: ContributionFrequency,
  weightedExpenseRatio: number,
  expectedReturn: number
): CrisisResult {
  let portfolioValue = investmentAmount;
  let totalInvested = investmentAmount;

  const periodsPerYear = getPeriodsPerYear(contributionFrequency);

  for (let year = 0; year < annualReturns.length && year < timeHorizon; year++) {
    const netReturn = (annualReturns[year] - weightedExpenseRatio) / 100;

    for (let period = 1; period <= periodsPerYear; period++) {
      portfolioValue += recurringContribution;
      totalInvested += recurringContribution;
      portfolioValue *= (1 + netReturn / periodsPerYear);
    }
  }

  // Fill remaining years with expected return
  for (let year = annualReturns.length; year < timeHorizon; year++) {
    const netReturn = (expectedReturn - weightedExpenseRatio) / 100;
    for (let period = 1; period <= periodsPerYear; period++) {
      portfolioValue += recurringContribution;
      totalInvested += recurringContribution;
      portfolioValue *= (1 + netReturn / periodsPerYear);
    }
  }

  return { finalValue: portfolioValue, totalInvested };
}

// Calculate what-if scenario
export function calculateWhatIf(
  usImpact: number,
  intlImpact: number,
  bondImpact: number,
  investmentAmount: number,
  usAllocation: number,
  internationalAllocation: number,
  bondAllocation: number,
  timeHorizon: number,
  recurringContribution: number,
  contributionFrequency: ContributionFrequency,
  weightedExpenseRatio: number,
  expectedReturn: number
): WhatIfResult {
  const usLoss = (usAllocation / 100) * (usImpact / 100) * investmentAmount;
  const intlLoss = (internationalAllocation / 100) * (intlImpact / 100) * investmentAmount;
  const bondLoss = (bondAllocation / 100) * (bondImpact / 100) * investmentAmount;
  const immediateImpact = usLoss + intlLoss + bondLoss;

  const startingValue = investmentAmount + immediateImpact;
  const netReturn = (expectedReturn - weightedExpenseRatio) / 100;
  const periodsPerYear = getPeriodsPerYear(contributionFrequency);

  let portfolioValue = startingValue;
  let totalInvested = investmentAmount;

  for (let year = 0; year < timeHorizon; year++) {
    for (let period = 1; period <= periodsPerYear; period++) {
      portfolioValue += recurringContribution;
      totalInvested += recurringContribution;
      portfolioValue *= (1 + netReturn / periodsPerYear);
    }
  }

  return {
    finalValue: portfolioValue,
    totalInvested,
    immediateImpact,
    impactPercent: (immediateImpact / investmentAmount) * 100
  };
}

// Calculate financial advisor cost comparison
export function calculateAdvisorCost(
  investmentAmount: number,
  totalPortfolioValue: number,
  finalValue: number,
  timeHorizon: number,
  recurringContribution: number,
  contributionFrequency: ContributionFrequency,
  weightedExpenseRatio: number,
  expectedReturn: number,
  mode: 'guided' | 'custom' | 'rebalance'
): number {
  const grossReturn = expectedReturn / 100;
  const etfExpenseRatio = weightedExpenseRatio / 100;
  const periodsPerYear = getPeriodsPerYear(contributionFrequency);

  let portfolioValueAdvisor = mode === 'rebalance' ? totalPortfolioValue : investmentAmount;

  if (portfolioValueAdvisor <= 0) return 0;

  for (let year = 0; year < timeHorizon; year++) {
    for (let period = 1; period <= periodsPerYear; period++) {
      portfolioValueAdvisor += recurringContribution;
      portfolioValueAdvisor *= (1 + (grossReturn - etfExpenseRatio) / periodsPerYear);
    }
    // At end of year, advisor takes their 1% fee from the portfolio value
    portfolioValueAdvisor *= (1 - (ADVISOR_FEE_RATE / 100));
  }

  return Math.max(0, finalValue - portfolioValueAdvisor);
}

// Find lowest fee portfolio
export function getLowestFeePortfolio(
  investmentAmount: number,
  usAllocation: number,
  internationalAllocation: number
): { lowestFee: number; lowestIndex: number } {
  let lowestFee = Infinity;
  let lowestIndex = 0;

  guidedPortfolios.forEach((portfolio, index) => {
    const usAmount = (investmentAmount * usAllocation) / 100;
    const intAmount = (investmentAmount * internationalAllocation) / 100;

    const fee = portfolio.funds.reduce((sum, fund) => {
      const etf = getETF(fund.ticker);
      const baseAmount = fund.allocation === 'us' ? usAmount : intAmount;
      const weight = fund.weight || 1;
      const amount = baseAmount * weight;
      return sum + (amount * etf.expenseRatio);
    }, 0) / investmentAmount;

    if (fee < lowestFee) {
      lowestFee = fee;
      lowestIndex = index;
    }
  });

  return { lowestFee, lowestIndex };
}

// Fetch price via server-side API route (keeps API keys private)
export async function fetchPriceWithFallback(ticker: string): Promise<PriceResult> {
  try {
    const response = await fetch(
      `/investment-calculator/api/stock-price?ticker=${encodeURIComponent(ticker)}`
    );

    if (response.ok) {
      const data = await response.json();
      return data as PriceResult;
    }

    const errorData = await response.json().catch(() => null);
    return { success: false, error: errorData?.error || 'Could not fetch price' };
  } catch {
    return { success: false, error: 'Could not fetch price from any source' };
  }
}

// Format currency value
export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
  }
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Format percentage
export function formatPercent(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%';
}
