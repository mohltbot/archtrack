import { NextResponse } from 'next/server';
import { getTasks, createTask, updateTaskStatus, deleteTask } from '@/lib/store';

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
  const { id, ...updates } = await request.json();
  
  // Handle status update
  if (updates.status) {
    updateTaskStatus(id, updates.status);
  }
  
  // Get updated task
  const tasks = getTasks();
  const updated = tasks.find(t => t.id === id);
  
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  
  deleteTask(parseInt(id));
  return NextResponse.json({ success: true });
}
