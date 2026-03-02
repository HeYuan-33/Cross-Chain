import { BridgePanel } from '@/components/BridgePanel';

export default function HomePage() {
  return (
    <main className="container">
      <h1>Ethereum → BNB Chain USDT 跨链桥示例</h1>
      <p>最小可运行示例：quote → approve → transfer → 源链确认 → 目标链轮询。</p>
      <BridgePanel />
    </main>
  );
}
