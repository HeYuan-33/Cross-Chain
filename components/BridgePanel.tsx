'use client';

import { useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Address, erc20Abi, formatUnits, Hash, parseUnits } from 'viem';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWalletClient
} from 'wagmi';
import { bsc, mainnet } from 'wagmi/chains';
import {
  buildBridgeTransferArgs,
  ETHEREUM_USDT,
  fetchBridgeQuote,
  notifySourceTransfer,
  SOURCE_BRIDGE_CONTRACT,
  waitForTargetChainCompletion
} from '@/lib/bridge-sdk';

const BRIDGE_ABI = [
  {
    type: 'function',
    name: 'bridgeUSDT',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'minReceive', type: 'uint256' },
      { name: 'dstChainId', type: 'uint256' },
      { name: 'recipient', type: 'address' }
    ],
    outputs: []
  }
] as const;

export function BridgePanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const ethPublicClient = usePublicClient({ chainId: mainnet.id });
  const bscPublicClient = usePublicClient({ chainId: bsc.id });

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('等待操作...');
  const [loading, setLoading] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [approveTx, setApproveTx] = useState<Hash | null>(null);
  const [bridgeTx, setBridgeTx] = useState<Hash | null>(null);
  const [targetTx, setTargetTx] = useState<Hash | null>(null);

  const canBridge = useMemo(() => {
    return Boolean(isConnected && amount && !loading);
  }, [isConnected, amount, loading]);

  async function ensureEthereumNetwork() {
    if (chainId !== mainnet.id) {
      setStatus('正在切换到 Ethereum 主网...');
      await switchChainAsync({ chainId: mainnet.id });
    }
  }

  async function runBridgeFlow() {
    if (!walletClient || !address || !ethPublicClient || !bscPublicClient) {
      throw new Error('钱包或公共客户端未初始化，请先连接钱包。');
    }

    const parsedAmount = parseUnits(amount, 6);

    // 1) 获取桥 quote（手续费、预计到账、最小到账）
    setStatus('步骤 1/5：获取 bridge quote...');
    const quote = await fetchBridgeQuote(parsedAmount);
    setQuoteText(
      `fee: ${formatUnits(quote.fee, 6)} USDT, 预计到账: ${formatUnits(
        quote.estimatedReceive,
        6
      )} USDT, 最小到账: ${formatUnits(quote.minReceive, 6)} USDT`
    );

    // 2) ERC20 approve 授权桥合约
    setStatus('步骤 2/5：发送 USDT approve 交易...');
    const approveHash = await walletClient.writeContract({
      address: ETHEREUM_USDT,
      abi: erc20Abi,
      functionName: 'approve',
      args: [SOURCE_BRIDGE_CONTRACT, parsedAmount],
      chain: mainnet,
      account: address
    });
    setApproveTx(approveHash);

    setStatus('步骤 3/5：等待 approve 交易确认...');
    await ethPublicClient.waitForTransactionReceipt({ hash: approveHash });

    // 3) 调用桥合约执行跨链 transfer
    setStatus('步骤 4/5：调用桥合约 bridgeUSDT...');
    const bridgeHash = await walletClient.writeContract({
      address: SOURCE_BRIDGE_CONTRACT,
      abi: BRIDGE_ABI,
      functionName: 'bridgeUSDT',
      args: buildBridgeTransferArgs({
        amount: parsedAmount,
        recipient: address as Address,
        minReceive: quote.minReceive
      }),
      chain: mainnet,
      account: address
    });
    setBridgeTx(bridgeHash);

    // 4) 监听 source tx 状态
    setStatus('步骤 5/5：等待 source tx 确认并查询目标链状态...');
    await ethPublicClient.waitForTransactionReceipt({ hash: bridgeHash });

    // 通知后端：源链交易已确认，开始生成/追踪目标链交易
    await notifySourceTransfer(bridgeHash);

    // 5) 轮询目标链是否完成
    const target = await waitForTargetChainCompletion({
      sourceTxHash: bridgeHash,
      bscPublicClient
    });

    setTargetTx(target.targetTxHash);
    setStatus(`跨链完成，目标链区块: ${target.blockNumber.toString()}`);
  }

  async function onBridge() {
    setLoading(true);
    setApproveTx(null);
    setBridgeTx(null);
    setTargetTx(null);

    try {
      await ensureEthereumNetwork();
      await runBridgeFlow();
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      setStatus(`跨链失败: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="row">
        <span>钱包连接</span>
        <ConnectButton />
      </div>

      <div className="row">
        <span>当前地址</span>
        <span className="mono">{address ?? '-'}</span>
      </div>

      <div className="row">
        <span>当前链 ID</span>
        <span>{chainId ?? '-'}</span>
      </div>

      <div className="row">
        <label htmlFor="amount">跨链金额 (USDT)</label>
        <input
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="例如 10.5"
          type="number"
          min="0"
          step="0.000001"
        />
      </div>

      <div className="row">
        <button disabled={!canBridge} onClick={onBridge}>
          {loading ? 'Bridging...' : 'Bridge'}
        </button>
      </div>

      {quoteText && (
        <div className="card">
          <strong>Quote</strong>
          <div>{quoteText}</div>
        </div>
      )}

      <div className="card">
        <strong>交易状态</strong>
        <div className="status">{status}</div>
        {approveTx && <div className="mono">Approve Tx: {approveTx}</div>}
        {bridgeTx && <div className="mono">Source Bridge Tx: {bridgeTx}</div>}
        {targetTx && <div className="mono">Target Tx: {targetTx}</div>}
      </div>
    </section>
  );
}
