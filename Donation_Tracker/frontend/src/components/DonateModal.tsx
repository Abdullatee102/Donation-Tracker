'use client';

import React, { useState } from 'react';
import { NetworkConfig, WalletState } from '@/lib/types';
import { sendWeb3Donation, switchOrAddNetworkInWallet } from '@/lib/web3';
import { Heart, Send, X, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAddress: string;
  currentNetwork: NetworkConfig;
  walletState: WalletState;
  onSuccessTx: () => void;
}

export function DonateModal({
  isOpen,
  onClose,
  targetAddress,
  currentNetwork,
  walletState,
  onSuccessTx,
}: DonateModalProps) {
  const [amount, setAmount] = useState<string>('1.0');
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'prompting' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [recipient, setRecipient] = useState<string>(targetAddress || '');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const presetAmounts = currentNetwork.symbol === 'BOT' ? ['0.5', '1.0', '5.0', '10.0', '50.0'] : ['0.005', '0.01', '0.05', '0.1', '0.5'];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#4facfe', '#7f00ff', '#10b981'],
      });
    } catch {
      // ignore if confetti fails
    }
  };

  const activeRecipient = recipient || targetAddress;

  const copyRecipient = () => {
    if (activeRecipient) {
      navigator.clipboard.writeText(activeRecipient);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletState.isConnected || !walletState.address) {
      alert('Please connect your Web3 Wallet first!');
      return;
    }

    if (!activeRecipient || !/^0x[a-fA-F0-9]{40}$/.test(activeRecipient.trim())) {
      alert('Please enter a valid 42-character recipient contract address (0x...).');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    try {
      setStatus('prompting');
      setErrorMessage('');

      // Auto check network match
      if (walletState.chainId !== currentNetwork.chainId) {
        await switchOrAddNetworkInWallet(currentNetwork);
      }

      setStatus('pending');
      const hash = await sendWeb3Donation(
        walletState.address,
        activeRecipient.trim(),
        amount,
        message,
        currentNetwork
      );

      setTxHash(hash);
      setStatus('success');
      triggerConfetti();
      onSuccessTx();
    } catch (err: any) {
      console.error('Donation error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Transaction rejected or failed.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[2px]">
            <div className="w-full h-full bg-[#0e1320] rounded-[14px] flex items-center justify-center">
              <Heart className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">Donate {currentNetwork.symbol}</h3>
            <p className="text-xs text-slate-400">Direct Smart Contract Contribution • On-Chain Web3</p>
          </div>
        </div>

        {/* Success State */}
        {status === 'success' ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-white">Donation Successfully Broadcast!</h4>
            <p className="text-xs text-slate-300">
              Thank you for contributing <span className="font-bold text-cyan-400">{amount} {currentNetwork.symbol}</span> on-chain!
            </p>

            <div className="p-3 bg-slate-900 rounded-xl border border-white/10 text-xs font-mono break-all text-slate-400">
              Tx Hash: <span className="text-cyan-300">{txHash}</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href={`${currentNetwork.explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2 px-4"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDonateSubmit} className="space-y-5">
            {/* Target Recipient Address Input & Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Recipient Contract / Wallet Address
                </label>
                {activeRecipient && (
                  <button
                    type="button"
                    onClick={copyRecipient}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    {copied ? 'Copied!' : 'Copy Address'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x... (Smart contract or recipient address)"
                className="w-full bg-[#121929] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <p className="text-[11px] text-slate-400">
                Your donation (native {currentNetwork.symbol}) will be sent directly to this address on {currentNetwork.name}.
              </p>
            </div>

            {/* Donation Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Amount ({currentNetwork.symbol})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {presetAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      amount === val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Custom Amount</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#121929] border border-white/10 rounded-xl py-2.5 px-3.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="absolute right-3.5 text-xs font-bold text-cyan-400 font-mono">
                  {currentNetwork.symbol}
                </span>
              </div>
            </div>

            {/* Optional Memo Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Donor Message / Note (On-Chain Hex Memo)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave an encouraging message to the project..."
                rows={2}
                className="w-full bg-[#121929] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary text-xs py-2.5 px-4">
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'prompting' || status === 'pending'}
                className="btn-primary text-xs sm:text-sm py-2.5 px-6"
              >
                {status === 'prompting' || status === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Confirming in Wallet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send {amount} {currentNetwork.symbol}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
