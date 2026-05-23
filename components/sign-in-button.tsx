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
        <span>Get demo wallet</span>
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
              Provision a demo wallet
            </div>
            <h2 className="mt-1 font-serif text-2xl font-medium text-[color:var(--cream-200)]">
              Not a Circle login. <span className="italic text-gold-bright">A RailAED-scoped wallet.</span>
            </h2>
            <p className="mt-3 text-sm text-[color:var(--cream-400)] leading-relaxed">
              Type any email and we&apos;ll mint a fresh Developer-Controlled Wallet under RailAED&apos;s
              wallet set on Arc testnet. The email is a label, not authentication. The wallet&apos;s
              private key is custodied by the platform for the demo.
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
                {loading ? 'Provisioning your wallet…' : 'Get my wallet'}
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-4 text-xs text-[color:var(--cream-400)] leading-relaxed space-y-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)] mb-1.5">
                  Why isn&apos;t this your existing Circle wallet?
                </div>
                Every Circle project has its own API key + entity secret + wallet set. Wallets are
                custodied per project, so the same email in RailAED and in your other project mints
                two completely independent wallets. To get one wallet that follows you across apps,
                you&apos;d need Circle Modular Wallets with passkey or social login (planned v2).
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)] mb-1.5">
                  Where does the money come from?
                </div>
                Your personal wallet starts at 0 USDC. For this testnet demo, sends are funded from
                the RailAED treasury wallet on Arc. Production would top up your wallet from your
                bank or card via Circle&apos;s on-ramp.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
