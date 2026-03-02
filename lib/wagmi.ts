import { http, createConfig } from 'wagmi';
import { bsc, mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = getDefaultConfig({
  appName: 'Cross-Chain Bridge Demo',
  projectId,
  chains: [mainnet, bsc],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL),
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL)
  },
  ssr: true
});

export type AppConfig = ReturnType<typeof createConfig>;
