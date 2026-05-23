'use client';
import { useEffect, useState } from 'react';
import { LogIn, LogOut, Loader2, Mail, Wallet } from 'lucide-react';
import { truncateAddr } from '@/lib/usdc';

interface User {
  email: string;
  walletId: string;
  address: string;
  createdAt: string;
  balanceUsdc?: string;
}

export function SignInButton() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setUser(j.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'sign-in failed');
      setUser(json.user);
      setOpen(false);
      setEmail('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch('/api/user/logout', { method: 'POST' });
    setUser(null);
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="pill-outline gap-1.5 cursor-default">
          <Wallet className="size-3.5 text-[color:var(--gold-500)]" />
          <span className="hidden sm:inline text-[color:var(--cream-300)]">{user.email}</span>
          <span className="font-mono text-xs text-[color:var(--cream-500)]">
            {truncateAddr(user.address, 4, 4)}
          </span>
        </div>
        <button
          onClick={logout}
          className="pill-outline gap-1.5 cursor-pointer"
          title="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="pill-outline cursor-pointer">
        <LogIn className="size-3.5" />
        <span>Sign in</span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[color:var(--surface)] border border-[color:var(--border-strong)] shadow-2xl p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-500)]">
              Demo sign-in
            </div>
            <h2 className="mt-1 font-serif text-2xl font-medium text-[color:var(--cream-200)]">
              Get your <span className="italic text-gold-bright">Circle wallet</span>
            </h2>
            <p className="mt-2 text-sm text-[color:var(--cream-400)] leading-relaxed">
              Enter any email and we&apos;ll provision a Developer-Controlled Wallet on Arc for you instantly.
              No password, no seed phrase — passkey-authenticated Modular Wallets are the planned v2.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <div className="relative">
                <Mail className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--cream-500)]" />
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-deep)]/60 pl-10 pr-4 text-base text-[color:var(--cream-200)] outline-none focus:border-[color:var(--gold-400)] focus:ring-2 focus:ring-[color:var(--gold-400)]/25 placeholder:text-[color:var(--cream-500)]"
                />
              </div>
              {err ? <div className="text-xs text-[color:var(--danger)]">{err}</div> : null}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--gold-500)] text-[color:var(--surface-deep)] h-11 font-medium hover:bg-[color:var(--gold-400)] disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? 'Provisioning your wallet…' : 'Continue'}
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-4 text-xs text-[color:var(--cream-400)] leading-relaxed">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)] mb-1.5">
                How money moves
              </div>
              For this testnet demo, sends are funded from the RailAED treasury wallet on Arc.
              Your personal wallet starts at 0 USDC and would normally be topped up from your bank
              or card via Circle&apos;s on-ramp — out of scope for the hackathon. Production would use
              passkey-authenticated Circle Modular Wallets per sender.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
