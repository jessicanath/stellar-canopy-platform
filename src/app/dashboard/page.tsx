"use client";

import React, { useState, useEffect } from "react";
import { Tree, getTrees, getActiveWallet, getCarbonOffsetStats } from "@/lib/stellar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/Card";
import { Badge } from "@/components/atoms/Badge";
import { ImpactCharts } from "@/components/organisms/ImpactCharts";
import { Leaf, BarChart2, Eye, MapPin, Calendar, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [offsetStats, setOffsetStats] = useState({
    sponsor: "",
    totalTrees: 0,
    totalOffsetKg: 0,
  });
  const [filter, setFilter] = useState<"All" | "Sponsored" | "Planted" | "Verified">("All");

  const refreshData = async (activeWallet: string | null) => {
    try {
      const allTrees = await getTrees();
      
      if (activeWallet) {
        // Filter trees sponsored by this wallet
        const sponsored = allTrees.filter(t => t.sponsor === activeWallet);
        setTrees(sponsored);
        
        const stats = await getCarbonOffsetStats(activeWallet);
        setOffsetStats(stats);
      } else {
        // If wallet not connected, show the seeded demo data for the first sponsor GD2C...8PQR
        const demoWallet = "GD2C...8PQR";
        const sponsored = allTrees.filter(t => t.sponsor === demoWallet);
        setTrees(sponsored);
        
        const stats = await getCarbonOffsetStats(demoWallet);
        setOffsetStats(stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const active = getActiveWallet();
    setWallet(active);
    refreshData(active);

    const handleWalletUpdate = () => {
      const current = getActiveWallet();
      setWallet(current);
      refreshData(current);
    };
    window.addEventListener("stellar-wallet-changed", handleWalletUpdate);
    return () => {
      window.removeEventListener("stellar-wallet-changed", handleWalletUpdate);
    };
  }, []);

  const filteredTrees = trees.filter(
    (t) => filter === "All" || t.status === filter
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
          Impact Dashboard
        </h1>
        <p className="text-lg text-slate-300">
          {!wallet
            ? "Showing platform demo data. Connect your wallet to view your personalized carbon offset metrics."
            : `Tracking impact metrics for wallet: ${wallet.slice(0, 8)}...${wallet.slice(-6)}`}
        </p>
      </div>

      {/* Carbon Offset Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="border-stellar-green/30 bg-stellar-green/[0.01]">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Trees Sponsored</span>
              <div className="text-4xl font-extrabold text-white">{offsetStats.totalTrees}</div>
            </div>
            <Leaf className="h-10 w-10 text-stellar-green" />
          </CardContent>
        </Card>

        <Card className="border-stellar-cyan/30 bg-stellar-cyan/[0.01]">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Cumulative CO₂ Offset</span>
              <div className="text-4xl font-extrabold text-white">
                {offsetStats.totalOffsetKg.toLocaleString()} kg/yr
              </div>
            </div>
            <BarChart2 className="h-10 w-10 text-stellar-cyan" />
          </CardContent>
        </Card>
      </div>

      {/* Recharts Visualization */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-stellar-blue" />
          Real-Time Sequestration Projections
        </h2>
        <ImpactCharts trees={trees} />
      </section>

      {/* Tree Portfolio Table */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-stellar-green" />
            Your Forest Portfolio ({filteredTrees.length})
          </h2>

          {/* Filter Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            {(["All", "Sponsored", "Planted", "Verified"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filter === tab
                    ? "bg-stellar-green text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTrees.length === 0 ? (
          <Card className="text-center p-8 bg-white/[0.01]">
            <CardContent className="text-slate-400 pt-6">
              No trees matching the active status filter.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTrees.map((tree) => (
              <Card key={tree.id} className="border-white/10 bg-white/[0.02]" hoverable={true}>
                <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-stellar-cyan">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-md">Tree #{tree.id}</span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300">
                          {tree.species}
                        </span>
                        <Badge status={tree.status} />
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-stellar-cyan" />
                        {tree.location}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        Planter: {tree.planter.slice(0, 6)}...{tree.planter.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-between gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(tree.creationTime).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-bold text-stellar-cyan">
                        {tree.amount} XLM
                      </span>
                    </div>

                    {tree.photoIpfs && (
                      <a
                        href={`https://ipfs.io/ipfs/${tree.photoIpfs}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-stellar-cyan hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Photo Proof (IPFS)
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
