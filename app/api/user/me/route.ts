import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeSession, SESSION_COOKIE } from '@/lib/session';
import { getUsdcBalance } from '@/lib/arc';
import { usdcToHuman } from '@/lib/usdc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: true, user: null });
  }
  try {
    const session = decodeSession(token);
    let balanceUsdc = '0';
    try {
      const raw = await getUsdcBalance(session.address as `0x${string}`);
      balanceUsdc = usdcToHuman(raw);
    } catch {
      /* RPC down — ignore, return 0 */
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
  } catch {
    return NextResponse.json({ ok: true, user: null });
  }
}
