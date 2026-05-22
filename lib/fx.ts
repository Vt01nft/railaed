/**
 * FX + honesty-score data.
 *
 * For the testnet demo we treat 1 USDC == 1 USD.
 * AED↔USD comes from a free public rate API with a static fallback.
 *
 * Competitor fee data is illustrative and based on the RESEARCH.md table —
 * always verifiable, but not live-quoted (which would require partner APIs).
 */

import { CORRIDORS, type CorridorCode } from './corridors';

const AED_USD_FALLBACK = 0.2723; // AED is pegged at 3.6725 / USD

let _fxCache: { rate: number; fetchedAt: number } | null = null;
const FX_TTL_MS = 5 * 60_000;

export async function getAedToUsdRate(): Promise<{ rate: number; cached: boolean; source: string }> {
  if (_fxCache && Date.now() - _fxCache.fetchedAt < FX_TTL_MS) {
    return { rate: _fxCache.rate, cached: true, source: 'cache' };
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/AED', {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = (await res.json()) as { rates?: { USD?: number } };
      const rate = data.rates?.USD;
      if (typeof rate === 'number' && rate > 0) {
        _fxCache = { rate, fetchedAt: Date.now() };
        return { rate, cached: false, source: 'open.er-api.com' };
      }
    }
  } catch {
    // fall through to fallback
  }
  return { rate: AED_USD_FALLBACK, cached: false, source: 'fallback' };
}

export interface CompetitorQuote {
  name: string;
  feePct: number;
  flatFeeAed: number;
  settlementMinutes: number;
  /** Net the recipient gets in USD given a senderAed amount. */
  recipientUsd: number;
  /** Total cost (in AED) for the sender to deliver `targetUsd` to recipient. */
  costForTargetAed?: number;
  notes?: string;
}

export interface RailAedQuote {
  senderAed: number;
  fxRate: number; // AED→USD
  baseUsd: number; // senderAed * fxRate (no fee)
  railaedFeePct: number;
  railaedFeeUsd: number;
  recipientUsd: number; // baseUsd - railaedFeeUsd
  recipientUsdc: number; // == recipientUsd for testnet (1 USDC = 1 USD)
  settlementSeconds: number;
  destinationLocal: { currency: string; amount: number; rate: number };
}

const RAILAED_FEE_PCT = 0.003; // 0.3% — leaves room for gas (USDC-denominated on Arc) + margin
const RAILAED_SETTLEMENT_SECONDS = 2;

export async function quoteRailAed(senderAed: number, corridor: CorridorCode): Promise<RailAedQuote> {
  const { rate } = await getAedToUsdRate();
  const corridorMeta = CORRIDORS[corridor];
  const baseUsd = senderAed * rate;
  const feeUsd = baseUsd * RAILAED_FEE_PCT;
  const recipientUsd = Math.max(0, baseUsd - feeUsd);
  const localAmount = recipientUsd * corridorMeta.usdToLocalRate;
  return {
    senderAed,
    fxRate: rate,
    baseUsd,
    railaedFeePct: RAILAED_FEE_PCT,
    railaedFeeUsd: feeUsd,
    recipientUsd,
    recipientUsdc: recipientUsd,
    settlementSeconds: RAILAED_SETTLEMENT_SECONDS,
    destinationLocal: {
      currency: corridorMeta.localCurrency,
      amount: localAmount,
      rate: corridorMeta.usdToLocalRate,
    },
  };
}

interface CompetitorTemplate {
  name: string;
  feePct: number;
  flatFeeAed: number;
  settlementMinutes: number;
  notes?: string;
}

const COMPETITORS: CompetitorTemplate[] = [
  { name: 'Al Ansari Exchange', feePct: 0.023, flatFeeAed: 12, settlementMinutes: 60, notes: 'UAE exchange-house standard' },
  { name: 'LuLu Money', feePct: 0.02, flatFeeAed: 10, settlementMinutes: 30, notes: 'Mobile-app rail' },
  { name: 'Western Union', feePct: 0.037, flatFeeAed: 20, settlementMinutes: 1440, notes: 'Cash-pickup, 24h+' },
  { name: 'Remitly', feePct: 0.03, flatFeeAed: 8, settlementMinutes: 120, notes: 'Online, card funding' },
  { name: 'Wise', feePct: 0.018, flatFeeAed: 6, settlementMinutes: 240, notes: 'Mid-market FX, slow' },
];

export async function honestyScore(senderAed: number): Promise<{
  railaedRecipientUsd: number;
  competitors: CompetitorQuote[];
  savingsVsAverageAed: number;
  averageCompetitorFeePct: number;
}> {
  const { rate } = await getAedToUsdRate();
  const railaedFeeUsd = senderAed * rate * RAILAED_FEE_PCT;
  const railaedRecipientUsd = senderAed * rate - railaedFeeUsd;

  const competitors: CompetitorQuote[] = COMPETITORS.map((c) => {
    const usableAed = Math.max(0, senderAed - c.flatFeeAed);
    const usableUsd = usableAed * rate;
    const competitorFeeUsd = usableUsd * c.feePct;
    const recipientUsd = Math.max(0, usableUsd - competitorFeeUsd);
    return {
      name: c.name,
      feePct: c.feePct,
      flatFeeAed: c.flatFeeAed,
      settlementMinutes: c.settlementMinutes,
      recipientUsd,
      notes: c.notes,
    };
  });

  const avgRecipientUsd =
    competitors.reduce((a, c) => a + c.recipientUsd, 0) / competitors.length;
  const savingsUsd = Math.max(0, railaedRecipientUsd - avgRecipientUsd);
  const savingsAed = savingsUsd / rate;
  const avgFeePct =
    COMPETITORS.reduce((a, c) => a + c.feePct, 0) / COMPETITORS.length;

  return {
    railaedRecipientUsd,
    competitors,
    savingsVsAverageAed: savingsAed,
    averageCompetitorFeePct: avgFeePct,
  };
}
