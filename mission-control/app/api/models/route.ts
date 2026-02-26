import { NextResponse } from 'next/server';
import { recommendModel, executeWithBestModel, getCostComparison, TaskType, ModelTier } from '@/lib/model-router';

// POST /api/models/recommend - Get model recommendations for a task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.task) {
      return NextResponse.json(
        { error: 'Missing required field: task' },
        { status: 400 }
      );
    }
    
    const recommendations = recommendModel(
      body.task as TaskType,
      body.tier as ModelTier || 'balanced',
      body.requiredCapabilities || [],
      body.maxCost
    );
    
    return NextResponse.json({
      task: body.task,
      tier: body.tier || 'balanced',
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    });
  } catch (error) {
    console.error('Error recommending models:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

// GET /api/models/compare?task=coding&tokens=1000 - Compare costs across models
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const task = searchParams.get('task') as TaskType;
    const tokens = parseInt(searchParams.get('tokens') || '1000');
    
    if (!task) {
      return NextResponse.json(
        { error: 'Missing required parameter: task' },
        { status: 400 }
      );
    }
    
    const comparison = getCostComparison(task, tokens);
    
    return NextResponse.json({
      task,
      estimatedTokens: tokens,
      comparisons: comparison,
      savings: {
        cheapest: comparison[0]?.cost || 0,
        mostExpensive: comparison[comparison.length - 1]?.cost || 0,
        potentialSavings: comparison.length > 1 
          ? ((1 - comparison[0].cost / comparison[comparison.length - 1].cost) * 100).toFixed(1)
          : '0',
      },
    });
  } catch (error) {
    console.error('Error comparing models:', error);
    return NextResponse.json(
      { error: 'Failed to compare models' },
      { status: 500 }
    );
  }
}
