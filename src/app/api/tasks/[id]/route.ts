import { deleteTaskAction, updateTaskAction } from '@/app/actions/task-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const res = await updateTaskAction({ id: params.id, ...body });
  return NextResponse.json(res);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await deleteTaskAction(params.id);
  return NextResponse.json(res);
}
