import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { transferUsdc, getTransaction } from '@/lib/circle';
import { env } from '@/lib/env';
import { getUsdcBalance, explorerTxUrl } from '@/lib/arc';
import { usdcToHuman } from '@/lib/usdc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PER_REQUEST_USDC = '5';

/**
 * POST /api/user/faucet
 *
 * Tops up the signed-in user's Circle wallet with testnet USDC from the
 * RailAED treasury (owner Circle wallet). Circle's own /v1/faucet/drips
 * returns 403 on developer-controlled wallets in this account, so we
 * shuttle from our pre-funded treasury via the Circle SDK instead.
 *
 * Capped at PER_REQUEST_USDC per call.
 */
export async function POST() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: 'sign in first' }, { status: 401 });
  }
  try {
    const tx = await transferUsdc({
      fromWalletId: env.circle.ownerWalletId,
      destinationAddress: session.address,
      amountUsdc: PER_REQUEST_USDC,
      refId: `railaed:faucet:${session.email}`,
    });

    // Poll briefly for the on-chain hash so we can return an ArcScan link.
    let txHash: string | null = null;
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const t = await getTransaction(tx.transactionId).catch(() => null);
      if (t?.txHash) { txHash = t.txHash; break; }
    }

    const bal = await getUsdcBalance(session.address as `0x${string}`).catch(() => 0n);
    return NextResponse.json({
      ok: true,
      address: session.address,
      txHash,
      explorerUrl: txHash ? explorerTxUrl(txHash) : null,
      circleTxId: tx.transactionId,
      amount: PER_REQUEST_USDC,
      newBalance: usdcToHuman(bal),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'faucet failed';
    const hint = /insufficient|balance/i.test(msg)
      ? 'RailAED treasury is low. Operator: top up via POST /api/seed/fund.'
      : undefined;
    return NextResponse.json({ error: msg, ...(hint ? { hint } : {}) }, { status: 502 });
  }
}
