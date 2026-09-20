export interface NetworkConfig {
  id: string;
  chainId: number;
  hexChainId: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  decimals: number;
  explorerUrl: string;
  faucetUrl?: string;
  isTestnet: boolean;
}

export interface Donation {
  id: string;
  txHash: string;
  from: string;
  to: string;
  amount: string; // formatted in ETH / BOT
  amountRaw: bigint;
  symbol: string;
  timestamp: number;
  blockNumber: number;
  message?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface ContractInfo {
  address: string;
  balance: string;
  rawBalance: bigint;
  symbol: string;
  name: string;
  txCount: number;
  usdValue: number;
  isVerified: boolean;
  deployedBlock?: number;
  hasBytecode: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
  symbol: string;
}

export interface FilterOptions {
  searchQuery: string;
  minAmount: string;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
}
