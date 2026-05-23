import { NextResponse, type NextRequest } from 'next/server';
import { listOwnerTransactions } from '@/lib/circle';
import { explorerAddrUrl, explorerTxUrl } from '@/lib/arc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/history?limit=25&kind=transfer|payroll|all
 *
 * Lists recent transactions owned by the platform's treasury wallet,
 * sourced live from Circle's listTransactions API. No local DB.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? '25')));
  const kindFilter = url.searchParams.get('kind') ?? 'all';

  try {
    const all = await listOwnerTransactions(limit);
    const filtered = kindFilter === 'all' ? all : all.filter((t) => t.kind === kindFilter);
    return NextResponse.json({
      ok: true,
      count: filtered.length,
      items: filtered.map((t) => ({
        ...t,
        explorerUrl: t.txHash ? explorerTxUrl(t.txHash) : null,
        destinationExplorerUrl: t.destinationAddress ? explorerAddrUrl(t.destinationAddress) : null,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'history fetch failed';
    return NextResponse.json({ ok: false, error: msg, items: [] }, { status: 502 });
  }
}
