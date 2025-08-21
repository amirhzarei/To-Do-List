import { NextRequest, NextResponse } from 'next/server';
import { attachTagAction } from '@/app/actions/tag.actions';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await attachTagAction(body);
  return NextResponse.json(res);
}
