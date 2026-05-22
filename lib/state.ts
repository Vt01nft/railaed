import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Tiny JSON-file-backed key-value store.
 * Good enough for a hackathon testnet demo where on-chain state is the
 * source of truth and this is just a local cache (claim records, payroll
 * runs, recipient metadata). NOT for production multi-instance use.
 */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

const STATE_FILE = path.resolve(process.cwd(), '.railaed-state.json');

interface StateShape {
  transfers: Record<
    string,
    {
      id: string;
      senderName: string;
      recipientPhone: string;
      recipientCountry: string;
      recipientWalletId: string;
      recipientAddress: string;
      amountUsdc: string;
      circleTxId: string;
      txHash?: string;
      createdAt: string;
      claimedAt?: string;
    }
  >;
  payrollRuns: Record<
    string,
    {
      id: string;
      employer: string;
      runAt: string;
      items: Array<{
        contractorName: string;
        country: string;
        walletId?: string;
        address: string;
        amountUsdc: string;
        circleTxId: string;
        txHash?: string;
        state: string;
      }>;
    }
  >;
  contractors: Array<{
    id: string;
    name: string;
    country: string;
    walletId?: string;
    address?: string;
    monthlyUsdc: string;
  }>;
}

const EMPTY: StateShape = { transfers: {}, payrollRuns: {}, contractors: [] };

let inMemory: StateShape | null = null;

async function load(): Promise<StateShape> {
  if (inMemory) return inMemory;
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    inMemory = JSON.parse(raw) as StateShape;
    // Backfill missing keys for forward compat.
    inMemory.transfers ??= {};
    inMemory.payrollRuns ??= {};
    inMemory.contractors ??= [];
    return inMemory;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      inMemory = structuredClone(EMPTY);
      return inMemory;
    }
    throw err;
  }
}

async function persist(s: StateShape): Promise<void> {
  inMemory = s;
  try {
    await fs.writeFile(STATE_FILE, JSON.stringify(s, null, 2), 'utf8');
  } catch {
    // On read-only filesystems (e.g. Vercel) fall back to in-memory only.
  }
}

export async function getTransfer(id: string) {
  const s = await load();
  return s.transfers[id];
}

export async function saveTransfer(t: StateShape['transfers'][string]) {
  const s = await load();
  s.transfers[t.id] = t;
  await persist(s);
}

export async function markClaimed(id: string) {
  const s = await load();
  const t = s.transfers[id];
  if (!t) return;
  t.claimedAt = new Date().toISOString();
  await persist(s);
}

export async function listTransfers() {
  const s = await load();
  return Object.values(s.transfers).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function savePayrollRun(r: StateShape['payrollRuns'][string]) {
  const s = await load();
  s.payrollRuns[r.id] = r;
  await persist(s);
}

export async function listPayrollRuns() {
  const s = await load();
  return Object.values(s.payrollRuns).sort((a, b) => b.runAt.localeCompare(a.runAt));
}

export async function getContractors() {
  const s = await load();
  return s.contractors;
}

export async function setContractors(rows: StateShape['contractors']) {
  const s = await load();
  s.contractors = rows;
  await persist(s);
}

export type { Json };
