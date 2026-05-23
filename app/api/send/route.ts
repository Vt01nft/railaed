import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createWallet, transferUsdc } from '@/lib/circle';
import { quoteRailAed } from '@/lib/fx';
import { COUNTRIES, isCorridorCode } from '@/lib/corridors';
import { env } from '@/lib/env';
import {
  encodeClaimToken,
  DEFAULT_CLAIM_TTL_MS,
  type ClaimPayload,
} from '@/lib/claim-token';
import { saveTransfer } from '@/lib/state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  senderName: z.string().min(1).max(80),
  senderAed: z.number().positive().max(1_000_000),
  recipientPhone: z.string().min(6).max(20),
  recipientName: z.string().min(1).max(80).optional(),
  corridor: z.string().refine(isCorridorCode, { message: 'unknown country code' }),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid body', issues: parsed.error.issues }, { status: 400 });
    }
    const { senderName, senderAed, recipientPhone, recipientName, corridor } = parsed.data;

    // 1. Re-quote so the user can't lock in a stale rate from a stale UI.
    const quote = await quoteRailAed(senderAed, corridor);
    const amountUsdc = quote.recipientUsdc.toFixed(6);
    if (Number(amountUsdc) <= 0) {
      return NextResponse.json({ error: 'amount rounds to zero' }, { status: 400 });
    }

    // 2. Provision a recipient wallet (developer-controlled, scoped to our wallet set).
    const transferId = randomUUID();
    const refId = `railaed:transfer:${transferId}`;
    const recipientWallet = await createWallet(refId);

    // 3. Initiate the USDC transfer from the platform's owner wallet.
    //    If the treasury is empty, Circle returns "insufficient balance" — bubble
    //    that up as a JSON error so the client doesn't choke on an HTML 500.
    const tx = await transferUsdc({
      fromWalletId: env.circle.ownerWalletId,
      destinationAddress: recipientWallet.address,
      amountUsdc,
      refId,
    });

    // 4. Sign a claim token the recipient can open in a link.
    const payload: ClaimPayload = {
      id: transferId,
      recipientWalletId: recipientWallet.id,
      recipientAddress: recipientWallet.address,
      amountUsdc,
      recipientPhone,
      senderName,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + DEFAULT_CLAIM_TTL_MS,
    };
    const token = encodeClaimToken(payload);

    // 5. Persist a local record so the UI can list transfers (best-effort —
    //    Vercel functions are stateless, this is per-container cache only).
    await saveTransfer({
      id: transferId,
      senderName,
      recipientPhone,
      recipientCountry: corridor,
      recipientWalletId: recipientWallet.id,
      recipientAddress: recipientWallet.address,
      amountUsdc,
      circleTxId: tx.transactionId,
      createdAt: payload.createdAt,
    }).catch(() => { /* read-only fs; ignore */ });

    const origin = request.nextUrl.origin;
    return NextResponse.json({
      transferId,
      claimUrl: `${origin}/claim/${token}`,
      claimToken: token,
      circleTxId: tx.transactionId,
      circleTxState: tx.state,
      recipientAddress: recipientWallet.address,
      recipientWalletId: recipientWallet.id,
      amountUsdc,
      quote,
      corridor: COUNTRIES[corridor],
      recipientName: recipientName ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'send failed';
    const hint = /insufficient|balance/i.test(msg)
      ? "Owner wallet is out of USDC — top up via POST /api/seed/fund."
      : undefined;
    return NextResponse.json({ error: msg, ...(hint ? { hint } : {}) }, { status: 500 });
  }
}
