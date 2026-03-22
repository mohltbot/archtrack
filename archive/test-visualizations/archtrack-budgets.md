# ArchTrack Budget Visualization Test

## Project Budget Breakdown

```typescript
// Using the visualize skill to show ArchTrack project budgets
const archTrackBudgets = {
  type: 'bar-chart',
  title: 'ArchTrack Active Projects - Budget Overview',
  subtitle: 'Your uncle\'s architectural firm projects',
  data: [
    { project: 'Community Center', budget: 300000, client: 'City Council', startDate: '2026-03-08' },
    { project: 'Downtown Office', budget: 500000, client: 'ABC Corp', startDate: '2026-03-08' },
    { project: 'Residential Tower', budget: 750000, client: 'XYZ Developers', startDate: '2026-03-08' }
  ],
  xAxis: 'project',
  yAxis: 'budget',
  format: 'currency',
  currency: 'USD'
};

// Total budget: $1,550,000
```

## Employee Cost Analysis

```typescript
const employeeCosts = {
  type: 'pie-chart',
  title: 'Team Hourly Rates',
  subtitle: '3 employees configured in ArchTrack',
  data: [
    { name: 'Ahmed (Architecture)', rate: 65, percentage: 29 },
    { name: 'Mohammed (Architecture)', rate: 75, percentage: 33 },
    { name: 'Sarah (Design Manager)', rate: 85, percentage: 38 }
  ],
  totalHourly: 225
};
```

## Task Distribution

```typescript
const taskDistribution = {
  type: 'doughnut-chart',
  title: 'Current Tasks by Priority',
  data: [
    { priority: 'High', count: 2, tasks: ['Initial Design Concepts', 'Site Analysis'] },
    { priority: 'Medium', count: 1, tasks: ['Floor Plan Development'] },
    { priority: 'Low', count: 1, tasks: ['Client Meeting Prep'] }
  ]
};
```

## Key Insights for Your Uncle:
1. **Total Portfolio Value:** $1.55M across 3 active projects
2. **Average Project Size:** $516K
3. **Largest Project:** Residential Tower at $750K (48% of total)
4. **Team Utilization:** 4 tasks assigned across 3 employees
5. **Billable Rates:** $65-85/hour (market competitive for architecture)
