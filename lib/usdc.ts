// USDC on Arc uses 6 decimals — verified on-chain via the contract's
// decimals() method (the same as USDC on Ethereum / Polygon mainnet).
// USDC is also the gas token on Arc, paid at this same precision.
export const USDC_DECIMALS = 6;

export function usdcToHuman(raw: bigint, decimals: number = USDC_DECIMALS): string {
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const frac = raw % base;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 4).replace(/0+$/, '');
  return fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
}

export function humanToUsdc(human: string | number, decimals: number = USDC_DECIMALS): bigint {
  const s = typeof human === 'number' ? human.toString() : human.trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error(`Invalid USDC amount: ${human}`);
  const [whole, frac = ''] = s.split('.');
  const paddedFrac = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(paddedFrac || '0');
}

export function formatUsd(n: number, opts: { compact?: boolean } = {}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts.compact ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatAed(n: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function truncateAddr(addr: string, head = 6, tail = 4): string {
  if (!addr) return '';
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
