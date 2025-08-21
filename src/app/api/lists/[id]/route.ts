import { deleteListAction } from '@/app/actions/list-actions';
import { NextResponse } from 'next/server';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const res = await deleteListAction(params.id);
  return NextResponse.json(res);
}
