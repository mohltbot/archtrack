import { NextResponse } from 'next/server';
import { getExpenses, addExpense, getMonthlySpend } from '@/lib/store';

export async function GET() {
  const expenses = getExpenses();
  const monthlySpend = getMonthlySpend();
  return NextResponse.json({ expenses, monthlySpend });
}

export async function POST(request: Request) {
  const body = await request.json();
  const expense = addExpense(body);
  return NextResponse.json(expense);
}
