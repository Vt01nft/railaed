import 'server-only';
import { getUsdcBalance } from './arc';
import { env } from './env';
import { usdcToHuman } from './usdc';
import { getAedToUsdRate } from './fx';
import { listTransfers } from './state';
import { CORRIDORS, type CorridorCode } from './corridors';

export interface LandingData {
  ownerAddress: string;
  ownerUsdc: number;
  ownerAedEquivalent: number;
  fxRate: number;
  lastTransfer:
    | {
        id: string;
        senderName: string;
        recipientCountry: CorridorCode;
        recipientFlag: string;
        recipientAddress: string;
        amountUsdc: string;
        amountUsdcDisplay: string;
        agoSeconds: number;
      }
    | null;
}

export async function loadLanding(): Promise<LandingData> {
  const [rawBal, fx, transfers] = await Promise.all([
    getUsdcBalance(env.circle.ownerWalletAddress as `0x${string}`).catch(() => 0n),
    getAedToUsdRate(),
    listTransfers().catch(() => []),
  ]);
  const ownerUsdc = Number(usdcToHuman(rawBal));
  const ownerAedEquivalent = fx.rate > 0 ? ownerUsdc / fx.rate : 0;

  const last = transfers[0];
  let lastTransfer: LandingData['lastTransfer'] = null;
  if (last) {
    const code = (last.recipientCountry as CorridorCode) ?? 'IN';
    const corridor = CORRIDORS[code];
    lastTransfer = {
      id: last.id,
      senderName: last.senderName,
      recipientCountry: code,
      recipientFlag: corridor?.flag ?? '🌍',
      recipientAddress: last.recipientAddress,
      amountUsdc: last.amountUsdc,
      amountUsdcDisplay: Number(last.amountUsdc).toFixed(2),
      agoSeconds: Math.max(0, Math.floor((Date.now() - new Date(last.createdAt).getTime()) / 1000)),
    };
  }

  return {
    ownerAddress: env.circle.ownerWalletAddress,
    ownerUsdc,
    ownerAedEquivalent,
    fxRate: fx.rate,
    lastTransfer,
  };
}

export function humanAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
