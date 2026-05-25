import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 sm:px-6 py-16 sm:py-20">
      <Card>
        <CardContent className="pt-6 pb-6 space-y-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-12 rounded-2xl bg-[color:var(--gold-500)]/15 text-[color:var(--gold-300)] grid place-items-center border border-[color:var(--gold-500)]/30 shrink-0">
              <Compass className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)]">404</div>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-[color:var(--cream-200)] tracking-tight">
                Off the rails.
              </h1>
              <p className="mt-2 text-sm text-[color:var(--cream-400)] leading-relaxed">
                There&apos;s nothing here. Probably an old or mistyped link.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--gold-500)] text-[color:var(--surface-deep)] h-10 px-5 text-sm font-medium hover:bg-[color:var(--gold-400)] transition-colors w-full sm:w-auto"
            >
              Back home
            </Link>
            <Link href="/send" className="pill-outline h-10 px-5 justify-center text-sm">
              Send money
            </Link>
            <Link href="/payroll" className="pill-outline h-10 px-5 justify-center text-sm">
              Run payroll
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
