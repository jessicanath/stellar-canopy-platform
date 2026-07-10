"use client";

import React, { useState, useEffect } from "react";
import { Tree, Planter, getPlanters, sponsorTree, getActiveWallet } from "@/lib/stellar";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/Card";
import { Leaf, MapPin, DollarSign, BarChart } from "lucide-react";

interface SpeciesOption {
  name: string;
  price: number;
  offset: number; // kg per year
  maturity: string;
}

const SPECIES_OPTIONS: SpeciesOption[] = [
  { name: "Moringa", price: 50, offset: 9, maturity: "3 years" },
  { name: "Mangrove", price: 100, offset: 14, maturity: "15 years" },
  { name: "Teak", price: 150, offset: 22, maturity: "20 years" },
  { name: "Eucalyptus", price: 200, offset: 31, maturity: "10 years" },
];

const REGIONS = [
  { id: "west-africa", name: "West Africa (Ghana/Ivory Coast)" },
  { id: "southeast-asia", name: "Southeast Asia (Indonesia/Vietnam)" },
  { id: "south-america", name: "South America (Amazon/Andes)" },
  { id: "australia", name: "Australia (Queensland/Tasmania)" },
];

export function SponsorForm() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesOption>(SPECIES_OPTIONS[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [planters, setPlanters] = useState<Planter[]>([]);
  const [selectedPlanter, setSelectedPlanter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const active = getActiveWallet();
    setWalletConnected(!!active);

    const loadPlanters = async () => {
      try {
        const list = await getPlanters();
        setPlanters(list);
        if (list.length > 0) {
          // Default to first planter
          setSelectedPlanter(list[0].wallet);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadPlanters();

    const handleWalletUpdate = () => {
      setWalletConnected(!!getActiveWallet());
    };
    window.addEventListener("stellar-wallet-changed", handleWalletUpdate);
    return () => {
      window.removeEventListener("stellar-wallet-changed", handleWalletUpdate);
    };
  }, []);

  const totalCost = selectedSpecies.price * quantity;
  const estimatedOffset = selectedSpecies.offset * quantity;

  const handleSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      setErrorMsg("Please connect your Stellar wallet via the header first.");
      return;
    }
    if (!selectedPlanter) {
      setErrorMsg("No registered planter available for the job.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      await sponsorTree(
        selectedSpecies.name,
        quantity,
        selectedRegion.name,
        selectedSpecies.price,
        selectedPlanter
      );
      
      setSuccess(true);
      window.dispatchEvent(new Event("stellar-wallet-changed")); // Notify header to reload balance
    } catch (err: any) {
      setErrorMsg(err.message || "Escrow transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto border-white/10 bg-white/[0.02]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-stellar-cyan to-stellar-green bg-clip-text text-transparent flex items-center gap-2">
          <Leaf className="h-6 w-6 text-stellar-green" />
          Sponsor Tree Planting
        </CardTitle>
        <CardDescription>
          Lock funds into a Soroban smart escrow. Planters are paid only when they submit verified GPS & photo proof.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="rounded-2xl bg-stellar-green/10 border border-stellar-green/30 p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-stellar-green">Escrow Locked Successfully!</h3>
            <p className="text-sm text-slate-300">
              You sponsored <strong>{quantity}x {selectedSpecies.name}</strong> trees in <strong>{selectedRegion.name}</strong>.
              The funds ({totalCost} XLM) are now securely locked in the smart contract escrow.
            </p>
            <p className="text-xs text-slate-400">
              Assigned Planter: <span className="font-mono text-stellar-cyan">{selectedPlanter.slice(0, 8)}...{selectedPlanter.slice(-6)}</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSuccess(false);
                setQuantity(1);
              }}
              className="mt-2"
            >
              Sponsor More Trees
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSponsor} className="space-y-6">
            {/* Species Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Select Tree Species
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SPECIES_OPTIONS.map((opt) => (
                  <div
                    key={opt.name}
                    onClick={() => setSelectedSpecies(opt)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 flex flex-col ${
                      selectedSpecies.name === opt.name
                        ? "border-stellar-green bg-stellar-green/10 shadow-lg shadow-stellar-green/5"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="font-bold text-white">{opt.name}</span>
                    <span className="text-xs text-slate-400 mt-1">CO₂/yr: {opt.offset} kg</span>
                    <span className="text-xs text-slate-400">Maturity: {opt.maturity}</span>
                    <span className="text-sm font-bold text-stellar-cyan mt-3">{opt.price} XLM</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Region Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                2. Select Planting Region
              </label>
              <div className="grid grid-cols-1 gap-2">
                {REGIONS.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedRegion(reg)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-300 flex items-center justify-between ${
                      selectedRegion.id === reg.id
                        ? "border-stellar-blue bg-stellar-blue/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-stellar-cyan" />
                      {reg.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Planter Assign */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. Designated Planter
              </label>
              <select
                value={selectedPlanter}
                onChange={(e) => setSelectedPlanter(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-stellar-blue/50 focus:bg-white/10 focus:outline-none"
              >
                {planters.map((p) => (
                  <option key={p.wallet} value={p.wallet} className="bg-stellar-navy text-white">
                    {p.name} ({p.region}) — Rep: {p.reputation}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Input
                label="4. Number of Trees to Plant"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            {/* Cost and Impact Summary */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-stellar-cyan" />
                  Total Escrow Deposit
                </span>
                <span className="text-xl font-bold text-stellar-cyan">{totalCost} XLM</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-stellar-green" />
                  Estimated CO₂ Offset
                </span>
                <span className="text-md font-bold text-stellar-green">{estimatedOffset} kg / year</span>
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              variant="stellar"
              className="w-full justify-center py-4 text-md"
              isLoading={loading}
            >
              Lock Funds in Escrow & Sponsor
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
