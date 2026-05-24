'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, ExternalLink, Loader2, Share2, Sparkles, Info } from 'lucide-react';
import { AddressPill } from '@/components/address-pill';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, FieldHint } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CorridorPicker } from '@/components/corridor-picker';
import { HonestyScore } from '@/components/honesty-score';
import { TxStateBadge } from '@/components/tx-state-badge';
import { HistoryList } from '@/components/history-list';
import { COUNTRIES, dialCodeFor, type CorridorCode, DEFAULT_CORRIDOR } from '@/lib/corridors';
import { formatAed, formatUsd } from '@/lib/usdc';

interface QuoteResp {
  quote: {
    senderAed: number;
    fxRate: number;
    baseUsd: number;
    railaedFeePct: number;
    railaedFeeUsd: number;
    recipientUsd: number;
    recipientUsdc: number;
    settlementSeconds: number;
    destinationLocal: { currency: string; amount: number; rate: number };
  };
  honestyScore: {
    railaedRecipientUsd: number;
    competitors: Array<{ name: string; feePct: number; flatFeeAed: number; settlementMinutes: number; recipientUsd: number; notes?: string }>;
    savingsVsAverageAed: number;
    averageCompetitorFeePct: number;
  };
  corridor: { code: string; country: string; flag: string; localCurrency: string; expatPopulationInUae?: string; notes?: string };
}

interface SendResp {
  transferId: string;
  claimUrl: string;
  claimToken: string;
  circleTxId: string;
  circleTxState: string;
  recipientAddress: string;
  recipientWalletId: string;
  amountUsdc: string;
}

interface TxResp {
  ok: boolean;
  id?: string;
  state?: string;
  txHash?: string | null;
  explorerUrl?: string | null;
}

export default function SendPage() {
  const [aed, setAed] = useState('500');
  const [corridor, setCorridor] = useState<CorridorCode>(DEFAULT_CORRIDOR);
  const [senderName, setSenderName] = useState('Ahmed (Dubai)');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState(dialCodeFor(DEFAULT_CORRIDOR));
  const [quote, setQuote] = useState<QuoteResp | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteErr, setQuoteErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const [result, setResult] = useState<SendResp | null>(null);
  const [tx, setTx] = useState<TxResp | null>(null);

  const aedNum = useMemo(() => Number(aed) || 0, [aed]);

  // Auto-rewrite the dial code when the corridor changes, but only if the
  // user hasn't already typed past the previous code (so we don't wipe their
  // input mid-edit).
  useEffect(() => {
    const newCode = dialCodeFor(corridor);
    setRecipientPhone((prev) => {
      // Find a known dial-code prefix in the current value; if everything
      // after the old prefix is just whitespace, replace; otherwise leave alone.
      const matched = prev.match(/^\+\d{1,4}/)?.[0] ?? '';
      const rest = prev.slice(matched.length).trim();
      if (!rest) return newCode;
      return prev; // user has typed digits past the prefix; respect that
    });
  }, [corridor]);

  useEffect(() => {
    if (aedNum <= 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setQuoting(true);
      setQuoteErr(null);
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ senderAed: aedNum, corridor }),
        });
        const data = (await res.json()) as QuoteResp | { error: string };
        if (cancelled) return;
        if ('error' in data) setQuoteErr(data.error);
        else setQuote(data);
      } catch (err) {
        if (!cancelled) setQuoteErr(err instanceof Error ? err.message : 'quote failed');
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [aedNum, corridor]);

  useEffect(() => {
    if (!result?.circleTxId) return;
    let cancelled = false;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/tx/${result.circleTxId}`);
        const data = (await res.json()) as TxResp;
        if (cancelled) return;
        setTx(data);
        if (
          data.state === 'COMPLETE' ||
          data.state === 'CONFIRMED' ||
          data.state === 'FAILED' ||
          data.state === 'CANCELLED' ||
          data.state === 'DENIED' ||
          attempts > 60
        ) {
          clearInterval(interval);
        }
      } catch {
        /* tx may not exist yet */
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [result?.circleTxId]);

  async function onSend() {
    setSending(true);
    setSendErr(null);
    setResult(null);
    setTx(null);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderAed: aedNum,
          recipientPhone,
          recipientName: recipientName || undefined,
          corridor,
        }),
      });
      // Be defensive: if the server returns HTML (e.g. an unhandled 500),
      // .json() throws "Unexpected end of JSON input". Read as text first,
      // then attempt to parse, so we can show the user something useful.
      const raw = await res.text();
      let data: { error?: string; hint?: string } & Record<string, unknown> = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          res.ok
            ? 'send succeeded but response was malformed'
            : `send failed (HTTP ${res.status}). ${raw.slice(0, 140)}`.trim()
        );
      }
      if (!res.ok) {
        const detail = data.error ?? `send failed (HTTP ${res.status})`;
        throw new Error(data.hint ? `${detail} — ${data.hint}` : detail);
      }
      setResult(data as unknown as SendResp);
    } catch (err) {
      setSendErr(err instanceof Error ? err.message : 'send failed');
    } finally {
      setSending(false);
    }
  }

  function resetForNew() {
    setResult(null);
    setTx(null);
    setSendErr(null);
  }

  if (result) {
    return (
      <SuccessView
        result={result}
        tx={tx}
        corridor={corridor}
        amountAed={aedNum}
        recipientName={recipientName}
        recipientPhone={recipientPhone}
        onAgain={resetForNew}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <header className="text-center mb-8">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-500)]">Send money</div>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[color:var(--cream-200)]">
          UAE → <span className="italic text-gold-bright">{COUNTRIES[corridor].country}</span>
        </h1>
      </header>

      {/* How money moves: explainer */}
      <div className="mb-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-5">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-2xl bg-[color:var(--gold-500)]/12 text-[color:var(--gold-300)] grid place-items-center border border-[color:var(--gold-500)]/30 shrink-0">
            <Info className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">
              How money moves
            </div>
            <div className="mt-2 grid sm:grid-cols-3 gap-3 text-sm">
              <FlowStep n={1} title="Your wallet">
                <span className="text-[color:var(--cream-400)] text-xs">
                  Tap <span className="text-[color:var(--cream-200)]">Sign in</span> for your own
                  Circle wallet · fund it from the testnet faucet in one tap
                </span>
              </FlowStep>
              <FlowStep n={2} title="USDC on Arc">
                <span className="text-[color:var(--cream-400)] text-xs">
                  Sub-second finality · gas paid in USDC
                </span>
              </FlowStep>
              <FlowStep n={3} title="Recipient wallet">
                <span className="text-[color:var(--cream-400)] text-xs">
                  Auto-provisioned per send · WhatsApp claim link
                </span>
              </FlowStep>
            </div>
            <p className="mt-3 text-xs text-[color:var(--cream-500)] leading-relaxed">
              Not signed in? The send falls back to the platform treasury so you can try the flow
              instantly. Production would replace this with Circle User-Controlled Wallets
              (PIN/passkey) and a card/bank on-ramp.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6">
        <Card variant="gradient" className="p-1.5">
          <div className="rounded-[1.4rem] bg-[color:var(--surface)]/95 p-7">
            <div className="space-y-6">
              <div>
                <Label htmlFor="aed">You send</Label>
                <div className="mt-2 relative">
                  <Input
                    id="aed"
                    inputMode="decimal"
                    value={aed}
                    onChange={(e) => setAed(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="500"
                    className="h-16 pl-6 pr-20 font-serif text-3xl font-medium tabular text-[color:var(--cream-200)] rounded-2xl"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-sm text-[color:var(--gold-500)]">AED</span>
                </div>
              </div>

              <div>
                <Label>Destination corridor</Label>
                <div className="mt-2">
                  <CorridorPicker value={corridor} onChange={setCorridor} />
                </div>
                {COUNTRIES[corridor].expatPopulationInUae ? (
                  <FieldHint>
                    {COUNTRIES[corridor].country} hosts ~{COUNTRIES[corridor].expatPopulationInUae} of the UAE&apos;s expat
                    population, the largest UAE outbound corridor for many senders.
                  </FieldHint>
                ) : null}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sender">Your name</Label>
                  <Input id="sender" className="mt-2" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="recipient">Recipient name</Label>
                  <Input
                    id="recipient"
                    className="mt-2"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="optional · e.g. Priya"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Recipient phone</Label>
                <Input
                  id="phone"
                  className="mt-2 font-mono"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder={`${dialCodeFor(corridor)} 98xxxxxxxx`}
                />
                <FieldHint>Addresses the share link (WhatsApp / SMS). Not transmitted on-chain.</FieldHint>
              </div>

              {sendErr ? <FieldHint tone="danger">{sendErr}</FieldHint> : null}

              <Button
                onClick={onSend}
                loading={sending}
                disabled={!aedNum || aedNum <= 0 || !recipientPhone || recipientPhone.length < 6}
                size="lg"
                variant="gold"
                className="w-full"
              >
                {sending ? 'Settling on Arc…' : 'Send now'}
                {!sending ? <ArrowRight className="size-4" /> : null}
              </Button>
              <p className="text-[11px] text-[color:var(--cream-500)] text-center">
                Testnet demo. Funds move from the platform&apos;s Circle wallet → a new recipient wallet on Arc testnet.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live quote</span>
                {quoting ? <Loader2 className="size-4 animate-spin text-[color:var(--cream-500)]" /> : null}
              </CardTitle>
              <CardDescription>Locked in the moment you tap Send.</CardDescription>
            </CardHeader>
            <CardContent>
              {quoteErr ? <FieldHint tone="danger">{quoteErr}</FieldHint> : null}
              {!quote ? (
                <div className="text-sm text-[color:var(--cream-500)]">Enter an amount to see the quote.</div>
              ) : (
                <div className="space-y-3 text-sm">
                  <Row label="You send" value={formatAed(quote.quote.senderAed)} mono />
                  <Row label="FX rate" value={`1 AED = ${quote.quote.fxRate.toFixed(4)} USD`} mono />
                  <Row
                    label="RailAED fee"
                    value={`${(quote.quote.railaedFeePct * 100).toFixed(2)}% · ${formatUsd(quote.quote.railaedFeeUsd)}`}
                    mono
                  />
                  <div className="border-t border-[color:var(--border)] pt-4 space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
                        Recipient gets
                      </span>
                      <div className="text-right">
                        <div className="font-serif text-3xl font-medium text-[color:var(--cream-200)] tabular">
                          {quote.quote.recipientUsdc.toFixed(2)}{' '}
                          <span className="text-base text-[color:var(--gold-500)] font-medium">USDC</span>
                        </div>
                        <div className="text-xs text-[color:var(--cream-400)] font-mono mt-0.5">
                          ≈{' '}
                          {quote.quote.destinationLocal.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}{' '}
                          {quote.quote.destinationLocal.currency}
                        </div>
                      </div>
                    </div>
                    <Row label="Settles in" value={`~${quote.quote.settlementSeconds} sec`} />
                  </div>
                  {quote.honestyScore.savingsVsAverageAed > 0 ? (
                    <Badge tone="success" className="mt-2">
                      <Sparkles className="size-3" />
                      Saves {formatAed(quote.honestyScore.savingsVsAverageAed)} vs industry average
                    </Badge>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {quote ? (
            <Card>
              <CardHeader>
                <CardTitle>Honesty score</CardTitle>
                <CardDescription>What every other UAE rail would charge for the same AED.</CardDescription>
              </CardHeader>
              <CardContent>
                <HonestyScore
                  railaedRecipientUsd={quote.honestyScore.railaedRecipientUsd}
                  competitors={quote.honestyScore.competitors}
                />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Your recent sends</CardTitle>
              <CardDescription>Pulled live from Circle. Click ArcScan to verify on-chain.</CardDescription>
            </CardHeader>
            <CardContent>
              <HistoryList limit={6} kind="transfer" compact autoRefreshSeconds={15} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/40 p-3">
      <div className="flex items-center gap-2">
        <span className="size-5 grid place-items-center rounded-full bg-[color:var(--gold-500)]/15 border border-[color:var(--gold-500)]/40 text-[10px] font-semibold text-[color:var(--gold-300)]">
          {n}
        </span>
        <span className="text-[color:var(--cream-200)] font-medium text-sm">{title}</span>
      </div>
      <div className="mt-1.5 pl-7">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--cream-500)]">{label}</span>
      <span className={`text-[color:var(--cream-200)] ${mono ? 'font-mono tabular' : ''}`}>{value}</span>
    </div>
  );
}

function SuccessView({
  result,
  tx,
  corridor,
  amountAed,
  recipientName,
  recipientPhone,
  onAgain,
}: {
  result: SendResp;
  tx: TxResp | null;
  corridor: CorridorCode;
  amountAed: number;
  recipientName: string;
  recipientPhone: string;
  onAgain: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(result.claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const shareText = `Hey${recipientName ? ' ' + recipientName : ''}! I sent you ${result.amountUsdc} USDC via RailAED. Claim it here:`;
  const whatsapp = `https://wa.me/${recipientPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(shareText + ' ' + result.claimUrl)}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
      <Card variant="gradient" className="p-1.5">
        <div className="rounded-[1.4rem] bg-[color:var(--surface)]/95 p-8">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-[color:var(--mint-500)]/15 text-[color:var(--mint-300)] grid place-items-center border border-[color:var(--mint-500)]/30 shrink-0">
              <Check className="size-7" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">Sent</div>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-[color:var(--cream-200)]">
                {formatAed(amountAed)} <span className="text-[color:var(--cream-500)]">→</span>{' '}
                {result.amountUsdc} <span className="text-[color:var(--gold-500)]">USDC</span>
              </h2>
              <p className="text-sm text-[color:var(--cream-400)] mt-1">
                Locked on Arc for {COUNTRIES[corridor].flag} {COUNTRIES[corridor].country}.
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">Claim link</div>
            <div className="mt-2 break-all font-mono text-xs text-[color:var(--cream-300)]">{result.claimUrl}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={copy} size="sm" variant="secondary">
                {copied ? <Check className="size-4 text-[color:var(--mint-300)]" /> : <Copy className="size-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="pill-outline h-8 px-4 text-sm">
                <Share2 className="size-4" />
                Share via WhatsApp
              </a>
              <Link href={`/claim/${result.claimToken}`} className="pill-outline h-8 px-4 text-sm" target="_blank">
                <ExternalLink className="size-4" />
                Open as recipient
              </Link>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <Fact label="Recipient wallet">
              <AddressPill address={result.recipientAddress} />
            </Fact>
            <Fact label="Tx status">
              <div className="flex items-center gap-2">
                <TxStateBadge state={tx?.state ?? result.circleTxState} />
                {tx?.txHash && tx.explorerUrl ? (
                  <a
                    className="inline-flex items-center gap-1 text-xs text-[color:var(--gold-300)] hover:underline"
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ArcScan <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
            </Fact>
            <Fact label="Circle tx id">
              <span className="font-mono text-xs text-[color:var(--cream-300)]">{result.circleTxId}</span>
            </Fact>
            <Fact label="Amount">
              <span className="font-mono text-[color:var(--cream-200)]">{result.amountUsdc} USDC</span>
            </Fact>
          </div>

          <div className="mt-8 flex gap-2">
            <Button onClick={onAgain} variant="secondary">
              Send another
            </Button>
            <Link href="/payroll" className="pill-outline h-10 px-4 text-sm">
              Try payroll mode
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.20em] text-[color:var(--gold-500)]">{label}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
