import { reconciliationEngine } from './reconciliation';
import { taxCalculator } from './tax';
import { financialAnalyzer } from './financial-analysis';
import { DepreciationCalculator } from './depreciation';

// Main entry point for OpenClaw skill
export {
  reconciliationEngine,
  taxCalculator,
  financialAnalyzer,
  DepreciationCalculator,
};

// Default export for skill registry
export default {
  name: 'accounting-tax',
  version: '1.0.0',
  description: 'Comprehensive accounting and tax automation for finance professionals',
  commands: {
    reconcile: reconciliationEngine.reconcile.bind(reconciliationEngine),
    'tax-calc': taxCalculator.calculateIncomeTax.bind(taxCalculator),
    'financial-analysis': financialAnalyzer.calculateRatios.bind(financialAnalyzer),
    'variance': financialAnalyzer.analyzeVariances.bind(financialAnalyzer),
  },
};
