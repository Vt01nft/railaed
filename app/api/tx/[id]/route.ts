import { NextResponse, type NextRequest } from 'next/server';
import { getTransaction } from '@/lib/circle';
import { explorerTxUrl } from '@/lib/arc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const tx = await getTransaction(id);
    if (!tx) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    return NextResponse.json({
      ok: true,
      id: tx.id,
      state: tx.state,
      txHash: tx.txHash ?? null,
      explorerUrl: tx.txHash ? explorerTxUrl(tx.txHash) : null,
      createDate: tx.createDate ?? null,
      updateDate: tx.updateDate ?? null,
      blockchain: tx.blockchain ?? null,
      destinationAddress: tx.destinationAddress ?? null,
      sourceAddress: tx.sourceAddress ?? null,
      amounts: tx.amounts ?? null,
      refId: tx.refId ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'tx fetch failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
