import { reorderTasksAction } from '@/app/actions/reorder-tasks-action';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await reorderTasksAction(body);
  return NextResponse.json(res);
}
