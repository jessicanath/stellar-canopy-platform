/**
 * Stellar & Soroban smart contract integration client.
 * Provides Freighter Wallet integration and a robust, state-synchronized fallback simulation
 * (stored in LocalStorage) for offline capability, conforming to PWA standards.
 */

import { isConnected, getAddress, signTransaction } from "@stellar/freighter-api";

export interface Tree {
  id: number;
  species: string;
  planter: string;
  sponsor: string;
  location: string;
  photoIpfs: string;
  status: "Sponsored" | "Planted" | "Verified";
  amount: number; // XLM amount locked
  creationTime: number;
}

export interface Planter {
  wallet: string;
  name: string;
  region: string;
  reputation: number;
  active: boolean;
}

export interface CarbonOffset {
  sponsor: string;
  totalTrees: number;
  totalOffsetKg: number;
}

// Initial Mock Data to seed the application
const DEFAULT_TREES: Tree[] = [
  {
    id: 1,
    species: "Teak",
    planter: "GB7B...3KLA",
    sponsor: "GD2C...8PQR",
    location: "5.345, -4.024 (Ivory Coast)",
    photoIpfs: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    status: "Verified",
    amount: 150,
    creationTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  },
  {
    id: 2,
    species: "Mangrove",
    planter: "GC4A...5XYZ",
    sponsor: "GD2C...8PQR",
    location: "-8.342, 115.124 (Bali, Indonesia)",
    photoIpfs: "QmT5NvUtoM5mTf2A91wW3QG852f6xN2eF6X7vS4Z3d9k",
    status: "Planted",
    amount: 100,
    creationTime: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
  },
  {
    id: 3,
    species: "Eucalyptus",
    planter: "GB7B...3KLA",
    sponsor: "GD2C...8PQR",
    location: "-33.868, 151.209 (Sydney, Australia)",
    photoIpfs: "",
    status: "Sponsored",
    amount: 200,
    creationTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
  }
];

const DEFAULT_PLANTERS: Planter[] = [
  {
    wallet: "GB7B...3KLA",
    name: "Kwame Mensah",
    region: "West Africa",
    reputation: 110,
    active: true,
  },
  {
    wallet: "GC4A...5XYZ",
    name: "Kadek Budiasa",
    region: "Southeast Asia",
    reputation: 105,
    active: true,
  }
];

const CO2_COEFFICIENTS: Record<string, number> = {
  Teak: 22,
  Moringa: 9,
  Eucalyptus: 31,
  Mangrove: 14,
};

// LocalStorage helpers to simulate smart contract state
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/**
 * Wallet API wrapper.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await isConnected();
    return !!res.isConnected;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<string> {
  const installed = await isFreighterInstalled();
  if (installed) {
    try {
      const res = await getAddress();
      if (res && res.address) {
        setStorageItem("canopy_active_wallet", res.address);
        return res.address;
      }
    } catch (e) {
      console.warn("Freighter connection rejected, using simulated wallet.", e);
    }
  }

  // Fallback / simulated wallet
  let simulatedWallet = getStorageItem<string | null>("canopy_simulated_wallet", null);
  if (!simulatedWallet) {
    // Generate a random mock Stellar address
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let mockAddr = "GD";
    for (let i = 0; i < 54; i++) {
      mockAddr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    simulatedWallet = mockAddr;
    setStorageItem("canopy_simulated_wallet", simulatedWallet);
  }
  setStorageItem("canopy_active_wallet", simulatedWallet);
  return simulatedWallet;
}

export async function disconnectWallet(): Promise<void> {
  setStorageItem("canopy_active_wallet", null);
}

export function getActiveWallet(): string | null {
  return getStorageItem<string | null>("canopy_active_wallet", null);
}

export async function getWalletBalance(publicKey: string): Promise<number> {
  // If it's a simulated wallet, return a simulated balance
  if (publicKey.startsWith("GD") && publicKey.length === 56) {
    const balances = getStorageItem<Record<string, number>>("canopy_wallet_balances", {});
    if (balances[publicKey] === undefined) {
      balances[publicKey] = 1000.0; // Gift 1000 XLM initially
      setStorageItem("canopy_wallet_balances", balances);
    }
    return balances[publicKey];
  }
  return 0;
}

export async function deductWalletBalance(publicKey: string, amount: number): Promise<void> {
  if (publicKey.startsWith("GD") && publicKey.length === 56) {
    const balances = getStorageItem<Record<string, number>>("canopy_wallet_balances", {});
    const current = balances[publicKey] ?? 1000.0;
    balances[publicKey] = Math.max(0, current - amount);
    setStorageItem("canopy_wallet_balances", balances);
  }
}

export async function addWalletBalance(publicKey: string, amount: number): Promise<void> {
  if (publicKey.startsWith("GD") && publicKey.length === 56) {
    const balances = getStorageItem<Record<string, number>>("canopy_wallet_balances", {});
    const current = balances[publicKey] ?? 1000.0;
    balances[publicKey] = current + amount;
    setStorageItem("canopy_wallet_balances", balances);
  }
}

/**
 * Smart Contract - Tree Registry & Escrow Simulation
 */
export async function getTrees(): Promise<Tree[]> {
  return getStorageItem<Tree[]>("canopy_trees", DEFAULT_TREES);
}

export async function sponsorTree(
  species: string,
  quantity: number,
  region: string,
  amountPerTree: number,
  planterWallet: string
): Promise<Tree[]> {
  const wallet = getActiveWallet();
  if (!wallet) throw new Error("Wallet not connected");

  const totalCost = amountPerTree * quantity;
  const balance = await getWalletBalance(wallet);
  if (balance < totalCost) throw new Error("Insufficient funds in wallet");

  // Deduct funds
  await deductWalletBalance(wallet, totalCost);

  const currentTrees = await getTrees();
  const newTrees: Tree[] = [];

  for (let i = 0; i < quantity; i++) {
    const treeId = currentTrees.length + newTrees.length + 1;
    newTrees.push({
      id: treeId,
      species,
      planter: planterWallet,
      sponsor: wallet,
      location: `Pending location in ${region}`,
      photoIpfs: "",
      status: "Sponsored",
      amount: amountPerTree,
      creationTime: Date.now(),
    });
  }

  const updatedTrees = [...currentTrees, ...newTrees];
  setStorageItem("canopy_trees", updatedTrees);
  
  // Also initiate escrow lock record
  const escrows = getStorageItem<Record<number, string>>("canopy_escrow_locks", {});
  newTrees.forEach(t => {
    escrows[t.id] = "Locked";
  });
  setStorageItem("canopy_escrow_locks", escrows);

  return updatedTrees;
}

/**
 * Smart Contract - Planter Registry Simulation
 */
export async function getPlanters(): Promise<Planter[]> {
  return getStorageItem<Planter[]>("canopy_planters", DEFAULT_PLANTERS);
}

export async function registerPlanter(name: string, region: string): Promise<Planter> {
  const wallet = getActiveWallet();
  if (!wallet) throw new Error("Wallet not connected");

  const planters = await getPlanters();
  if (planters.some(p => p.wallet === wallet)) {
    throw new Error("Planter already registered with this wallet");
  }

  const newPlanter: Planter = {
    wallet,
    name,
    region,
    reputation: 100,
    active: true,
  };

  setStorageItem("canopy_planters", [...planters, newPlanter]);
  return newPlanter;
}

export async function getPlanter(wallet: string): Promise<Planter | null> {
  const planters = await getPlanters();
  return planters.find(p => p.wallet === wallet) || null;
}

/**
 * Smart Contract - Escrow & Verification Release Flow
 */
export async function planterUploadProgress(
  treeId: number,
  photoIpfs: string,
  location: string
): Promise<Tree> {
  const wallet = getActiveWallet();
  if (!wallet) throw new Error("Wallet not connected");

  const trees = await getTrees();
  const treeIndex = trees.findIndex(t => t.id === treeId);
  if (treeIndex === -1) throw new Error("Tree not found");
  if (trees[treeIndex].planter !== wallet) throw new Error("You are not the designated planter for this tree");
  if (trees[treeIndex].status !== "Sponsored") throw new Error("Tree progress was already updated");

  // Move status to "Planted"
  trees[treeIndex].status = "Planted";
  trees[treeIndex].photoIpfs = photoIpfs;
  trees[treeIndex].location = location;

  setStorageItem("canopy_trees", trees);
  return trees[treeIndex];
}

export async function verifyTreeAndReleaseEscrow(treeId: number): Promise<Tree> {
  // Verify tree (simulated by admin/verifier, releases contract funds)
  const trees = await getTrees();
  const treeIndex = trees.findIndex(t => t.id === treeId);
  if (treeIndex === -1) throw new Error("Tree not found");
  
  const tree = trees[treeIndex];
  if (tree.status !== "Planted") throw new Error("Tree must be marked as Planted before verification");

  // Release payment from escrow to planter wallet
  await addWalletBalance(tree.planter, tree.amount);

  // Update tree status to "Verified"
  trees[treeIndex].status = "Verified";
  setStorageItem("canopy_trees", trees);

  // Mark escrow as released
  const escrows = getStorageItem<Record<number, string>>("canopy_escrow_locks", {});
  escrows[treeId] = "Released";
  setStorageItem("canopy_escrow_locks", escrows);

  // Increment planter reputation
  const planters = await getPlanters();
  const planterIndex = planters.findIndex(p => p.wallet === tree.planter);
  if (planterIndex !== -1) {
    planters[planterIndex].reputation += 10;
    setStorageItem("canopy_planters", planters);
  }

  // Update Carbon offset
  const offsetDb = getStorageItem<Record<string, CarbonOffset>>("canopy_carbon_credits", {});
  const currentOffset = offsetDb[tree.sponsor] ?? {
    sponsor: tree.sponsor,
    totalTrees: 0,
    totalOffsetKg: 0,
  };
  
  const annualSequestration = CO2_COEFFICIENTS[tree.species] ?? 15;
  currentOffset.totalTrees += 1;
  currentOffset.totalOffsetKg += annualSequestration; // Add one year's sequestration value
  offsetDb[tree.sponsor] = currentOffset;
  setStorageItem("canopy_carbon_credits", offsetDb);

  return trees[treeIndex];
}

/**
 * Carbon Offset Queries
 */
export async function getCarbonOffsetStats(sponsorWallet: string): Promise<CarbonOffset> {
  const offsetDb = getStorageItem<Record<string, CarbonOffset>>("canopy_carbon_credits", {});
  return offsetDb[sponsorWallet] ?? {
    sponsor: sponsorWallet,
    totalTrees: 0,
    totalOffsetKg: 0,
  };
}

export async function getGlobalStats() {
  const trees = await getTrees();
  const planters = await getPlanters();

  const totalTrees = trees.length;
  const verifiedTrees = trees.filter(t => t.status === "Verified").length;
  const totalOffsetKg = trees
    .filter(t => t.status === "Verified")
    .reduce((sum, t) => sum + (CO2_COEFFICIENTS[t.species] ?? 15), 0);
  
  const totalPayout = trees
    .filter(t => t.status === "Verified")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalTrees,
    verifiedTrees,
    totalOffsetKg,
    totalPayout,
    activePlanters: planters.length,
  };
}

/**
 * DEV NOTE: PRODUCTION STELLAR DEPLOYMENT REFERENCE
 *
 * For deploying to Soroban, your smart contracts are compiled to WASM and then you execute:
 *
 * import { Contract, Horizon, Keypair, TransactionBuilder, Networks } from "@stellar/stellar-sdk";
 *
 * const server = new Horizon.Server("https://horizon-testnet.stellar.org");
 * const contractId = "CC...YOUR_CONTRACT_ID";
 * const contract = new Contract(contractId);
 *
 * // Preparing an invocation:
 * const tx = new TransactionBuilder(account, { fee: "100" })
 *   .addOperation(contract.call("mint_tree", ...args))
 *   .build();
 *
 * // Sign with Freighter:
 * const signedTx = await signTransaction(tx.toXDR());
 */
