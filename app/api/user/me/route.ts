import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getUsdcBalance } from '@/lib/arc';
import { usdcToHuman } from '@/lib/usdc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: true, user: null });
  let balanceUsdc = '0';
  try {
    const raw = await getUsdcBalance(session.address as `0x${string}`);
    balanceUsdc = usdcToHuman(raw);
  } catch {
    /* rpc blip - return 0 */
  }
  return NextResponse.json({
    ok: true,
    user: {
      email: session.email,
      walletId: session.walletId,
      address: session.address,
      createdAt: session.createdAt,
      balanceUsdc,
    },
  });
}
