# Mission Control

AI-powered command center for managing tasks, expenses, memories, and sub-agents.

## Features

- **Dashboard Overview**: Real-time stats on tasks, agents, budget, and memories
- **Task Management**: Track tasks with status, priority, and category
- **Budget Tracker**: Monitor API spend against $200/month limit
- **Sub-Agent Monitor**: View active AI agents and their status
- **Memory Browser**: (Coming soon) Search and manage stored memories

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- Recharts (for visualizations)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Data Storage

All data is stored locally in SQLite at `data/mission-control.db`.

## API Routes

- `GET/POST /api/tasks` - Manage tasks
- `GET/POST /api/expenses` - Track expenses
- `GET /api/expenses` - Get monthly spend summary

## Roadmap

- [ ] Memory browser with search
- [ ] Real-time agent status updates
- [ ] Task creation/editing UI
- [ ] Expense breakdown charts
- [ ] Integration with OpenClaw session data
