export type Mode = 'guided' | 'custom' | 'rebalance';
export type ContributionFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';

export interface ETF {
  name: string;
  fullName: string;
  expenseRatio: number;
  assetClass: string;
  provider: string;
  dividendYield: number;
  taxEfficiency: string;
  turnover: number;
}

export interface Holding {
  ticker: string;
  shares: number;
  price: number;
  amount: number;
  type: 'etf' | 'stock';
  purchaseDate: string;
}

export interface FundAllocation {
  ticker: string;
  fullName: string;
  provider: string;
  expenseRatio: number;
  dividendYield: number;
  taxEfficiency: string;
  turnover: number;
  assetClass?: string;
  amount: number;
  cost: number;
  percentage: number;
  holdingType?: 'etf' | 'stock';
  name?: string;
}

export interface GrowthData {
  years: number[];
  values: number[];
  costImpact: number[];
  totalContributions: number[];
  dividendIncome: number[];
  weightedDividendYield: number;
}

export interface Scenarios {
  conservative: number;
  expected: number;
  optimistic: number;
  crisis: number;
}

export interface GuidedPortfolio {
  name: string;
  funds: { ticker: string; allocation: 'us' | 'international' | 'bonds'; weight?: number }[];
  description: string;
  complexity: string;
  hasBonds?: boolean;
  persona?: string;
  bestFor?: string;
}

export interface CustomFund {
  ticker: string;
  allocation: number;
}

export interface CrisisResult {
  finalValue: number;
  totalInvested: number;
}

export interface WhatIfResult {
  finalValue: number;
  totalInvested: number;
  immediateImpact: number;
  impactPercent: number;
}

export interface PriceResult {
  success: boolean;
  price?: number;
  source?: string;
  error?: string;
}
