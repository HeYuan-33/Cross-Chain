import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppProviders } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Cross-Chain Bridge Demo',
  description: 'Next.js + wagmi + viem + RainbowKit bridge example'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
