import { fetchTasksForListAction } from '@/app/actions/task-actions';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: { listId: string } }) {
  const res = await fetchTasksForListAction(params.listId);
  return NextResponse.json(res);
}
