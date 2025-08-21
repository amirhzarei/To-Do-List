import { NextResponse } from 'next/server';
import { deleteTagAction } from '@/app/actions/tag.actions';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const res = await deleteTagAction(params.id);
  return NextResponse.json(res);
}
