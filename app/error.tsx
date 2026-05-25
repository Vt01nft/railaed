'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production we'd ship to Sentry / Datadog here. For the testnet demo,
    // a console.error is fine — the digest is the join key with Vercel logs.
    // eslint-disable-next-line no-console
    console.error('railaed.error', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-5 sm:px-6 py-16 sm:py-20">
      <Card>
        <CardContent className="pt-6 pb-6 space-y-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-12 rounded-2xl bg-[color:var(--danger)]/15 text-[color:var(--danger)] grid place-items-center border border-[color:var(--danger)]/30 shrink-0">
              <AlertTriangle className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">Something went wrong</div>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-[color:var(--cream-200)] tracking-tight">
                That request didn&apos;t settle.
              </h1>
              <p className="mt-2 text-sm text-[color:var(--cream-400)] leading-relaxed">
                The server hit an unexpected error. The on-chain state is unchanged, so it&apos;s
                safe to retry. If this keeps happening, the Arc testnet RPC or Circle&apos;s API
                may be having a moment.
              </p>
            </div>
          </div>
          {error.digest ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 px-4 py-2 font-mono text-xs text-[color:var(--cream-500)] break-all">
              digest: {error.digest}
            </div>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button variant="gold" onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="size-4" /> Try again
            </Button>
            <Link href="/" className="pill-outline h-10 px-5 justify-center text-sm">
              Back home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
