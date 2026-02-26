import { getDb } from './db';

export interface Memory {
  id: number;
  content: string;
  category: 'fact' | 'preference' | 'task' | 'insight' | 'context';
  importance: 1 | 2 | 3 | 4 | 5;
  source?: string;
  context?: string;
  tags?: string[];
  created_at: string;
  last_accessed?: string;
  access_count: number;
}

export interface MemoryQuery {
  query: string;
  category?: Memory['category'];
  tags?: string[];
  minImportance?: number;
  limit?: number;
}

// Initialize memory table
export function initMemoryTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'fact',
      importance INTEGER DEFAULT 3,
      source TEXT,
      context TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_accessed DATETIME,
      access_count INTEGER DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
    CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance);
    CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
  `);
}

// Add a new memory
export function addMemory(memory: Omit<Memory, 'id' | 'created_at' | 'access_count'>): Memory {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO memories (content, category, importance, source, context, tags) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    memory.content,
    memory.category,
    memory.importance,
    memory.source || null,
    memory.context || null,
    memory.tags ? JSON.stringify(memory.tags) : null
  );
  
  return db.prepare('SELECT * FROM memories WHERE id = ?').get(result.lastInsertRowid) as Memory;
}

// Retrieve memories based on query (simple keyword matching for now)
export function queryMemories(query: MemoryQuery): Memory[] {
  const db = getDb();
  const limit = query.limit || 10;
  
  let sql = 'SELECT * FROM memories WHERE 1=1';
  const params: any[] = [];
  
  if (query.category) {
    sql += ' AND category = ?';
    params.push(query.category);
  }
  
  if (query.minImportance) {
    sql += ' AND importance >= ?';
    params.push(query.minImportance);
  }
  
  if (query.tags && query.tags.length > 0) {
    sql += ' AND (' + query.tags.map(() => 'tags LIKE ?').join(' OR ') + ')';
    query.tags.forEach(tag => params.push(`%${tag}%`));
  }
  
  // Simple keyword matching in content
  if (query.query) {
    const keywords = query.query.toLowerCase().split(' ');
    sql += ' AND (' + keywords.map(() => 'LOWER(content) LIKE ?').join(' OR ') + ')';
    keywords.forEach(keyword => params.push(`%${keyword}%`));
  }
  
  sql += ' ORDER BY importance DESC, access_count DESC, created_at DESC LIMIT ?';
  params.push(limit);
  
  const memories = db.prepare(sql).all(...params) as Memory[];
  
  // Update access stats
  memories.forEach(mem => {
    db.prepare('UPDATE memories SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE id = ?')
      .run(mem.id);
  });
  
  return memories;
}

// Get memories by category
export function getMemoriesByCategory(category: Memory['category'], limit: number = 20): Memory[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM memories WHERE category = ? ORDER BY importance DESC, created_at DESC LIMIT ?'
  ).all(category, limit) as Memory[];
}

// Get high-importance memories (for critical context)
export function getCriticalMemories(limit: number = 10): Memory[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM memories WHERE importance >= 4 ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as Memory[];
}

// Update memory importance
export function updateMemoryImportance(id: number, importance: Memory['importance']): void {
  const db = getDb();
  db.prepare('UPDATE memories SET importance = ? WHERE id = ?').run(importance, id);
}

// Delete old/unused memories
export function cleanupMemories(olderThanDays: number = 90, maxImportance: number = 2): number {
  const db = getDb();
  const result = db.prepare(
    'DELETE FROM memories WHERE created_at < datetime("now", ?) AND importance <= ? AND access_count < 3'
  ).run(`-${olderThanDays} days`, maxImportance);
  
  return result.changes;
}

// Get memory statistics
export function getMemoryStats(): {
  total: number;
  byCategory: Record<string, number>;
  avgImportance: number;
  criticalCount: number;
} {
  const db = getDb();
  
  const total = (db.prepare('SELECT COUNT(*) as count FROM memories').get() as { count: number }).count;
  
  const byCategory: Record<string, number> = {};
  const categories = ['fact', 'preference', 'task', 'insight', 'context'];
  categories.forEach(cat => {
    byCategory[cat] = (db.prepare('SELECT COUNT(*) as count FROM memories WHERE category = ?').get(cat) as { count: number }).count;
  });
  
  const avgImportance = (db.prepare('SELECT AVG(importance) as avg FROM memories').get() as { avg: number }).avg || 0;
  
  const criticalCount = (db.prepare('SELECT COUNT(*) as count FROM memories WHERE importance >= 4').get() as { count: number }).count;
  
  return { total, byCategory, avgImportance, criticalCount };
}

// Observational memory: automatically extract insights from conversations
export function extractInsightsFromText(text: string, source: string): Partial<Memory>[] {
  const insights: Partial<Memory>[] = [];
  
  // Pattern 1: Preferences ("I prefer...", "I like...", "I want...")
  const preferencePatterns = [
    /I (?:prefer|like|want|need|hate|dislike) ([^.,]+)/gi,
    /my (?:favorite|preferred) ([^.,]+) (?:is|are) ([^.,]+)/gi,
  ];
  
  preferencePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      insights.push({
        content: match[0],
        category: 'preference',
        importance: 4,
        source,
        tags: ['auto-extracted', 'preference'],
      });
    }
  });
  
  // Pattern 2: Facts ("I work at...", "I live in...", "My name is...")
  const factPatterns = [
    /I (?:work at|work for|am employed by) ([^.,]+)/gi,
    /I (?:live in|am from|am based in) ([^.,]+)/gi,
    /my (?:name is|name's|email is) ([^.,]+)/gi,
  ];
  
  factPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      insights.push({
        content: match[0],
        category: 'fact',
        importance: 3,
        source,
        tags: ['auto-extracted', 'fact'],
      });
    }
  });
  
  // Pattern 3: Tasks/Goals ("I need to...", "I should...", "I want to...")
  const taskPatterns = [
    /I (?:need to|should|must|have to) ([^.,]+)/gi,
    /I want to ([^.,]+)/gi,
  ];
  
  taskPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      insights.push({
        content: match[0],
        category: 'task',
        importance: 3,
        source,
        tags: ['auto-extracted', 'task'],
      });
    }
  });
  
  return insights.slice(0, 10); // Limit to top 10 insights
}
