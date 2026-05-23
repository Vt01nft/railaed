import Link from 'next/link';
import { ArrowRight, Users, Globe2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Logo, ScallopBadge } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddressPill } from '@/components/address-pill';
import { loadLanding, humanAgo } from '@/lib/landing-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const data = await loadLanding();

  return (
    <div className="relative">
      {/* Hero. Centred "logotype" composition à la Smaragd */}
      <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Scallop badge: only on lg+, kept far enough from the centre to avoid clipping */}
        <div className="absolute left-8 top-32 text-[color:var(--gold-500)]/80 hidden lg:block">
          <ScallopBadge text={'MADE\nON ARC'} size={108} />
        </div>

        <div className="flex flex-col items-center text-center">
          <Logo size="xl" variant="stacked" spin />

          <h1 className="mt-12 font-serif text-[2.75rem] sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.02] text-[color:var(--cream-200)] max-w-4xl">
            UAE to anywhere,<br />
            <span className="italic text-gold-bright">in seconds on Arc.</span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--cream-400)] max-w-2xl leading-relaxed">
            Pay in AED. Settle in USDC. Deliver to the seven biggest UAE-expat corridors with a live
            <span className="text-[color:var(--cream-200)]"> honesty score </span>
            beside every quote. Al Ansari, Wise, Western Union, Remitly.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/send"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold-500)] text-[color:var(--surface-deep)] px-7 h-12 text-base font-medium shadow-[0_14px_40px_-14px_rgba(212,165,47,0.55)] hover:bg-[color:var(--gold-400)] transition-colors"
            >
              Send a remittance
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/payroll" className="pill-outline h-12 px-6 text-base">
              Run payroll
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-xl">
            <Stat label="Settles in" value="≈2 sec" />
            <Stat label="Our fee" value="0.30%" />
            <Stat label="Chain" value="Arc · 5042002" mono />
          </div>
        </div>
      </section>

      {/* Wallet card + features, now wired to live data */}
      <section className="mx-auto max-w-6xl px-6 pb-20 grid lg:grid-cols-[1fr_1fr] gap-8 items-stretch">
        <Card variant="gradient" className="p-1.5">
          <div className="rounded-[1.4rem] bg-[color:var(--surface)]/90 p-7 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[color:var(--mint-300)] animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">
                  Treasury · live on Arc
                </span>
              </div>
              <Badge tone="gold">Owner wallet</Badge>
            </div>

            <div className="mt-7">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--cream-500)]">
                Balance
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-6xl font-medium tabular text-[color:var(--cream-200)] leading-none">
                  {data.ownerUsdc.toFixed(2)}
                </span>
                <span className="text-xl text-[color:var(--gold-500)] font-medium font-serif">USDC</span>
              </div>
              <div className="mt-2 text-sm text-[color:var(--cream-400)] font-mono">
                ≈ AED {data.ownerAedEquivalent.toFixed(2)} · sub-second finality
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--cream-500)] flex items-center gap-1.5">
                <AddressPill address={data.ownerAddress} />
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2">
              <ActionTile href="/send" label="Send" />
              <ActionTile href="/payroll" label="Payroll" />
              <ActionTile href="/api/health" label="Audit" external />
            </div>

            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[color:var(--cream-500)]">
                <span>Last settled</span>
                {data.lastTransfer ? (
                  <span className="font-mono text-[color:var(--mint-300)]">
                    {humanAgo(data.lastTransfer.agoSeconds)} ago
                  </span>
                ) : (
                  <span className="font-mono text-[color:var(--cream-500)] inline-flex items-center gap-1">
                    <RefreshCw className="size-3" /> awaiting first send
                  </span>
                )}
              </div>
              {data.lastTransfer ? (
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-[color:var(--cream-200)] font-medium">
                      Send → {data.lastTransfer.recipientFlag} from {data.lastTransfer.senderName}
                    </div>
                    <AddressPill address={data.lastTransfer.recipientAddress} />
                  </div>
                  <div className="font-mono text-[color:var(--cream-200)] text-right">
                    <span className="text-lg">{data.lastTransfer.amountUsdcDisplay}</span>{' '}
                    <span className="text-[color:var(--gold-500)] text-xs">USDC</span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-[color:var(--cream-500)]">
                  No transfers yet. Head to <Link className="text-[color:var(--gold-300)] hover:underline" href="/send">Send</Link> and the next one shows up here.
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <FeatureCard
            icon={<Globe2 className="size-5" />}
            title="Seven UAE-expat corridors"
            body="India · Philippines · Pakistan · Egypt · Bangladesh · Sri Lanka · Nepal. The largest UAE outbound remittance flows, each pre-configured with local-currency display."
          />
          <FeatureCard
            icon={<Users className="size-5" />}
            title="Global payroll, one click"
            body="Each contractor gets their own Circle wallet on Arc. Parallel transfers settle in seconds, every line fully traceable on ArcScan."
          />
          <FeatureCard
            icon={<ShieldCheck className="size-5" />}
            title="Honesty score, always on"
            body="A live side-by-side against Al Ansari, LuLu, Wise, Remitly, Western Union. Recipient amounts in dollars and dirhams, no hidden FX margin."
          />
        </div>
      </section>

    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 px-4 py-3 text-left">
      <div className="text-[10px] uppercase tracking-[0.20em] text-[color:var(--gold-500)]">{label}</div>
      <div className={`mt-1 text-base font-medium text-[color:var(--cream-200)] ${mono ? 'font-mono tabular' : 'font-serif'}`}>
        {value}
      </div>
    </div>
  );
}

function ActionTile({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const cls =
    'flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-1)]/40 py-3 text-sm font-medium text-[color:var(--cream-200)] hover:bg-[color:var(--surface-1)]/70 hover:border-[color:var(--border-strong)] transition-colors';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card>
      <CardContent className="pt-6 flex gap-4">
        <div className="size-11 shrink-0 rounded-2xl bg-[color:var(--gold-500)]/12 text-[color:var(--gold-300)] grid place-items-center border border-[color:var(--gold-500)]/30">
          {icon}
        </div>
        <div>
          <h3 className="font-serif text-lg font-medium text-[color:var(--cream-200)]">{title}</h3>
          <p className="text-sm text-[color:var(--cream-400)] mt-1.5 leading-relaxed">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}

