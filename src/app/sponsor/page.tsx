"use client";

import React from "react";
import { SponsorForm } from "@/components/organisms/SponsorForm";

export default function SponsorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Sponsor Tree Planting
          </h1>
          <p className="text-lg text-slate-300">
            Fund local planters to restore ecosystems. Your deposit is held in escrow until verification proof is submitted on-chain.
          </p>
        </div>

        <div className="pt-4">
          <SponsorForm />
        </div>
      </div>
    </div>
  );
}
