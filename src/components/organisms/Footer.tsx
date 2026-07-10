import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-stellar-navy/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-stellar-cyan to-stellar-green text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              Stellar Canopy
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-400">
            <Link href="/sponsor" className="hover:text-white transition-colors">
              Sponsor
            </Link>
            <Link href="/planters" className="hover:text-white transition-colors">
              Planters
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Stellar Network
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Stellar Canopy. Open Source contribution to the Stellar Ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
