import { NetworkConfig } from './types';

export const BOHR_TESTNET: NetworkConfig = {
  id: 'bohr-testnet',
  chainId: 968,
  hexChainId: '0x3c8', // 968 in hex
  name: 'Bohr Testnet',
  rpcUrl: 'https://rpc.bohr.life',
  symbol: 'BOT',
  decimals: 18,
  explorerUrl: 'https://scan.bohr.life',
  faucetUrl: 'https://faucet.botchain.ai/en/basic',
  isTestnet: true,
};

export const ETH_MAINNET: NetworkConfig = {
  id: 'eth-mainnet',
  chainId: 1,
  hexChainId: '0x1',
  name: 'Ethereum Mainnet',
  rpcUrl: 'https://cloudflare-eth.com',
  symbol: 'ETH',
  decimals: 18,
  explorerUrl: 'https://etherscan.io',
  isTestnet: false,
};

export const SEPOLIA_TESTNET: NetworkConfig = {
  id: 'sepolia',
  chainId: 11155111,
  hexChainId: '0xaa36a7',
  name: 'Sepolia Testnet',
  rpcUrl: 'https://rpc.sepolia.org',
  symbol: 'ETH',
  decimals: 18,
  explorerUrl: 'https://sepolia.etherscan.io',
  faucetUrl: 'https://sepoliafaucet.com',
  isTestnet: true,
};

export const BASE_MAINNET: NetworkConfig = {
  id: 'base-mainnet',
  chainId: 8453,
  hexChainId: '0x2105',
  name: 'Base Mainnet',
  rpcUrl: 'https://mainnet.base.org',
  symbol: 'ETH',
  decimals: 18,
  explorerUrl: 'https://basescan.org',
  isTestnet: false,
};

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  BOHR_TESTNET,
  ETH_MAINNET,
  SEPOLIA_TESTNET,
  BASE_MAINNET,
];

