# Mission Control API Documentation

## Overview

The Mission Control Dashboard provides RESTful API endpoints for managing tasks, tracking expenses, and monitoring system health.

**Base URL:** `http://localhost:3000/api`

---

## Endpoints

### Health Check

Check the system health status, including database connectivity, task count, and budget status.

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-01T20:15:00.000Z",
  "version": "0.1.0",
  "checks": {
    "database": {
      "status": "pass",
      "responseTime": 12
    },
    "tasks": {
      "status": "pass",
      "count": 3
    },
    "budget": {
      "status": "pass",
      "monthlySpend": 4.26,
      "budgetLimit": 200,
      "percentage": 2.13
    }
  },
  "uptime": 3600000
}
```

**Status Codes:**
- `200` - System healthy or degraded
- `503` - System unhealthy

---

### Tasks

#### List All Tasks

```
GET /api/tasks
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Review PR #11",
    "status": "open",
    "priority": "high",
    "category": "ai-ready"
  }
]
```

#### Create Task

```
POST /api/tasks
Content-Type: application/json

{
  "title": "New task",
  "status": "open",
  "priority": "medium",
  "category": "general"
}
```

#### Update Task Status

```
PATCH /api/tasks
Content-Type: application/json

{
  "id": 1,
  "status": "completed"
}
```

#### Delete Task

```
DELETE /api/tasks?id=1
```

---

### Expenses

#### List Expenses

```
GET /api/expenses
```

**Query Parameters:**
- `month` (optional) - Filter by month (YYYY-MM)
- `provider` (optional) - Filter by provider (moonshot, deepseek, gemini)

**Response:**
```json
[
  {
    "id": 1,
    "provider": "moonshot",
    "model": "kimi-k2.5",
    "tokens_in": 20000,
    "tokens_out": 6300,
    "cost": 0.04,
    "timestamp": "2026-03-01T12:00:00.000Z"
  }
]
```

#### Record Expense

```
POST /api/expenses
Content-Type: application/json

{
  "provider": "moonshot",
  "model": "kimi-k2.5",
  "tokens_in": 20000,
  "tokens_out": 6300,
  "cost": 0.04
}
```

#### Get Monthly Summary

```
GET /api/expenses?month=2026-03
```

**Response:**
```json
{
  "month": "2026-03",
  "total": 4.26,
  "by_provider": {
    "moonshot": 3.71,
    "deepseek": 0.50,
    "gemini": 0.00
  },
  "budget_remaining": 195.74,
  "percentage_used": 2.13
}
```

---

## Data Models

### Task

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| title | string | Task description |
| status | enum | `open`, `in_progress`, `completed`, `blocked` |
| priority | enum | `low`, `medium`, `high`, `critical` |
| category | enum | `ai-ready`, `needs-input`, `archive` |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

### Expense

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| provider | string | API provider (moonshot, deepseek, gemini) |
| model | string | Model name used |
| tokens_in | integer | Input tokens consumed |
| tokens_out | integer | Output tokens consumed |
| cost | decimal | Calculated cost in USD |
| timestamp | datetime | When the expense was recorded |

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is enforced. Future versions may implement limits based on budget thresholds.

---

## OpenAPI Specification

Full OpenAPI 3.0 spec available at `/api/openapi.json`
