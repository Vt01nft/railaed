import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createWallet } from '@/lib/circle';
import { getContractors, setContractors } from '@/lib/state';
import { isCorridorCode } from '@/lib/corridors';
import { buildSeedContractors } from '@/lib/payroll-seed';
import { STREAM_RATE_USDC_PER_SEC } from '@/lib/stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Opens a streaming-payroll session: ensures every contractor has a Circle
 * wallet on Arc (provisioning any that are missing), then hands the client the
 * wallet addresses + per-second rate so it can drive the live accrual clock and
 * call /api/payroll/stream/settle on an interval.
 *
 * Stateless-friendly: the client passes the contractor list it already holds,
 * so we don't depend on the JSON cache surviving between Vercel invocations.
 */
const Row = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  country: z.string().refine(isCorridorCode, { message: 'unknown country code' }),
  walletId: z.string().optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  monthlyUsdc: z.string().optional(),
});
const Body = z.object({ contractors: z.array(Row).optional() });

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = Body.safeParse(json);

    let rows = parsed.success && parsed.data.contractors?.length
      ? parsed.data.contractors
      : await getContractors();
    if (rows.length === 0) rows = buildSeedContractors();

    const ensured = await Promise.all(
      rows.map(async (c) => {
        if (c.walletId && c.address) return c;
        const w = await createWallet(`railaed:contractor:${c.id}`);
        return { ...c, walletId: w.id, address: w.address };
      })
    );

    await setContractors(
      ensured.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        monthlyUsdc: c.monthlyUsdc ?? '0.5',
        walletId: c.walletId,
        address: c.address,
      }))
    ).catch(() => { /* read-only fs on Vercel; ignore */ });

    return NextResponse.json({
      streamId: randomUUID(),
      startedAt: Date.now(),
      ratePerSecondUsdc: STREAM_RATE_USDC_PER_SEC,
      contractors: ensured.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        walletId: c.walletId!,
        address: c.address!,
        ratePerSecondUsdc: STREAM_RATE_USDC_PER_SEC,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'stream start failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
