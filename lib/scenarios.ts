// Historical crisis annual returns data
export const CRISIS_2008_RETURNS = [-37, 26, 15, 2, 16, 32, 14, 12, 21, 29]; // 2008-2017 S&P 500 actual
export const CRISIS_DOTCOM_RETURNS = [-9, -12, -22, 29, 11, 5, 16, 16, -37, 26]; // 2000-2009 actual
export const CRISIS_DEPRESSION_RETURNS = [-43, -25, -9, -43, 50, 47, 32, -35, 31, 0]; // 1929-1938 modeled

// Return assumptions
export const STOCK_RETURN = 10; // 10% historical average for stocks
export const BOND_RETURN = 4;   // 4% historical average for bonds
export const INFLATION_RATE = 0.03; // 3% annual inflation
export const ADVISOR_FEE_RATE = 1.0; // 1% annual fee typical for financial advisors

// What-if scenario impacts
export const WHAT_IF_SMALL_CAP = { us: -60, intl: 0, bonds: 0 };
export const WHAT_IF_BOND_CRISIS = { us: 0, intl: 0, bonds: -20 };
export const WHAT_IF_INTL_COLLAPSE = { us: 0, intl: -100, bonds: 0 };
export const WHAT_IF_ARMAGEDDON = { us: -60, intl: -100, bonds: -20 };
