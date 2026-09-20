'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider, http } from 'wagmi';
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

export const networks = [bohrTestnet, mainnet, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

let appKitInstance: any;

export function Web3Provider({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined' && !appKitInstance) {
    appKitInstance = createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: networks as any,
      defaultNetwork: bohrTestnet as any,
      features: {
        analytics: true,
      }
    });
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}


