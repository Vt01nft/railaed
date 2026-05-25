'use client';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatUsd } from '@/lib/usdc';

interface Competitor {
  name: string;
  feePct: number;
  flatFeeAed: number;
  settlementMinutes: number;
  recipientUsd: number;
  notes?: string;
}

export function HonestyScore({
  railaedRecipientUsd,
  competitors,
}: {
  railaedRecipientUsd: number;
  competitors: Competitor[];
}) {
  const rows = [
    {
      name: 'RailAED',
      isUs: true,
      feeLabel: '0.30%',
      settle: 'seconds',
      recipientUsd: railaedRecipientUsd,
      notes: 'USDC on Arc · sub-second finality',
    },
    ...competitors.map((c) => ({
      name: c.name,
      isUs: false,
      feeLabel: `${(c.feePct * 100).toFixed(1)}% + AED ${c.flatFeeAed}`,
      settle: humanMinutes(c.settlementMinutes),
      recipientUsd: c.recipientUsd,
      notes: c.notes ?? '',
    })),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40">
      {/* Desktop: full 5-column table */}
      <table className="hidden md:table w-full text-sm">
        <thead className="bg-[color:var(--surface-1)]/40 text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-500)]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Provider</th>
            <th className="px-4 py-3 text-left font-semibold">Fee</th>
            <th className="px-4 py-3 text-left font-semibold">Settles</th>
            <th className="px-4 py-3 text-right font-semibold">Recipient gets</th>
            <th className="px-4 py-3 text-right font-semibold">vs RailAED</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--border)]">
          {rows.map((r, i) => {
            const delta = r.recipientUsd - railaedRecipientUsd;
            return (
              <tr
                key={i}
                className={
                  r.isUs
                    ? 'bg-gradient-to-r from-[color:var(--gold-500)]/[0.08] via-transparent to-transparent'
                    : 'hover:bg-[color:var(--surface-1)]/30'
                }
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        r.isUs
                          ? 'font-serif text-[color:var(--gold-300)] text-base'
                          : 'text-[color:var(--cream-200)]'
                      }
                    >
                      {r.name}
                    </span>
                    {r.isUs ? (
                      <span className="rounded-full bg-[color:var(--gold-500)]/15 border border-[color:var(--gold-500)]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-300)]">
                        You
                      </span>
                    ) : null}
                  </div>
                  {r.notes ? (
                    <div className="text-xs text-[color:var(--cream-500)] font-normal mt-0.5">{r.notes}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-[color:var(--cream-300)] text-xs">{r.feeLabel}</td>
                <td className="px-4 py-3 text-[color:var(--cream-400)] text-xs">{r.settle}</td>
                <td className="px-4 py-3 text-right font-mono text-[color:var(--cream-200)]">
                  {formatUsd(r.recipientUsd)}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.isUs ? (
                    <span className="text-[color:var(--cream-500)]">·</span>
                  ) : delta < 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-[color:var(--danger)] font-mono text-xs">
                      <ArrowDown className="size-3.5" />
                      {formatUsd(Math.abs(delta))}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[color:var(--mint-300)] font-mono text-xs">
                      <ArrowUp className="size-3.5" />
                      {formatUsd(delta)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile: stacked rows. Provider + recipient-gets on one line, fee/settle/delta below. */}
      <div className="md:hidden divide-y divide-[color:var(--border)]">
        {rows.map((r, i) => {
          const delta = r.recipientUsd - railaedRecipientUsd;
          return (
            <div
              key={i}
              className={
                'px-4 py-3 ' +
                (r.isUs
                  ? 'bg-gradient-to-r from-[color:var(--gold-500)]/[0.08] via-transparent to-transparent'
                  : '')
              }
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                  <span
                    className={
                      r.isUs
                        ? 'font-serif text-[color:var(--gold-300)] text-base'
                        : 'text-[color:var(--cream-200)] text-sm'
                    }
                  >
                    {r.name}
                  </span>
                  {r.isUs ? (
                    <span className="rounded-full bg-[color:var(--gold-500)]/15 border border-[color:var(--gold-500)]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-300)]">
                      You
                    </span>
                  ) : null}
                </div>
                <div className="text-right font-mono text-sm text-[color:var(--cream-200)] tabular shrink-0">
                  {formatUsd(r.recipientUsd)}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[color:var(--cream-500)]">
                <span className="font-mono text-[color:var(--cream-400)] truncate">{r.feeLabel}</span>
                <span className="shrink-0">·</span>
                <span className="truncate">{r.settle}</span>
                <span className="shrink-0">·</span>
                <span className="shrink-0">
                  {r.isUs ? (
                    <span className="text-[color:var(--cream-500)]">—</span>
                  ) : delta < 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-[color:var(--danger)] font-mono">
                      <ArrowDown className="size-3" />
                      {formatUsd(Math.abs(delta))}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[color:var(--mint-300)] font-mono">
                      <ArrowUp className="size-3" />
                      {formatUsd(delta)}
                    </span>
                  )}
                </span>
              </div>
              {r.notes ? (
                <div className="text-[11px] text-[color:var(--cream-500)] mt-0.5">{r.notes}</div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 text-[11px] text-[color:var(--cream-500)] bg-[color:var(--surface-deep)]/40">
        Competitor fees are illustrative, based on publicly-published price sheets. Live partner quotes will be wired via the StableFX gated rail once access is granted.
      </div>
    </div>
  );
}

function humanMinutes(m: number): string {
  if (m < 1) return 'seconds';
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
