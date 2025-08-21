import { NextRequest, NextResponse } from 'next/server';
import { detachTagAction } from '@/app/actions/tag.actions';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await detachTagAction(body);
  return NextResponse.json(res);
}
