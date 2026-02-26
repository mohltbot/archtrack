import Decimal from 'decimal.js';

export interface FinancialStatement {
  period: string;
  revenue: Decimal;
  costOfGoodsSold: Decimal;
  operatingExpenses: {
    salaries: Decimal;
    rent: Decimal;
    utilities: Decimal;
    marketing: Decimal;
    other: Decimal;
  };
  assets: {
    current: Decimal;
    fixed: Decimal;
    other: Decimal;
  };
  liabilities: {
    current: Decimal;
    longTerm: Decimal;
  };
  equity: Decimal;
}

export interface FinancialRatios {
  profitability: {
    grossProfitMargin: Decimal;
    operatingProfitMargin: Decimal;
    netProfitMargin: Decimal;
    returnOnAssets: Decimal;
    returnOnEquity: Decimal;
  };
  liquidity: {
    currentRatio: Decimal;
    quickRatio: Decimal;
    cashRatio: Decimal;
    workingCapital: Decimal;
  };
  leverage: {
    debtToEquity: Decimal;
    debtToAssets: Decimal;
    equityMultiplier: Decimal;
  };
  efficiency: {
    assetTurnover: Decimal;
    inventoryTurnover?: Decimal;
    receivablesTurnover?: Decimal;
    daysSalesOutstanding?: Decimal;
  };
}

export interface VarianceAnalysis {
  category: string;
  budgeted: Decimal;
  actual: Decimal;
  variance: Decimal;
  variancePercent: Decimal;
  status: 'favorable' | 'unfavorable' | 'neutral';
}

export class FinancialAnalyzer {
  /**
   * Calculate all key financial ratios
   */
  calculateRatios(
    current: FinancialStatement,
    previous?: FinancialStatement,
    industry?: { [key: string]: Decimal }
  ): FinancialRatios {
    // Income statement calculations
    const grossProfit = current.revenue.minus(current.costOfGoodsSold);
    const operatingExpenses = Object.values(current.operatingExpenses)
      .reduce((sum, exp) => sum.plus(exp), new Decimal(0));
    const operatingIncome = grossProfit.minus(operatingExpenses);
    const netIncome = operatingIncome; // Simplified
    
    // Balance sheet calculations
    const totalAssets = current.assets.current
      .plus(current.assets.fixed)
      .plus(current.assets.other);
    const totalLiabilities = current.liabilities.current.plus(current.liabilities.longTerm);
    const totalEquity = current.equity;
    
    // Verify: Assets = Liabilities + Equity
    const balanceCheck = totalAssets.minus(totalLiabilities.plus(totalEquity));
    if (balanceCheck.abs().greaterThan(0.01)) {
      console.warn('Balance sheet does not balance!');
    }
    
    // Profitability Ratios
    const profitability = {
      grossProfitMargin: current.revenue.greaterThan(0)
        ? grossProfit.dividedBy(current.revenue).times(100)
        : new Decimal(0),
      operatingProfitMargin: current.revenue.greaterThan(0)
        ? operatingIncome.dividedBy(current.revenue).times(100)
        : new Decimal(0),
      netProfitMargin: current.revenue.greaterThan(0)
        ? netIncome.dividedBy(current.revenue).times(100)
        : new Decimal(0),
      returnOnAssets: totalAssets.greaterThan(0)
        ? netIncome.dividedBy(totalAssets).times(100)
        : new Decimal(0),
      returnOnEquity: totalEquity.greaterThan(0)
        ? netIncome.dividedBy(totalEquity).times(100)
        : new Decimal(0),
    };
    
    // Liquidity Ratios
    const liquidity = {
      currentRatio: current.liabilities.current.greaterThan(0)
        ? current.assets.current.dividedBy(current.liabilities.current)
        : new Decimal(0),
      quickRatio: current.liabilities.current.greaterThan(0)
        ? current.assets.current.dividedBy(current.liabilities.current) // Simplified (assuming no inventory)
        : new Decimal(0),
      cashRatio: current.liabilities.current.greaterThan(0)
        ? current.assets.current.dividedBy(current.liabilities.current) // Simplified
        : new Decimal(0),
      workingCapital: current.assets.current.minus(current.liabilities.current),
    };
    
    // Leverage Ratios
    const leverage = {
      debtToEquity: totalEquity.greaterThan(0)
        ? totalLiabilities.dividedBy(totalEquity)
        : new Decimal(0),
      debtToAssets: totalAssets.greaterThan(0)
        ? totalLiabilities.dividedBy(totalAssets)
        : new Decimal(0),
      equityMultiplier: totalEquity.greaterThan(0)
        ? totalAssets.dividedBy(totalEquity)
        : new Decimal(0),
    };
    
    // Efficiency Ratios (simplified)
    const efficiency = {
      assetTurnover: totalAssets.greaterThan(0) && previous
        ? current.revenue.dividedBy(totalAssets.plus(
            previous.assets.current.plus(previous.assets.fixed).plus(previous.assets.other)
          ).dividedBy(2))
        : new Decimal(0),
    };
    
    return {
      profitability,
      liquidity,
      leverage,
      efficiency,
    };
  }
  
  /**
   * Analyze budget vs actual variances
   */
  analyzeVariances(budget: { [category: string]: Decimal }, actual: { [category: string]: Decimal }): VarianceAnalysis[] {
    const allCategories = new Set([...Object.keys(budget), ...Object.keys(actual)]);
    
    return Array.from(allCategories).map(category => {
      const budgeted = budget[category] || new Decimal(0);
      const actualAmount = actual[category] || new Decimal(0);
      const variance = actualAmount.minus(budgeted);
      
      const variancePercent = budgeted.greaterThan(0)
        ? variance.dividedBy(budgeted).abs().times(100)
        : new Decimal(0);
      
      // Determine if favorable or unfavorable (simplified logic)
      let status: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
      
      // For expenses: actual < budget = favorable
      // For revenue: actual > budget = favorable
      if (category.toLowerCase().includes('revenue') || category.toLowerCase().includes('income')) {
        status = variance.greaterThan(0) ? 'favorable' : 'unfavorable';
      } else {
        status = variance.lessThan(0) ? 'favorable' : 'unfavorable';
      }
      
      return {
        category,
        budgeted,
        actual: actualAmount,
        variance,
        variancePercent,
        status,
      };
    }).sort((a, b) => b.variancePercent.minus(a.variancePercent).toNumber());
  }
  
  /**
   * Generate comprehensive financial analysis report
   */
  generateReport(statement: FinancialStatement, ratios: FinancialRatios): string {
    let report = `# Financial Analysis Report\n\n`;
    report += `Period: ${statement.period}\n\n`;
    
    // Executive Summary
    report += `## Executive Summary\n`;
    report += `- Revenue: $${statement.revenue.toFixed(2)}\n`;
    report += `- Gross Profit Margin: ${ratios.profitability.grossProfitMargin.toFixed(2)}%\n`;
    report += `- Net Profit Margin: ${ratios.profitability.netProfitMargin.toFixed(2)}%\n`;
    report += `- Current Ratio: ${ratios.liquidity.currentRatio.toFixed(2)}\n`;
    report += `- ROE: ${ratios.profitability.returnOnEquity.toFixed(2)}%\n\n`;
    
    // Profitability
    report += `## Profitability Ratios\n`;
    report += `| Ratio | Value | Industry Avg | Status |\n`;
    report += `|-------|-------|--------------|--------|\n`;
    report += `| Gross Profit Margin | ${ratios.profitability.grossProfitMargin.toFixed(2)}% | 40% | ${ratios.profitability.grossProfitMargin.greaterThan(40) ? '✅' : '⚠️'} |\n`;
    report += `| Operating Margin | ${ratios.profitability.operatingProfitMargin.toFixed(2)}% | 15% | ${ratios.profitability.operatingProfitMargin.greaterThan(15) ? '✅' : '⚠️'} |\n`;
    report += `| Net Profit Margin | ${ratios.profitability.netProfitMargin.toFixed(2)}% | 10% | ${ratios.profitability.netProfitMargin.greaterThan(10) ? '✅' : '⚠️'} |\n`;
    report += `| Return on Assets | ${ratios.profitability.returnOnAssets.toFixed(2)}% | 5% | ${ratios.profitability.returnOnAssets.greaterThan(5) ? '✅' : '⚠️'} |\n`;
    report += `| Return on Equity | ${ratios.profitability.returnOnEquity.toFixed(2)}% | 15% | ${ratios.profitability.returnOnEquity.greaterThan(15) ? '✅' : '⚠️'} |\n\n`;
    
    // Liquidity
    report += `## Liquidity Ratios\n`;
    report += `- Current Ratio: ${ratios.liquidity.currentRatio.toFixed(2)} ${ratios.liquidity.currentRatio.greaterThan(1.5) ? '✅ Healthy' : '⚠️ Low'}\n`;
    report += `- Quick Ratio: ${ratios.liquidity.quickRatio.toFixed(2)}\n`;
    report += `- Working Capital: $${ratios.liquidity.workingCapital.toFixed(2)}\n\n`;
    
    // Leverage
    report += `## Leverage Ratios\n`;
    report += `- Debt to Equity: ${ratios.leverage.debtToEquity.toFixed(2)}\n`;
    report += `- Debt to Assets: ${(ratios.leverage.debtToAssets.times(100)).toFixed(2)}%\n\n`;
    
    // Recommendations
    report += `## Recommendations\n`;
    if (ratios.liquidity.currentRatio.lessThan(1.5)) {
      report += `⚠️ **Liquidity Concern**: Current ratio below 1.5. Consider improving working capital management.\n\n`;
    }
    if (ratios.profitability.netProfitMargin.lessThan(10)) {
      report += `⚠️ **Profitability**: Net margin below 10%. Review pricing strategy and cost structure.\n\n`;
    }
    if (ratios.profitability.returnOnEquity.greaterThan(20)) {
      report += `✅ **Strong Performance**: ROE above 20% indicates excellent use of equity capital.\n\n`;
    }
    
    return report;
  }
}

export const financialAnalyzer = new FinancialAnalyzer();
