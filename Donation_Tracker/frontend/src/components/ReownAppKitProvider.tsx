'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet, metaMask } from 'wagmi/connectors';
import { BOHR_TESTNET } from '../lib/networks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const bohrTestnet = {
  id: BOHR_TESTNET.chainId,
  name: BOHR_TESTNET.name,
  nativeCurrency: { name: BOHR_TESTNET.symbol, symbol: BOHR_TESTNET.symbol, decimals: BOHR_TESTNET.decimals },
  rpcUrls: {
    default: { http: [BOHR_TESTNET.rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'BohrScan', url: BOHR_TESTNET.explorerUrl! },
  },
  testnet: true
} as const;

// Read Reown Project ID from env variables
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || process.env.REOWN_PROJECT_ID || '202f49df3a791669309a0178347d64ee';

export const metadata = {
  name: 'BotDonationTracker',
  description: 'Track live BOT and ETH donations on smart contracts',
  url: 'https://donation-tracker-henna.vercel.app', 
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

export const networks = [bohrTestnet, mainnet, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  // @ts-ignore
  metadata,
  ssr: true,
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    metaMask(),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: metadata.name })
  ]
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

if (typeof window !== 'undefined') {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: networks as any,
    defaultNetwork: bohrTestnet as any,
    metadata,
    features: {
      analytics: true,
      allWallets: true, // Force "All Wallets" button to show
      email: false,
      socials: false,
    }
  });
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}


