'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NetworkConfig, Donation, WalletState } from '@/lib/types';
import { BOHR_TESTNET } from '@/lib/networks';
import {
  getLiveBalance,
  getLatestBlockNumber,
  fetchLiveDonationHistory,
  getLiveTokenPriceUsd,
} from '@/lib/web3';
import { Navbar } from '@/components/Navbar';
import { ContractSelector } from '@/components/ContractSelector';
import { StatsOverview } from '@/components/StatsOverview';
import { TransactionFeed } from '@/components/TransactionFeed';
import { ContractExplorer } from '@/components/ContractExplorer';
import { DonateModal } from '@/components/DonateModal';
import { Heart, Activity, Code2 } from 'lucide-react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export default function Home() {
  // Default network: Bohr Testnet (Chain ID 968)
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(BOHR_TESTNET);
  // Default donation target address is blank to require user input
  const [targetAddress, setTargetAddress] = useState<string>('');
  
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

  // Wagmi & Reown AppKit Web3 hooks
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Unified reactive wallet state connected to modern Wagmi stack
  const walletState: WalletState = {
    isConnected: !!isConnected,
    address: address || null,
    chainId: chainId || null,
    balance: balanceData ? balanceData.formatted.slice(0, 7) : '0.0000',
    symbol: balanceData?.symbol || currentNetwork.symbol,
  };

  const handleConnectClick = () => {
    open();
  };

  const handleDisconnectClick = () => {
    disconnect();
  };

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
    } catch (err) {
      console.error('Error fetching live RPC data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetAddress, currentNetwork]);

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

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden w-full max-w-[100vw]">
      <div className="ambient-glow"></div>

      <div>
        {/* Navbar */}
        <Navbar
          currentNetwork={currentNetwork}
          onSelectNetwork={(net) => {
            setCurrentNetwork(net);
          }}
          walletState={walletState}
          onConnectWallet={handleConnectClick}
          onDisconnectWallet={handleDisconnectClick}
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

            {/* Direct Donation Action Button */}
            <button
              onClick={() => setIsDonateModalOpen(true)}
              className="w-full md:w-auto btn-primary text-xs py-2.5 px-6 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Donate Now</span>
            </button>
          </div>

          {/* Active View Content */}
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
