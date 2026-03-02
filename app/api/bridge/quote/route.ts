import { NextRequest, NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/bridge-math';
import { BridgeQuoteResponse } from '@/lib/bridge-types';

export async function GET(request: NextRequest) {
  try {
    const amount = request.nextUrl.searchParams.get('amount');
    if (!amount) {
      return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
    }

    const parsedAmount = BigInt(amount);
    if (parsedAmount <= 0n) {
      return NextResponse.json({ error: 'Amount must be > 0' }, { status: 400 });
    }

    const quote = calculateQuote(parsedAmount);
    const response: BridgeQuoteResponse = {
      fee: quote.fee.toString(),
      estimatedReceive: quote.estimatedReceive.toString(),
      minReceive: quote.minReceive.toString()
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
