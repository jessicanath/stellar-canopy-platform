"use client";

import React from "react";
import { PlanterForm } from "@/components/organisms/PlanterForm";

export default function PlantersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Planter Portal
          </h1>
          <p className="text-lg text-slate-300">
            Register as a local planter, view your active assignments, and submit coordinates and photo proof to unlock your escrow payments.
          </p>
        </div>

        <div className="pt-4">
          <PlanterForm />
        </div>
      </div>
    </div>
  );
}
