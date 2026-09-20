'use client';

import React, { useState } from 'react';
import { NetworkConfig, Donation, FilterOptions } from '@/lib/types';
import { Search, Filter, Download, ExternalLink, ArrowDownLeft, Calendar, User, MessageSquare } from 'lucide-react';

interface TransactionFeedProps {
  donations: Donation[];
  currentNetwork: NetworkConfig;
  isLoading: boolean;
  onOpenDonateModal: () => void;
}

export function TransactionFeed({ donations, currentNetwork, isLoading, onOpenDonateModal }: TransactionFeedProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    minAmount: '0',
    sortBy: 'newest',
  });

  // Filter & Sort logic
  const filteredDonations = donations
    .filter((d) => {
      const matchSearch =
        !filters.searchQuery ||
        d.from.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        d.txHash.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (d.message && d.message.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      const matchMinAmount = parseFloat(d.amount || '0') >= parseFloat(filters.minAmount || '0');

      return matchSearch && matchMinAmount;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'newest') return b.blockNumber - a.blockNumber;
      if (filters.sortBy === 'oldest') return a.blockNumber - b.blockNumber;
      if (filters.sortBy === 'highest') return parseFloat(b.amount) - parseFloat(a.amount);
      if (filters.sortBy === 'lowest') return parseFloat(a.amount) - parseFloat(b.amount);
      return 0;
    });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredDonations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bohr_donations_${currentNetwork.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ['TxHash', 'FromAddress', 'Amount', 'Symbol', 'BlockNumber', 'Timestamp', 'Message'];
    const rows = filteredDonations.map((d) => [
      d.txHash,
      d.from,
      d.amount,
      d.symbol,
      d.blockNumber,
      new Date(d.timestamp).toISOString(),
      `"${(d.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bohr_donations_${currentNetwork.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Live Donation Stream</h3>
            <span className="badge badge-success text-[11px]">
              <span className="pulse-indicator"></span>
              {filteredDonations.length} Events Scanned
            </span>
          </div>
          <p className="text-xs text-slate-400">Incoming smart contract transactions on {currentNetwork.name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onOpenDonateModal} className="btn-primary text-xs py-2 px-4">
            <span>+ Send Donation</span>
          </button>
          <button onClick={exportToCsv} className="btn-secondary text-xs py-2 px-3">
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button onClick={exportToJson} className="btn-secondary text-xs py-2 px-3">
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search donor address or memo..."
            className="w-full bg-[#121929] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Minimum Amount Filter */}
        <div className="relative flex items-center">
          <Filter className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            type="number"
            step="any"
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
            placeholder="Min Amount (0.0)"
            className="w-full bg-[#121929] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Sort By */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e: any) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full bg-[#121929] border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="newest">Sort by Newest Block</option>
            <option value="oldest">Sort by Oldest Block</option>
            <option value="highest">Sort by Highest Amount</option>
            <option value="lowest">Sort by Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Live Transaction Feed List */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Scanning {currentNetwork.name} RPC blocks for live donations...</p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="py-12 text-center space-y-3 border border-dashed border-white/10 rounded-2xl bg-slate-900/40">
          <ArrowDownLeft className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No Recent Scanned Donations Found</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No incoming transactions match the selected filters or target contract. Be the first to donate live on {currentNetwork.name}!
          </p>
          <button onClick={onOpenDonateModal} className="btn-outline text-xs py-1.5 px-4 mt-2">
            Make First Donation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDonations.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-xl bg-[#0e1320] border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {d.from.slice(0, 8)}...{d.from.slice(-6)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="badge badge-bohr text-[10px]">Block #{d.blockNumber}</span>
                  </div>

                  {/* Donor Memo Message if present */}
                  {d.message && (
                    <div className="text-xs text-slate-300 bg-slate-900/90 border border-white/5 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-sans italic">
                      <MessageSquare className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>&quot;{d.message}&quot;</span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                    Tx: {d.txHash}
                  </div>
                </div>
              </div>

              {/* Right Value & Explorer Link */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-400 font-mono">
                    +{d.amount} <span className="text-xs font-sans text-emerald-500">{d.symbol}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Confirmed</span>
                </div>

                <a
                  href={`${currentNetwork.explorerUrl}/tx/${d.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-colors"
                  title="View Transaction on Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
