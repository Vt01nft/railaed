import * as React from 'react';

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'gold';

const tones: Record<Tone, string> = {
  neutral: 'border border-[color:var(--border)] text-[color:var(--cream-300)] bg-transparent',
  brand:   'border border-[color:var(--border-mint)] text-[color:var(--mint-300)] bg-[color:var(--mint-500)]/10',
  accent:  'border border-[color:var(--border-strong)] text-[color:var(--gold-300)] bg-[color:var(--gold-500)]/10',
  gold:    'border border-[color:var(--border-strong)] text-[color:var(--gold-300)] bg-[color:var(--gold-500)]/12',
  success: 'border border-[color:var(--border-mint)] text-[color:var(--mint-300)] bg-[color:var(--mint-500)]/12',
  warning: 'border border-[color:var(--border-strong)] text-[color:var(--gold-300)] bg-[color:var(--gold-500)]/10',
  danger:  'border border-[color:var(--danger)]/40 text-[color:var(--danger)] bg-[color:var(--danger)]/10',
};

export function Badge({
  tone = 'neutral',
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-medium tracking-tight ${tones[tone]} ${className}`}
      {...rest}
    />
  );
}
