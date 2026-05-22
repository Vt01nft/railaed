import { NextResponse, type NextRequest } from 'next/server';
import { isAddress } from 'viem';
import { transferUsdcFromDeployer, explorerTxUrl, getUsdcBalance } from '@/lib/arc';
import { env } from '@/lib/env';
import { usdcToHuman } from '@/lib/usdc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/seed/fund
 *   { address?: "0x...", amount?: "5" }
 *
 * Funds a target wallet (default: the platform's owner Circle wallet)
 * with USDC from the deployer EOA. Used to bootstrap the demo when
 * Circle's own faucet doesn't have permission on the wallet.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { address?: string; amount?: string };
  const target = (body.address ?? env.circle.ownerWalletAddress).toLowerCase();
  const amount = (body.amount ?? '5').toString();
  if (!isAddress(target)) {
    return NextResponse.json({ ok: false, error: 'invalid address' }, { status: 400 });
  }
  try {
    const hash = await transferUsdcFromDeployer(target, amount);
    const bal = await getUsdcBalance(target);
    return NextResponse.json({
      ok: true,
      from: env.arc.deployerAddress,
      to: target,
      amount,
      txHash: hash,
      explorerUrl: explorerTxUrl(hash),
      newBalance: usdcToHuman(bal),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'fund failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
