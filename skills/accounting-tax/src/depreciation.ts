import Decimal from 'decimal.js';

export interface DepreciationSchedule {
  method: 'straight-line' | 'double-declining' | 'sum-of-years' | 'units-of-production';
  assetName: string;
  purchasePrice: Decimal;
  salvageValue: Decimal;
  usefulLife: number; // in years
  purchaseDate: Date;
  schedule: DepreciationEntry[];
}

export interface DepreciationEntry {
  year: number;
  startBookValue: Decimal;
  depreciationExpense: Decimal;
  accumulatedDepreciation: Decimal;
  endBookValue: Decimal;
  taxDeduction?: Decimal;
}

export class DepreciationCalculator {
  /**
   * Calculate straight-line depreciation
   */
  calculateStraightLine(
    purchasePrice: Decimal,
    salvageValue: Decimal,
    usefulLife: number,
    assetName: string,
    purchaseDate: Date = new Date()
  ): DepreciationSchedule {
    const depreciableBase = purchasePrice.minus(salvageValue);
    const annualDepreciation = depreciableBase.dividedBy(usefulLife);
    
    const schedule: DepreciationEntry[] = [];
    let accumulatedDepreciation = new Decimal(0);
    
    for (let year = 1; year <= usefulLife; year++) {
      const startBookValue = purchasePrice.minus(accumulatedDepreciation);
      
      // Handle partial first year if needed
      let yearDepreciation = annualDepreciation;
      if (year === 1) {
        const monthsInFirstYear = 12 - purchaseDate.getMonth();
        yearDepreciation = annualDepreciation.times(monthsInFirstYear).dividedBy(12);
      }
      
      accumulatedDepreciation = accumulatedDepreciation.plus(yearDepreciation);
      const endBookValue = purchasePrice.minus(accumulatedDepreciation);
      
      schedule.push({
        year,
        startBookValue,
        depreciationExpense: yearDepreciation,
        accumulatedDepreciation,
        endBookValue,
        taxDeduction: yearDepreciation,
      });
    }
    
    return {
      method: 'straight-line',
      assetName,
      purchasePrice,
      salvageValue,
      usefulLife,
      purchaseDate,
      schedule,
    };
  }
  
  /**
   * Calculate MACRS (Modified Accelerated Cost Recovery System) - US Tax
   * Simplified for common property types (5-year, 7-year, 15-year, 27.5-year, 39-year)
   */
  calculateMACRS(
    purchasePrice: Decimal,
    propertyClass: 3 | 5 | 7 | 10 | 15 | 20 | 27.5 | 39,
    assetName: string,
    purchaseDate: Date = new Date(),
    convention: 'half-year' | 'mid-quarter' | 'mid-month' = 'half-year'
  ): DepreciationSchedule {
    // MACRS rates for half-year convention
    const macrsRates: Record<number, number[]> = {
      3: [0.3333, 0.4445, 0.1481, 0.0741],
      5: [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576],
      7: [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
      10: [0.1000, 0.1800, 0.1440, 0.1152, 0.0922, 0.0737, 0.0655, 0.0655, 0.0656, 0.0655, 0.0328],
      15: [0.0500, 0.0950, 0.0855, 0.0770, 0.0693, 0.0623, 0.0590, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0295],
      20: [0.0375, 0.0721, 0.0667, 0.0617, 0.0571, 0.0529, 0.0491, 0.0455, 0.0422, 0.0391, 0.0362, 0.0362, 0.0362, 0.0362, 0.0362, 0.0362, 0.0362, 0.0362, 0.0362, 0.0362, 0.0181],
      27.5: Array(28).fill(0.03636).map((v, i) => i === 27 ? 0.01818 : v),
      39: Array(40).fill(0.02564).map((v, i) => i === 39 ? 0.01128 : v),
    };
    
    const rates = macrsRates[propertyClass];
    const schedule: DepreciationEntry[] = [];
    let accumulatedDepreciation = new Decimal(0);
    
    rates.forEach((rate, index) => {
      const year = index + 1;
      const startBookValue = purchasePrice.minus(accumulatedDepreciation);
      const depreciationExpense = purchasePrice.times(rate);
      accumulatedDepreciation = accumulatedDepreciation.plus(depreciationExpense);
      const endBookValue = purchasePrice.minus(accumulatedDepreciation);
      
      schedule.push({
        year,
        startBookValue,
        depreciationExpense,
        accumulatedDepreciation,
        endBookValue,
        taxDeduction: depreciationExpense,
      });
    });
    
    return {
      method: 'double-declining',
      assetName,
      purchasePrice,
      salvageValue: new Decimal(0),
      usefulLife: propertyClass,
      purchaseDate,
      schedule,
    };
  }
  
  /**
   * Generate depreciation schedule report
   */
  generateReport(schedule: DepreciationSchedule): string {
    let report = `# Depreciation Schedule: ${schedule.assetName}\n\n`;
    report += `Method: ${schedule.method.toUpperCase()}\n`;
    report += `Purchase Price: $${schedule.purchasePrice.toFixed(2)}\n`;
    report += `Salvage Value: $${schedule.salvageValue.toFixed(2)}\n`;
    report += `Useful Life: ${schedule.usefulLife} years\n`;
    report += `Purchase Date: ${schedule.purchaseDate.toLocaleDateString()}\n\n`;
    
    report += `| Year | Start Value | Depreciation | Accumulated | End Value | Tax Deduction |\n`;
    report += `|------|-------------|--------------|-------------|-----------|---------------|\n`;
    
    schedule.schedule.forEach(entry => {
      report += `| ${entry.year} | $${entry.startBookValue.toFixed(2)} | $${entry.depreciationExpense.toFixed(2)} | $${entry.accumulatedDepreciation.toFixed(2)} | $${entry.endBookValue.toFixed(2)} | $${entry.taxDeduction?.toFixed(2) || '0.00'} |\n`;
    });
    
    const totalDepreciation = schedule.schedule.reduce(
      (sum, entry) => sum.plus(entry.depreciationExpense),
      new Decimal(0)
    );
    
    report += `\n**Total Depreciation: $${totalDepreciation.toFixed(2)}**\n`;
    
    return report;
  }
}

export const depreciationCalculator = new DepreciationCalculator();
