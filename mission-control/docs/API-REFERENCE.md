# Mission Control - API Endpoints

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Tasks

#### GET /tasks
List all tasks
```bash
curl http://localhost:3000/api/tasks
```

#### POST /tasks
Create new task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task name",
    "description": "Task details",
    "status": "pending",
    "priority": "high",
    "category": "infrastructure"
  }'
```

#### PUT /tasks/:id
Update task
```bash
curl -X PUT http://localhost:3000/api/tasks/123 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

#### DELETE /tasks/:id
Delete task
```bash
curl -X DELETE http://localhost:3000/api/tasks/123
```

### Expenses

#### GET /expenses
List all expenses
```bash
curl http://localhost:3000/api/expenses
```

#### POST /expenses
Log new expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "API call",
    "amount": 0.05,
    "provider": "moonshot",
    "model": "kimi-k2.5",
    "tokens_in": 1000,
    "tokens_out": 500
  }'
```

### Health Check

#### GET /health
System health status
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-02T07:52:00Z",
  "services": {
    "database": "connected",
    "tasks": "operational",
    "expenses": "operational"
  }
}
```

## Data Models

### Task
```typescript
{
  id: number;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  created_at: string;
  completed_at?: string;
}
```

### Expense
```typescript
{
  id: number;
  description: string;
  amount: number;
  provider: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  category: string;
  created_at: string;
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": "Missing required field: title"
}
```

### 404 Not Found
```json
{
  "error": "Task not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

**Last Updated:** March 2, 2026
