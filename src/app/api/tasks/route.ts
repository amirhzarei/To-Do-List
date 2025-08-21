import { createTaskAction } from '@/app/actions/task-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await createTaskAction(body);
  return NextResponse.json(res);
}
