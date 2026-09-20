'use client';

import React from 'react';
import { NetworkConfig, Donation } from '@/lib/types';
import { Coins, DollarSign, Activity, Trophy, Blocks, RefreshCw } from 'lucide-react';

interface StatsOverviewProps {
  contractBalance: string;
  usdValue: number;
  donations: Donation[];
  latestBlock: number;
  currentNetwork: NetworkConfig;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefreshSec: number;
  setAutoRefreshSec: (sec: number) => void;
}

export function StatsOverview({
  contractBalance,
  usdValue,
  donations,
  latestBlock,
  currentNetwork,
  isLoading,
  onRefresh,
  autoRefreshSec,
  setAutoRefreshSec,
}: StatsOverviewProps) {
  // Calculate total volume from scanned transactions
  const totalVolumeFromTx = donations.reduce((acc, d) => acc + parseFloat(d.amount || '0'), 0);
  const highestDonation = donations.reduce((max, d) => {
    const val = parseFloat(d.amount || '0');
    return val > max ? val : max;
  }, 0);

  const formattedUsd = (parseFloat(contractBalance || '0') * usdValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-4 mb-8">
      {/* Top Header & Polling Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white tracking-wide uppercase">On-Chain Analytics</h3>
          <span className="text-xs text-slate-400 font-mono">({currentNetwork.name})</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Select */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <span className="text-slate-400">Auto-Sync:</span>
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={5} className="bg-slate-900 text-white">5s</option>
              <option value={10} className="bg-slate-900 text-white">10s</option>
              <option value={30} className="bg-slate-900 text-white">30s</option>
              <option value={0} className="bg-slate-900 text-white">Paused</option>
            </select>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-secondary text-xs py-1.5 px-3 border border-white/10 hover:border-cyan-500/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : 'text-slate-300'}`} />
            <span>Sync RPC</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Contract Balance */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-cyan-500/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contract Balance</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {contractBalance} <span className="text-sm font-sans text-cyan-400">{currentNetwork.symbol}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>≈ ${formattedUsd} USD</span>
            </div>
          </div>
        </div>

        {/* Card 2: Scanned Transactions Count */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-blue-500/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Donations Recorded</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {donations.length}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Scanned Volume: {totalVolumeFromTx.toFixed(4)} {currentNetwork.symbol}
            </div>
          </div>
        </div>

        {/* Card 3: Top Single Donation */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-amber-500/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Donation</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-amber-300 font-mono tracking-tight">
              {highestDonation > 0 ? highestDonation.toFixed(4) : '0.0000'}{' '}
              <span className="text-sm font-sans text-amber-400">{currentNetwork.symbol}</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {donations.length > 0 ? 'Top Contributor Recorded' : 'Waiting for donations'}
            </div>
          </div>
        </div>

        {/* Card 4: Latest Block Height */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-purple-500/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Block Height</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Blocks className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              #{latestBlock > 0 ? latestBlock.toLocaleString() : '---'}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
              <span className="pulse-indicator"></span>
              <span>Syncing with {currentNetwork.name} RPC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
