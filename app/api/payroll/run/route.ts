import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createWallet, transferUsdc } from '@/lib/circle';
import { env } from '@/lib/env';
import { getContractors, setContractors, savePayrollRun } from '@/lib/state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Runs payroll for every contractor in state. Provisions a recipient wallet
 * for any contractor that doesn't have one yet, then fires a USDC transfer
 * from the platform's owner wallet for each row in parallel.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { employer?: string };
  const employer = body.employer?.trim() || 'RailAED Demo Co.';

  const contractors = await getContractors();
  if (contractors.length === 0) {
    return NextResponse.json({ error: 'no contractors configured' }, { status: 400 });
  }

  const runId = randomUUID();

  // Ensure every contractor has a wallet.
  const updated = await Promise.all(
    contractors.map(async (c) => {
      if (c.walletId && c.address) return c;
      const w = await createWallet(`railaed:contractor:${c.id}`);
      return { ...c, walletId: w.id, address: w.address };
    })
  );
  await setContractors(updated);

  // Fire payroll transfers in parallel.
  const items = await Promise.all(
    updated.map(async (c) => {
      try {
        const tx = await transferUsdc({
          fromWalletId: env.circle.ownerWalletId,
          destinationAddress: c.address!,
          amountUsdc: c.monthlyUsdc,
          refId: `railaed:payroll:${runId}:${c.id}`,
        });
        return {
          contractorName: c.name,
          country: c.country,
          walletId: c.walletId,
          address: c.address!,
          amountUsdc: c.monthlyUsdc,
          circleTxId: tx.transactionId,
          state: tx.state,
        };
      } catch (err: unknown) {
        return {
          contractorName: c.name,
          country: c.country,
          walletId: c.walletId,
          address: c.address!,
          amountUsdc: c.monthlyUsdc,
          circleTxId: '',
          state: 'FAILED',
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  const runAt = new Date().toISOString();
  await savePayrollRun({ id: runId, employer, runAt, items });

  return NextResponse.json({
    runId,
    employer,
    runAt,
    items,
    totalUsdc: items.reduce((a, i) => a + Number(i.amountUsdc || 0), 0).toFixed(2),
  });
}
