'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { defineChain } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';

// 1. Explicit Bohr Testnet custom network configuration
export const bohrTestnet = defineChain({
  id: 968,
  caipNetworkId: 'eip155:968',
  chainNamespace: 'eip155',
  name: 'Bohr Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life/',
    },
  },
  testnet: true,
});

// 2. Read Reown Project ID directly from environment (.env.local)
export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  '202f49df3a791669309a0178347d64ee';

export const metadata = {
  name: 'BotDonationTracker',
  description: 'Track live BOT and ETH donations on smart contracts',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://donation-tracker-henna.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

export const networks = [bohrTestnet];

// 3. Set up Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 4. Initialize modern Reown AppKit with all standard wallets enabled & featured
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bohrTestnet] as any,
  defaultNetwork: bohrTestnet as any,
  metadata,
  allWallets: 'SHOW',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'fd20dc426fb3704d13069c07e0830ae829a0f600f3c7f6b5f7440e50eefd68e6', // Coinbase Wallet
    '8a0ee5009180f94f8577597d30444224580092f6819d77e4773723a290709447', // Binance Wallet
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // SafePal
  ],
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00f2fe',
    '--w3m-border-radius-master': '12px',
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
