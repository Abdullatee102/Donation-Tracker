'use client';

import React from 'react';
import { NetworkConfig, WalletState } from '@/lib/types';
import { SUPPORTED_NETWORKS } from '@/lib/networks';
import { Wallet, Zap, LogOut, ChevronDown } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

interface NavbarProps {
  currentNetwork: NetworkConfig;
  onSelectNetwork: (network: NetworkConfig) => void;
  walletState: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet?: () => void;
}

export function Navbar({
  currentNetwork,
  onSelectNetwork,
  walletState,
  onConnectWallet,
  onDisconnectWallet,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { open } = useAppKit();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-80 border-b border-white/10 bg-[#07090e]/90 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                <span className="gradient-text">BotDonationTracker</span>
              </h1>
              <span className="badge badge-bohr">
                <span className="pulse-indicator"></span>
                LIVE RPC
              </span>
            </div>
            <p className="text-xs text-slate-400">Live blockchain data • Smart contracts and wallet access</p>
          </div>
        </div>

        {/* Action Controls & Wallet Connection */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Network Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 hover:border-cyan-500/40 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="font-medium">{currentNetwork.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 py-1.5 bg-[#0e1424] border border-white/10 rounded-xl shadow-2xl transition-all z-50">
                {SUPPORTED_NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => {
                      onSelectNetwork(net);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer ${
                      net.id === currentNetwork.id ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-300'
                    }`}
                  >
                    <span>{net.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{net.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Web3 Connection Button */}
          {walletState.isConnected ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl p-1 pr-3">
              <div className="bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300">
                {walletState.balance} {walletState.symbol}
              </div>
              <button 
                onClick={() => open()}
                className="text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
              </button>
              <button 
                onClick={() => {
                  if (onDisconnectWallet) onDisconnectWallet();
                  open(); // Also open AppKit to allow disconnect from modal
                }}
                className="ml-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                title="Disconnect or Switch Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => open()}
              className="bg-cyan-500 hover:bg-cyan-400 text-[#040914] font-bold text-sm py-2 px-5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

