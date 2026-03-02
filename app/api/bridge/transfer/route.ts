import { NextRequest, NextResponse } from 'next/server';
import { createBridgeRecord } from '@/lib/server/bridge-store';
import { BridgeTransferRequest, BridgeTransferResponse } from '@/lib/bridge-types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BridgeTransferRequest;
    if (!body.sourceTxHash || !body.sourceTxHash.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid sourceTxHash' }, { status: 400 });
    }

    const record = createBridgeRecord(body.sourceTxHash);
    const response: BridgeTransferResponse = {
      sourceTxHash: record.sourceTxHash,
      targetTxHash: record.targetTxHash,
      etaSeconds: 15
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
