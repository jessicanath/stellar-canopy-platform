import type { Metadata, Viewport } from "next";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar Canopy — Plant Trees. Track Impact. Offset Carbon.",
  description: "A decentralized tree-planting platform on Stellar where anyone can pay farmers and individuals to plant trees, track progress via unique tree IDs, and verify carbon offsets using Soroban smart contracts.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Canopy",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0B21",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="application-name" content="Stellar Canopy" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stellar Canopy" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0D0B21" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-stellar-navy text-slate-100 antialiased">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
