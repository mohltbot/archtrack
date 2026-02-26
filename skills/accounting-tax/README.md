# 🧮 Accounting & Tax OpenClaw Skill

> **Professional-grade accounting automation for CPAs, bookkeepers, and finance professionals**
>
> Built by a CPA actively working in AI advisory. This isn't theoretical—it's designed for real-world accounting workflows.

[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue)](https://openclaw.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 🎯 Why This Skill Exists

As a CPA in AI advisory, I noticed most accounting automation tools are:
- ❌ Built by developers who don't understand accounting
- ❌ Overly complex for daily workflows
- ❌ Don't handle real edge cases (partial periods, rounding, tax law changes)

**This skill bridges that gap**—accounting expertise meets AI automation.

## ✨ Features

### 🔍 **Bank Reconciliation**
- Automated matching between GL and bank statements
- Identifies missing transactions, duplicates, and amount mismatches
- Auto-categorizes outstanding checks and deposits in transit
- Generates professional reconciliation reports

```typescript
const result = await claw.accounting.reconcile({
  glAccount: generalLedger,
  bankStatement: bankStmt,
  tolerance: 0.01
});
// Returns: balanced status, differences, adjusted balance
```

### 💰 **Tax Calculations**
- Federal income tax with 2024 brackets
- Self-employment tax calculations
- Quarterly estimated payments
- Effective and marginal tax rates

```typescript
const tax = await claw.accounting.taxCalc({
  filingStatus: 'single',
  income: 85000,
  deductions: 15000,
  credits: [{ name: 'Education', amount: 2000 }]
});
// Returns: total tax, amount due, quarterly estimates
```

### 📊 **Financial Analysis**
- Profitability ratios (margins, ROA, ROE)
- Liquidity ratios (current, quick ratios)
- Leverage analysis (debt/equity)
- Variance analysis (budget vs actual)

```typescript
const analysis = await claw.accounting.financialAnalysis({
  current: currentPeriod,
  previous: priorPeriod
});
// Returns: complete ratio suite with industry comparisons
```

### 🏢 **Depreciation Schedules**
- Straight-line, MACRS (US tax), and declining balance
- 3, 5, 7, 10, 15, 20, 27.5, 39-year property classes
- Tax deduction calculations
- Professional schedule reports

```typescript
const schedule = await claw.accounting.depreciation({
  purchasePrice: 50000,
  propertyClass: 5,
  method: 'MACRS'
});
// Returns: year-by-year depreciation schedule
```

### 🧠 **Smart Variance Detection**
- Automatically flags significant variances (>10%)
- Categorizes as favorable/unfavorable
- Prioritizes by dollar impact
- Generates variance reports

## 🚀 Quick Start

### Installation

```bash
# Via OpenClaw CLI
claw skill install accounting-tax

# Or clone manually
git clone https://github.com/mohltbot/accounting-tax-skill.git
cd accounting-tax-skill
npm install
npm run build
```

### Basic Usage

```typescript
import { claw } from 'openclaw';

// Enable the skill
await claw.skills.enable('accounting-tax');

// Reconcile a bank statement
const recon = await claw.accounting.reconcile({
  glTransactions: myGLData,
  bankTransactions: bankCSV,
  period: '2024-Q1'
});

if (!recon.isBalanced) {
  console.log('Differences found:', recon.differences);
}

// Calculate tax projection
const projection = await claw.accounting.taxCalc({
  filingStatus: 'married',
  income: 125000,
  state: 'CA'
});

console.log(`Estimated tax: $${projection.totalTax}`);
console.log(`Quarterly payments: $${projection.quarterlyEstimates[0].amount}/quarter`);
```

## 💡 Real-World Use Cases

### Monthly Close Automation
```typescript
// Automated month-end reconciliation
for (const account of bankAccounts) {
  const result = await claw.accounting.reconcile({
    glAccount: account.gl,
    bankStatement: await fetchBankData(account.number),
    autoCategorize: true
  });
  
  if (result.outstandingChecks.length > 0) {
    await notifyAPTeam(result.outstandingChecks);
  }
}
```

### Tax Planning for Clients
```typescript
// Quarterly tax check-in
const estimates = await claw.accounting.taxCalc({
  ...clientData,
  ytdIncome: await fetchYTDEarnings(client.id),
  projectedAnnual: projectAnnualIncome(client)
});

if (estimates.amountDue > 1000) {
  await suggestEstimatedPayment(client, estimates.quarterlyEstimates);
}
```

### Financial Health Dashboard
```typescript
// Weekly financial snapshot
const ratios = await claw.accounting.financialAnalysis({
  current: thisWeek,
  previous: lastWeek,
  budget: annualBudget
});

if (ratios.liquidity.currentRatio < 1.5) {
  await alertCFO('Liquidity warning: Current ratio below threshold');
}
```

## 📚 Documentation

### API Reference

#### `reconcile(options)`
Reconciles GL against bank statement.

**Parameters:**
- `glAccount` (GLAccount): General ledger data
- `bankStatement` (BankStatement): Bank statement data
- `tolerance` (number): Matching tolerance (default: 0.01)
- `dateRange` (object): Optional date filter

**Returns:** `ReconciliationResult`

#### `taxCalc(taxpayerInfo)`
Calculates federal income tax.

**Parameters:**
- `filingStatus` (string): 'single' | 'married' | 'headOfHousehold'
- `income` (Decimal): Gross income
- `deductions` (Decimal): Itemized deductions (optional)
- `credits` (TaxCredit[]): Tax credits array

**Returns:** `TaxCalculation`

#### `financialAnalysis(statements)`
Analyzes financial ratios and performance.

**Parameters:**
- `current` (FinancialStatement): Current period data
- `previous` (FinancialStatement): Prior period for comparison
- `budget` (object): Budget data for variance analysis

**Returns:** `FinancialRatios`

## 🛠️ Technical Details

### Precision Handling
All calculations use **Decimal.js** with 20-digit precision to eliminate floating-point errors common in financial calculations.

### Tax Law Updates
- Current for **2024 tax year**
- Includes latest brackets and standard deductions
- Self-employment tax calculations
- Quarterly estimate safe harbors

### Data Formats
Supports:
- CSV imports (bank statements, GL exports)
- JSON objects
- Direct API integrations

## 🧪 Testing

```bash
npm test

# Run specific test suite
npm test -- reconciliation
npm test -- tax
npm test -- financial-analysis
```

## 🤝 Contributing

This is a living skill. Tax laws change. Accounting standards evolve. 

**Ways to contribute:**
1. Report bugs or edge cases
2. Suggest new features
3. Update tax brackets for new years
4. Add support for international tax systems
5. Improve documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Built with expertise from:
- Real client engagements in AI advisory
- Active CPA practice
- OpenClaw community feedback
- Accounting standards (GAAP, tax code)

---

**Built by Mohammed Wasif, CPA** | [LinkedIn](https://linkedin.com/in/mohammedwasif) | [GitHub](https://github.com/mohltbot)

> *"The best accounting automation isn't about replacing CPAs—it's about amplifying their judgment with accurate, instant calculations."*
