import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RailAED · UAE → Anywhere · USDC on Arc';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #082822 0%, #0e3a30 45%, #143d34 100%)',
          padding: '70px 80px',
          fontFamily: 'sans-serif',
          color: '#f3e9c9',
          position: 'relative',
        }}
      >
        {/* Top bar: brand wordmark + chain badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#d4a52f',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Mosaic />
            <span style={{ color: '#e7d9a8' }}>RailAED</span>
          </div>
          <div
            style={{
              border: '1px solid rgba(212, 165, 47, 0.45)',
              borderRadius: 999,
              padding: '8px 18px',
              fontSize: 16,
              color: '#e7d9a8',
              letterSpacing: 3,
            }}
          >
            ARC · CHAIN 5042002
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: 90,
            display: 'flex',
            flexDirection: 'column',
            fontSize: 96,
            fontWeight: 500,
            lineHeight: 1.02,
            color: '#f3e9c9',
            letterSpacing: -2,
          }}
        >
          <span>UAE to anywhere,</span>
          <span style={{ color: '#f0c34d', fontStyle: 'italic' }}>
            in seconds on Arc.
          </span>
        </div>

        {/* Subhead */}
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            lineHeight: 1.35,
            color: '#cbb88a',
            maxWidth: 950,
          }}
        >
          Pay in AED. Settle in USDC. Deliver with a live honesty score against
          Al Ansari, Wise, Western Union, Remitly.
        </div>

        {/* Footer pills */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 18,
            color: '#e7d9a8',
          }}
        >
          <Pill>≈ 2 sec settlement</Pill>
          <Pill>0.30% fee</Pill>
          <Pill>Circle Developer Wallets</Pill>
          <Pill>USDC on Arc</Pill>
        </div>
      </div>
    ),
    { ...size }
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid rgba(212, 165, 47, 0.35)',
        backgroundColor: 'rgba(212, 165, 47, 0.06)',
        borderRadius: 999,
        padding: '10px 20px',
      }}
    >
      {children}
    </div>
  );
}

function Mosaic() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#0e2b25" />
      <path d="M22 8 Q29 5 34 9 L31 19 Q24 19 19 14 Q19 10 22 8 Z" fill="#4ab695" />
      <path d="M36 9 L46 13 Q49 18 45 22 L33 19 Q31 13 36 9 Z" fill="#5fc99a" />
      <path d="M47 24 L54 30 Q55 37 50 41 L42 33 Q42 27 47 24 Z" fill="#1c5d49" />
      <path d="M22 21 L33 21 L40 29 L34 39 L22 36 Q17 28 22 21 Z" fill="#5fc99a" />
      <path d="M11 30 L20 30 L22 42 Q17 47 11 44 Q7 38 11 30 Z" fill="#4ab695" />
      <path d="M28 42 L42 36 L48 44 Q46 53 38 54 Q30 53 28 42 Z" fill="#1c5d49" />
      <path d="M38 22 L46 23 L45 30 L37 30 Q35 26 38 22 Z" fill="#f0c34d" />
    </svg>
  );
}
