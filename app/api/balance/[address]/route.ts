import { NextResponse, type NextRequest } from 'next/server';
import { getUsdcBalance, explorerAddrUrl } from '@/lib/arc';
import { usdcToHuman } from '@/lib/usdc';
import { isAddress } from 'viem';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ address: string }> }) {
  const { address } = await ctx.params;
  if (!isAddress(address)) {
    return NextResponse.json({ ok: false, error: 'invalid address' }, { status: 400 });
  }
  try {
    const raw = await getUsdcBalance(address);
    return NextResponse.json({
      ok: true,
      address: address.toLowerCase(),
      raw: raw.toString(),
      human: usdcToHuman(raw),
      explorerUrl: explorerAddrUrl(address),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'rpc failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
