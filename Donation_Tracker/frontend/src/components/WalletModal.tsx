'use client';

import React from 'react';
import { NetworkConfig } from '@/lib/types';
import { X, Wallet, ShieldCheck, Sparkles } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectExtension: () => void;
  onConnectDemo: () => void;
  currentNetwork: NetworkConfig;
}

export function WalletModal({
  isOpen,
  onClose,
  onConnectExtension,
  onConnectDemo,
  currentNetwork,
}: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Connect Web3 Wallet</h3>
              <p className="text-xs text-slate-400">Select your preferred connection method</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Option 1: Browser Extension */}
            <button
              onClick={() => {
                onConnectExtension();
                onClose();
              }}
              className="w-full p-4 rounded-xl bg-[#121929] border border-white/10 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300">
                    Browser Wallet Extension
                  </div>
                  <div className="text-xs text-slate-400">
                    MetaMask, Rabby, Coinbase Wallet, Trust, Brave
                  </div>
                </div>
              </div>
              <span className="badge badge-bohr text-[10px]">Extension</span>
            </button>

            {/* Option 2: Instant Demo / Testnet Wallet Mode */}
            <button
              onClick={() => {
                onConnectDemo();
                onClose();
              }}
              className="w-full p-4 rounded-xl bg-[#121929] border border-white/10 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-emerald-300">
                    Instant Testnet Account
                  </div>
                  <div className="text-xs text-slate-400">
                    Connect simulated wallet on {currentNetwork.name}
                  </div>
                </div>
              </div>
              <span className="badge badge-success text-[10px]">Instant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
