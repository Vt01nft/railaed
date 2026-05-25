'use client';
import { useEffect, useState } from 'react';
import { Loader2, Play, Plus, Trash2, ExternalLink, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddressPill } from '@/components/address-pill';
import { TxStateBadge } from '@/components/tx-state-badge';
import { COUNTRIES, CORRIDOR_LIST, type CorridorCode } from '@/lib/corridors';
import { formatUsd } from '@/lib/usdc';

interface Contractor {
  id: string;
  name: string;
  country: CorridorCode;
  walletId?: string;
  address?: string;
  monthlyUsdc: string;
}

interface PayrollRun {
  runId: string;
  employer: string;
  runAt: string;
  totalUsdc: string;
  items: Array<{
    contractorName: string;
    country: string;
    walletId?: string;
    address: string;
    amountUsdc: string;
    circleTxId: string;
    state: string;
    error?: string;
  }>;
}

export default function PayrollPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [employer, setEmployer] = useState('RailAED Demo Co.');
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<PayrollRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadContractors() {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll/contractors', { cache: 'no-store' });
      const data = await res.json();
      setContractors(data.contractors ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function saveContractors(rows: Contractor[]) {
    const res = await fetch('/api/payroll/contractors', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(rows),
    });
    const data = await res.json();
    setContractors(data.contractors ?? rows);
  }

  useEffect(() => {
    loadContractors();
  }, []);

  function updateRow(id: string, patch: Partial<Contractor>) {
    setContractors((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    const id = crypto.randomUUID();
    setContractors((rows) => [
      ...rows,
      { id, name: '', country: 'IN', monthlyUsdc: '0.5' },
    ]);
  }

  function removeRow(id: string) {
    setContractors((rows) => rows.filter((r) => r.id !== id));
  }

  async function runPayroll() {
    await saveContractors(contractors);
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/payroll/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ employer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'payroll failed');
      setLastRun(data as PayrollRun);
      await loadContractors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'payroll failed');
    } finally {
      setRunning(false);
    }
  }

  const total = contractors.reduce((a, c) => a + Number(c.monthlyUsdc || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-12 lg:py-16 space-y-6">
      <header className="text-center mb-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-500)]">Global payroll</div>
        <h1 className="mt-2 font-serif text-[2rem] sm:text-5xl font-medium tracking-tight text-[color:var(--cream-200)]">
          Pay every contractor <span className="italic text-gold-bright">in one click</span>
        </h1>
        <p className="mt-3 text-sm text-[color:var(--cream-400)] max-w-xl mx-auto">
          Each contractor gets their own Circle wallet on Arc. Parallel transfers, settled in seconds, every line traceable on ArcScan.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="w-full sm:w-64">
          <Label htmlFor="employer">Employer name</Label>
          <Input id="employer" className="mt-2" value={employer} onChange={(e) => setEmployer(e.target.value)} />
        </div>
        <Badge tone="gold" className="self-start sm:self-auto">{contractors.length} contractors · {formatUsd(total)} this run</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-[color:var(--gold-500)]" /> Contractors
            </CardTitle>
            <CardDescription>Edit any row; wallets are provisioned on first run.</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={addRow}>
            <Plus className="size-4" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-[color:var(--cream-500)]">
              <Loader2 className="size-5 animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {/* Desktop: table. Hidden on small screens to avoid horizontal scroll. */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
                    <tr>
                      <th className="text-left px-2 py-3 font-semibold">Name</th>
                      <th className="text-left px-2 py-3 font-semibold">Country</th>
                      <th className="text-left px-2 py-3 font-semibold">Wallet on Arc</th>
                      <th className="text-right px-2 py-3 font-semibold">Monthly USDC</th>
                      <th className="px-2 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    {contractors.map((c) => (
                      <tr key={c.id} className="hover:bg-[color:var(--surface-1)]/30">
                        <td className="px-2 py-2">
                          <Input
                            value={c.name}
                            onChange={(e) => updateRow(c.id, { name: e.target.value })}
                            className="h-9"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={c.country}
                            onChange={(e) => updateRow(c.id, { country: e.target.value as CorridorCode })}
                            className="h-9 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-deep)]/60 px-3 text-sm text-[color:var(--cream-200)]"
                          >
                            {CORRIDOR_LIST.map((co) => (
                              <option key={co.code} value={co.code} className="bg-[color:var(--surface)]">
                                {co.flag} {co.country}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          {c.address ? (
                            <AddressPill address={c.address} />
                          ) : (
                            <span className="text-xs text-[color:var(--cream-500)]">provisions on first run</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Input
                            value={c.monthlyUsdc}
                            onChange={(e) =>
                              updateRow(c.id, { monthlyUsdc: e.target.value.replace(/[^\d.]/g, '') })
                            }
                            className="h-9 text-right font-mono"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Button variant="ghost" size="sm" onClick={() => removeRow(c.id)} title="Remove">
                            <Trash2 className="size-4 text-[color:var(--cream-500)]" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {contractors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-[color:var(--cream-500)] py-8 text-sm">
                          No contractors yet. Click <em className="text-[color:var(--cream-300)]">Add</em>.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked cards. Each contractor gets its own panel with labelled fields. */}
              <div className="md:hidden space-y-3">
                {contractors.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Label className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
                        Contractor
                      </Label>
                      <Button variant="ghost" size="sm" onClick={() => removeRow(c.id)} title="Remove">
                        <Trash2 className="size-4 text-[color:var(--cream-500)]" />
                      </Button>
                    </div>
                    <Input
                      value={c.name}
                      onChange={(e) => updateRow(c.id, { name: e.target.value })}
                      placeholder="Full name"
                      className="h-10"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
                          Country
                        </Label>
                        <select
                          value={c.country}
                          onChange={(e) => updateRow(c.id, { country: e.target.value as CorridorCode })}
                          className="mt-1.5 h-10 w-full rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-deep)]/60 px-3 text-sm text-[color:var(--cream-200)]"
                        >
                          {CORRIDOR_LIST.map((co) => (
                            <option key={co.code} value={co.code} className="bg-[color:var(--surface)]">
                              {co.flag} {co.country}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
                          Monthly USDC
                        </Label>
                        <Input
                          value={c.monthlyUsdc}
                          onChange={(e) => updateRow(c.id, { monthlyUsdc: e.target.value.replace(/[^\d.]/g, '') })}
                          className="mt-1.5 h-10 text-right font-mono"
                          inputMode="decimal"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
                        Wallet on Arc
                      </Label>
                      <div className="mt-1.5">
                        {c.address ? (
                          <AddressPill address={c.address} />
                        ) : (
                          <span className="text-xs text-[color:var(--cream-500)]">provisions on first run</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {contractors.length === 0 ? (
                  <div className="text-center text-[color:var(--cream-500)] py-8 text-sm">
                    No contractors yet. Tap <em className="text-[color:var(--cream-300)]">Add</em>.
                  </div>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {error ? <div className="text-sm text-[color:var(--danger)]">{error}</div> : null}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
        <Button variant="secondary" onClick={() => saveContractors(contractors)} className="sm:w-auto w-full">
          Save changes
        </Button>
        <Button onClick={runPayroll} loading={running} size="lg" variant="gold" disabled={contractors.length === 0} className="sm:w-auto w-full">
          <Play className="size-4" /> Run payroll · {formatUsd(total)}
        </Button>
      </div>

      {lastRun ? <RunReport run={lastRun} /> : null}
    </div>
  );
}

interface LiveTx {
  state: string;
  txHash: string | null;
  explorerUrl: string | null;
}

function useTxStatuses(circleTxIds: string[]) {
  const [statuses, setStatuses] = useState<Record<string, LiveTx>>({});

  useEffect(() => {
    const pending = circleTxIds.filter((id) => !!id);
    if (pending.length === 0) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (cancelled) return;
      attempts++;
      await Promise.all(
        pending.map(async (id) => {
          // Stop polling rows that have already terminal-resolved
          const known = statuses[id];
          if (known && (known.state === 'COMPLETE' || known.state === 'CONFIRMED' || known.state === 'FAILED' || known.state === 'CANCELLED' || known.state === 'DENIED')) {
            return;
          }
          try {
            const res = await fetch(`/api/tx/${id}`);
            const data = await res.json();
            if (data.ok) {
              setStatuses((prev) => ({
                ...prev,
                [id]: {
                  state: data.state ?? 'INITIATED',
                  txHash: data.txHash ?? null,
                  explorerUrl: data.explorerUrl ?? null,
                },
              }));
            }
          } catch {
            /* one bad poll, try again */
          }
        })
      );
    }

    poll();
    const interval = setInterval(() => {
      if (attempts > 30) {
        clearInterval(interval);
        return;
      }
      poll();
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleTxIds.join('|')]);

  return statuses;
}

function RunReport({ run }: { run: PayrollRun }) {
  const live = useTxStatuses(run.items.map((i) => i.circleTxId).filter(Boolean));

  return (
    <Card variant="gradient" className="p-1.5">
      <div className="rounded-[1.4rem] bg-[color:var(--surface)]/95 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">Last run</div>
            <h2 className="mt-1 font-serif text-2xl font-medium tracking-tight text-[color:var(--cream-200)]">
              {run.employer}
            </h2>
            <p className="text-sm text-[color:var(--cream-400)]">
              {new Date(run.runAt).toLocaleString()} · total{' '}
              <span className="text-[color:var(--cream-200)] font-mono">{formatUsd(Number(run.totalUsdc))}</span>
            </p>
          </div>
          <Badge tone="brand" className="self-start sm:self-auto">{run.items.length} transfers · settled in seconds</Badge>
        </div>

        {/* Desktop: table */}
        <div className="mt-5 hidden md:block">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
              <tr>
                <th className="text-left px-2 py-2 font-semibold">Contractor</th>
                <th className="text-left px-2 py-2 font-semibold">Wallet</th>
                <th className="text-right px-2 py-2 font-semibold">Amount</th>
                <th className="text-left px-2 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {run.items.map((it, i) => {
                const liveStatus = live[it.circleTxId];
                const state = liveStatus?.state ?? it.state;
                const recipientExplorer = `https://testnet.arcscan.app/address/${it.address}`;
                const txExplorer = liveStatus?.explorerUrl ?? null;
                return (
                  <tr key={i}>
                    <td className="px-2 py-3 text-[color:var(--cream-200)]">
                      {it.contractorName}{' '}
                      <span className="text-xs text-[color:var(--cream-500)]">
                        {COUNTRIES[it.country as CorridorCode]?.flag}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <AddressPill address={it.address} />
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-[color:var(--cream-200)]">
                      {it.amountUsdc} USDC
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TxStateBadge state={state} />
                        {txExplorer ? (
                          <a
                            className="text-xs text-[color:var(--gold-300)] hover:underline inline-flex items-center gap-1"
                            href={txExplorer}
                            target="_blank"
                            rel="noreferrer"
                          >
                            ArcScan tx <ExternalLink className="size-3" />
                          </a>
                        ) : it.circleTxId ? (
                          <a
                            className="text-xs text-[color:var(--cream-500)] hover:text-[color:var(--gold-300)] inline-flex items-center gap-1"
                            href={recipientExplorer}
                            target="_blank"
                            rel="noreferrer"
                          >
                            view recipient <ExternalLink className="size-3" />
                          </a>
                        ) : null}
                      </div>
                      {it.error ? (
                        <div className="text-xs text-[color:var(--danger)] mt-1">{it.error}</div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="mt-5 md:hidden space-y-3">
          {run.items.map((it, i) => {
            const liveStatus = live[it.circleTxId];
            const state = liveStatus?.state ?? it.state;
            const recipientExplorer = `https://testnet.arcscan.app/address/${it.address}`;
            const txExplorer = liveStatus?.explorerUrl ?? null;
            return (
              <div
                key={i}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[color:var(--cream-200)] truncate">
                      {it.contractorName}{' '}
                      <span className="text-xs text-[color:var(--cream-500)]">
                        {COUNTRIES[it.country as CorridorCode]?.flag}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-sm text-[color:var(--cream-200)] tabular shrink-0">
                    {it.amountUsdc} <span className="text-[color:var(--gold-500)]">USDC</span>
                  </div>
                </div>
                <AddressPill address={it.address} />
                <div className="flex items-center gap-2 flex-wrap">
                  <TxStateBadge state={state} />
                  {txExplorer ? (
                    <a
                      className="text-xs text-[color:var(--gold-300)] hover:underline inline-flex items-center gap-1"
                      href={txExplorer}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ArcScan tx <ExternalLink className="size-3" />
                    </a>
                  ) : it.circleTxId ? (
                    <a
                      className="text-xs text-[color:var(--cream-500)] hover:text-[color:var(--gold-300)] inline-flex items-center gap-1"
                      href={recipientExplorer}
                      target="_blank"
                      rel="noreferrer"
                    >
                      view recipient <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
                {it.error ? <div className="text-xs text-[color:var(--danger)]">{it.error}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
