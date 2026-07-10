"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Wallet, LogOut, Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import {
  connectWallet,
  disconnectWallet,
  getActiveWallet,
  getWalletBalance,
} from "@/lib/stellar";

export function Header() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if wallet is active on mount
    const active = getActiveWallet();
    if (active) {
      setWalletAddress(active);
      updateBalance(active);
    }

    // Set up custom event to monitor wallet state updates inside page components
    const handleWalletUpdate = () => {
      const current = getActiveWallet();
      setWalletAddress(current);
      if (current) {
        updateBalance(current);
      } else {
        setBalance(null);
      }
    };
    window.addEventListener("stellar-wallet-changed", handleWalletUpdate);
    return () => {
      window.removeEventListener("stellar-wallet-changed", handleWalletUpdate);
    };
  }, []);

  const updateBalance = async (address: string) => {
    try {
      const bal = await getWalletBalance(address);
      setBalance(bal);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      await updateBalance(address);
      window.dispatchEvent(new Event("stellar-wallet-changed"));
    } catch (e) {
      console.error("Wallet connection failed", e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setWalletAddress(null);
    setBalance(null);
    window.dispatchEvent(new Event("stellar-wallet-changed"));
  };

  const navLinks = [
    { href: "/sponsor", label: "Sponsor a Tree" },
    { href: "/planters", label: "Planter Portal" },
    { href: "/dashboard", label: "Impact Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-stellar-navy/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-stellar-cyan to-stellar-green text-white shadow-lg shadow-stellar-green/20 group-hover:scale-105 transition-transform">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-stellar-cyan bg-clip-text text-transparent">
              Stellar Canopy
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-stellar-cyan",
                    isActive ? "text-stellar-cyan font-semibold" : "text-slate-300"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet / Action */}
          <div className="hidden md:flex items-center space-x-4">
            {walletAddress ? (
              <div className="flex items-center space-x-3 rounded-2xl border border-white/10 bg-white/5 p-1.5 pl-3.5 pr-1.5">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Wallet Connected
                  </span>
                  <span className="text-xs font-mono text-stellar-cyan">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                
                {balance !== null && (
                  <div className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-stellar-green">
                    {balance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} XLM
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white"
                  title="Disconnect Wallet"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="stellar"
                size="sm"
                onClick={handleConnect}
                isLoading={isConnecting}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-stellar-navy/95 p-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col space-y-4 mb-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-base font-medium transition-colors p-2 rounded-lg hover:bg-white/5",
                  pathname === link.href ? "text-stellar-cyan bg-white/5" : "text-slate-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/5">
            {walletAddress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Address</span>
                    <span className="text-sm font-mono text-stellar-cyan">
                      {walletAddress}
                    </span>
                  </div>
                  {balance !== null && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Balance</span>
                      <div className="text-sm font-bold text-stellar-green">{balance.toFixed(2)} XLM</div>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    handleDisconnect();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <Button
                variant="stellar"
                className="w-full justify-center"
                onClick={() => {
                  handleConnect();
                  setIsMenuOpen(false);
                }}
                isLoading={isConnecting}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
