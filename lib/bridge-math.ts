export type QuoteMath = {
  fee: bigint;
  estimatedReceive: bigint;
  minReceive: bigint;
};

const MOCK_SLIPPAGE_BPS = 30n;
const MOCK_FEE_BPS = 20n;

export function calculateQuote(amount: bigint): QuoteMath {
  const fee = (amount * MOCK_FEE_BPS) / 10_000n;
  const estimatedReceive = amount - fee;
  const minReceive = estimatedReceive - (estimatedReceive * MOCK_SLIPPAGE_BPS) / 10_000n;
  return { fee, estimatedReceive, minReceive };
}

export function buildTransferArgs(amount: bigint, minReceive: bigint, recipient: `0x${string}`) {
  return [amount, minReceive, 56n, recipient] as const;
}
