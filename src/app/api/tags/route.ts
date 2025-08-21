import { NextRequest, NextResponse } from 'next/server';
import { fetchTagsAction, createTagAction } from '@/app/actions/tag.actions';

export async function GET() {
  const res = await fetchTagsAction();
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await createTagAction(body);
  return NextResponse.json(res);
}
