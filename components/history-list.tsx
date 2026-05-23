'use client';
import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, RefreshCw, Users, Send } from 'lucide-react';
import { AddressPill } from '@/components/address-pill';
import { TxStateBadge } from '@/components/tx-state-badge';

interface HistoryItem {
  id: string;
  txHash: string | null;
  state: string;
  amount: string;
  destinationAddress: string;
  sourceAddress: string;
  refId?: string;
  createDate: string;
  updateDate: string;
  kind: 'transfer' | 'payroll' | 'other';
  explorerUrl: string | null;
  destinationExplorerUrl: string | null;
}

interface Props {
  limit?: number;
  kind?: 'all' | 'transfer' | 'payroll';
  /** Compact mode renders fewer columns (good for sidebars). */
  compact?: boolean;
  /** Refresh every N seconds — pass 0 to disable. */
  autoRefreshSeconds?: number;
}

export function HistoryList({ limit = 10, kind = 'all', compact = false, autoRefreshSeconds = 15 }: Props) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?limit=${limit}&kind=${kind}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'history failed');
      setItems(json.items as HistoryItem[]);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'history failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (autoRefreshSeconds > 0) {
      const t = setInterval(load, autoRefreshSeconds * 1000);
      return () => clearInterval(t);
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, kind]);

  if (loading && !items) {
    return (
      <div className="text-center py-8 text-[color:var(--cream-500)] text-sm">
        <Loader2 className="size-5 animate-spin mx-auto mb-2" />
        Loading recent activity from Circle…
      </div>
    );
  }

  if (err && !items) {
    return (
      <div className="text-center py-6 text-sm text-[color:var(--danger)]">
        {err}
        <button onClick={load} className="block mx-auto mt-2 pill-outline">
          <RefreshCw className="size-3.5" /> retry
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[color:var(--cream-500)]">
        No transfers yet. Send your first one to see it here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((t) => (
        <Row key={t.id} item={t} compact={compact} />
      ))}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[color:var(--cream-500)] pt-2">
        <span>Source: Circle listTransactions · live</span>
        <button onClick={load} className="inline-flex items-center gap-1 hover:text-[color:var(--cream-300)]">
          {loading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
          refresh
        </button>
      </div>
    </div>
  );
}

function Row({ item, compact }: { item: HistoryItem; compact: boolean }) {
  const ago = humanAgo(new Date(item.createDate).getTime());
  const Icon = item.kind === 'payroll' ? Users : Send;
  const kindLabel = item.kind === 'payroll' ? 'Payroll' : item.kind === 'transfer' ? 'Send' : 'Tx';

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 px-4 py-3 hover:border-[color:var(--border-strong)] transition-colors">
      <div className="size-9 shrink-0 rounded-2xl bg-[color:var(--gold-500)]/12 text-[color:var(--gold-300)] grid place-items-center border border-[color:var(--gold-500)]/30">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">{kindLabel}</span>
          <TxStateBadge state={item.state} />
          <span className="text-[10px] text-[color:var(--cream-500)] font-mono">{ago}</span>
        </div>
        {!compact ? (
          <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--cream-400)]">
            <span>to</span>
            <AddressPill address={item.destinationAddress} />
          </div>
        ) : null}
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-[color:var(--cream-200)] tabular">
          <span className="text-base">{Number(item.amount).toFixed(2)}</span>{' '}
          <span className="text-[color:var(--gold-500)] text-xs">USDC</span>
        </div>
        {item.explorerUrl ? (
          <a
            href={item.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-[color:var(--gold-300)] hover:underline mt-0.5"
          >
            ArcScan <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="text-[10px] text-[color:var(--cream-500)]">awaiting hash</span>
        )}
      </div>
    </div>
  );
}

function humanAgo(ts: number): string {
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
