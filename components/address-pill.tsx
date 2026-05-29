'use client';
import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { truncateAddr } from '@/lib/usdc';

export function AddressPill({
  address,
  explorerBase = 'https://testnet.arcscan.app/address/',
}: {
  address: string;
  explorerBase?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-deep)]/50 pl-3 pr-1.5 py-1 font-mono text-xs text-[color:var(--cream-200)]">
      <span title={address}>{truncateAddr(address, 6, 4)}</span>
      <button
        onClick={copy}
        type="button"
        title="Copy"
        className="tap-target inline-flex items-center justify-center text-[color:var(--cream-500)] hover:text-[color:var(--cream-200)] cursor-pointer rounded-full p-0.5 hover:bg-[color:var(--surface-1)]/60"
      >
        {copied ? <Check className="size-3.5 text-[color:var(--mint-300)]" /> : <Copy className="size-3.5" />}
      </button>
      <a
        href={`${explorerBase}${address}`}
        target="_blank"
        rel="noreferrer"
        title="View on ArcScan"
        className="tap-target inline-flex items-center justify-center text-[color:var(--cream-500)] hover:text-[color:var(--cream-200)] rounded-full p-0.5 hover:bg-[color:var(--surface-1)]/60"
      >
        <ExternalLink className="size-3.5" />
      </a>
    </span>
  );
}
