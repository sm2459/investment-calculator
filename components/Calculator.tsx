'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Mode, ContributionFrequency, Holding, CustomFund } from '@/types';
import { guidedPortfolios } from '@/lib/etf-data';
import {
  CRISIS_2008_RETURNS,
  CRISIS_DOTCOM_RETURNS,
  CRISIS_DEPRESSION_RETURNS,
  WHAT_IF_SMALL_CAP,
  WHAT_IF_BOND_CRISIS,
  WHAT_IF_INTL_COLLAPSE,
  WHAT_IF_ARMAGEDDON
} from '@/lib/scenarios';
import {
  getRecommendedBondAllocation,
  calculateScenarios,
  calculateWeightedExpenseRatio,
  getCurrentFunds,
  calculateGrowth,
  calculateHistoricalCrisis,
  calculateWhatIf,
  calculateAdvisorCost,
  getLowestFeePortfolio
} from '@/lib/calculations';

import ModeSelector from './ModeSelector';
import InvestmentInputs from './inputs/InvestmentInputs';
import AllocationSliders from './inputs/AllocationSliders';
import DCAInputs from './inputs/DCAInputs';
import HoldingsInput from './inputs/HoldingsInput';
import GuidedPortfolios from './portfolios/GuidedPortfolios';
import CustomFunds from './portfolios/CustomFunds';
import AllocationChart from './results/AllocationChart';
import CostAnalysis from './results/CostAnalysis';
import GrowthProjection from './results/GrowthProjection';
import ComparisonCard from './results/ComparisonCard';
import StressTest from './results/StressTest';
import ExportButtons from './actions/ExportButtons';

export default function Calculator() {
  // Core inputs
  const [mode, setMode] = useState<Mode>('guided');
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [age, setAge] = useState(30);
  const [timeHorizon, setTimeHorizon] = useState(10);
  const [usAllocation, setUsAllocation] = useState(70);
  const [bondAllocation, setBondAllocation] = useState(0);
  const [recurringContribution, setRecurringContribution] = useState(0);
  const [contributionFrequency, setContributionFrequency] = useState<ContributionFrequency>('monthly');

  // Mode-specific state
  const [selectedPortfolio, setSelectedPortfolio] = useState(0);
  const [customFunds, setCustomFunds] = useState<CustomFund[]>([
    { ticker: 'VTI', allocation: 70 },
    { ticker: 'VXUS', allocation: 30 }
  ]);
  const [currentHoldings, setCurrentHoldings] = useState<Holding[]>([
    { ticker: 'VOO', shares: 0, price: 0, amount: 0, type: 'etf', purchaseDate: '' }
  ]);

  // UI state
  const [stressTestExpanded, setStressTestExpanded] = useState(false);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

  // Track previous portfolio to detect changes
  const prevPortfolioRef = useRef(selectedPortfolio);
  const prevAgeRef = useRef(age);

  // Calculated values
  const recommendedBondAllocation = getRecommendedBondAllocation(age);
  const stockAllocation = 100 - bondAllocation;
  const internationalAllocation = stockAllocation - usAllocation;

  // Auto-adjust bond allocation when portfolio or age changes (not on every render)
  useEffect(() => {
    const portfolioChanged = prevPortfolioRef.current !== selectedPortfolio;
    const ageChanged = prevAgeRef.current !== age;
    const portfolioHasBonds = mode === 'guided' && guidedPortfolios[selectedPortfolio].hasBonds;
    const portfolioHadBonds = mode === 'guided' && guidedPortfolios[prevPortfolioRef.current]?.hasBonds;

    // Only auto-set bonds when switching TO a portfolio with bonds (not on every bondAllocation change)
    if (portfolioChanged) {
      if (portfolioHasBonds && !portfolioHadBonds) {
        // Switching to a portfolio with bonds - set recommended
        setBondAllocation(recommendedBondAllocation);
      } else if (!portfolioHasBonds) {
        // Switching to a portfolio without bonds - reset to 0
        setBondAllocation(0);
      }
      prevPortfolioRef.current = selectedPortfolio;
    }

    // Update bond allocation when age changes (only if current portfolio has bonds)
    if (ageChanged && portfolioHasBonds && age >= 18 && age <= 100) {
      setBondAllocation(recommendedBondAllocation);
      prevAgeRef.current = age;
    }
  }, [selectedPortfolio, age, mode, recommendedBondAllocation]);

  // Calculate total portfolio value based on mode
  const totalPortfolioValue = useMemo(() => {
    return mode === 'rebalance'
      ? currentHoldings.reduce((sum, h) => sum + (h.amount || 0), 0)
      : investmentAmount;
  }, [mode, currentHoldings, investmentAmount]);

  // Get fund allocations based on current mode
  const fundAllocations = useMemo(() => {
    return getCurrentFunds(
      mode,
      investmentAmount,
      usAllocation,
      internationalAllocation,
      bondAllocation,
      selectedPortfolio,
      customFunds,
      currentHoldings
    );
  }, [mode, investmentAmount, usAllocation, internationalAllocation, bondAllocation, selectedPortfolio, customFunds, currentHoldings]);

  // Calculate totals
  const totalCost = useMemo(() => {
    return fundAllocations.reduce((sum, fund) => sum + fund.cost, 0);
  }, [fundAllocations]);

  const weightedExpenseRatio = useMemo(() => {
    return calculateWeightedExpenseRatio(fundAllocations, totalPortfolioValue);
  }, [fundAllocations, totalPortfolioValue]);

  // Calculate scenarios
  const scenarios = useMemo(() => {
    return calculateScenarios(stockAllocation, bondAllocation);
  }, [stockAllocation, bondAllocation]);

  // Calculate growth projections for all scenarios (consolidated to reduce hook overhead)
  const allGrowthData = useMemo(() => {
    const commonArgs = [
      totalPortfolioValue,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      fundAllocations
    ] as const;

    return {
      conservative: calculateGrowth(scenarios.conservative, ...commonArgs),
      expected: calculateGrowth(scenarios.expected, ...commonArgs),
      optimistic: calculateGrowth(scenarios.optimistic, ...commonArgs),
      crisis: calculateGrowth(scenarios.crisis, ...commonArgs)
    };
  }, [scenarios, totalPortfolioValue, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, fundAllocations]);

  // Destructure for convenience
  const { conservative: growthDataConservative, expected: growthDataExpected, optimistic: growthDataOptimistic, crisis: growthDataCrisis } = allGrowthData;

  // Use expected scenario as main data source
  const finalValue = growthDataExpected.values[growthDataExpected.values.length - 1];
  const totalContributed = growthDataExpected.totalContributions[growthDataExpected.totalContributions.length - 1];
  const totalReturn = finalValue - totalContributed;
  const totalFeesLost = growthDataExpected.costImpact[growthDataExpected.costImpact.length - 1];
  const totalDividends = growthDataExpected.dividendIncome.reduce((sum, val) => sum + val, 0);
  const capitalGains = totalReturn - totalDividends;

  // Calculate advisor cost
  const totalAdvisorFeesLost = useMemo(() => {
    return calculateAdvisorCost(
      investmentAmount,
      totalPortfolioValue,
      finalValue,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected,
      mode
    );
  }, [investmentAmount, totalPortfolioValue, finalValue, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected, mode]);

  // Calculate historical crisis scenarios
  const crisis2008 = useMemo(() => {
    return calculateHistoricalCrisis(
      CRISIS_2008_RETURNS,
      investmentAmount,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected
    );
  }, [investmentAmount, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected]);

  const crisisDotCom = useMemo(() => {
    return calculateHistoricalCrisis(
      CRISIS_DOTCOM_RETURNS,
      investmentAmount,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected
    );
  }, [investmentAmount, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected]);

  const crisisDepression = useMemo(() => {
    return calculateHistoricalCrisis(
      CRISIS_DEPRESSION_RETURNS,
      investmentAmount,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected
    );
  }, [investmentAmount, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected]);

  // Calculate what-if scenarios
  const whatIfSmallCap = useMemo(() => {
    return calculateWhatIf(
      WHAT_IF_SMALL_CAP.us,
      WHAT_IF_SMALL_CAP.intl,
      WHAT_IF_SMALL_CAP.bonds,
      investmentAmount,
      usAllocation,
      internationalAllocation,
      bondAllocation,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected
    );
  }, [investmentAmount, usAllocation, internationalAllocation, bondAllocation, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected]);

  const whatIfBondCrisis = useMemo(() => {
    return calculateWhatIf(
      WHAT_IF_BOND_CRISIS.us,
      WHAT_IF_BOND_CRISIS.intl,
      WHAT_IF_BOND_CRISIS.bonds,
      investmentAmount,
      usAllocation,
      internationalAllocation,
      bondAllocation,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected
    );
  }, [investmentAmount, usAllocation, internationalAllocation, bondAllocation, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected]);

  const whatIfIntlCollapse = useMemo(() => {
    return calculateWhatIf(
      WHAT_IF_INTL_COLLAPSE.us,
      WHAT_IF_INTL_COLLAPSE.intl,
      WHAT_IF_INTL_COLLAPSE.bonds,
      investmentAmount,
      usAllocation,
      internationalAllocation,
      bondAllocation,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected
    );
  }, [investmentAmount, usAllocation, internationalAllocation, bondAllocation, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected]);

  const whatIfArmageddon = useMemo(() => {
    return calculateWhatIf(
      WHAT_IF_ARMAGEDDON.us,
      WHAT_IF_ARMAGEDDON.intl,
      WHAT_IF_ARMAGEDDON.bonds,
      investmentAmount,
      usAllocation,
      internationalAllocation,
      bondAllocation,
      timeHorizon,
      recurringContribution,
      contributionFrequency,
      weightedExpenseRatio,
      scenarios.expected
    );
  }, [investmentAmount, usAllocation, internationalAllocation, bondAllocation, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, scenarios.expected]);

  // Cash/inflation scenarios
  const cashScenario = useMemo(() => {
    return calculateGrowth(0, totalPortfolioValue, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, fundAllocations);
  }, [totalPortfolioValue, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, fundAllocations]);

  const inflationLoss = useMemo(() => {
    return calculateGrowth(-3, totalPortfolioValue, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, fundAllocations);
  }, [totalPortfolioValue, timeHorizon, recurringContribution, contributionFrequency, weightedExpenseRatio, fundAllocations]);

  // Lowest fee portfolio comparison
  const { lowestFee, lowestIndex } = useMemo(() => {
    return mode === 'guided'
      ? getLowestFeePortfolio(investmentAmount, usAllocation, internationalAllocation)
      : { lowestFee: 0, lowestIndex: 0 };
  }, [mode, investmentAmount, usAllocation, internationalAllocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Investment Allocation Calculator</h1>
          <p className="text-lg text-gray-600 mb-2">Your journey to financial independence starts here</p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Investing doesn&apos;t have to be complicated. We&apos;ll help you build a diversified portfolio,
            understand the true cost of fees, and see how your money can grow over time.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mb-6">
          <ModeSelector mode={mode} setMode={setMode} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Investment Inputs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                <h2 className="text-lg font-semibold text-gray-800">Investment Details</h2>
              </div>
              <InvestmentInputs
                investmentAmount={investmentAmount}
                setInvestmentAmount={setInvestmentAmount}
                age={age}
                setAge={setAge}
                timeHorizon={timeHorizon}
                setTimeHorizon={setTimeHorizon}
                mode={mode}
              />
            </div>

            {/* Mode-specific inputs */}
            {mode === 'guided' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                  <h2 className="text-lg font-semibold text-gray-800">Choose Your Strategy</h2>
                </div>
                <GuidedPortfolios
                  selectedPortfolio={selectedPortfolio}
                  setSelectedPortfolio={setSelectedPortfolio}
                />
              </div>
            )}

            {mode === 'custom' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                  <h2 className="text-lg font-semibold text-gray-800">Build Your Mix</h2>
                </div>
                <CustomFunds
                  customFunds={customFunds}
                  setCustomFunds={setCustomFunds}
                />
              </div>
            )}

            {mode === 'rebalance' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                  <h2 className="text-lg font-semibold text-gray-800">Your Current Holdings</h2>
                </div>
                <HoldingsInput
                  currentHoldings={currentHoldings}
                  setCurrentHoldings={setCurrentHoldings}
                  isFetchingPrices={isFetchingPrices}
                  setIsFetchingPrices={setIsFetchingPrices}
                  lastPriceUpdate={lastPriceUpdate}
                  setLastPriceUpdate={setLastPriceUpdate}
                />
              </div>
            )}

            {/* Allocation Sliders - only for guided/custom modes */}
            {mode !== 'rebalance' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">3</span>
                  <h2 className="text-lg font-semibold text-gray-800">Allocation</h2>
                </div>
                <AllocationSliders
                  usAllocation={usAllocation}
                  setUsAllocation={setUsAllocation}
                  bondAllocation={bondAllocation}
                  setBondAllocation={setBondAllocation}
                  recommendedBondAllocation={recommendedBondAllocation}
                  showBonds={mode === 'guided' && !!guidedPortfolios[selectedPortfolio].hasBonds}
                />
              </div>
            )}

            {/* DCA Inputs */}
            <DCAInputs
              recurringContribution={recurringContribution}
              setRecurringContribution={setRecurringContribution}
              contributionFrequency={contributionFrequency}
              setContributionFrequency={setContributionFrequency}
            />

            {/* Export Buttons */}
            <ExportButtons
              mode={mode}
              investmentAmount={investmentAmount}
              timeHorizon={timeHorizon}
              recurringContribution={recurringContribution}
              contributionFrequency={contributionFrequency}
              scenarios={scenarios}
              fundAllocations={fundAllocations}
              weightedExpenseRatio={weightedExpenseRatio}
              totalCost={totalCost}
              totalFeesLost={totalFeesLost}
              totalAdvisorFeesLost={totalAdvisorFeesLost}
              finalValue={finalValue}
              totalContributed={totalContributed}
              totalReturn={totalReturn}
              totalDividends={totalDividends}
              capitalGains={capitalGains}
              growthData={growthDataExpected}
              crisis2008={crisis2008}
              crisisDotCom={crisisDotCom}
              crisisDepression={crisisDepression}
              whatIfSmallCap={whatIfSmallCap}
              whatIfBondCrisis={whatIfBondCrisis}
              whatIfIntlCollapse={whatIfIntlCollapse}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Allocation Chart */}
            <AllocationChart
              fundAllocations={fundAllocations}
              investmentAmount={totalPortfolioValue}
            />

            {/* Growth Projection */}
            <GrowthProjection
              growthDataExpected={growthDataExpected}
              growthDataConservative={growthDataConservative}
              growthDataOptimistic={growthDataOptimistic}
              growthDataCrisis={growthDataCrisis}
              scenarios={scenarios}
              timeHorizon={timeHorizon}
              finalValue={finalValue}
              totalContributed={totalContributed}
              totalReturn={totalReturn}
              totalDividends={totalDividends}
              capitalGains={capitalGains}
            />

            {/* Cost Analysis */}
            <CostAnalysis
              fundAllocations={fundAllocations}
              weightedExpenseRatio={weightedExpenseRatio}
              totalCost={totalCost}
              totalFeesLost={totalFeesLost}
              totalAdvisorFeesLost={totalAdvisorFeesLost}
              timeHorizon={timeHorizon}
            />

            {/* Comparison Card - for guided and custom modes */}
            {mode !== 'rebalance' && (
              <ComparisonCard
                selectedPortfolioIndex={selectedPortfolio}
                lowestFeeIndex={lowestIndex}
                lowestFee={lowestFee}
                currentFee={weightedExpenseRatio / 100}
                mode={mode}
              />
            )}

            {/* Stress Test */}
            <StressTest
              crisis2008={crisis2008}
              crisisDotCom={crisisDotCom}
              crisisDepression={crisisDepression}
              whatIfSmallCap={whatIfSmallCap}
              whatIfBondCrisis={whatIfBondCrisis}
              whatIfIntlCollapse={whatIfIntlCollapse}
              whatIfArmageddon={whatIfArmageddon}
              cashScenario={cashScenario}
              inflationLoss={inflationLoss}
              investmentAmount={investmentAmount}
              expanded={stressTestExpanded}
              setExpanded={setStressTestExpanded}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This calculator is for educational purposes only. Past performance does not guarantee future results.</p>
          <p className="mt-1">Always consult a qualified financial advisor before making investment decisions.</p>
        </div>
      </div>
    </div>
  );
}
