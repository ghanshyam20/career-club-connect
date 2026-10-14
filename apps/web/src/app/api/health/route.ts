import { NextResponse } from 'next/server';
export async function GET() {
  const backend = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:8000';
  try {
    const response = await fetch(`${backend}/api/v1/health/live`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (!response.ok) return NextResponse.json({ status: 'error', message: 'Backend health failed' }, { status: 502 });
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ status: 'error', message: 'Backend unavailable' }, { status: 502 });
  }
}
