import { Address, Hash, PublicClient } from 'viem';

export type BridgeQuote = {
  fee: bigint;
  estimatedReceive: bigint;
  minReceive: bigint;
};

export type BridgeTransferParams = {
  amount: bigint;
  recipient: Address;
};

const MOCK_SLIPPAGE_BPS = 30n; // 0.3%
const MOCK_FEE_BPS = 20n; // 0.2%

/**
 * 模拟桥 SDK：返回手续费和预计到账数量。
 * 实际接入时可替换为第三方桥接协议 SDK/API。
 */
export async function getBridgeQuote(amount: bigint): Promise<BridgeQuote> {
  await sleep(600);
  const fee = (amount * MOCK_FEE_BPS) / 10_000n;
  const estimatedReceive = amount - fee;
  const minReceive = estimatedReceive - (estimatedReceive * MOCK_SLIPPAGE_BPS) / 10_000n;
  return { fee, estimatedReceive, minReceive };
}

/**
 * 模拟桥 SDK：查询目标链是否完成。
 * 若配置了 NEXT_PUBLIC_BRIDGE_STATUS_API，会调用该 API 轮询 sourceTxHash 对应的 targetTxHash。
 */
export async function queryTargetTxHash(sourceTxHash: Hash): Promise<Hash | null> {
  const statusApi = process.env.NEXT_PUBLIC_BRIDGE_STATUS_API;
  if (!statusApi) return null;

  const res = await fetch(`${statusApi}?sourceTxHash=${sourceTxHash}`);
  if (!res.ok) {
    throw new Error(`Bridge status API error: ${res.status}`);
  }

  const data = (await res.json()) as { targetTxHash?: Hash };
  return data.targetTxHash ?? null;
}

/**
 * 在目标链轮询 tx receipt，确认跨链是否落地。
 */
export async function waitForTargetChainCompletion(params: {
  sourceTxHash: Hash;
  bscPublicClient: PublicClient;
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<{ targetTxHash: Hash; blockNumber: bigint }> {
  const { sourceTxHash, bscPublicClient, timeoutMs = 180_000, intervalMs = 5_000 } = params;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const targetTxHash = await queryTargetTxHash(sourceTxHash);
    if (targetTxHash) {
      const receipt = await bscPublicClient.getTransactionReceipt({ hash: targetTxHash });
      if (receipt.status === 'success') {
        return { targetTxHash, blockNumber: receipt.blockNumber };
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
  // 示例签名: bridgeUSDT(uint256 amount, uint256 minReceive, uint256 dstChainId, address recipient)
  return [amount, minReceive, 56n, recipient] as const;
}
