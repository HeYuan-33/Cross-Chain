import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote, buildTransferArgs } from '../lib/bridge-math.ts';

test('calculateQuote should calculate fee/receive correctly', () => {
  const amount = 1_000_000n;
  const quote = calculateQuote(amount);

  assert.equal(quote.fee, 2_000n);
  assert.equal(quote.estimatedReceive, 998_000n);
  assert.equal(quote.minReceive, 995_006n);
});

test('buildTransferArgs should include BNB chain id', () => {
  const args = buildTransferArgs(100n, 90n, '0x000000000000000000000000000000000000dEaD');
  assert.equal(args[2], 56n);
});
