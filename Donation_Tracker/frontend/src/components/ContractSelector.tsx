'use client';

import React, { useState, useEffect } from 'react';
import { NetworkConfig } from '@/lib/types';
import { Search, Bookmark, BookmarkCheck, Sparkles, Check, Copy } from 'lucide-react';

interface ContractSelectorProps {
  currentAddress: string;
  onAddressChange: (address: string) => void;
  currentNetwork: NetworkConfig;
}

export function ContractSelector({ currentAddress, onAddressChange, currentNetwork }: ContractSelectorProps) {
  const [inputAddress, setInputAddress] = useState<string>(currentAddress);
  const [savedWatchlist, setSavedWatchlist] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true);

  useEffect(() => {
    setInputAddress(currentAddress);
  }, [currentAddress]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bohr_donation_watchlist');
      if (stored) {
        setSavedWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load local watchlist:', e);
    }
  }, []);

  const validateAndSubmit = (addr: string) => {
    const trimmed = addr.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setIsValidAddress(true);
      onAddressChange(trimmed);
    } else {
      setIsValidAddress(false);
    }
  };

  const toggleBookmark = () => {
    if (!currentAddress || !isValidAddress) return;
    let updated: string[];
    if (savedWatchlist.includes(currentAddress)) {
      updated = savedWatchlist.filter((a) => a !== currentAddress);
    } else {
      updated = [...savedWatchlist, currentAddress];
    }
    setSavedWatchlist(updated);
    localStorage.setItem('bohr_donation_watchlist', JSON.stringify(updated));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBookmarked = savedWatchlist.includes(currentAddress);

  return (
    <div className="glass-panel p-6 mb-8 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Search Header */}
        <div className="w-full lg:w-2/3 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Smart Contract / Recipient Address</h2>
          </div>
          <p className="text-xs text-slate-400">
            Paste any Ethereum or Bohr smart contract address to track live incoming donations in real-time.
          </p>

          {/* Search Bar Input */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => {
                setInputAddress(e.target.value);
                validateAndSubmit(e.target.value);
              }}
              placeholder="Enter your address to track your analytics..."
              className={`w-full bg-[#121929] border rounded-xl py-3 pl-11 pr-24 text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition-all ${
                !isValidAddress && inputAddress.length > 0
                  ? 'border-rose-500/70 focus:border-rose-500'
                  : 'border-white/10 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40'
              }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleBookmark}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={isBookmarked ? 'Remove from Watchlist' : 'Save to Watchlist'}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isValidAddress && (
            <p className="text-xs text-rose-400 font-medium">
              Please enter a valid 42-character EVM hexadecimal address (starting with 0x).
            </p>
          )}
        </div>

        <div className="w-full lg:w-1/3 flex items-center border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
          <p className="text-xs leading-5 text-slate-500">
            Enter the address you want to inspect. Results are read directly from the selected network.
          </p>
        </div>
      </div>
    </div>
  );
}
