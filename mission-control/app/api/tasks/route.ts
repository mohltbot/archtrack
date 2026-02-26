import { NextResponse } from 'next/server';
import { getTasks, createTask, updateTaskStatus } from '@/lib/store';

export async function GET() {
  const tasks = getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const task = createTask(body);
  return NextResponse.json(task);
}

export async function PATCH(request: Request) {
  const { id, status } = await request.json();
  updateTaskStatus(id, status);
  return NextResponse.json({ success: true });
}
