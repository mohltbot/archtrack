import { getMemories, createMemory, deleteMemory, Memory as DbMemory } from './db';

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

// Initialize memory table - no-op for JSON store (already initialized)
export function initMemoryTable(): void {
  // JSON store is already initialized in db.ts
}

// Add a new memory
export function addMemory(memory: Omit<Memory, 'id' | 'created_at' | 'access_count'>): Memory {
  const newMemory = createMemory({
    content: memory.content,
    category: memory.category || 'fact',
    importance: (memory.importance || 3) as 1 | 2 | 3,
    source: memory.source,
  });

  return {
    ...newMemory,
    category: (newMemory.category as Memory['category']) || 'fact',
    importance: (newMemory.importance as Memory['importance']) || 3,
    access_count: 0,
  };
}

// Retrieve memories based on query (simple keyword matching)
export function queryMemories(query: MemoryQuery): Memory[] {
  const allMemories = getMemories();
  let results = allMemories.map(m => ({
    ...m,
    category: (m.category as Memory['category']) || 'fact',
    importance: (m.importance as Memory['importance']) || 3,
    access_count: 0,
    tags: m.source ? [m.source] : [],
  } as Memory));

  // Filter by category
  if (query.category) {
    results = results.filter(m => m.category === query.category);
  }

  // Filter by minimum importance
  if (query.minImportance) {
    const minImp = query.minImportance;
    results = results.filter(m => m.importance >= minImp);
  }

  // Filter by tags
  if (query.tags && query.tags.length > 0) {
    results = results.filter(m => 
      query.tags!.some(tag => m.tags?.includes(tag) || m.source?.includes(tag))
    );
  }

  // Simple keyword matching in content
  if (query.query) {
    const keywords = query.query.toLowerCase().split(' ');
    results = results.filter(m => 
      keywords.some(keyword => m.content.toLowerCase().includes(keyword))
    );
  }

  // Sort by importance and created_at
  results.sort((a, b) => {
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Limit results
  if (query.limit) {
    results = results.slice(0, query.limit);
  }

  return results;
}

// Get memories by category
export function getMemoriesByCategory(category: Memory['category'], limit: number = 20): Memory[] {
  return queryMemories({ query: '', category, limit });
}

// Get high-importance memories (for critical context)
export function getCriticalMemories(limit: number = 10): Memory[] {
  return queryMemories({ query: '', minImportance: 4, limit });
}

// Update memory importance
export function updateMemoryImportance(id: number, importance: Memory['importance']): void {
  // For JSON store, we'd need to add an updateMemory function to db.ts
  // For now, this is a no-op
  console.log(`Would update memory ${id} importance to ${importance}`);
}

// Delete old/unused memories
export function cleanupMemories(olderThanDays: number = 90, maxImportance: number = 2): number {
  const allMemories = getMemories();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const toDelete = allMemories.filter(m => {
    const memDate = new Date(m.created_at);
    return memDate < cutoffDate && m.importance <= maxImportance;
  });

  toDelete.forEach(m => deleteMemory(m.id));
  return toDelete.length;
}

// Get memory statistics
export function getMemoryStats(): {
  total: number;
  byCategory: Record<string, number>;
  avgImportance: number;
  criticalCount: number;
} {
  const allMemories = getMemories();
  const total = allMemories.length;

  const byCategory: Record<string, number> = {};
  const categories = ['fact', 'preference', 'task', 'insight', 'context'];
  categories.forEach(cat => {
    byCategory[cat] = allMemories.filter(m => m.category === cat).length;
  });

  const avgImportance = total > 0 
    ? allMemories.reduce((sum, m) => sum + (m.importance || 3), 0) / total 
    : 0;

  const criticalCount = allMemories.filter(m => (m.importance || 3) >= 4).length;

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
