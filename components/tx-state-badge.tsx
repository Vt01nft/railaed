'use client';
import { Badge } from '@/components/ui/badge';

export function TxStateBadge({ state }: { state?: string | null }) {
  const s = (state ?? 'INITIATED').toUpperCase();
  if (s === 'COMPLETE' || s === 'CONFIRMED') return <Badge tone="success">Confirmed on Arc</Badge>;
  if (s === 'FAILED' || s === 'CANCELLED' || s === 'DENIED') return <Badge tone="danger">{prettifyState(s)}</Badge>;
  if (s === 'SENT' || s === 'PENDING_RISK_SCREENING' || s === 'INITIATED' || s === 'QUEUED')
    return <Badge tone="warning">{prettifyState(s)}</Badge>;
  return <Badge tone="neutral">{prettifyState(s)}</Badge>;
}

function prettifyState(s: string): string {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
