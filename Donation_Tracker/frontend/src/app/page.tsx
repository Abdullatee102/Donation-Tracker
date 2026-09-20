'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NetworkConfig, Donation, WalletState } from '@/lib/types';
import { BOHR_TESTNET } from '@/lib/networks';
import {
  getLiveBalance,
  getLatestBlockNumber,
  fetchLiveDonationHistory,
  getLiveTokenPriceUsd,
  getWalletProvider,
  switchOrAddNetworkInWallet,
} from '@/lib/web3';
import { Navbar } from '@/components/Navbar';
import { ContractSelector } from '@/components/ContractSelector';
import { StatsOverview } from '@/components/StatsOverview';
import { TransactionFeed } from '@/components/TransactionFeed';
import { ContractExplorer } from '@/components/ContractExplorer';
import { DonateModal } from '@/components/DonateModal';
import { WalletModal } from '@/components/WalletModal';
import { Heart, Activity, Code2 } from 'lucide-react';

export default function Home() {
  // Default network: Bohr Testnet (Chain ID 968)
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(BOHR_TESTNET);
  // Default donation target address (reads from environment if available)
  const [targetAddress, setTargetAddress] = useState<string>(
    process.env.NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS || ''
  );
  
  // Dynamic state loaded directly from the selected network RPC.
  const [contractBalance, setContractBalance] = useState<string>('0.0000');
  const [tokenUsdPrice, setTokenUsdPrice] = useState<number>(0);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'stream' | 'inspector'>('stream');

  // Modal open
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);

  // Auto-refresh interval (5s default)
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(5);

  // Wallet Connection State
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: '0.0000',
    symbol: BOHR_TESTNET.symbol,
  });

  // Wallet Modal open state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  // Connect via Browser Extension (MetaMask / Rabby / Injected)
  const connectExtensionWallet = async () => {
    let provider = await getWalletProvider();
    if (!provider && typeof window !== 'undefined' && (window as any).ethereum) {
      provider = (window as any).ethereum;
    }

    if (!provider) {
      setIsWalletModalOpen(true);
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const chainHex = await provider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainHex, 16);

      if (accounts && accounts.length > 0) {
        const userAddr = accounts[0];
        const balObj = await getLiveBalance(userAddr, currentNetwork.rpcUrl);

        setWalletState({
          isConnected: true,
          address: userAddr,
          chainId,
          balance: balObj.formatted,
          symbol: currentNetwork.symbol,
        });

        // Prompt user to switch to Bohr testnet if on wrong network
        if (chainId !== currentNetwork.chainId) {
          await switchOrAddNetworkInWallet(currentNetwork);
        }
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err?.code === 4001) return;
      alert('Failed to connect wallet: ' + (err?.message || 'User rejected request'));
    }
  };

  // Connect Instant Demo / Testnet Wallet Account
  const connectDemoWallet = async () => {
    const demoAddr = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    const balObj = await getLiveBalance(demoAddr, currentNetwork.rpcUrl);

    setWalletState({
      isConnected: true,
      address: demoAddr,
      chainId: currentNetwork.chainId,
      balance: balObj.formatted,
      symbol: currentNetwork.symbol,
    });
  };

  // Disconnect Web3 Wallet
  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: '0.0000',
      symbol: currentNetwork.symbol,
    });
  };

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnectedWallet = async () => {
      const provider = await getWalletProvider();
      if (provider) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const userAddr = accounts[0];
            const chainHex = await provider.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainHex, 16);
            const balObj = await getLiveBalance(userAddr, currentNetwork.rpcUrl);

            setWalletState({
              isConnected: true,
              address: userAddr,
              chainId,
              balance: balObj.formatted,
              symbol: currentNetwork.symbol,
            });
          }
        } catch (e) {
          console.error('Error checking wallet auto-connection:', e);
        }
      }
    };
    checkConnectedWallet();
  }, [currentNetwork]);

  // Fetch live blockchain data directly from RPC
  const refreshBlockchainData = useCallback(async () => {
    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) return;

    setIsLoading(true);
    try {
      const [balResult, blockNum, txs, price] = await Promise.all([
        getLiveBalance(targetAddress, currentNetwork.rpcUrl),
        getLatestBlockNumber(currentNetwork.rpcUrl),
        fetchLiveDonationHistory(targetAddress, currentNetwork),
        getLiveTokenPriceUsd(currentNetwork.symbol),
      ]);

      setContractBalance(balResult.formatted);
      setLatestBlock(blockNum);
      setDonations(txs);
      setTokenUsdPrice(price);

      // Update wallet balance if connected
      if (walletState.isConnected && walletState.address) {
        const userBal = await getLiveBalance(walletState.address, currentNetwork.rpcUrl);
        setWalletState((prev) => ({ ...prev, balance: userBal.formatted }));
      }
    } catch (err) {
      console.error('Error fetching live RPC data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetAddress, currentNetwork, walletState.isConnected, walletState.address]);

  // Initial load & automatic polling loop
  useEffect(() => {
    refreshBlockchainData();
  }, [refreshBlockchainData]);

  useEffect(() => {
    if (autoRefreshSec <= 0) return;
    const interval = setInterval(() => {
      refreshBlockchainData();
    }, autoRefreshSec * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshSec, refreshBlockchainData]);

  // Listen to window.ethereum account / chain changes
  useEffect(() => {
    let provider: Awaited<ReturnType<typeof getWalletProvider>>;
    let isMounted = true;

    const setupProviderListeners = async () => {
      provider = await getWalletProvider();
      if (!isMounted || !provider?.on) return;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletState((prev) => ({ ...prev, isConnected: false, address: null }));
        } else {
          setWalletState((prev) => ({ ...prev, isConnected: true, address: accounts[0] }));
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      return () => {
        provider?.removeListener?.('accountsChanged', handleAccountsChanged);
        provider?.removeListener?.('chainChanged', handleChainChanged);
      };
    };

    let removeListeners: (() => void) | undefined;
    setupProviderListeners().then((cleanup) => {
      removeListeners = cleanup;
    });

    return () => {
      isMounted = false;
      removeListeners?.();
    };
  }, []);

  // Responsive Connect Wallet Handler
  const handleConnectClick = async () => {
    // 1. Open connection modal immediately so options are always visible
    setIsWalletModalOpen(true);

    // 2. If browser wallet extension is present, attempt direct request
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await connectExtensionWallet();
      } catch (err) {
        console.log('Extension prompt error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      <div className="ambient-glow"></div>

      <div>
        {/* Navbar */}
        <Navbar
          currentNetwork={currentNetwork}
          onSelectNetwork={(net) => {
            setCurrentNetwork(net);
            setWalletState((prev) => ({ ...prev, symbol: net.symbol }));
          }}
          walletState={walletState}
          onConnectWallet={handleConnectClick}
          onDisconnectWallet={disconnectWallet}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 relative z-10 space-y-6">
          {/* Smart Contract Selector */}
          <ContractSelector
            currentAddress={targetAddress}
            onAddressChange={(addr) => setTargetAddress(addr)}
            currentNetwork={currentNetwork}
          />

          {/* On-Chain Analytics Overview Stats */}
          <StatsOverview
            contractBalance={contractBalance}
            usdValue={tokenUsdPrice}
            donations={donations}
            latestBlock={latestBlock}
            currentNetwork={currentNetwork}
            isLoading={isLoading}
            onRefresh={refreshBlockchainData}
            autoRefreshSec={autoRefreshSec}
            setAutoRefreshSec={setAutoRefreshSec}
          />

          {/* Navigation Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center ${
                  activeTab === 'stream'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Live Feed ({donations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inspector')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-1 md:flex-none justify-center ${
                  activeTab === 'inspector'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Code2 className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Bytecode Explorer</span>
              </button>
            </div>

            <button onClick={() => setIsDonateModalOpen(true)} className="btn-primary text-xs py-2 px-4 shadow-lg w-full md:w-auto flex justify-center items-center gap-2">
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300 shrink-0" />
              <span>Donate Now</span>
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'stream' ? (
            <TransactionFeed
              donations={donations}
              currentNetwork={currentNetwork}
              isLoading={isLoading}
              onOpenDonateModal={() => setIsDonateModalOpen(true)}
            />
          ) : (
            <ContractExplorer targetAddress={targetAddress} currentNetwork={currentNetwork} />
          )}
        </main>
      </div>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnectExtension={connectExtensionWallet}
        onConnectDemo={connectDemoWallet}
        currentNetwork={currentNetwork}
      />

      {/* Donate Modal */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        targetAddress={targetAddress}
        currentNetwork={currentNetwork}
        walletState={walletState}
        onSuccessTx={() => {
          refreshBlockchainData();
        }}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12 bg-[#07090e]/80 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            BotDonationTracker • On-chain smart contract tracker
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href={currentNetwork.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400"
            >
              Block Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
