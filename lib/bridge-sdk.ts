import { Address, Hash, PublicClient } from 'viem';
import { BridgeQuoteResponse, BridgeStatusResponse } from './bridge-types';
import { buildTransferArgs, calculateQuote } from './bridge-math';

export type BridgeQuote = {
  fee: bigint;
  estimatedReceive: bigint;
  minReceive: bigint;
};

export type BridgeTransferParams = {
  amount: bigint;
  recipient: Address;
};

export async function getBridgeQuote(amount: bigint): Promise<BridgeQuote> {
  await sleep(300);
  return calculateQuote(amount);
}

export async function fetchBridgeQuote(amount: bigint): Promise<BridgeQuote> {
  const res = await fetch(`/api/bridge/quote?amount=${amount.toString()}`);
  if (!res.ok) {
    throw new Error(`Quote API error: ${res.status}`);
  }

  const data = (await res.json()) as BridgeQuoteResponse;
  return {
    fee: BigInt(data.fee),
    estimatedReceive: BigInt(data.estimatedReceive),
    minReceive: BigInt(data.minReceive)
  };
}

export async function notifySourceTransfer(sourceTxHash: Hash): Promise<void> {
  const res = await fetch('/api/bridge/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceTxHash })
  });

  if (!res.ok) {
    throw new Error(`Transfer API error: ${res.status}`);
  }
}

export async function queryTargetTxHash(sourceTxHash: Hash): Promise<{ hash: Hash; blockNumber?: bigint } | null> {
  const res = await fetch(`/api/bridge/status?sourceTxHash=${sourceTxHash}`);
  if (!res.ok) {
    throw new Error(`Bridge status API error: ${res.status}`);
  }

  const data = (await res.json()) as BridgeStatusResponse;
  if (!data.completed || !data.targetTxHash) return null;

  return {
    hash: data.targetTxHash,
    blockNumber: data.targetBlockNumber ? BigInt(data.targetBlockNumber) : undefined
  };
}

export async function waitForTargetChainCompletion(params: {
  sourceTxHash: Hash;
  bscPublicClient: PublicClient;
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<{ targetTxHash: Hash; blockNumber: bigint }> {
  const { sourceTxHash, bscPublicClient, timeoutMs = 180_000, intervalMs = 5_000 } = params;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const target = await queryTargetTxHash(sourceTxHash);
    if (target) {
      if (target.blockNumber) {
        return { targetTxHash: target.hash, blockNumber: target.blockNumber };
      }

      const receipt = await bscPublicClient.getTransactionReceipt({ hash: target.hash });
      if (receipt.status === 'success') {
        return { targetTxHash: target.hash, blockNumber: receipt.blockNumber };
      }
      throw new Error('Target chain tx failed.');
    }

    await sleep(intervalMs);
  }

  throw new Error('Timed out waiting for target chain completion.');
}

export const ETHEREUM_USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address;
export const SOURCE_BRIDGE_CONTRACT = '0x1111111111111111111111111111111111111111' as Address;

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildBridgeTransferArgs(params: BridgeTransferParams & { minReceive: bigint }) {
  const { amount, recipient, minReceive } = params;
  return buildTransferArgs(amount, minReceive, recipient);
}
