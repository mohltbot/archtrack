import { Router } from 'express';
import { getDatabase } from '../database.js';
import { detectRepetitivePatterns, getTopAgentOpportunities } from '../ai-analytics.js';

const router = Router();

interface ChatRequest {
  question: string;
}

interface ChatResponse {
  answer: string;
  sql?: string;
  data?: any[];
  suggestions?: string[];
}

/**
 * Natural language query endpoint for AI chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { question }: ChatRequest = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await processNaturalLanguageQuery(question);
    res.json(response);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      answer: 'Sorry, I encountered an error processing your question. Please try again.' 
    });
  }
});

/**
 * Get repetitive patterns and automation opportunities
 */
router.get('/patterns', async (req, res) => {
  try {
    const { employeeId, days } = req.query;
    const patterns = await detectRepetitivePatterns(
      employeeId as string | undefined,
      days ? parseInt(days as string) : 7
    );
    res.json(patterns);
  } catch (error) {
    console.error('Pattern detection error:', error);
    res.status(500).json({ error: 'Failed to detect patterns' });
  }
});

/**
 * Get top agent opportunities
 */
router.get('/opportunities', async (req, res) => {
  try {
    const { limit } = req.query;
    const opportunities = await getTopAgentOpportunities(
      limit ? parseInt(limit as string) : 5
    );
    res.json(opportunities);
  } catch (error) {
    console.error('Opportunities error:', error);
    res.status(500).json({ error: 'Failed to get opportunities' });
  }
});

/**
 * Process natural language queries and convert to data analysis
 */
async function processNaturalLanguageQuery(question: string): Promise<ChatResponse> {
  const lowerQuestion = question.toLowerCase();
  const db = getDatabase();

  // Pattern 1: Time spent queries
  if (lowerQuestion.includes('time') && (lowerQuestion.includes('spend') || lowerQuestion.includes('spent'))) {
    return handleTimeSpentQuery(lowerQuestion, db);
  }

  // Pattern 2: Productivity queries
  if (lowerQuestion.includes('productive') || lowerQuestion.includes('productivity')) {
    return handleProductivityQuery(lowerQuestion, db);
  }

  // Pattern 3: Repetitive tasks / automation
  if (lowerQuestion.includes('repetitive') || lowerQuestion.includes('automation') || lowerQuestion.includes('automate')) {
    return handleRepetitiveTasksQuery(db);
  }

  // Pattern 4: Employee-specific queries
  if (lowerQuestion.includes('employee') || lowerQuestion.includes('who')) {
    return handleEmployeeQuery(lowerQuestion, db);
  }

  // Pattern 5: App/website queries
  if (lowerQuestion.includes('app') || lowerQuestion.includes('website') || lowerQuestion.includes('youtube') || lowerQuestion.includes('email')) {
    return handleAppQuery(lowerQuestion, db);
  }

  // Default: General summary
  return handleGeneralQuery(db);
}

async function handleTimeSpentQuery(question: string, db: any): Promise<ChatResponse> {
  // Extract employee name if mentioned
  const employees = await db.all('SELECT id, name FROM employees');
  const mentionedEmployee = employees.find((e: any) => 
    question.toLowerCase().includes(e.name.toLowerCase())
  );

  // Extract timeframe
  let days = 7;
  if (question.includes('today')) days = 1;
  if (question.includes('yesterday')) days = 1;
  if (question.includes('week')) days = 7;
  if (question.includes('month')) days = 30;

  let sql: string;
  let params: any[];

  if (mentionedEmployee) {
    sql = `
      SELECT 
        app_name,
        SUM(duration_seconds) / 3600 as hours,
        COUNT(*) as sessions
      FROM activities
      WHERE employee_id = ?
      AND timestamp > datetime('now', '-${days} days')
      GROUP BY app_name
      ORDER BY hours DESC
      LIMIT 10
    `;
    params = [mentionedEmployee.id];
  } else {
    sql = `
      SELECT 
        e.name as employee_name,
        SUM(a.duration_seconds) / 3600 as hours
      FROM activities a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.timestamp > datetime('now', '-${days} days')
      GROUP BY a.employee_id
      ORDER BY hours DESC
    `;
    params = [];
  }

  const data = await db.all(sql, params);

  let answer: string;
  if (mentionedEmployee) {
    const totalHours = data.reduce((sum: number, row: any) => sum + row.hours, 0);
    const topApps = data.slice(0, 3).map((row: any) => `${row.app_name} (${Math.round(row.hours * 10) / 10}h)`).join(', ');
    answer = `${mentionedEmployee.name} spent ${Math.round(totalHours * 10) / 10} hours on the computer in the last ${days} day(s). Top apps: ${topApps}.`;
  } else {
    answer = `Here's the time spent by each employee over the last ${days} day(s):\n\n` +
      data.map((row: any) => `• ${row.employee_name}: ${Math.round(row.hours * 10) / 10} hours`).join('\n');
  }

  return {
    answer,
    sql,
    data,
    suggestions: ['Show productivity scores', 'What apps were used most?', 'Any suspicious activity?']
  };
}

async function handleProductivityQuery(question: string, db: any): Promise<ChatResponse> {
  const days = question.includes('today') ? 1 : question.includes('yesterday') ? 1 : 7;

  const sql = `
    SELECT 
      e.name as employee_name,
      AVG(a.productivity_score) as avg_score,
      SUM(CASE WHEN a.productivity_level = 'productive' THEN a.duration_seconds ELSE 0 END) / 3600 as productive_hours,
      SUM(a.duration_seconds) / 3600 as total_hours
    FROM activities a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.timestamp > datetime('now', '-${days} days')
    GROUP BY a.employee_id
    ORDER BY avg_score DESC
  `;

  const data = await db.all(sql);

  const answer = `Productivity rankings for the last ${days} day(s):\n\n` +
    data.map((row: any, idx: number) => {
      const percentage = row.total_hours > 0 ? Math.round((row.productive_hours / row.total_hours) * 100) : 0;
      return `${idx + 1}. ${row.employee_name}: ${Math.round(row.avg_score)}% score, ${percentage}% productive time`;
    }).join('\n');

  return {
    answer,
    sql,
    data,
    suggestions: ['Who was least productive?', 'Show time wasters', 'Repetitive task opportunities']
  };
}

async function handleRepetitiveTasksQuery(db: any): Promise<ChatResponse> {
  const patterns = await detectRepetitivePatterns(undefined, 14);
  
  if (patterns.length === 0) {
    return {
      answer: "I haven't detected any clear repetitive patterns yet. I need at least a few days of data to identify automation opportunities. Check back after your team has been using the tracker for a while.",
      suggestions: ['Show productivity summary', 'What apps are used most?', 'Employee time breakdown']
    };
  }

  const topPatterns = patterns.slice(0, 5);
  
  let answer = `I found ${patterns.length} repetitive patterns that could be automated:\n\n`;
  
  topPatterns.forEach((pattern, idx) => {
    answer += `${idx + 1}. **${pattern.description}**\n`;
    answer += `   • Frequency: ${pattern.frequency}x per day\n`;
    answer += `   • Time cost: ${pattern.totalTimeHours} hours/week\n`;
    answer += `   • Automation potential: ${pattern.automationPotential.toUpperCase()}\n`;
    answer += `   • Suggestion: ${pattern.suggestedSolution}\n\n`;
  });

  const totalHours = topPatterns.reduce((sum, p) => sum + p.totalTimeHours, 0);
  answer += `\n💡 **Total potential time savings: ${Math.round(totalHours * 4)} hours/month** if these are automated.`;

  return {
    answer,
    data: topPatterns,
    suggestions: ['Show all patterns', 'Which tasks are easiest to automate?', 'Employee-specific opportunities']
  };
}

async function handleEmployeeQuery(question: string, db: any): Promise<ChatResponse> {
  const sql = `
    SELECT 
      e.name,
      e.department,
      COUNT(DISTINCT DATE(a.timestamp)) as days_active,
      SUM(a.duration_seconds) / 3600 as total_hours,
      AVG(a.productivity_score) as avg_productivity,
      SUM(CASE WHEN a.is_suspicious = 1 THEN 1 ELSE 0 END) as suspicious_count
    FROM employees e
    LEFT JOIN activities a ON e.id = a.employee_id
    WHERE a.timestamp > datetime('now', '-7 days')
    GROUP BY e.id
    ORDER BY total_hours DESC
  `;

  const data = await db.all(sql);

  const answer = `Employee activity summary (last 7 days):\n\n` +
    data.map((row: any) => {
      const status = row.suspicious_count > 5 ? '⚠️' : '✅';
      return `${status} **${row.name}** (${row.department})\n   ${Math.round(row.total_hours * 10) / 10}h tracked, ${Math.round(row.avg_productivity)}% productivity, ${row.suspicious_count} flags`;
    }).join('\n\n');

  return {
    answer,
    sql,
    data,
    suggestions: ['Who worked the most hours?', 'Show suspicious activity', 'Department comparison']
  };
}

async function handleAppQuery(question: string, db: any): Promise<ChatResponse> {
  const days = 7;

  // Check for specific apps
  const appKeywords: Record<string, string[]> = {
    'youtube': ['YouTube', 'youtube'],
    'email': ['Mail', 'Outlook', 'Gmail', 'Thunderbird'],
    'slack': ['Slack'],
    'excel': ['Excel', 'Sheets', 'Numbers']
  };

  let appFilter = '';
  for (const [keyword, apps] of Object.entries(appKeywords)) {
    if (question.includes(keyword)) {
      appFilter = apps.map(a => `LOWER(app_name) LIKE '%${a.toLowerCase()}%'`).join(' OR ');
      break;
    }
  }

  let sql: string;
  if (appFilter) {
    sql = `
      SELECT 
        e.name as employee_name,
        SUM(a.duration_seconds) / 3600 as hours,
        COUNT(*) as sessions
      FROM activities a
      JOIN employees e ON a.employee_id = e.id
      WHERE (${appFilter})
      AND a.timestamp > datetime('now', '-${days} days')
      GROUP BY a.employee_id
      ORDER BY hours DESC
    `;
  } else {
    sql = `
      SELECT 
        app_name,
        SUM(duration_seconds) / 3600 as hours,
        COUNT(DISTINCT employee_id) as users
      FROM activities
      WHERE timestamp > datetime('now', '-${days} days')
      GROUP BY app_name
      ORDER BY hours DESC
      LIMIT 10
    `;
  }

  const data = await db.all(sql);

  let answer: string;
  if (appFilter) {
    answer = `Time spent on ${question.match(/youtube|email|slack|excel/)?.[0] || 'specified apps'} (last ${days} days):\n\n` +
      data.map((row: any) => `• ${row.employee_name}: ${Math.round(row.hours * 10) / 10} hours (${row.sessions} sessions)`).join('\n');
  } else {
    answer = `Top 10 apps by usage (last ${days} days):\n\n` +
      data.map((row: any, idx: number) => `${idx + 1}. ${row.app_name}: ${Math.round(row.hours * 10) / 10} hours (${row.users} users)`).join('\n');
  }

  return {
    answer,
    sql,
    data,
    suggestions: ['Show distracting apps', 'Most productive apps', 'App usage trends']
  };
}

async function handleGeneralQuery(db: any): Promise<ChatResponse> {
  const sql = `
    SELECT 
      COUNT(DISTINCT employee_id) as active_employees,
      SUM(duration_seconds) / 3600 as total_hours,
      AVG(productivity_score) as avg_productivity,
      SUM(CASE WHEN is_suspicious = 1 THEN 1 ELSE 0 END) as suspicious_activities
    FROM activities
    WHERE timestamp > datetime('now', '-7 days')
  `;

  const data = await db.all(sql);
  const row = data[0];

  const answer = `📊 **Weekly Summary**\n\n` +
    `• **${row.active_employees}** employees actively tracked\n` +
    `• **${Math.round(row.total_hours * 10) / 10}** total hours logged\n` +
    `• **${Math.round(row.avg_productivity)}%** average productivity score\n` +
    `• **${row.suspicious_activities}** suspicious activities flagged\n\n` +
    `Try asking me specific questions like "Who spent the most time on YouTube?" or "What are the automation opportunities?"`;

  return {
    answer,
    sql,
    data,
    suggestions: ['Show repetitive tasks', 'Who is most productive?', 'Time breakdown by app']
  };
}

export default router;