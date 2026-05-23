import * as React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'mark' | 'lockup' | 'stacked';
  className?: string;
  spin?: boolean;
}

const sizes = {
  xs: { mark: 22, text: 'text-sm',  gap: 'gap-1.5' },
  sm: { mark: 30, text: 'text-lg',  gap: 'gap-2.5' },
  md: { mark: 44, text: 'text-2xl', gap: 'gap-3' },
  lg: { mark: 64, text: 'text-4xl', gap: 'gap-3.5' },
  xl: { mark: 120, text: 'text-6xl', gap: 'gap-4' },
} as const;

export function Logo({ size = 'sm', variant = 'lockup', className = '', spin }: LogoProps) {
  const s = sizes[size];
  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <LogoMark size={s.mark} spin={spin} />
        <div className={`mt-3 font-serif font-medium tracking-tight leading-none text-[color:var(--gold-300)] ${s.text}`}>
          RailAED
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-500)]/70">
          Stablecoin Remittance
        </div>
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.mark} spin={spin} />
      {variant === 'lockup' ? (
        <span className={`font-serif font-medium tracking-tight leading-none text-[color:var(--gold-300)] ${s.text}`}>
          RailAED
        </span>
      ) : null}
    </div>
  );
}

export function LogoMark({ size = 32, spin = false }: { size?: number; spin?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RailAED"
      role="img"
      className={spin ? 'animate-slow-spin' : undefined}
    >
      <defs>
        <radialGradient id="rl-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a4a40" stopOpacity="0" />
          <stop offset="100%" stopColor="#0c2820" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rl-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9be3c0" />
          <stop offset="100%" stopColor="#5fc99a" />
        </linearGradient>
        <linearGradient id="rl-teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ab695" />
          <stop offset="100%" stopColor="#2a8a6a" />
        </linearGradient>
        <linearGradient id="rl-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f8c70" />
          <stop offset="100%" stopColor="#1c5d49" />
        </linearGradient>
        <linearGradient id="rl-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0c34d" />
          <stop offset="100%" stopColor="#c98e1f" />
        </linearGradient>
      </defs>

      {/* Six organic facets clustered in a circle (a "cut-emerald" mosaic),
          plus one gold facet as an AED nod. */}
      <circle cx="32" cy="32" r="28" fill="url(#rl-bg)" />

      {/* top-left */}
      <path
        d="M22 8 Q29 5 34 9 L31 19 Q24 19 19 14 Q19 10 22 8 Z"
        fill="url(#rl-teal)"
      />
      {/* top-right (mint highlight) */}
      <path
        d="M36 9 L46 13 Q49 18 45 22 L33 19 Q31 13 36 9 Z"
        fill="url(#rl-mint)"
      />
      {/* right (deep) */}
      <path
        d="M47 24 L54 30 Q55 37 50 41 L42 33 Q42 27 47 24 Z"
        fill="url(#rl-deep)"
      />
      {/* center (mint accent, the brightest, like the highlighted gem) */}
      <path
        d="M22 21 L33 21 L40 29 L34 39 L22 36 Q17 28 22 21 Z"
        fill="url(#rl-mint)"
      />
      {/* bottom-left */}
      <path
        d="M11 30 L20 30 L22 42 Q17 47 11 44 Q7 38 11 30 Z"
        fill="url(#rl-teal)"
      />
      {/* bottom-right (deep) */}
      <path
        d="M28 42 L42 36 L48 44 Q46 53 38 54 Q30 53 28 42 Z"
        fill="url(#rl-deep)"
      />
      {/* gold accent facet (AED nod) */}
      <path
        d="M38 22 L46 23 L45 30 L37 30 Q35 26 38 22 Z"
        fill="url(#rl-gold)"
      />

      {/* hairline facet edges for premium feel */}
      <g stroke="#0c2820" strokeWidth="1.1" fill="none" strokeLinejoin="round">
        <path d="M22 8 Q29 5 34 9 L31 19 Q24 19 19 14 Q19 10 22 8 Z" />
        <path d="M36 9 L46 13 Q49 18 45 22 L33 19 Q31 13 36 9 Z" />
        <path d="M47 24 L54 30 Q55 37 50 41 L42 33 Q42 27 47 24 Z" />
        <path d="M22 21 L33 21 L40 29 L34 39 L22 36 Q17 28 22 21 Z" />
        <path d="M11 30 L20 30 L22 42 Q17 47 11 44 Q7 38 11 30 Z" />
        <path d="M28 42 L42 36 L48 44 Q46 53 38 54 Q30 53 28 42 Z" />
        <path d="M38 22 L46 23 L45 30 L37 30 Q35 26 38 22 Z" />
      </g>
    </svg>
  );
}

/** A scalloped "MADE ON ARC"-style badge, used as decoration. */
export function ScallopBadge({
  text = 'MADE\nON ARC',
  size = 110,
}: {
  text?: string;
  size?: number;
}) {
  const lines = text.split('\n');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        {/* 16-petal scalloped circle path */}
        <path id="scallop" d={scallopPath(55, 55, 48, 16, 4.5)} />
      </defs>
      <use href="#scallop" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {lines.map((l, i) => (
        <text
          key={i}
          x="55"
          y={55 + (i - (lines.length - 1) / 2) * 11}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontWeight="600"
          letterSpacing="2.5"
          fill="currentColor"
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

function scallopPath(cx: number, cy: number, r: number, petals: number, bump: number): string {
  const points: string[] = [];
  const step = (Math.PI * 2) / (petals * 2);
  for (let i = 0; i < petals * 2; i++) {
    const angle = i * step - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r - bump;
    points.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`);
  }
  return `M ${points[0]} ` + points.slice(1).map((p) => `Q ${p} ${p}`).join(' ') + ' Z';
}
