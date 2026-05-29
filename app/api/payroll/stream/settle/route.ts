import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { transferUsdc } from '@/lib/circle';
import { env, publicEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Settles one tick of a streaming-payroll session: a single real USDC transfer
 * on Arc from the treasury to the contractor's wallet for the amount accrued
 * since the previous settlement. The client fires these on an interval, so a
 * running stream produces a steady series of on-chain transactions.
 *
 * refId namespace: railaed:stream:<streamId>:<contractorId>:<seq>
 */
const Body = z.object({
  streamId: z.string().min(1),
  contractorId: z.string().min(1),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  seq: z.number().int().nonnegative(),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body', issues: parsed.error.issues }, { status: 400 });
  }
  const { streamId, contractorId, address, amountUsdc, seq } = parsed.data;
  if (Number(amountUsdc) <= 0) {
    return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 });
  }

  try {
    const tx = await transferUsdc({
      fromWalletId: env.circle.ownerWalletId,
      destinationAddress: address,
      amountUsdc,
      refId: `railaed:stream:${streamId}:${contractorId}:${seq}`,
    });
    return NextResponse.json({
      ok: true,
      circleTxId: tx.transactionId,
      state: tx.state,
      amountUsdc,
      recipientExplorerUrl: `${publicEnv.explorerUrl}/address/${address}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'settle failed';
    const hint = /insufficient|balance/i.test(msg)
      ? 'Treasury is out of USDC — top up via POST /api/seed/fund.'
      : undefined;
    return NextResponse.json({ ok: false, error: msg, ...(hint ? { hint } : {}) }, { status: 500 });
  }
}
