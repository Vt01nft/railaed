import * as React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`h-11 w-full rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-deep)]/60 px-5 text-base text-[color:var(--cream-200)] outline-none focus:border-[color:var(--gold-400)] focus:ring-2 focus:ring-[color:var(--gold-400)]/25 placeholder:text-[color:var(--cream-500)] transition-colors ${className}`}
        {...rest}
      />
    );
  }
);

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ className = '', ...rest }, ref) {
    return (
      <label
        ref={ref}
        className={`text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold-500)] ${className}`}
        {...rest}
      />
    );
  }
);

export function FieldHint({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'danger' }) {
  return (
    <p className={`text-xs mt-1 ${tone === 'danger' ? 'text-[color:var(--danger)]' : 'text-[color:var(--cream-500)]'}`}>
      {children}
    </p>
  );
}
