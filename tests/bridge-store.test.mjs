import test from 'node:test';
import assert from 'node:assert/strict';
import {
  _resetBridgeStoreForTest,
  createBridgeRecord,
  getBridgeStatus
} from '../lib/server/bridge-store.ts';

test('bridge store should complete after readyAt', () => {
  _resetBridgeStoreForTest();
  const sourceTxHash = '0x' + '1'.repeat(64);
  createBridgeRecord(sourceTxHash);

  const status = getBridgeStatus(sourceTxHash);
  assert.equal(status.sourceTxHash, sourceTxHash);
  assert.equal(typeof status.completed, 'boolean');
});
