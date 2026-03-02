# Cross-Chain Bridge Demo (Next.js + TypeScript)

一个可运行、可测试、包含前后端的跨链桥前端示例：
- 前端：钱包连接 + 跨链操作页面
- 后端：Next.js API Route（quote / transfer / status）
- 流程：quote -> approve -> bridge transfer -> 源链确认 -> 后端登记 -> 目标链轮询

## 技术栈
- Next.js 14 + TypeScript
- wagmi + viem
- RainbowKit

## 快速启动

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 测试

```bash
npm test
```

> 测试基于 Node.js 内置 `node:test`，覆盖核心桥接计算与后端状态存储逻辑。

## 环境变量

创建 `.env.local`：

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/xxx
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
```

## 后端 API

- `GET /api/bridge/quote?amount=<uint256>`
- `POST /api/bridge/transfer` body: `{ "sourceTxHash": "0x..." }`
- `GET /api/bridge/status?sourceTxHash=0x...`

> 注：示例中的桥合约地址和后端逻辑为演示用途，生产请替换真实桥 SDK、合约和索引服务。
