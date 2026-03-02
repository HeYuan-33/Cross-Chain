import { NextRequest, NextResponse } from 'next/server';
import { getBridgeStatus } from '@/lib/server/bridge-store';

export async function GET(request: NextRequest) {
  try {
    const sourceTxHash = request.nextUrl.searchParams.get('sourceTxHash') as `0x${string}` | null;
    if (!sourceTxHash || !sourceTxHash.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid sourceTxHash' }, { status: 400 });
    }

    return NextResponse.json(getBridgeStatus(sourceTxHash));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
