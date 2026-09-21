import { NetworkConfig, Donation, ContractInfo } from './types';

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

/** Resolve active Wagmi connector provider, MetaMask, Rabby, Coinbase Wallet, and other injected wallets dynamically. */
export async function getWalletProvider(): Promise<EthereumProvider | undefined> {
  if (typeof window === 'undefined') return undefined;

  // 1. Check if Wagmi has an active connector with a live provider
  try {
    const { wagmiConfig } = await import('@/components/ReownAppKitProvider');
    const state = wagmiConfig.state;
    const currentConnection = state?.connections?.get(state.current as any);
    if (currentConnection?.connector) {
      const provider = (await currentConnection.connector.getProvider()) as EthereumProvider;
      if (provider) return provider;
    }
  } catch {
    // Continue fallback
  }

  const win = window as unknown as { ethereum?: EthereumProvider & { providers?: EthereumProvider[] } };
  
  if (win.ethereum) {
    if (Array.isArray(win.ethereum.providers) && win.ethereum.providers.length > 0) {
      const selected = win.ethereum.providers.find((p) => p.isMetaMask) || win.ethereum.providers[0];
      return selected;
    }
    return win.ethereum;
  }

  const announcedProviders: EthereumProvider[] = [];
  const handleAnnouncement = (event: Event) => {
    const provider = (event as CustomEvent<{ provider?: EthereumProvider }>).detail?.provider;
    if (provider) announcedProviders.push(provider);
  };

  window.addEventListener('eip6963:announceProvider', handleAnnouncement);
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  await new Promise((resolve) => window.setTimeout(resolve, 100));
  window.removeEventListener('eip6963:announceProvider', handleAnnouncement);

  if (announcedProviders.length > 0) {
    return announcedProviders.find((provider) => provider.isMetaMask) || announcedProviders[0];
  }

  return undefined;
}

/**
 * Low-level, resilient JSON-RPC helper function over fetch.
 * Bypasses CORS and complex library overheads with direct RPC requests.
 */
export async function rpcCall(rpcUrl: string, method: string, params: unknown[] = []): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`RPC server error HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'JSON-RPC Error');
    }

    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Format BigInt Wei to ETH / BOT string with standard decimals.
 */
export function formatWei(weiHexOrBigInt: string | bigint, decimals: number = 18): string {
  try {
    const wei = typeof weiHexOrBigInt === 'string' ? BigInt(weiHexOrBigInt) : weiHexOrBigInt;
    const divisor = BigInt(10 ** decimals);
    const integerPart = wei / divisor;
    const remainder = wei % divisor;
    
    let remainderStr = remainder.toString().padStart(decimals, '0');
    // Trim trailing zeros but keep up to 4 significant decimals
    remainderStr = remainderStr.slice(0, 4);
    
    return `${integerPart.toString()}.${remainderStr}`;
  } catch {
    return '0.0000';
  }
}

/**
 * Convert human readable amount (e.g. "0.5") to Hex Wei string
 */
export function parseTokenAmountToWeiHex(amountStr: string, decimals: number = 18): string {
  try {
    const [whole, fraction = ''] = amountStr.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    const wei = BigInt(whole + paddedFraction);
    return '0x' + wei.toString(16);
  } catch {
    return '0x0';
  }
}

/**
 * Encode plain text string to Hex string for transaction memo/data
 */
export function stringToHex(text: string): string {
  if (!text) return '0x';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Decode Hex string back to UTF-8 plain text if possible
 */
export function hexToString(hex: string): string {
  if (!hex || hex === '0x') return '';
  try {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    if (cleanHex.length % 2 !== 0) return '';
    const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const text = new TextDecoder().decode(bytes);
    // filter non-printable chars
    return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
  } catch {
    return '';
  }
}

/**
 * Fetch real live account balance from RPC
 */
export async function getLiveBalance(address: string, rpcUrl: string): Promise<{ formatted: string; raw: bigint }> {
  try {
    const balanceHex = await rpcCall(rpcUrl, 'eth_getBalance', [address, 'latest']);
    const raw = BigInt(balanceHex || '0x0');
    return {
      formatted: formatWei(raw),
      raw,
    };
  } catch (err) {
    console.error('Error fetching live balance:', err);
    return { formatted: '0.0000', raw: BigInt(0) };
  }
}

/**
 * Fetch current block number from RPC
 */
export async function getLatestBlockNumber(rpcUrl: string): Promise<number> {
  try {
    const blockHex = await rpcCall(rpcUrl, 'eth_blockNumber', []);
    return parseInt(blockHex, 16);
  } catch (err) {
    console.error('Error fetching block number:', err);
    return 0;
  }
}

/**
 * Fetch current gas price in Gwei
 */
export async function getGasPriceGwei(rpcUrl: string): Promise<string> {
  try {
    const gasHex = await rpcCall(rpcUrl, 'eth_gasPrice', []);
    const gasWei = BigInt(gasHex || '0x0');
    const gwei = Number(gasWei) / 1e9;
    return gwei.toFixed(2);
  } catch {
    return '0.0';
  }
}

/**
 * Check if target address is a smart contract (bytecode length > 2)
 */
export async function checkIfContract(address: string, rpcUrl: string): Promise<boolean> {
  try {
    const code = await rpcCall(rpcUrl, 'eth_getCode', [address, 'latest']);
    return Boolean(code && code !== '0x' && code !== '0x0' && code.length > 2);
  } catch {
    return false;
  }
}

import { decodeFunctionResult } from 'viem';

const DONATION_HISTORY_ABI = [{
  name: 'getDonationHistory',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [{
    type: 'tuple[]',
    components: [
      { name: 'donor', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'message', type: 'string' }
    ]
  }]
}] as const;

/**
 * Scan recent blocks dynamically to discover real live incoming transactions / donations for an address,
 * or fetch directly from the smart contract if supported.
 */
export async function fetchLiveDonationHistory(
  targetAddress: string,
  network: NetworkConfig
): Promise<Donation[]> {
  try {
    // 1. Try to read directly from the smart contract's getDonationHistory()
    try {
      const contractData = await rpcCall(network.rpcUrl, 'eth_call', [{
        to: targetAddress,
        data: '0x0527ba8f' // getDonationHistory() selector
      }, 'latest']);

      if (contractData && contractData !== '0x') {
        const decoded = decodeFunctionResult({
          abi: DONATION_HISTORY_ABI,
          data: contractData
        }) as any[];

        if (Array.isArray(decoded) && Array.isArray(decoded[0])) {
          const contractDonations: Donation[] = decoded[0].map((record: any, index: number) => {
            return {
              id: `contract-${index}-${record.timestamp}`,
              txHash: `contract-record-${index}`, // We don't have tx hash in the struct, so mock it
              from: record.donor,
              to: targetAddress,
              amount: formatWei(record.amount, network.decimals),
              amountRaw: record.amount,
              symbol: network.symbol,
              timestamp: Number(record.timestamp) * 1000,
              blockNumber: 0,
              message: record.message || undefined,
              status: 'confirmed',
            };
          });
          
          return contractDonations.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
    } catch (e) {
      // Not a contract or function doesn't exist, fallback to block scanning
      console.log('Fallback to block scanning...', e);
    }

    // 2. Fallback: Block scanning for EOA wallets
    const currentBlock = await getLatestBlockNumber(network.rpcUrl);
    if (!currentBlock) return [];

    const donations: Donation[] = [];
    const scanDepth = 40;
    const startBlock = Math.max(0, currentBlock - scanDepth);

    const batchSize = 5;
    for (let i = currentBlock; i >= startBlock; i -= batchSize) {
      const blockPromises = [];
      for (let b = i; b > Math.max(startBlock - 1, i - batchSize); b--) {
        const hexBlock = '0x' + b.toString(16);
        blockPromises.push(
          rpcCall(network.rpcUrl, 'eth_getBlockByNumber', [hexBlock, true]).catch(() => null)
        );
      }

      const blocks = await Promise.all(blockPromises);
      for (const block of blocks) {
        if (!block || !block.transactions) continue;
        const blockTimestamp = parseInt(block.timestamp, 16) * 1000;
        const blockNum = parseInt(block.number, 16);

        for (const tx of block.transactions) {
          if (!tx || !tx.to) continue;

          if (tx.to.toLowerCase() === targetAddress.toLowerCase()) {
            const valueWei = BigInt(tx.value || '0x0');
            const memoMessage = hexToString(tx.input);

            donations.push({
              id: tx.hash,
              txHash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount: formatWei(valueWei, network.decimals),
              amountRaw: valueWei,
              symbol: network.symbol,
              timestamp: blockTimestamp || Date.now(),
              blockNumber: blockNum,
              message: memoMessage || undefined,
              status: 'confirmed',
            });
          }
        }
      }
    }

    return donations.sort((a, b) => b.blockNumber - a.blockNumber);
  } catch (err) {
    console.error('Error fetching live transactions from RPC:', err);
    return [];
  }
}

/**
 * Fetch native token (ETH / BOT) market price estimate in USD
 */
export async function getLiveTokenPriceUsd(symbol: string): Promise<number> {
  if (symbol !== 'ETH') return 0;
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data?.ethereum?.usd === 'number' ? data.ethereum.usd : 0;
  } catch {
    return 0;
  }
}

/**
 * Switch or add network in user's Web3 Browser Wallet (MetaMask, Rabby, Coinbase, etc.)
 */
export async function switchOrAddNetworkInWallet(network: NetworkConfig): Promise<boolean> {
  const provider = await getWalletProvider();
  if (!provider) {
    alert('No Web3 wallet extension found. Please install MetaMask, Rabby, or Coinbase Wallet.');
    return false;
  }

  try {
    // Request wallet to switch chain
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.hexChainId }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 means the chain has not been added to the wallet yet
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: network.hexChainId,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: network.decimals,
              },
              blockExplorerUrls: [network.explorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add custom network:', addError);
        return false;
      }
    }
    console.error('Failed to switch network:', switchError);
    return false;
  }
}

import { encodeFunctionData } from 'viem';

/**
 * Send real live ETH / BOT transaction directly through user's connected wallet
 */
export async function sendWeb3Donation(
  fromAddress: string,
  toAddress: string,
  amountEthOrBot: string,
  messageMemo: string = '',
  network: NetworkConfig
): Promise<string> {
  const provider = await getWalletProvider();
  if (!provider) {
    throw new Error('Web3 wallet is not connected.');
  }

  const valueHex = parseTokenAmountToWeiHex(amountEthOrBot, network.decimals);
  
  // Check if it's a contract
  const isContract = await checkIfContract(toAddress, network.rpcUrl);
  
  let dataHex = '0x';
  if (isContract) {
    // If it's a contract, we MUST call the donate(string) function 
    // otherwise the contract will revert if we send msg.data to a contract with no fallback()
    try {
      dataHex = encodeFunctionData({
        abi: [{
          name: 'donate',
          type: 'function',
          stateMutability: 'payable',
          inputs: [{ name: '_message', type: 'string' }]
        }],
        args: [messageMemo]
      });
    } catch (e) {
      // Fallback
      dataHex = stringToHex(messageMemo);
    }
  } else {
    // For normal wallets, just send the message as hex data
    dataHex = stringToHex(messageMemo);
  }

  const txParams = {
    from: fromAddress,
    to: toAddress,
    value: valueHex,
    data: dataHex,
  };

  const txHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [txParams],
  });

  return txHash;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
