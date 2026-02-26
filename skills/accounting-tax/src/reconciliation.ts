import Decimal from 'decimal.js';

// Accounting precision - always use 2 decimal places for currency
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: Decimal;
  type: 'debit' | 'credit';
  account: string;
  reference?: string;
}

export interface GLAccount {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: Decimal;
  transactions: Transaction[];
}

export interface BankStatement {
  accountNumber: string;
  startDate: Date;
  endDate: Date;
  startingBalance: Decimal;
  endingBalance: Decimal;
  transactions: Transaction[];
}

export interface ReconciliationResult {
  isBalanced: boolean;
  differences: ReconciliationDifference[];
  glBalance: Decimal;
  bankBalance: Decimal;
  outstandingChecks: Transaction[];
  depositsInTransit: Transaction[];
  adjustedBalance: Decimal;
}

export interface ReconciliationDifference {
  type: 'missing_gl' | 'missing_bank' | 'amount_mismatch' | 'duplicate';
  transaction: Transaction;
  glAmount?: Decimal;
  bankAmount?: Decimal;
  details: string;
}

export class ReconciliationEngine {
  /**
   * Perform bank reconciliation between GL and bank statement
   */
  reconcile(
    glAccount: GLAccount,
    bankStatement: BankStatement,
    options: {
      tolerance?: Decimal;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): ReconciliationResult {
    const tolerance = options.tolerance || new Decimal(0.01);
    const differences: ReconciliationDifference[] = [];
    
    // Filter GL transactions to reconciliation period
    const glTransactions = glAccount.transactions.filter(t => {
      if (!options.dateRange) return true;
      return t.date >= options.dateRange.start && t.date <= options.dateRange.end;
    });
    
    // Create lookup maps for faster matching
    const glMap = new Map<string, Transaction[]>();
    const bankMap = new Map<string, Transaction[]>();
    
    glTransactions.forEach(t => {
      const key = this.getMatchKey(t);
      if (!glMap.has(key)) glMap.set(key, []);
      glMap.get(key)!.push(t);
    });
    
    bankStatement.transactions.forEach(t => {
      const key = this.getMatchKey(t);
      if (!bankMap.has(key)) bankMap.set(key, []);
      bankMap.get(key)!.push(t);
    });
    
    // Find missing in GL (bank has, GL doesn't)
    const missingInGL: Transaction[] = [];
    bankStatement.transactions.forEach(bankTx => {
      const key = this.getMatchKey(bankTx);
      const glMatches = glMap.get(key) || [];
      
      if (glMatches.length === 0) {
        missingInGL.push(bankTx);
        differences.push({
          type: 'missing_gl',
          transaction: bankTx,
          bankAmount: bankTx.amount,
          details: `Transaction exists in bank but not in GL: ${bankTx.description}`,
        });
      }
    });
    
    // Find missing in bank (GL has, bank doesn't)
    const missingInBank: Transaction[] = [];
    glTransactions.forEach(glTx => {
      const key = this.getMatchKey(glTx);
      const bankMatches = bankMap.get(key) || [];
      
      if (bankMatches.length === 0) {
        missingInBank.push(glTx);
        differences.push({
          type: 'missing_bank',
          transaction: glTx,
          glAmount: glTx.amount,
          details: `Transaction exists in GL but not in bank: ${glTx.description}`,
        });
      }
    });
    
    // Check for amount mismatches
    glTransactions.forEach(glTx => {
      const key = this.getMatchKey(glTx);
      const bankMatches = bankMap.get(key) || [];
      
      bankMatches.forEach(bankTx => {
        const amountDiff = glTx.amount.minus(bankTx.amount).abs();
        if (amountDiff.greaterThan(tolerance)) {
          differences.push({
            type: 'amount_mismatch',
            transaction: glTx,
            glAmount: glTx.amount,
            bankAmount: bankTx.amount,
            details: `Amount mismatch: GL shows ${glTx.amount}, Bank shows ${bankTx.amount}`,
          });
        }
      });
    });
    
    // Categorize missing items
    const outstandingChecks = missingInBank.filter(t => 
      t.type === 'credit' && t.amount.greaterThan(0)
    );
    
    const depositsInTransit = missingInBank.filter(t => 
      t.type === 'debit' && t.amount.greaterThan(0)
    );
    
    // Calculate adjusted balance
    const glBalance = glAccount.balance;
    const bankBalance = bankStatement.endingBalance;
    
    const outstandingChecksTotal = outstandingChecks.reduce(
      (sum, t) => sum.plus(t.amount),
      new Decimal(0)
    );
    
    const depositsInTransitTotal = depositsInTransit.reduce(
      (sum, t) => sum.plus(t.amount),
      new Decimal(0)
    );
    
    const adjustedBalance = bankBalance
      .minus(outstandingChecksTotal)
      .plus(depositsInTransitTotal);
    
    const isBalanced = adjustedBalance.minus(glBalance).abs().lessThanOrEqualTo(tolerance);
    
    return {
      isBalanced,
      differences,
      glBalance,
      bankBalance,
      outstandingChecks,
      depositsInTransit,
      adjustedBalance,
    };
  }
  
  private getMatchKey(transaction: Transaction): string {
    // Create fuzzy matching key based on amount and date
    const amountKey = transaction.amount.toFixed(2);
    const dateKey = transaction.date.toISOString().split('T')[0];
    return `${amountKey}|${dateKey}`;
  }
  
  /**
   * Generate reconciliation report
   */
  generateReport(result: ReconciliationResult): string {
    let report = `# Bank Reconciliation Report\n\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n\n`;
    report += `## Summary\n`;
    report += `- Status: ${result.isBalanced ? '✅ BALANCED' : '❌ UNBALANCED'}\n`;
    report += `- GL Balance: $${result.glBalance.toFixed(2)}\n`;
    report += `- Bank Balance: $${result.bankBalance.toFixed(2)}\n`;
    report += `- Adjusted Balance: $${result.adjustedBalance.toFixed(2)}\n`;
    report += `- Difference: $${result.glBalance.minus(result.adjustedBalance).toFixed(2)}\n\n`;
    
    if (result.outstandingChecks.length > 0) {
      report += `## Outstanding Checks ($${result.outstandingChecks.reduce((s, t) => s.plus(t.amount), new Decimal(0)).toFixed(2)})\n`;
      result.outstandingChecks.forEach(t => {
        report += `- ${t.date.toLocaleDateString()}: ${t.description} ($${t.amount.toFixed(2)})\n`;
      });
      report += `\n`;
    }
    
    if (result.depositsInTransit.length > 0) {
      report += `## Deposits in Transit ($${result.depositsInTransit.reduce((s, t) => s.plus(t.amount), new Decimal(0)).toFixed(2)})\n`;
      result.depositsInTransit.forEach(t => {
        report += `- ${t.date.toLocaleDateString()}: ${t.description} ($${t.amount.toFixed(2)})\n`;
      });
      report += `\n`;
    }
    
    if (result.differences.length > 0) {
      report += `## Differences Found (${result.differences.length})\n`;
      result.differences.forEach((diff, i) => {
        report += `${i + 1}. **${diff.type}**: ${diff.details}\n`;
      });
    }
    
    return report;
  }
}

export const reconciliationEngine = new ReconciliationEngine();
