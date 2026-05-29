/**
 * StableFX client seam.
 *
 * Circle StableFX is the FX-aware leg of the swap (AED → USDC and onward
 * stablecoin-pair routing) settled on Arc via FxEscrow + Permit2. Two things
 * stop us using it live for this submission:
 *   1. Testnet access is gated (request in docs/STABLEFX_REQUEST.md).
 *   2. The destination corridor currencies (AED, INR, PKR, EGP, BDT, …) are
 *      not yet on Circle's partner-stablecoin list, so the AED→local pair
 *      can't be quoted on StableFX today regardless of access.
 *
 * So we ship the interface the hackathon brief asks for: a `StableFXClient`
 * with a `MockStableFXClient` (default - backed by a live FX oracle) and a
 * `LiveStableFXClient` stub that drops in once access + currency coverage land.
 * `getStableFXClient()` picks Live only when explicitly enabled, so the demo is
 * always honest about which rail produced the rate.
 */

const AED_USD_FALLBACK = 0.2723; // AED is pegged at 3.6725 / USD.
const FX_TTL_MS = 5 * 60_000;

let _fxCache: { rate: number; fetchedAt: number; source: string } | null = null;

/** Live-ish AED→USD oracle with a static peg fallback. 1 USDC == 1 USD (testnet). */
export async function getAedToUsdRate(): Promise<{ rate: number; cached: boolean; source: string }> {
  if (_fxCache && Date.now() - _fxCache.fetchedAt < FX_TTL_MS) {
    return { rate: _fxCache.rate, cached: true, source: _fxCache.source };
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
        _fxCache = { rate, fetchedAt: Date.now(), source: 'open.er-api.com' };
        return { rate, cached: false, source: 'open.er-api.com' };
      }
    }
  } catch {
    // fall through to peg fallback
  }
  return { rate: AED_USD_FALLBACK, cached: false, source: 'fallback' };
}

export type SettlementTenor = 'instant' | 'hourly' | 'daily';

export interface StableFxQuote {
  source: 'AED';
  target: 'USDC';
  /** USDC delivered per 1 AED. */
  rate: number;
  provider: 'circle-stablefx' | 'mock-stablefx';
  settlementTenor: SettlementTenor;
  /** true when the live StableFX rail is unavailable and we used the oracle. */
  gated: boolean;
  /** Where the rate actually came from, for the honesty story. */
  rateSource: string;
  quotedAt: string;
  note?: string;
}

export interface StableFXClient {
  quoteAedToUsdc(amountAed: number): Promise<StableFxQuote>;
}

/**
 * Default implementation: real AED→USD oracle, labelled as a mock so the UI can
 * say "FX via StableFX (simulated)" truthfully.
 */
export class MockStableFXClient implements StableFXClient {
  async quoteAedToUsdc(): Promise<StableFxQuote> {
    const { rate, source } = await getAedToUsdRate();
    return {
      source: 'AED',
      target: 'USDC',
      rate,
      provider: 'mock-stablefx',
      settlementTenor: 'instant',
      gated: true,
      rateSource: source,
      quotedAt: new Date().toISOString(),
      note:
        'Simulated StableFX quote. Live rail pending gated testnet access; AED/INR-style ' +
        'pairs are also not yet on Circle’s partner-stablecoin list.',
    };
  }
}

/**
 * Drop-in for the real rail. Wired to the StableFX RFQ + FxEscrow flow once
 * access is granted and the AED↔local pairs are listed. Intentionally inert
 * until then so it can never be selected by accident.
 */
export class LiveStableFXClient implements StableFXClient {
  async quoteAedToUsdc(): Promise<StableFxQuote> {
    throw new Error(
      'LiveStableFXClient is not enabled: StableFX testnet access has not been granted yet. ' +
        'Set STABLEFX_ENABLED=true only after access + AED pair coverage are confirmed.'
    );
  }
}

let _client: StableFXClient | null = null;

export function getStableFXClient(): StableFXClient {
  if (_client) return _client;
  _client = process.env.STABLEFX_ENABLED === 'true' ? new LiveStableFXClient() : new MockStableFXClient();
  return _client;
}
