'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Globe2, Search, X } from 'lucide-react';
import { CORRIDOR_LIST, ALL_COUNTRIES, COUNTRIES, type CorridorCode } from '@/lib/corridors';

export function CorridorPicker({
  value,
  onChange,
}: {
  value: CorridorCode;
  onChange: (c: CorridorCode) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // When opened, focus the input.
  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  // Close on outside click.
  useEffect(() => {
    if (!searchOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [searchOpen]);

  // Whether the current value is one of the featured tiles.
  const featuredCodes = useMemo(() => CORRIDOR_LIST.map((c) => c.code), []);
  const isFeatured = featuredCodes.includes(value);
  const selectedMeta = COUNTRIES[value];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES.filter((c) => !c.featured).slice(0, 30);
    return ALL_COUNTRIES.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.localCurrency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [query]);

  function pick(code: CorridorCode) {
    onChange(code);
    setSearchOpen(false);
    setQuery('');
  }

  return (
    <div className="space-y-3">
      {/* Featured tiles */}
      <div className="grid grid-cols-4 gap-2">
        {CORRIDOR_LIST.map((c) => {
          const active = c.code === value;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onChange(c.code as CorridorCode)}
              className={[
                'flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-3 text-xs cursor-pointer transition-all',
                active
                  ? 'border-[color:var(--gold-500)]/55 bg-[color:var(--gold-500)]/[0.10] text-[color:var(--cream-200)] shadow-[0_0_0_4px_rgba(212,165,47,0.06)]'
                  : 'border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 text-[color:var(--cream-300)] hover:bg-[color:var(--surface-1)]/60 hover:border-[color:var(--border-strong)]',
              ].join(' ')}
            >
              <div className="text-xl leading-none">{c.flag}</div>
              <div className="font-medium text-[11px]">{c.country.replace('United ', '').replace(' Kingdom', 'K').replace(' States', 'SA')}</div>
              <div className="font-mono text-[10px] text-[color:var(--cream-500)]">{c.localCurrency}</div>
            </button>
          );
        })}
      </div>

      {/* "More countries" search */}
      <div ref={wrapperRef} className="relative">
        {!isFeatured && selectedMeta ? (
          <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--gold-500)]/55 bg-[color:var(--gold-500)]/[0.10] px-4 py-3">
            <span className="text-xl">{selectedMeta.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[color:var(--cream-200)] text-sm truncate">
                {selectedMeta.country}
              </div>
              <div className="font-mono text-[10px] text-[color:var(--cream-500)]">
                {selectedMeta.localCurrency}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange('IN' as CorridorCode)}
              className="text-[color:var(--cream-500)] hover:text-[color:var(--cream-200)] p-1 rounded-full hover:bg-[color:var(--surface-1)]/60"
              title="Clear selection"
            >
              <X className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="text-xs text-[color:var(--gold-300)] hover:underline px-2"
            >
              change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-deep)]/30 px-4 py-2.5 text-sm text-[color:var(--cream-400)] hover:bg-[color:var(--surface-1)]/40 hover:text-[color:var(--cream-200)] transition-colors"
          >
            <Globe2 className="size-4" />
            Send to another country…
          </button>
        )}

        {searchOpen ? (
          <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="relative border-b border-[color:var(--border)]">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--cream-500)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or currency…"
                className="w-full h-11 pl-10 pr-3 bg-transparent text-sm text-[color:var(--cream-200)] placeholder:text-[color:var(--cream-500)] outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-sm text-[color:var(--cream-500)] text-center">
                  No country matches “{query}”.
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => pick(c.code as CorridorCode)}
                    className={[
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[color:var(--surface-1)]/60 transition-colors',
                      c.code === value ? 'bg-[color:var(--gold-500)]/[0.10]' : '',
                    ].join(' ')}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="flex-1 text-[color:var(--cream-200)]">{c.country}</span>
                    <span className="font-mono text-[10px] text-[color:var(--cream-500)]">
                      {c.localCurrency}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
