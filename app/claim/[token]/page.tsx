'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, RefreshCw, ExternalLink, Wallet, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddressPill } from '@/components/address-pill';

interface ClaimResp {
  ok: boolean;
  error?: string;
  payload?: {
    id: string;
    recipientWalletId: string;
    recipientAddress: string;
    amountUsdc: string;
    recipientPhone: string;
    senderName: string;
    createdAt: string;
    expiresAt: number;
  };
  transfer?: {
    id: string;
    senderName: string;
    recipientPhone: string;
    recipientCountry: string;
    recipientWalletId: string;
    recipientAddress: string;
    amountUsdc: string;
    circleTxId: string;
    txHash?: string;
    createdAt: string;
    claimedAt?: string;
  } | null;
  onchainBalance?: { raw: string; human: string };
  corridor?: { code: string; country: string; flag: string; localCurrency: string; usdToLocalRate: number };
}

export default function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<ClaimResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/claim/${token}`, { cache: 'no-store' });
      const json = (await res.json()) as ClaimResp;
      setData(json);
      if (json.transfer?.claimedAt) setAccepted(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch claim data (token decode + on-chain balance) on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    load();
  }, [token]);

  useEffect(() => {
    if (!data?.ok || !data.payload) return;
    const recipientHas = Number(data.onchainBalance?.human ?? '0') > 0;
    if (recipientHas) return;
    const t = setInterval(load, 3000);
    setTimeout(() => clearInterval(t), 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.ok]);

  async function accept() {
    setAccepting(true);
    try {
      const res = await fetch(`/api/claim/${token}`, { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.ok) setAccepted(true);
    } finally {
      setAccepting(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center text-[color:var(--cream-500)]">
        <Loader2 className="size-6 animate-spin mx-auto" />
        <div className="mt-3 text-sm">Verifying claim link…</div>
      </div>
    );
  }

  if (!data?.ok || !data.payload) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20">
        <Card>
          <CardContent className="pt-6 pb-6">
            <h1 className="font-serif text-2xl font-medium text-[color:var(--cream-200)]">Claim link invalid</h1>
            <p className="mt-2 text-sm text-[color:var(--cream-400)]">
              {data?.error ?? 'This claim link is malformed, expired, or already used.'}
            </p>
            <Link href="/" className="mt-4 inline-block text-sm text-[color:var(--gold-300)] hover:underline">
              ← Back home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const p = data.payload;
  const onchain = Number(data.onchainBalance?.human ?? '0');
  const expected = Number(p.amountUsdc);
  const settled = onchain + 0.000001 >= expected;
  const corridor = data.corridor;
  const localAmount = corridor ? onchain * corridor.usdToLocalRate : 0;

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-6 py-10 sm:py-14 lg:py-20 space-y-6">
      <Card variant="gradient" className="p-1.5">
        <div className="rounded-[1.4rem] bg-[color:var(--surface)]/95 p-5 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-12 sm:size-14 rounded-2xl bg-[color:var(--gold-500)]/15 text-[color:var(--gold-300)] grid place-items-center border border-[color:var(--gold-500)]/30 shrink-0">
              <Wallet className="size-6 sm:size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">You&apos;ve received money</div>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[color:var(--cream-200)] break-words">
                {p.senderName} sent you{' '}
                <span className="font-serif italic text-gold-bright">{p.amountUsdc} USDC</span>
              </h1>
              <p className="text-sm text-[color:var(--cream-400)] mt-1">Via RailAED · settled on Arc</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--gold-500)]/[0.06] via-transparent to-[color:var(--mint-500)]/[0.05] p-4 sm:p-6">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">Your wallet balance</div>
            <div className="mt-2 font-serif text-4xl sm:text-6xl font-medium tabular text-[color:var(--cream-200)] leading-none break-words">
              {data.onchainBalance?.human ?? '0'}{' '}
              <span className="text-base sm:text-xl text-[color:var(--gold-500)] font-medium">USDC</span>
            </div>
            {corridor ? (
              <div className="mt-2 text-sm text-[color:var(--cream-400)] font-mono">
                ≈ {localAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} {corridor.localCurrency}{' '}
                {corridor.flag}
              </div>
            ) : null}
            <div className="mt-4 flex items-center gap-2">
              {settled ? (
                <Badge tone="success">
                  <Check className="size-3" /> Confirmed on Arc
                </Badge>
              ) : (
                <Badge tone="warning" className="gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  Settling on Arc…
                </Badge>
              )}
              <Button size="sm" variant="ghost" onClick={load}>
                <RefreshCw className="size-3.5" /> refresh
              </Button>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field label="Wallet address">
              <AddressPill address={p.recipientAddress} />
            </Field>
            <Field label="From">
              <span className="text-sm font-medium text-[color:var(--cream-200)]">{p.senderName}</span>
            </Field>
            <Field label="Sent at">
              <span className="font-mono text-xs text-[color:var(--cream-300)]">
                {new Date(p.createdAt).toLocaleString()}
              </span>
            </Field>
            <Field label="Link expires">
              <span className="font-mono text-xs text-[color:var(--cream-300)]">
                {new Date(p.expiresAt).toLocaleString()}
              </span>
            </Field>
          </div>

          {settled ? (
            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-5">
              <div className="flex items-center gap-2 text-[color:var(--cream-200)] font-medium">
                <Banknote className="size-4 text-[color:var(--gold-300)]" /> Cash out
              </div>
              <p className="mt-1.5 text-sm text-[color:var(--cream-400)]">
                In production this hands off to a local off-ramp partner (
                {corridor?.country} → {corridor?.localCurrency}). For the testnet demo, your USDC sits in your Arc wallet, verifiably yours.
              </p>
              {!accepted ? (
                <Button className="mt-4" variant="gold" onClick={accept} loading={accepting}>
                  <Check className="size-4" /> I&apos;ve received it
                </Button>
              ) : (
                <Badge tone="success" className="mt-4">
                  <Check className="size-3" /> Claim acknowledged
                </Badge>
              )}
            </div>
          ) : null}

          <a
            href={`https://testnet.arcscan.app/address/${p.recipientAddress}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-sm text-[color:var(--gold-300)] hover:underline"
          >
            View this wallet on ArcScan <ExternalLink className="size-3.5" />
          </a>
        </div>
      </Card>

      <p className="text-center text-xs text-[color:var(--cream-500)]">
        Testnet demo · USDC on Arc · chain 5042002 · not financial advice.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.20em] text-[color:var(--gold-500)]">{label}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
