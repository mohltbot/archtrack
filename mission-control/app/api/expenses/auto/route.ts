import { NextResponse } from 'next/server';
import { addExpense, getMonthlySpend } from '@/lib/store';

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100;
const requestLog: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove old requests outside window
  while (requestLog.length > 0 && requestLog[0] < now - RATE_LIMIT_WINDOW) {
    requestLog.shift();
  }
  if (requestLog.length >= MAX_REQUESTS) {
    return false;
  }
  requestLog.push(now);
  return true;
}

export async function POST(request: Request) {
  // Rate limiting
  if (!checkRateLimit()) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.description || !body.provider) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, description, provider' },
        { status: 400 }
      );
    }

    // Validate amount is positive and reasonable (< $10 per call)
    if (body.amount <= 0 || body.amount > 10) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between $0 and $10' },
        { status: 400 }
      );
    }

    // Add the expense
    const expense = addExpense({
      description: body.description,
      amount: body.amount,
      category: body.category || 'api_call',
      provider: body.provider,
      model: body.model || 'unknown',
      tokens_in: body.tokens_in,
      tokens_out: body.tokens_out,
    });

    // Get updated monthly spend
    const monthlySpend = getMonthlySpend();

    return NextResponse.json({
      success: true,
      expense,
      monthlySpend,
      percentUsed: Math.round((monthlySpend / 200) * 100),
    });
  } catch (error) {
    console.error('Error logging expense:', error);
    return NextResponse.json(
      { error: 'Failed to log expense' },
      { status: 500 }
    );
  }
}

// Get current budget status
export async function GET() {
  const monthlySpend = getMonthlySpend();
  const percentUsed = Math.round((monthlySpend / 200) * 100);
  
  return NextResponse.json({
    monthlySpend,
    budget: 200,
    percentUsed,
    remaining: 200 - monthlySpend,
  });
}
