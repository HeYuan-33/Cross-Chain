# Cross-Chain Bridge Demo (Next.js + TypeScript)

一个最小可运行的跨链桥前端示例：
- Ethereum 主网发起 USDT 跨链
- 目标链为 BNB Chain
- 流程：quote -> approve -> bridge transfer -> 源链确认 -> 目标链轮询

## 技术栈
- Next.js 14 + TypeScript
- wagmi + viem
- RainbowKit

## 快速启动

```bash
npm install
npm run dev
```

## 环境变量

创建 `.env.local`：

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/xxx
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
# 可选：桥状态服务（用于 source tx -> target tx 映射）
NEXT_PUBLIC_BRIDGE_STATUS_API=https://your-bridge-service/status
```

> 注：示例中的桥合约地址和 SDK 为演示用途，真实生产需替换为可用协议地址与 API。
