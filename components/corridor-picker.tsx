'use client';
import { CORRIDOR_LIST, type CorridorCode } from '@/lib/corridors';

export function CorridorPicker({
  value,
  onChange,
}: {
  value: CorridorCode;
  onChange: (c: CorridorCode) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {CORRIDOR_LIST.map((c) => {
        const active = c.code === value;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => onChange(c.code)}
            className={[
              'flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-3 text-xs cursor-pointer transition-all',
              active
                ? 'border-[color:var(--gold-500)]/55 bg-[color:var(--gold-500)]/[0.10] text-[color:var(--cream-200)] shadow-[0_0_0_4px_rgba(212,165,47,0.06)]'
                : 'border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 text-[color:var(--cream-300)] hover:bg-[color:var(--surface-1)]/60 hover:border-[color:var(--border-strong)]',
            ].join(' ')}
          >
            <div className="text-xl leading-none">{c.flag}</div>
            <div className="font-medium">{c.country}</div>
            <div className="font-mono text-[10px] text-[color:var(--cream-500)]">{c.localCurrency}</div>
          </button>
        );
      })}
    </div>
  );
}
