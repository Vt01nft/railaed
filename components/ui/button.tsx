import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-[color:var(--mint-400)] text-[color:var(--surface-deep)] hover:bg-[color:var(--mint-300)] shadow-[0_10px_30px_-10px_rgba(126,212,176,0.55)] disabled:opacity-50',
  gold:
    'bg-[color:var(--gold-500)] text-[color:var(--surface-deep)] hover:bg-[color:var(--gold-400)] shadow-[0_10px_30px_-10px_rgba(212,165,47,0.55)] disabled:opacity-50',
  secondary:
    'bg-transparent text-[color:var(--cream-200)] border border-[color:var(--border-strong)] hover:bg-[color:var(--cream-200)]/[0.04]',
  ghost:
    'bg-transparent text-[color:var(--cream-300)] hover:bg-[color:var(--cream-200)]/[0.05] hover:text-[color:var(--cream-200)]',
  danger:
    'bg-[color:var(--danger)]/90 text-[color:var(--surface-deep)] hover:bg-[color:var(--danger)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-full',
  md: 'h-10 px-4 text-sm rounded-full',
  lg: 'h-12 px-7 text-base rounded-full',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className = '', disabled, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold-400)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 animate-spin" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
