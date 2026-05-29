/**
 * Streaming-payroll tuning.
 *
 * Salary accrues every second and is settled on-chain on a short interval —
 * each settlement is a real USDC transfer on Arc, so a one-minute stream
 * naturally produces dozens of verifiable on-chain transactions. This is the
 * shape Circle Nanopayments productionises (gas-free, sub-cent, batched
 * settlement of EIP-3009 authorisations); on Arc testnet, where gas is USDC and
 * finality is sub-second, the per-tick transfer stands in for that batching and
 * keeps every settlement independently auditable on ArcScan.
 *
 * No `server-only` here: the client streaming UI imports these constants too.
 */

/** Demo accrual rate — the canonical "$0.001 / second worked" from RESEARCH.md. */
export const STREAM_RATE_USDC_PER_SEC = 0.001;

/** How often accrued pay is flushed on-chain. Lower = more txs, more API load. */
export const STREAM_SETTLE_INTERVAL_MS = 3000;

/** Don't fire a transfer for less than this (avoids dust + needless API calls). */
export const STREAM_MIN_SETTLE_USDC = 0.001;

/** Safety cap so a forgotten stream can't drain the treasury. */
export const STREAM_MAX_DURATION_MS = 120_000;

/** Format a small USDC amount with fixed precision (streaming shows sub-cent). */
export function formatUsdcFine(n: number, dp = 4): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/** Round down to USDC's 6-decimal precision (never over-pay vs. accrued). */
export function floorUsdc6(n: number): number {
  return Math.floor(n * 1e6) / 1e6;
}
