import { NextResponse, type NextRequest } from 'next/server';
import { decodeClaimToken } from '@/lib/claim-token';
import { getTransfer, markClaimed } from '@/lib/state';
import { getUsdcBalance } from '@/lib/arc';
import { COUNTRIES, type CorridorCode } from '@/lib/corridors';
import { usdcToHuman } from '@/lib/usdc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadAndAuth(token: string) {
  const payload = decodeClaimToken(token);
  const transfer = await getTransfer(payload.id);
  return { payload, transfer };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  try {
    const { payload, transfer } = await loadAndAuth(token);
    const onchainRaw = await getUsdcBalance(payload.recipientAddress as `0x${string}`);
    const onchainHuman = usdcToHuman(onchainRaw);
    const corridor = COUNTRIES[(transfer?.recipientCountry as CorridorCode) ?? 'IN'];
    return NextResponse.json({
      ok: true,
      payload,
      transfer: transfer ?? null,
      onchainBalance: { raw: onchainRaw.toString(), human: onchainHuman },
      corridor,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'invalid token';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function POST(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  try {
    const { payload } = await loadAndAuth(token);
    await markClaimed(payload.id);
    return NextResponse.json({ ok: true, claimedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'invalid token';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
