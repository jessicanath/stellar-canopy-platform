"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Leaf, Shield, Heart, Map, TrendingUp, DollarSign, Users, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/Card";
import { getGlobalStats } from "@/lib/stellar";

export default function Home() {
  const [stats, setStats] = useState({
    totalTrees: 0,
    verifiedTrees: 0,
    totalOffsetKg: 0,
    totalPayout: 0,
    activePlanters: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const data = await getGlobalStats();
      setStats(data);
    };
    loadStats();
    
    // Listen for updates
    window.addEventListener("stellar-wallet-changed", loadStats);
    return () => {
      window.removeEventListener("stellar-wallet-changed", loadStats);
    };
  }, []);

  return (
    <div className="relative min-h-screen space-y-24 py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-stellar-green/30 bg-stellar-green/10 px-4 py-1.5 text-xs font-semibold text-stellar-green animate-float">
          <Leaf className="h-3.5 w-3.5" />
          Proudly Supported by Fundable Finance
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Plant Trees. Track Impact. <br />
          <span className="bg-gradient-to-r from-stellar-cyan via-stellar-blue to-stellar-green bg-clip-text text-transparent">
            Offset Carbon on Stellar.
          </span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg text-slate-300">
          Connect tree sponsors with on-the-ground planters through a transparent, blockchain-backed payment system using Soroban smart contracts.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link href="/sponsor">
            <Button variant="stellar" size="lg">
              Sponsor a Tree
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              View Impact Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Global Stats Grid */}
      <section className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card hoverable={true} className="bg-white/[0.01]">
            <CardContent className="pt-6 text-center space-y-2">
              <Leaf className="h-6 w-6 text-stellar-green mx-auto" />
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalTrees}</div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Trees Sponsored</p>
            </CardContent>
          </Card>
          
          <Card hoverable={true} className="bg-white/[0.01]">
            <CardContent className="pt-6 text-center space-y-2">
              <Award className="h-6 w-6 text-stellar-cyan mx-auto" />
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.verifiedTrees}</div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Trees Verified</p>
            </CardContent>
          </Card>
          
          <Card hoverable={true} className="bg-white/[0.01]">
            <CardContent className="pt-6 text-center space-y-2">
              <TrendingUp className="h-6 w-6 text-stellar-blue mx-auto" />
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalOffsetKg} kg</div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">CO₂ Offset</p>
            </CardContent>
          </Card>
          
          <Card hoverable={true} className="bg-white/[0.01]">
            <CardContent className="pt-6 text-center space-y-2">
              <DollarSign className="h-6 w-6 text-stellar-green mx-auto" />
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalPayout} XLM</div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Paid to Planters</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section className="mx-auto max-w-5xl space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl text-white">How It Works</h2>
          <p className="text-sm text-slate-400">Decentralized trust managed entirely by smart contracts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <Card className="bg-white/[0.02] border-white/10" hoverable={false}>
            <CardHeader className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stellar-cyan/10 text-stellar-cyan">
                1
              </div>
              <CardTitle className="text-lg">Sponsor Depositing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Sponsor selects tree species, region, and planter. XLM or USDC funds are locked into a secure <strong>Soroban Escrow Contract</strong> on-chain.
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/10" hoverable={false}>
            <CardHeader className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stellar-blue/10 text-stellar-blue">
                2
              </div>
              <CardTitle className="text-lg">Planter Planting</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Planter receives the order, plants the tree in the real world, and uploads GPS coordinates + photo proof to the platform.
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/10" hoverable={false}>
            <CardHeader className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stellar-green/10 text-stellar-green">
                3
              </div>
              <CardTitle className="text-lg">Verification & Pay</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Upon coordinate/photo verification, the Escrow Contract releases the funds directly to the planter's wallet instantly with no middleman.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Grid Table */}
      <section className="mx-auto max-w-5xl space-y-8">
        <h2 className="text-2xl font-bold text-center text-white">Platform Features</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <div className="grid grid-cols-3 bg-white/5 p-4 text-xs uppercase tracking-wider font-semibold text-slate-400">
            <div>Feature</div>
            <div className="col-span-2">Description</div>
          </div>
          <div className="divide-y divide-white/5 text-sm">
            <div className="grid grid-cols-3 p-4">
              <div className="font-bold text-white flex items-center gap-2">
                <Leaf className="h-4 w-4 text-stellar-green" /> Sponsor a Tree
              </div>
              <div className="col-span-2 text-slate-300">Pay registered local planters directly to plant trees on your behalf.</div>
            </div>
            <div className="grid grid-cols-3 p-4">
              <div className="font-bold text-white flex items-center gap-2">
                <Heart className="h-4 w-4 text-stellar-cyan" /> Anonymous Options
              </div>
              <div className="col-span-2 text-slate-300">Make immediate one-time donations without creating an account.</div>
            </div>
            <div className="grid grid-cols-3 p-4">
              <div className="font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-stellar-blue" /> Smart Escrow
              </div>
              <div className="col-span-2 text-slate-300">Your funds are protected. Planters are paid only when real progress is verified.</div>
            </div>
            <div className="grid grid-cols-3 p-4">
              <div className="font-bold text-white flex items-center gap-2">
                <Map className="h-4 w-4 text-stellar-green" /> GPS + Photo Tracking
              </div>
              <div className="col-span-2 text-slate-300">Every tree receives a unique ID, showing real coordinates and photos of its growth.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation CTA Cards */}
      <section className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-stellar-navy to-stellar-purple/20 p-6 flex flex-col justify-between hover:border-stellar-purple/50 transition-all duration-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Grow Your Forest</h3>
            <p className="text-sm text-slate-300 mb-6">
              Sponsor individual trees, select specific planting regions, and start generating certified carbon offsets.
            </p>
          </div>
          <Link href="/sponsor" className="inline-flex items-center text-sm font-semibold text-stellar-cyan hover:underline">
            Go to Sponsoring Portal <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-stellar-navy to-stellar-green/20 p-6 flex flex-col justify-between hover:border-stellar-green/50 transition-all duration-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Are you a Planter?</h3>
            <p className="text-sm text-slate-300 mb-6">
              Register your local community group or farm. Upload planting proof and receive automated payments instantly.
            </p>
          </div>
          <Link href="/planters" className="inline-flex items-center text-sm font-semibold text-stellar-green hover:underline">
            Go to Planter Portal <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
