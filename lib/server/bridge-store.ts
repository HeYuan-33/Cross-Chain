import { randomBytes } from 'crypto';
import type { BridgeStatusResponse } from '../bridge-types.ts';

type BridgeRecord = {
  sourceTxHash: `0x${string}`;
  targetTxHash: `0x${string}`;
  readyAt: number;
  targetBlockNumber: bigint;
};

const records = new Map<string, BridgeRecord>();

function randomHash(): `0x${string}` {
  return `0x${randomBytes(32).toString('hex')}`;
}

export function createBridgeRecord(sourceTxHash: `0x${string}`): BridgeRecord {
  const record: BridgeRecord = {
    sourceTxHash,
    targetTxHash: randomHash(),
    readyAt: Date.now() + 15_000,
    targetBlockNumber: BigInt(Math.floor(40_000_000 + Math.random() * 100_000))
  };

  records.set(sourceTxHash, record);
  return record;
}

export function getBridgeStatus(sourceTxHash: `0x${string}`): BridgeStatusResponse {
  const record = records.get(sourceTxHash);
  if (!record) {
    return { sourceTxHash, completed: false };
  }

  const completed = Date.now() >= record.readyAt;
  if (!completed) {
    return { sourceTxHash, completed: false };
  }

  return {
    sourceTxHash,
    completed: true,
    targetTxHash: record.targetTxHash,
    targetBlockNumber: record.targetBlockNumber.toString()
  };
}

export function _resetBridgeStoreForTest() {
  records.clear();
}
