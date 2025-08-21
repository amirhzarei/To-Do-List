import { createListAction, fetchListsAction } from '@/app/actions/list-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const res = await fetchListsAction();
  // Always return 200; consumer can inspect res.error
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await createListAction(body);
    // If DB / validation error, still return 200 with error field (avoid 500 masking)
    return NextResponse.json(res);
  } catch (e: any) {
    console.error('[POST /api/lists] Uncaught', e);
    return NextResponse.json(
      { error: 'UNEXPECTED', detail: e.message || String(e) },
      { status: 500 },
    );
  }
}
