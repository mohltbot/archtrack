import { NextResponse } from 'next/server';
import { 
  initMemoryTable, 
  addMemory, 
  queryMemories, 
  getMemoryStats,
  extractInsightsFromText,
  Memory 
} from '@/lib/supermemory';

// Lazy initialization - only init when first request comes in
let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    initMemoryTable();
    initialized = true;
  }
}

// GET /api/memories - Query memories
export async function GET(request: Request) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') as Memory['category'] | undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (searchParams.get('stats')) {
      const stats = getMemoryStats();
      return NextResponse.json(stats);
    }
    
    const memories = queryMemories({
      query,
      category,
      limit,
    });
    
    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Error querying memories:', error);
    return NextResponse.json(
      { error: 'Failed to query memories', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/memories - Add new memory or extract from text
export async function POST(request: Request) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    
    // Auto-extract mode
    if (body.extractFromText) {
      const insights = extractInsightsFromText(body.text, body.source || 'unknown');
      const added = insights.map(insight => addMemory(insight as any));
      return NextResponse.json({
        success: true,
        extracted: added.length,
        memories: added,
      });
    }
    
    // Direct add mode
    if (!body.content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }
    
    const memory = addMemory({
      content: body.content,
      category: body.category || 'fact',
      importance: body.importance || 3,
      source: body.source,
      context: body.context,
      tags: body.tags,
    });
    
    return NextResponse.json({
      success: true,
      memory,
    });
  } catch (error) {
    console.error('Error adding memory:', error);
    return NextResponse.json(
      { error: 'Failed to add memory', details: String(error) },
      { status: 500 }
    );
  }
}
