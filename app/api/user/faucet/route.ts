import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { transferUsdcFromDeployer, explorerTxUrl, getUsdcBalance } from '@/lib/arc';
import { usdcToHuman } from '@/lib/usdc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PER_REQUEST_USDC = '5';

/**
 * POST /api/user/faucet
 *
 * Tops up the signed-in user's Circle wallet with testnet USDC from the
 * deployer EOA we control. Circle's own /v1/faucet/drips returns 403 on
 * developer-controlled wallets in this account, so we bridge from the
 * pre-funded EOA via viem instead.
 *
 * Capped at PER_REQUEST_USDC per call. Future calls can stack.
 */
export async function POST() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: 'sign in first' }, { status: 401 });
  }
  try {
    const hash = await transferUsdcFromDeployer(
      session.address as `0x${string}`,
      PER_REQUEST_USDC
    );
    const bal = await getUsdcBalance(session.address as `0x${string}`).catch(() => 0n);
    return NextResponse.json({
      ok: true,
      address: session.address,
      txHash: hash,
      explorerUrl: explorerTxUrl(hash),
      amount: PER_REQUEST_USDC,
      newBalance: usdcToHuman(bal),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'faucet failed';
    const hint = /insufficient|balance/i.test(msg)
      ? 'Deployer EOA is dry. Top it up via Circle console faucet or another testnet faucet.'
      : undefined;
    return NextResponse.json({ error: msg, ...(hint ? { hint } : {}) }, { status: 502 });
  }
}
