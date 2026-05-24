import { NextResponse, type NextRequest } from 'next/server';
import { listWalletTransactions } from '@/lib/circle';
import { env } from '@/lib/env';
import { readSession } from '@/lib/session';
import { explorerAddrUrl, explorerTxUrl } from '@/lib/arc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/history?limit=25&kind=transfer|payroll|all&scope=all|me
 *
 * Lists recent transactions sourced live from Circle's listTransactions API.
 * By default folds in the platform treasury wallet AND (if signed in) the
 * user's own wallet, so a sender sees the send they just did from their balance.
 * scope=me restricts to the user's wallet only (404 if not signed in).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? '25')));
  const kindFilter = url.searchParams.get('kind') ?? 'all';
  const scope = url.searchParams.get('scope') ?? 'all';

  try {
    const session = await readSession();
    const walletIds: string[] = [];
    if (scope === 'me') {
      if (!session) return NextResponse.json({ ok: false, error: 'sign in first', items: [] }, { status: 401 });
      walletIds.push(session.walletId);
    } else {
      walletIds.push(env.circle.ownerWalletId);
      if (session?.walletId && session.walletId !== env.circle.ownerWalletId) {
        walletIds.push(session.walletId);
      }
    }
    const all = await listWalletTransactions(walletIds, limit);
    const filtered = kindFilter === 'all' ? all : all.filter((t) => t.kind === kindFilter);
    return NextResponse.json({
      ok: true,
      count: filtered.length,
      scope,
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
