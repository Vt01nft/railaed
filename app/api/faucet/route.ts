import { NextResponse, type NextRequest } from 'next/server';
import { isAddress } from 'viem';
import { faucetUsdc } from '@/lib/circle';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/faucet                       → fund the platform's owner wallet
 * POST /api/faucet { address: "0x..." }  → fund any Arc testnet address
 *
 * Wraps Circle's testnet USDC faucet for ARC-TESTNET. USDC arrives in
 * seconds; on Arc, USDC is also the gas token, so a single drip funds
 * both balance and fees.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { address?: string };
  const target = (body.address ?? env.circle.ownerWalletAddress).toLowerCase();
  if (!isAddress(target)) {
    return NextResponse.json({ ok: false, error: 'invalid address' }, { status: 400 });
  }
  try {
    const out = await faucetUsdc(target);
    return NextResponse.json({ ok: true, address: target, status: out.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'faucet failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
