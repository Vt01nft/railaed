'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square, ExternalLink, Radio, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { COUNTRIES, type CorridorCode } from '@/lib/corridors';
import {
  STREAM_RATE_USDC_PER_SEC,
  STREAM_SETTLE_INTERVAL_MS,
  STREAM_MIN_SETTLE_USDC,
  STREAM_MAX_DURATION_MS,
  formatUsdcFine,
  floorUsdc6,
} from '@/lib/stream';

// Time is read here at module scope, never during a component's render - keeps
// the render pure (React 19 purity rule) while the live clock lives in state.
function nowMs(): number {
  return Date.now();
}

interface Contractor {
  id: string;
  name: string;
  country: CorridorCode;
  walletId?: string;
  address?: string;
  monthlyUsdc: string;
}

interface StreamContractor {
  id: string;
  name: string;
  country: string;
  walletId: string;
  address: string;
  ratePerSecondUsdc: number;
}

interface Acct {
  settled: number;
  txCount: number;
  explorerUrl?: string;
  lastError?: string;
}

const emptyAcct = (): Acct => ({ settled: 0, txCount: 0 });

export function PayrollStream({
  contractors,
  onProvisioned,
}: {
  contractors: Contractor[];
  onProvisioned?: () => void;
}) {
  const [stream, setStream] = useState<StreamContractor[] | null>(null);
  const [streamId, setStreamId] = useState('');
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [accts, setAccts] = useState<Record<string, Acct>>({});

  // Mirrors + bookkeeping read only inside the settle interval (never render).
  const acctsRef = useRef(accts);
  useEffect(() => {
    acctsRef.current = accts;
  }, [accts]);
  const seqRef = useRef<Record<string, number>>({});
  const inFlightRef = useRef<Record<string, boolean>>({});

  const stop = useCallback(() => setRunning(false), []);

  async function start() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch('/api/payroll/stream/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contractors }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `stream start failed (HTTP ${res.status})`);

      const sc: StreamContractor[] = data.contractors ?? [];
      seqRef.current = Object.fromEntries(sc.map((c) => [c.id, 0]));
      inFlightRef.current = Object.fromEntries(sc.map((c) => [c.id, false]));
      const init = Object.fromEntries(sc.map((c) => [c.id, emptyAcct()]));
      acctsRef.current = init;

      const t = nowMs();
      setStream(sc);
      setStreamId(data.streamId);
      setAccts(init);
      setStartedAt(t);
      setNow(t);
      setRunning(true);
      onProvisioned?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'stream start failed');
    } finally {
      setStarting(false);
    }
  }

  // Drive the live clock + on-chain settlement while running. All freshly-
  // changing data (accts) is read via a ref so the interval never goes stale;
  // start-time invariants (stream, streamId, startedAt) come from deps.
  useEffect(() => {
    if (!running || !stream) return;

    const display = setInterval(() => setNow(nowMs()), 100);

    const settle = setInterval(() => {
      const t = nowMs();
      const elapsed = (t - startedAt) / 1000;
      if (t - startedAt >= STREAM_MAX_DURATION_MS) {
        setRunning(false);
        return;
      }
      for (const c of stream) {
        if (inFlightRef.current[c.id]) continue;
        const acct = acctsRef.current[c.id] ?? emptyAcct();
        const pending = floorUsdc6(c.ratePerSecondUsdc * elapsed - acct.settled);
        if (pending < STREAM_MIN_SETTLE_USDC) continue;

        const seq = seqRef.current[c.id] ?? 0;
        seqRef.current[c.id] = seq + 1;
        inFlightRef.current[c.id] = true;

        void (async () => {
          try {
            const res = await fetch('/api/payroll/stream/settle', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                streamId,
                contractorId: c.id,
                address: c.address,
                amountUsdc: pending.toFixed(6),
                seq,
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.ok) {
              setAccts((prev) => {
                const p = prev[c.id] ?? emptyAcct();
                return {
                  ...prev,
                  [c.id]: {
                    settled: p.settled + pending,
                    txCount: p.txCount + 1,
                    explorerUrl: data.recipientExplorerUrl ?? p.explorerUrl,
                    lastError: undefined,
                  },
                };
              });
            } else {
              const msg = data.hint ? `${data.error} - ${data.hint}` : (data.error ?? 'settle failed');
              setAccts((prev) => ({ ...prev, [c.id]: { ...(prev[c.id] ?? emptyAcct()), lastError: msg } }));
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'settle failed';
            setAccts((prev) => ({ ...prev, [c.id]: { ...(prev[c.id] ?? emptyAcct()), lastError: msg } }));
          } finally {
            inFlightRef.current[c.id] = false;
          }
        })();
      }
    }, STREAM_SETTLE_INTERVAL_MS);

    return () => {
      clearInterval(display);
      clearInterval(settle);
    };
  }, [running, stream, streamId, startedAt]);

  const list = stream ?? [];
  const elapsed = running ? Math.max(0, (now - startedAt) / 1000) : 0;
  const totals = list.reduce(
    (acc, c) => {
      const a = accts[c.id];
      acc.earned += c.ratePerSecondUsdc * elapsed;
      acc.settled += a?.settled ?? 0;
      acc.txCount += a?.txCount ?? 0;
      return acc;
    },
    { earned: 0, settled: 0, txCount: 0 }
  );
  const combinedRate = list.reduce((s, c) => s + c.ratePerSecondUsdc, 0) || STREAM_RATE_USDC_PER_SEC;
  const txPerMinute = Math.round((60_000 / STREAM_SETTLE_INTERVAL_MS) * list.length);

  return (
    <Card variant="gradient" className="p-1.5">
      <div className="rounded-[1.4rem] bg-[color:var(--surface)]/95 p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">
              <Zap className="size-3.5" /> Streaming payroll · Nanopayments-style
            </div>
            <h2 className="mt-1 font-serif text-2xl font-medium tracking-tight text-[color:var(--cream-200)]">
              Pay per second worked
            </h2>
            <p className="text-sm text-[color:var(--cream-400)] mt-1 max-w-xl">
              Each contractor accrues USDC every second; we flush it on-chain every{' '}
              {Math.round(STREAM_SETTLE_INTERVAL_MS / 1000)}s as a real Arc transfer. One minute of
              streaming ≈ {txPerMinute || 0} on-chain txs - the workload Circle Nanopayments batches
              gas-free in production.
            </p>
          </div>
          <div className="shrink-0">
            {running ? (
              <Button variant="danger" size="lg" onClick={stop}>
                <Square className="size-4" /> Stop stream
              </Button>
            ) : (
              <Button
                variant="gold"
                size="lg"
                onClick={start}
                loading={starting}
                disabled={contractors.length === 0}
              >
                {!starting ? <Play className="size-4" /> : null}
                {starting ? 'Provisioning wallets…' : stream ? 'Stream again' : 'Start streaming'}
              </Button>
            )}
          </div>
        </div>

        {error ? <div className="text-sm text-[color:var(--danger)]">{error}</div> : null}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label="Status"
            value={running ? 'Live' : stream ? 'Stopped' : 'Idle'}
            accent={running}
            icon={running ? <Radio className="size-3.5 animate-pulse" /> : undefined}
          />
          <Stat label="Streamed (accrued)" value={`${formatUsdcFine(totals.earned)} USDC`} />
          <Stat label="Settled on-chain" value={`${formatUsdcFine(totals.settled)} USDC`} />
          <Stat label="On-chain txs" value={String(totals.txCount)} accent />
        </div>

        {!stream ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-deep)]/30 px-4 py-8 text-center text-sm text-[color:var(--cream-400)]">
            {contractors.length === 0
              ? 'Add a contractor above, then start the stream.'
              : `Ready to stream to ${contractors.length} contractor${contractors.length > 1 ? 's' : ''} at ${formatUsdcFine(combinedRate, 3)} USDC/sec combined.`}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((c) => {
              const a = accts[c.id] ?? emptyAcct();
              const earned = c.ratePerSecondUsdc * elapsed;
              const pending = Math.max(0, earned - a.settled);
              const flag = COUNTRIES[c.country as CorridorCode]?.flag ?? '';
              const pct = earned > 0 ? Math.min(100, (a.settled / earned) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[color:var(--cream-200)] truncate">
                        {c.name || 'Unnamed'} <span className="text-xs">{flag}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[color:var(--cream-500)] font-mono">
                        {c.ratePerSecondUsdc.toFixed(3)} USDC/sec
                        {a.txCount ? ` · ${a.txCount} settlements` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono tabular text-lg text-[color:var(--cream-200)] leading-none">
                        {formatUsdcFine(earned)}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)] mt-1">
                        streamed USDC
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-[color:var(--cream-500)]">
                      settled <span className="font-mono text-[color:var(--mint-300)]">{formatUsdcFine(a.settled)}</span>
                      {' · '}
                      pending <span className="font-mono text-[color:var(--cream-300)]">{formatUsdcFine(pending)}</span>
                    </span>
                    {a.explorerUrl ? (
                      <a
                        href={a.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[color:var(--gold-300)] hover:underline shrink-0"
                      >
                        ArcScan <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-2 h-1.5 rounded-full bg-[color:var(--surface-1)]/60 overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--mint-400)] transition-[width] duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {a.lastError ? (
                    <div className="mt-2 text-[11px] text-[color:var(--danger)]">{a.lastError}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-[color:var(--cream-500)] leading-relaxed border-t border-[color:var(--border)] pt-3">
          Testnet demo. Each settlement is a real USDC transfer from the treasury wallet on Arc -
          verifiable on ArcScan. Production swaps the per-tick transfer for Circle Nanopayments
          (gas-free, sub-cent, batched EIP-3009 settlement), so thousands of contractors can stream
          at once without a transfer-per-tick.
        </p>
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)] flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div
        className={`mt-1 font-mono tabular text-base ${
          accent ? 'text-[color:var(--mint-300)]' : 'text-[color:var(--cream-200)]'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
