'use client';
import { useEffect, useState } from 'react';
import { Loader2, Play, Plus, Trash2, ExternalLink, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddressPill } from '@/components/address-pill';
import { TxStateBadge } from '@/components/tx-state-badge';
import { CORRIDORS, CORRIDOR_LIST, type CorridorCode } from '@/lib/corridors';
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
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16 space-y-6">
      <header className="text-center mb-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-500)]">Global payroll</div>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[color:var(--cream-200)]">
          Pay every contractor <span className="italic text-gold-bright">in one click</span>
        </h1>
        <p className="mt-3 text-sm text-[color:var(--cream-400)] max-w-xl mx-auto">
          Each contractor gets their own Circle wallet on Arc. Parallel transfers, settled in seconds, every line traceable on ArcScan.
        </p>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-64">
          <Label htmlFor="employer">Employer name</Label>
          <Input id="employer" className="mt-2" value={employer} onChange={(e) => setEmployer(e.target.value)} />
        </div>
        <Badge tone="gold">{contractors.length} contractors · {formatUsd(total)} this run</Badge>
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
            <div className="overflow-x-auto">
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
                          <span className="text-xs text-[color:var(--cream-500)]">— provisions on first run —</span>
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
          )}
        </CardContent>
      </Card>

      {error ? <div className="text-sm text-[color:var(--danger)]">{error}</div> : null}

      <div className="flex flex-wrap items-center gap-3 justify-end">
        <Button variant="secondary" onClick={() => saveContractors(contractors)}>
          Save changes
        </Button>
        <Button onClick={runPayroll} loading={running} size="lg" variant="gold" disabled={contractors.length === 0}>
          <Play className="size-4" /> Run payroll · {formatUsd(total)}
        </Button>
      </div>

      {lastRun ? <RunReport run={lastRun} /> : null}
    </div>
  );
}

function RunReport({ run }: { run: PayrollRun }) {
  return (
    <Card variant="gradient" className="p-1.5">
      <div className="rounded-[1.4rem] bg-[color:var(--surface)]/95 p-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">Last run</div>
            <h2 className="mt-1 font-serif text-2xl font-medium tracking-tight text-[color:var(--cream-200)]">
              {run.employer}
            </h2>
            <p className="text-sm text-[color:var(--cream-400)]">
              {new Date(run.runAt).toLocaleString()} · total{' '}
              <span className="text-[color:var(--cream-200)] font-mono">{formatUsd(Number(run.totalUsdc))}</span>
            </p>
          </div>
          <Badge tone="brand">{run.items.length} transfers · settled in seconds</Badge>
        </div>

        <div className="mt-5 overflow-x-auto">
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
              {run.items.map((it, i) => (
                <tr key={i}>
                  <td className="px-2 py-3 text-[color:var(--cream-200)]">
                    {it.contractorName}{' '}
                    <span className="text-xs text-[color:var(--cream-500)]">
                      {CORRIDORS[it.country as CorridorCode]?.flag}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <AddressPill address={it.address} />
                  </td>
                  <td className="px-2 py-3 text-right font-mono text-[color:var(--cream-200)]">
                    {it.amountUsdc} USDC
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <TxStateBadge state={it.state} />
                      {it.circleTxId ? (
                        <a
                          className="text-xs text-[color:var(--cream-500)] hover:text-[color:var(--gold-300)] inline-flex items-center gap-1"
                          href={`/api/tx/${it.circleTxId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          tx <ExternalLink className="size-3" />
                        </a>
                      ) : null}
                    </div>
                    {it.error ? (
                      <div className="text-xs text-[color:var(--danger)] mt-1">{it.error}</div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
