# 🌱 Stellar Canopy — Plant Trees. Track Impact. Offset Carbon.

[![CI Build](https://github.com/jessicanath/stellar-canopy-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/jessicanath/stellar-canopy-platform/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-purple.svg)](https://stellar.org)

**Stellar Canopy** connects global tree sponsors with on-the-ground planters (farmers, community groups, individuals) through a transparent, blockchain-backed payment system built on the Stellar network using Soroban smart contracts.

---

## 📖 What is Stellar Canopy?

Through Stellar Canopy, sponsors can fund local planters to restore forests. The funds are held in secure, smart-contract escrows and released instantly to the planter's wallet the moment they submit verified real-world proof (GPS coordinates and photo updates) of tree growth.

### Core Ecosystem Roles:
- **Sponsors**: fund tree planting projects, view live growth milestones, and trace their cumulative carbon offset. Sponsoring can be tracked via a connected wallet or done anonymously.
- **Planters**: register on-chain, claim planting assignments in their biome, and upload timestamped photo and GPS proof to trigger automated payments.
- **Verifiers**: trustless verifiers (or decentralized DAOs) approve submitted planting proofs to release locked escrow funds.

---

## ⚙️ How It Works

```
Sponsor                    Canopy Platform                  Planter
  │                               │                            │
  │── Choose species, quantity ──>│                            │
  │── Deposit XLM / USDC ────────>│                            │
  │                               │── Escrow Funds in Contract ──>│
  │                               │                            │── Plants tree
  │                               │                            │── Uploads GPS + Photo
  │                               │<── Submits proof ──────────│
  │<── Updates carbon dashboard ──│                            │
  │                               │── Releases escrow payment ──>│
```

---

## 🛠️ Smart Contracts

Our smart contracts are located in the `contracts/` directory and built using **Soroban Rust SDK**:

- **`tree_registry`**: Mints and tracks unique tree metadata records (species, planter, sponsor, coordinates, IPFS photo hash, status).
- **`escrow`**: Holds sponsor funds on-chain and releases payments to planters upon successful verification, with built-in refund options.
- **`planter_registry`**: Manages registered planters' profiles, biomes, and on-chain reputation scores.
- **`carbon_credits`**: Calculates and logs CO₂ sequestration statistics per sponsor wallet.
- **`governance`**: Configures authorized verifiers and platform parameters (e.g. platform fees).

---

## 💻 Frontend Tech Stack

Our frontend is engineered to be a Progressive Web App (PWA) with atomic design principles:

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 (Stellar brand variables)
- **Language**: TypeScript (strict mode)
- **State/Integration**: Freighter Wallet API + synced LocalStorage offline simulator
- **Charts**: Recharts (Carbon Sequestration projections)
- **Animations**: Framer Motion

### Stellar Design Tokens
Defined in `src/app/globals.css`:
- **Stellar Blue**: `#14B6E7` (`bg-stellar-blue`)
- **Stellar Purple**: `#3E1BDB` (`bg-stellar-purple`)
- **Stellar Navy**: `#0D0B21` (`bg-stellar-navy`)
- **Stellar Cyan**: `#00C2FF` (`bg-stellar-cyan`)
- **Stellar Green**: `#00B36B` (`bg-stellar-green`)

---

## 🚀 Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/stellar-canopy/canopy.git
   cd canopy
   ```
2. Install frontend dependencies:
   ```bash
   pnpm install
   ```

### Compile Smart Contracts
Build the Soroban WASM targets:
```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

### Run Frontend
Start the local server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📱 Progressive Web App (PWA)

Stellar Canopy is fully audit-compliant for PWA standards:
- **Installable**: Adds to the home screen of mobile and desktop devices.
- **Offline Capability**: Cached service workers ensure the interface loads offline.
- **Responsive**: Tailored for both desktop and mobile screens.

Build production version and test:
```bash
pnpm build
pnpm start
```

---

## 📄 License
This project is open source and licensed under the [Apache License 2.0](LICENSE).
