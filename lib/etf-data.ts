import { ETF, GuidedPortfolio } from '@/types';

export const etfs: Record<string, ETF> = {
  // Vanguard ETFs
  voo: {
    name: 'VOO',
    fullName: 'Vanguard S&P 500 ETF',
    expenseRatio: 0.03,
    assetClass: 'US Large Cap',
    provider: 'Vanguard',
    dividendYield: 1.5,
    taxEfficiency: 'Excellent',
    turnover: 3
  },
  vti: {
    name: 'VTI',
    fullName: 'Vanguard Total Stock Market ETF',
    expenseRatio: 0.03,
    assetClass: 'US Total Market',
    provider: 'Vanguard',
    dividendYield: 1.5,
    taxEfficiency: 'Excellent',
    turnover: 4
  },
  vxus: {
    name: 'VXUS',
    fullName: 'Vanguard Total International Stock ETF',
    expenseRatio: 0.08,
    assetClass: 'International',
    provider: 'Vanguard',
    dividendYield: 3.2,
    taxEfficiency: 'Very Good',
    turnover: 5
  },
  vb: {
    name: 'VB',
    fullName: 'Vanguard Small-Cap ETF',
    expenseRatio: 0.05,
    assetClass: 'US Small Cap',
    provider: 'Vanguard',
    dividendYield: 1.3,
    taxEfficiency: 'Very Good',
    turnover: 15
  },
  vwo: {
    name: 'VWO',
    fullName: 'Vanguard Emerging Markets ETF',
    expenseRatio: 0.08,
    assetClass: 'Emerging Markets',
    provider: 'Vanguard',
    dividendYield: 3.5,
    taxEfficiency: 'Good',
    turnover: 8
  },
  vea: {
    name: 'VEA',
    fullName: 'Vanguard Developed Markets ETF',
    expenseRatio: 0.05,
    assetClass: 'Developed International',
    provider: 'Vanguard',
    dividendYield: 3.0,
    taxEfficiency: 'Very Good',
    turnover: 4
  },

  // Schwab ETFs
  schb: {
    name: 'SCHB',
    fullName: 'Schwab U.S. Broad Market ETF',
    expenseRatio: 0.03,
    assetClass: 'US Total Market',
    provider: 'Schwab',
    dividendYield: 1.4,
    taxEfficiency: 'Excellent',
    turnover: 4
  },
  schx: {
    name: 'SCHX',
    fullName: 'Schwab U.S. Large-Cap ETF',
    expenseRatio: 0.03,
    assetClass: 'US Large Cap',
    provider: 'Schwab',
    dividendYield: 1.5,
    taxEfficiency: 'Excellent',
    turnover: 3
  },
  schf: {
    name: 'SCHF',
    fullName: 'Schwab International Equity ETF',
    expenseRatio: 0.06,
    assetClass: 'International',
    provider: 'Schwab',
    dividendYield: 3.1,
    taxEfficiency: 'Very Good',
    turnover: 5
  },
  scha: {
    name: 'SCHA',
    fullName: 'Schwab U.S. Small-Cap ETF',
    expenseRatio: 0.04,
    assetClass: 'US Small Cap',
    provider: 'Schwab',
    dividendYield: 1.2,
    taxEfficiency: 'Very Good',
    turnover: 12
  },
  sche: {
    name: 'SCHE',
    fullName: 'Schwab Emerging Markets Equity ETF',
    expenseRatio: 0.11,
    assetClass: 'Emerging Markets',
    provider: 'Schwab',
    dividendYield: 3.4,
    taxEfficiency: 'Good',
    turnover: 9
  },

  // iShares Core ETFs (BlackRock)
  itot: {
    name: 'ITOT',
    fullName: 'iShares Core S&P Total U.S. Stock Market ETF',
    expenseRatio: 0.03,
    assetClass: 'US Total Market',
    provider: 'iShares',
    dividendYield: 1.4,
    taxEfficiency: 'Excellent',
    turnover: 3
  },
  ivv: {
    name: 'IVV',
    fullName: 'iShares Core S&P 500 ETF',
    expenseRatio: 0.03,
    assetClass: 'US Large Cap',
    provider: 'iShares',
    dividendYield: 1.5,
    taxEfficiency: 'Excellent',
    turnover: 3
  },
  ixus: {
    name: 'IXUS',
    fullName: 'iShares Core MSCI Total International Stock ETF',
    expenseRatio: 0.07,
    assetClass: 'International',
    provider: 'iShares',
    dividendYield: 3.3,
    taxEfficiency: 'Very Good',
    turnover: 5
  },
  ijr: {
    name: 'IJR',
    fullName: 'iShares Core S&P Small-Cap ETF',
    expenseRatio: 0.06,
    assetClass: 'US Small Cap',
    provider: 'iShares',
    dividendYield: 1.3,
    taxEfficiency: 'Very Good',
    turnover: 14
  },
  iemg: {
    name: 'IEMG',
    fullName: 'iShares Core MSCI Emerging Markets ETF',
    expenseRatio: 0.09,
    assetClass: 'Emerging Markets',
    provider: 'iShares',
    dividendYield: 3.6,
    taxEfficiency: 'Good',
    turnover: 10
  },

  // SPDR (State Street)
  spy: {
    name: 'SPY',
    fullName: 'SPDR S&P 500 ETF Trust',
    expenseRatio: 0.09,
    assetClass: 'US Large Cap',
    provider: 'SPDR',
    dividendYield: 1.5,
    taxEfficiency: 'Excellent',
    turnover: 3
  },
  sptm: {
    name: 'SPTM',
    fullName: 'SPDR Portfolio S&P 1500 Composite Stock Market ETF',
    expenseRatio: 0.03,
    assetClass: 'US Total Market',
    provider: 'SPDR',
    dividendYield: 1.4,
    taxEfficiency: 'Excellent',
    turnover: 4
  },
  spem: {
    name: 'SPEM',
    fullName: 'SPDR Portfolio Emerging Markets ETF',
    expenseRatio: 0.07,
    assetClass: 'Emerging Markets',
    provider: 'SPDR',
    dividendYield: 3.7,
    taxEfficiency: 'Good',
    turnover: 11
  },

  // Bond ETFs
  bnd: {
    name: 'BND',
    fullName: 'Vanguard Total Bond Market ETF',
    expenseRatio: 0.03,
    assetClass: 'US Bonds',
    provider: 'Vanguard',
    dividendYield: 4.2,
    taxEfficiency: 'Excellent',
    turnover: 10
  },
  agg: {
    name: 'AGG',
    fullName: 'iShares Core US Aggregate Bond ETF',
    expenseRatio: 0.03,
    assetClass: 'US Bonds',
    provider: 'iShares',
    dividendYield: 4.1,
    taxEfficiency: 'Excellent',
    turnover: 9
  },
  bndw: {
    name: 'BNDW',
    fullName: 'Vanguard Total World Bond ETF',
    expenseRatio: 0.05,
    assetClass: 'Global Bonds',
    provider: 'Vanguard',
    dividendYield: 4.0,
    taxEfficiency: 'Very Good',
    turnover: 11
  }
};

export const guidedPortfolios: GuidedPortfolio[] = [
  {
    name: '3-Fund Balanced',
    funds: [
      { ticker: 'VTI', allocation: 'us' },
      { ticker: 'VXUS', allocation: 'international' },
      { ticker: 'BND', allocation: 'bonds' }
    ],
    description: 'Classic 3-fund with bonds (age-based)',
    complexity: '3 funds',
    hasBonds: true,
    persona: 'The Steady Builder',
    bestFor: 'Set-it-and-forget-it investors who want balance between growth and stability'
  },
  {
    name: '3-Fund Conservative',
    funds: [
      { ticker: 'VOO', allocation: 'us' },
      { ticker: 'VXUS', allocation: 'international' },
      { ticker: 'BND', allocation: 'bonds' }
    ],
    description: 'S&P 500 with bonds for stability',
    complexity: '3 funds',
    hasBonds: true,
    persona: 'The Cautious Planner',
    bestFor: 'Those closer to retirement or who prefer less volatility in their portfolio'
  },
  {
    name: 'Simple Two-Fund',
    funds: [
      { ticker: 'VTI', allocation: 'us' },
      { ticker: 'VXUS', allocation: 'international' }
    ],
    description: 'Classic & clean - total market coverage',
    complexity: 'Simplest',
    persona: 'The Minimalist',
    bestFor: 'First-time investors or anyone who values simplicity over complexity'
  },
  {
    name: 'S&P 500 Focus',
    funds: [
      { ticker: 'VOO', allocation: 'us' },
      { ticker: 'VXUS', allocation: 'international' }
    ],
    description: 'Large-cap US companies',
    complexity: 'Simplest',
    persona: 'The Blue-Chip Believer',
    bestFor: 'Those who want exposure to America\'s largest, most established companies'
  },
  {
    name: 'Small-Cap Tilt',
    funds: [
      { ticker: 'VOO', allocation: 'us', weight: 0.8 },
      { ticker: 'VB', allocation: 'us', weight: 0.2 },
      { ticker: 'VXUS', allocation: 'international' }
    ],
    description: '80/20 large/small cap US split',
    complexity: '3 funds',
    persona: 'The Growth Seeker',
    bestFor: 'Long-term investors willing to accept more volatility for potentially higher returns'
  },
  {
    name: 'Emerging Markets Split',
    funds: [
      { ticker: 'VTI', allocation: 'us' },
      { ticker: 'VEA', allocation: 'international', weight: 0.6 },
      { ticker: 'VWO', allocation: 'international', weight: 0.4 }
    ],
    description: 'Separate developed & emerging intl',
    complexity: '3 funds',
    persona: 'The Global Diversifier',
    bestFor: 'Those who believe in global growth and want exposure to developing economies'
  }
];

export const CHART_COLORS = ['#3b82f6', '#6366f1', '#10b981', '#059669', '#f59e0b', '#ef4444'];
