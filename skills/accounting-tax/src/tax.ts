import Decimal from 'decimal.js';
import { addMonths, differenceInMonths, startOfYear, endOfYear } from 'date-fns';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// 2024 Tax Brackets (Single filer) - update annually
const TAX_BRACKETS_2024 = {
  single: [
    { limit: new Decimal(11600), rate: new Decimal(0.10) },
    { limit: new Decimal(47150), rate: new Decimal(0.12) },
    { limit: new Decimal(100525), rate: new Decimal(0.22) },
    { limit: new Decimal(191950), rate: new Decimal(0.24) },
    { limit: new Decimal(243725), rate: new Decimal(0.32) },
    { limit: new Decimal(609350), rate: new Decimal(0.35) },
    { limit: new Decimal(Infinity), rate: new Decimal(0.37) },
  ],
  married: [
    { limit: new Decimal(23200), rate: new Decimal(0.10) },
    { limit: new Decimal(94300), rate: new Decimal(0.12) },
    { limit: new Decimal(201050), rate: new Decimal(0.22) },
    { limit: new Decimal(383900), rate: new Decimal(0.24) },
    { limit: new Decimal(487450), rate: new Decimal(0.32) },
    { limit: new Decimal(731200), rate: new Decimal(0.35) },
    { limit: new Decimal(Infinity), rate: new Decimal(0.37) },
  ],
};

// Standard Deductions 2024
const STANDARD_DEDUCTIONS_2024 = {
  single: new Decimal(14600),
  married: new Decimal(29200),
  headOfHousehold: new Decimal(21900),
};

export interface TaxpayerInfo {
  filingStatus: 'single' | 'married' | 'headOfHousehold';
  income: Decimal;
  deductions?: Decimal;
  credits?: TaxCredit[];
  withholding?: Decimal;
  estimatedPayments?: Decimal;
}

export interface TaxCredit {
  name: string;
  amount: Decimal;
  refundable: boolean;
}

export interface TaxCalculation {
  grossIncome: Decimal;
  adjustedGrossIncome: Decimal;
  taxableIncome: Decimal;
  standardDeduction: Decimal;
  itemizedDeductions?: Decimal;
  deductionUsed: 'standard' | 'itemized';
  taxBrackets: TaxBracketDetail[];
  totalTax: Decimal;
  credits: Decimal;
  taxAfterCredits: Decimal;
  withholding: Decimal;
  estimatedPayments: Decimal;
  amountDue: Decimal;
  effectiveTaxRate: Decimal;
  marginalTaxRate: Decimal;
}

export interface TaxBracketDetail {
  bracket: string;
  amountInBracket: Decimal;
  rate: Decimal;
  tax: Decimal;
}

export interface QuarterlyEstimate {
  quarter: number;
  dueDate: Date;
  amount: Decimal;
  safeHarborAmount: Decimal;
}

export class TaxCalculator {
  /**
   * Calculate federal income tax
   */
  calculateIncomeTax(info: TaxpayerInfo): TaxCalculation {
    const agi = info.income;
    
    // Determine standard deduction
    const standardDeduction = STANDARD_DEDUCTIONS_2024[info.filingStatus];
    
    // Use itemized if provided and greater
    const itemized = info.deductions || new Decimal(0);
    const useItemized = itemized.greaterThan(standardDeduction);
    const deductionUsed = useItemized ? itemized : standardDeduction;
    
    // Calculate taxable income
    const taxableIncome = agi.minus(deductionUsed);
    const finalTaxableIncome = taxableIncome.greaterThan(0) ? taxableIncome : new Decimal(0);
    
    // Calculate tax using brackets
    const brackets = TAX_BRACKETS_2024[info.filingStatus];
    const bracketDetails: TaxBracketDetail[] = [];
    let remainingIncome = finalTaxableIncome;
    let previousLimit = new Decimal(0);
    let totalTax = new Decimal(0);
    let marginalRate = new Decimal(0);
    
    for (const bracket of brackets) {
      if (remainingIncome.lessThanOrEqualTo(0)) break;
      
      const bracketSize = bracket.limit.minus(previousLimit);
      const amountInBracket = Decimal.min(remainingIncome, bracketSize);
      const taxInBracket = amountInBracket.times(bracket.rate);
      
      bracketDetails.push({
        bracket: `$${previousLimit.toFixed(0)} - $${bracket.limit.toFixed(0)}`,
        amountInBracket,
        rate: bracket.rate,
        tax: taxInBracket,
      });
      
      totalTax = totalTax.plus(taxInBracket);
      remainingIncome = remainingIncome.minus(amountInBracket);
      previousLimit = bracket.limit;
      
      if (amountInBracket.greaterThan(0)) {
        marginalRate = bracket.rate;
      }
    }
    
    // Apply credits
    const totalCredits = (info.credits || []).reduce(
      (sum, credit) => sum.plus(credit.amount),
      new Decimal(0)
    );
    
    const taxAfterCredits = Decimal.max(totalTax.minus(totalCredits), new Decimal(0));
    
    // Calculate payments
    const withholding = info.withholding || new Decimal(0);
    const estimatedPayments = info.estimatedPayments || new Decimal(0);
    const totalPayments = withholding.plus(estimatedPayments);
    
    const amountDue = taxAfterCredits.minus(totalPayments);
    
    // Effective tax rate
    const effectiveRate = info.income.greaterThan(0) 
      ? totalTax.dividedBy(info.income).times(100)
      : new Decimal(0);
    
    return {
      grossIncome: info.income,
      adjustedGrossIncome: agi,
      taxableIncome: finalTaxableIncome,
      standardDeduction,
      itemizedDeductions: useItemized ? itemized : undefined,
      deductionUsed: useItemized ? 'itemized' : 'standard',
      taxBrackets: bracketDetails,
      totalTax,
      credits: totalCredits,
      taxAfterCredits,
      withholding,
      estimatedPayments,
      amountDue,
      effectiveTaxRate: effectiveRate,
      marginalTaxRate: marginalRate.times(100),
    };
  }
  
  /**
   * Calculate quarterly estimated tax payments
   */
  calculateQuarterlyEstimates(
    projectedAnnualIncome: Decimal,
    filingStatus: 'single' | 'married' | 'headOfHousehold',
    year: number = new Date().getFullYear()
  ): QuarterlyEstimate[] {
    const mockTaxpayer: TaxpayerInfo = {
      filingStatus,
      income: projectedAnnualIncome,
    };
    
    const calculation = this.calculateIncomeTax(mockTaxpayer);
    const annualTax = calculation.taxAfterCredits;
    
    // Safe harbor: 100% of prior year tax (110% if AGI > $150k)
    const safeHarborPercent = projectedAnnualIncome.greaterThan(150000) 
      ? new Decimal(1.10) 
      : new Decimal(1.00);
    
    const safeHarborTax = annualTax.times(safeHarborPercent);
    
    // Quarterly due dates
    const quarters = [
      { q: 1, month: 3, day: 15 },
      { q: 2, month: 5, day: 15 },
      { q: 3, month: 8, day: 15 },
      { q: 4, month: 0, day: 15 }, // Jan of next year
    ];
    
    return quarters.map((q, i) => ({
      quarter: q.q,
      dueDate: new Date(year + (q.month === 0 ? 1 : 0), q.month, q.day),
      amount: annualTax.dividedBy(4),
      safeHarborAmount: safeHarborTax.dividedBy(4),
    }));
  }
  
  /**
   * Calculate self-employment tax
   */
  calculateSelfEmploymentTax(netSelfEmploymentIncome: Decimal): {
    socialSecurityTax: Decimal;
    medicareTax: Decimal;
    totalSETax: Decimal;
    deduction: Decimal;
  } {
    // 2024 limits
    const socialSecurityLimit = new Decimal(168600);
    const socialSecurityRate = new Decimal(0.124);
    const medicareRate = new Decimal(0.029);
    const additionalMedicareRate = new Decimal(0.009);
    
    // Calculate 92.35% of net SE income
    const taxableSEIncome = netSelfEmploymentIncome.times(0.9235);
    
    // Social Security portion (limited to wage base)
    const ssTaxable = Decimal.min(taxableSEIncome, socialSecurityLimit);
    const socialSecurityTax = ssTaxable.times(socialSecurityRate);
    
    // Medicare portion (no limit)
    let medicareTax = taxableSEIncome.times(medicareRate);
    
    // Additional Medicare Tax for high earners (> $200k single, > $250k married)
    // Simplified - assuming single filer for this calculation
    if (taxableSEIncome.greaterThan(200000)) {
      medicareTax = medicareTax.plus(
        taxableSEIncome.minus(200000).times(additionalMedicareRate)
      );
    }
    
    const totalSETax = socialSecurityTax.plus(medicareTax);
    
    // 50% of SE tax is deductible
    const deduction = totalSETax.times(0.50);
    
    return {
      socialSecurityTax,
      medicareTax,
      totalSETax,
      deduction,
    };
  }
  
  /**
   * Generate tax summary report
   */
  generateReport(calculation: TaxCalculation): string {
    let report = `# Tax Calculation Summary\n\n`;
    report += `Filing Status: ${calculation.deductionUsed === 'standard' ? 'Standard Deduction' : 'Itemized Deductions'}\n\n`;
    
    report += `## Income\n`;
    report += `- Gross Income: $${calculation.grossIncome.toFixed(2)}\n`;
    report += `- Adjusted Gross Income: $${calculation.adjustedGrossIncome.toFixed(2)}\n\n`;
    
    report += `## Deductions\n`;
    report += `- ${calculation.deductionUsed === 'standard' ? 'Standard' : 'Itemized'} Deduction: $${calculation.deductionUsed === 'standard' ? calculation.standardDeduction.toFixed(2) : calculation.itemizedDeductions?.toFixed(2)}\n`;
    report += `- Taxable Income: $${calculation.taxableIncome.toFixed(2)}\n\n`;
    
    report += `## Tax Calculation\n`;
    calculation.taxBrackets.forEach(b => {
      if (b.amountInBracket.greaterThan(0)) {
        report += `- ${b.bracket}: $${b.amountInBracket.toFixed(2)} × ${b.rate.times(100).toFixed(0)}% = $${b.tax.toFixed(2)}\n`;
      }
    });
    report += `- **Total Tax: $${calculation.totalTax.toFixed(2)}**\n`;
    
    if (calculation.credits.greaterThan(0)) {
      report += `- Credits: -$${calculation.credits.toFixed(2)}\n`;
    }
    
    report += `- **Tax After Credits: $${calculation.taxAfterCredits.toFixed(2)}**\n\n`;
    
    report += `## Payments\n`;
    report += `- Withholding: $${calculation.withholding.toFixed(2)}\n`;
    report += `- Estimated Payments: $${calculation.estimatedPayments.toFixed(2)}\n`;
    
    if (calculation.amountDue.greaterThan(0)) {
      report += `- **Amount Due: $${calculation.amountDue.toFixed(2)}** ⚠️\n`;
    } else {
      report += `- **Refund Due: $${calculation.amountDue.abs().toFixed(2)}** ✅\n`;
    }
    
    report += `\n## Tax Rates\n`;
    report += `- Effective Tax Rate: ${calculation.effectiveTaxRate.toFixed(2)}%\n`;
    report += `- Marginal Tax Rate: ${calculation.marginalTaxRate.toFixed(2)}%\n`;
    
    return report;
  }
}

export const taxCalculator = new TaxCalculator();
