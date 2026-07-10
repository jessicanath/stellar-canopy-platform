"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Tree } from "@/lib/stellar";

interface ImpactChartsProps {
  trees: Tree[];
}

const COLORS = ["#00C2FF", "#00B36B", "#3E1BDB", "#14B6E7"];

export function ImpactCharts({ trees }: ImpactChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-slate-500 bg-white/5 rounded-2xl">
        Loading charts...
      </div>
    );
  }

  // 1. Calculate species distribution
  const speciesCounts: Record<string, number> = {};
  trees.forEach((t) => {
    speciesCounts[t.species] = (speciesCounts[t.species] || 0) + 1;
  });

  const pieData = Object.keys(speciesCounts).map((key) => ({
    name: key,
    value: speciesCounts[key],
  }));

  // 2. Generate carbon offset over time (last 6 months simulation)
  // Teak = 22, Moringa = 9, Eucalyptus = 31, Mangrove = 14
  const getOffsetVal = (species: string) => {
    if (species === "Teak") return 22;
    if (species === "Moringa") return 9;
    if (species === "Eucalyptus") return 31;
    if (species === "Mangrove") return 14;
    return 15;
  };

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleString("default", { month: "short" });
  });

  // Calculate cumulative offsets per month
  const areaData = months.map((month, index) => {
    const targetMonth = (now.getMonth() - (5 - index) + 12) % 12;
    const treesUpToMonth = trees.filter((t) => {
      const treeDate = new Date(t.creationTime);
      return (
        treeDate.getFullYear() < now.getFullYear() ||
        (treeDate.getFullYear() === now.getFullYear() && treeDate.getMonth() <= targetMonth)
      );
    });

    const totalOffset = treesUpToMonth
      .filter((t) => t.status === "Verified")
      .reduce((sum, t) => sum + getOffsetVal(t.species), 0);

    return {
      month,
      "CO₂ Offset (kg)": totalOffset,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Carbon Offset Area Chart */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          CO₂ Offset Cumulative Growth
        </h3>
        <div className="h-64 w-full">
          {trees.filter((t) => t.status === "Verified").length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No verified trees to display offset metrics.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOffset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B36B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00B36B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D0B21",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="CO₂ Offset (kg)"
                  stroke="#00B36B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOffset)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Species Pie Chart */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Sponsorship Tree Species Split
        </h3>
        <div className="h-64 w-full">
          {trees.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No sponsored trees yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D0B21",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
