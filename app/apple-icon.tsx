import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #082822 0%, #143d34 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 8 Q29 5 34 9 L31 19 Q24 19 19 14 Q19 10 22 8 Z" fill="#4ab695" />
          <path d="M36 9 L46 13 Q49 18 45 22 L33 19 Q31 13 36 9 Z" fill="#5fc99a" />
          <path d="M47 24 L54 30 Q55 37 50 41 L42 33 Q42 27 47 24 Z" fill="#1c5d49" />
          <path d="M22 21 L33 21 L40 29 L34 39 L22 36 Q17 28 22 21 Z" fill="#5fc99a" />
          <path d="M11 30 L20 30 L22 42 Q17 47 11 44 Q7 38 11 30 Z" fill="#4ab695" />
          <path d="M28 42 L42 36 L48 44 Q46 53 38 54 Q30 53 28 42 Z" fill="#1c5d49" />
          <path d="M38 22 L46 23 L45 30 L37 30 Q35 26 38 22 Z" fill="#f0c34d" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
