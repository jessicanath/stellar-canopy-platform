"use client";

import React, { useState, useEffect } from "react";
import {
  Tree,
  Planter,
  getPlanter,
  registerPlanter,
  getTrees,
  planterUploadProgress,
  verifyTreeAndReleaseEscrow,
  getActiveWallet,
  getWalletBalance,
} from "@/lib/stellar";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/Card";
import { Badge } from "@/components/atoms/Badge";
import { User, MapPin, Camera, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

export function PlanterForm() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [planter, setPlanter] = useState<Planter | null>(null);
  
  // Registration Form
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [registering, setRegistering] = useState(false);
  
  // Tree Jobs
  const [assignedTrees, setAssignedTrees] = useState<Tree[]>([]);
  const [updatingTreeId, setUpdatingTreeId] = useState<number | null>(null);
  const [gpsCoords, setGpsCoords] = useState("");
  const [photoHash, setPhotoHash] = useState("");
  
  // Verifier State
  const [verifyingTreeId, setVerifyingTreeId] = useState<number | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const refreshState = async (activeWallet: string) => {
    try {
      const p = await getPlanter(activeWallet);
      setPlanter(p);
      
      const bal = await getWalletBalance(activeWallet);
      setBalance(bal);
      
      const allTrees = await getTrees();
      // Filter trees assigned to this planter
      const assigned = allTrees.filter(
        t => t.planter === activeWallet || (p && t.planter === p.wallet)
      );
      setAssignedTrees(assigned);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const active = getActiveWallet();
    setWallet(active);
    if (active) {
      refreshState(active);
    }

    const handleWalletUpdate = () => {
      const current = getActiveWallet();
      setWallet(current);
      if (current) {
        refreshState(current);
      } else {
        setPlanter(null);
        setAssignedTrees([]);
      }
    };
    window.addEventListener("stellar-wallet-changed", handleWalletUpdate);
    return () => {
      window.removeEventListener("stellar-wallet-changed", handleWalletUpdate);
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    if (!name || !region) {
      setErrorMsg("Please fill out all fields.");
      return;
    }
    
    setRegistering(true);
    setErrorMsg("");
    try {
      const newPlanter = await registerPlanter(name, region);
      setPlanter(newPlanter);
      setSuccessMsg("Successfully registered on-chain!");
      await refreshState(wallet);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const handleJobSubmit = async (treeId: number) => {
    if (!gpsCoords) {
      setErrorMsg("GPS coordinates are required to submit proof.");
      return;
    }
    
    const mockHash = photoHash || "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    setErrorMsg("");
    setUpdatingTreeId(treeId);
    try {
      await planterUploadProgress(treeId, mockHash, gpsCoords);
      setSuccessMsg("Tree planting update submitted to smart contract! Pending verification.");
      setGpsCoords("");
      setPhotoHash("");
      if (wallet) {
        await refreshState(wallet);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Progress submission failed.");
    } finally {
      setUpdatingTreeId(null);
    }
  };

  const handleSimulateVerification = async (treeId: number) => {
    setErrorMsg("");
    setVerifyingTreeId(treeId);
    try {
      await verifyTreeAndReleaseEscrow(treeId);
      setSuccessMsg("Verifier approved! Escrow payment released to planter's wallet.");
      if (wallet) {
        await refreshState(wallet);
      }
      // Send event to header to reload balance
      window.dispatchEvent(new Event("stellar-wallet-changed"));
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed.");
    } finally {
      setVerifyingTreeId(null);
    }
  };

  if (!wallet) {
    return (
      <Card className="text-center p-8 max-w-lg mx-auto">
        <CardContent className="space-y-4 pt-6">
          <HelpCircle className="h-12 w-12 text-stellar-cyan mx-auto animate-bounce" />
          <h2 className="text-xl font-bold">Wallet Not Connected</h2>
          <p className="text-sm text-slate-400">
            Please connect your wallet in the navigation bar to register as a planter or view your planting assignments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Planter Status Card */}
      {!planter ? (
        <Card className="max-w-md mx-auto border-white/10 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-stellar-green" />
              Register as Planter
            </CardTitle>
            <CardDescription>
              Register your wallet on-chain to start claiming planting jobs and earning XLM/USDC payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name / Community Group Name"
                placeholder="e.g. Green Earth Farmers"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Primary Planting Region"
                placeholder="e.g. West Africa, Southeast Asia"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
              
              {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
              
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                isLoading={registering}
              >
                Register Planter Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-stellar-green/30 bg-stellar-green/[0.01]">
          <CardContent className="pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-stellar-green animate-pulse" />
                <h3 className="text-lg font-bold text-white">{planter.name}</h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-md text-slate-300">Planter</span>
              </div>
              <p className="text-xs text-slate-400">
                Wallet: <span className="font-mono text-stellar-cyan">{planter.wallet}</span>
              </p>
              <p className="text-xs text-slate-400">
                Region: <strong>{planter.region}</strong>
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center md:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Reputation Score</span>
                <div className="text-2xl font-bold text-stellar-green">{planter.reputation}</div>
              </div>
              <div className="text-center md:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Escrow Balance</span>
                <div className="text-2xl font-bold text-stellar-cyan">
                  {balance.toLocaleString(undefined, { minimumFractionDigits: 1 })} XLM
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Jobs list */}
      {planter && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-stellar-blue" />
            Your Planting Assignments ({assignedTrees.length})
          </h3>
          
          {successMsg && (
            <div className="rounded-xl bg-stellar-green/10 border border-stellar-green/20 p-3 text-sm text-stellar-green text-center">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
              {errorMsg}
            </div>
          )}

          {assignedTrees.length === 0 ? (
            <Card className="text-center p-8 bg-white/[0.01]">
              <CardContent className="text-slate-400 pt-6">
                No assignments found. Go to the <a href="/sponsor" className="text-stellar-cyan underline">Sponsor</a> tab to create a job and assign it to your wallet!
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedTrees.map((tree) => (
                <Card key={tree.id} className="border-white/10 bg-white/[0.02]" hoverable={false}>
                  <CardHeader className="flex flex-row justify-between items-center space-y-0 p-4 border-b border-white/5">
                    <div>
                      <CardTitle className="text-md font-bold">Tree #{tree.id}</CardTitle>
                      <CardDescription className="text-xs">{tree.species} Tree</CardDescription>
                    </div>
                    <Badge status={tree.status} />
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Escrow Value:</span>
                        <span className="font-bold text-stellar-cyan">{tree.amount} XLM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Location:</span>
                        <span className="text-xs text-white">{tree.location}</span>
                      </div>
                      {tree.photoIpfs && (
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Photo Hash:</span>
                          <span className="text-[10px] font-mono text-stellar-green truncate w-40 text-right">{tree.photoIpfs}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress upload form */}
                    {tree.status === "Sponsored" && (
                      <div className="pt-4 border-t border-white/5 space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5 text-stellar-cyan" />
                          Submit Real-World Proof
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="GPS (e.g. 5.12, -4.0)"
                            value={gpsCoords}
                            onChange={(e) => setGpsCoords(e.target.value)}
                            className="h-10 text-xs py-1 px-3"
                          />
                          <Input
                            placeholder="IPFS Photo Hash (Optional)"
                            value={photoHash}
                            onChange={(e) => setPhotoHash(e.target.value)}
                            className="h-10 text-xs py-1 px-3"
                          />
                        </div>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full h-10 text-xs"
                          onClick={() => handleJobSubmit(tree.id)}
                          isLoading={updatingTreeId === tree.id}
                        >
                          Submit Proof (Escrow Planted)
                        </Button>
                      </div>
                    )}

                    {/* Simulate Verification Panel (Escrow Release) */}
                    {tree.status === "Planted" && (
                      <div className="pt-4 border-t border-white/5 bg-stellar-blue/[0.02] rounded-xl p-3 border border-stellar-blue/20">
                        <h4 className="text-xs font-bold text-stellar-blue flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-stellar-blue" />
                          Verifier Approval Panel
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 mb-3">
                          Verify the planter's photo + GPS coordinates to trigger the Soroban smart contract escrow release.
                        </p>
                        <Button
                          variant="stellar"
                          size="sm"
                          className="w-full h-9 text-xs"
                          onClick={() => handleSimulateVerification(tree.id)}
                          isLoading={verifyingTreeId === tree.id}
                        >
                          Approve Verification & Release XLM
                        </Button>
                      </div>
                    )}

                    {tree.status === "Verified" && (
                      <div className="flex items-center gap-2 bg-stellar-green/10 text-stellar-green rounded-xl p-2.5 border border-stellar-green/20">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Funds Released. Sponsoring Cycle Complete.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
