'use client';
import { useEffect, useState, useCallback } from 'react';
import { Droplets, ExternalLink, LogIn, LogOut, Loader2, Mail, Wallet, Check } from 'lucide-react';
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
  const [signInOpen, setSignInOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [funding, setFunding] = useState(false);
  const [fundResult, setFundResult] = useState<{ txHash: string; explorerUrl: string; newBalance: string } | null>(null);
  const [fundErr, setFundErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/user/me', { cache: 'no-store' });
      const j = await r.json();
      setUser(j.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const raw = await res.text();
      let json: { user?: User; error?: string } = {};
      try { json = raw ? JSON.parse(raw) : {}; } catch { /* leave json empty */ }
      if (!res.ok) throw new Error(json.error ?? `sign-in failed (HTTP ${res.status})`);
      setUser(json.user ?? null);
      setSignInOpen(false);
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
    setWalletOpen(false);
  }

  async function faucet() {
    setFunding(true);
    setFundErr(null);
    setFundResult(null);
    try {
      const res = await fetch('/api/user/faucet', { method: 'POST' });
      const raw = await res.text();
      let json: { txHash?: string; explorerUrl?: string; newBalance?: string; error?: string; hint?: string } = {};
      try { json = raw ? JSON.parse(raw) : {}; } catch { /* leave json empty */ }
      if (!res.ok) throw new Error((json.hint ? `${json.error} — ${json.hint}` : json.error) ?? `faucet failed (HTTP ${res.status})`);
      setFundResult({
        txHash: json.txHash ?? '',
        explorerUrl: json.explorerUrl ?? '',
        newBalance: json.newBalance ?? '0',
      });
      // refresh balance after a moment
      setTimeout(refresh, 1500);
    } catch (e) {
      setFundErr(e instanceof Error ? e.message : 'faucet failed');
    } finally {
      setFunding(false);
    }
  }

  if (user) {
    return (
      <>
        <button
          onClick={() => setWalletOpen(true)}
          className="pill-outline gap-2 cursor-pointer"
          title="View wallet"
        >
          <Wallet className="size-3.5 text-[color:var(--gold-500)]" />
          <span className="hidden sm:inline text-[color:var(--cream-300)] font-mono text-xs">
            {user.balanceUsdc ?? '0'}
          </span>
          <span className="text-[10px] text-[color:var(--gold-500)] font-medium">USDC</span>
          <span className="font-mono text-xs text-[color:var(--cream-500)] hidden md:inline">
            {truncateAddr(user.address, 4, 4)}
          </span>
        </button>

        {walletOpen ? (
          <Modal onClose={() => setWalletOpen(false)}>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-500)]">
              Your demo wallet
            </div>
            <h2 className="mt-1 font-serif text-2xl font-medium text-[color:var(--cream-200)]">
              {user.email}
            </h2>
            <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--cream-500)]">Balance</div>
              <div className="mt-1 font-serif text-4xl font-medium tabular text-[color:var(--cream-200)]">
                {user.balanceUsdc ?? '0'}{' '}
                <span className="text-base text-[color:var(--gold-500)] font-medium">USDC</span>
              </div>
              <div className="mt-3 flex items-center gap-2 font-mono text-xs text-[color:var(--cream-400)]">
                <span>{truncateAddr(user.address, 8, 6)}</span>
                <a
                  href={`https://testnet.arcscan.app/address/${user.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--gold-300)] hover:underline inline-flex items-center gap-1"
                >
                  ArcScan <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={faucet}
                disabled={funding}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--gold-500)] text-[color:var(--surface-deep)] h-11 font-medium hover:bg-[color:var(--gold-400)] disabled:opacity-50 transition-colors"
              >
                {funding ? <Loader2 className="size-4 animate-spin" /> : <Droplets className="size-4" />}
                {funding ? 'Funding from testnet faucet…' : 'Fund +5 USDC (testnet)'}
              </button>
              {fundErr ? <div className="mt-2 text-xs text-[color:var(--danger)]">{fundErr}</div> : null}
              {fundResult ? (
                <div className="mt-3 rounded-2xl border border-[color:var(--mint-400)]/30 bg-[color:var(--mint-500)]/[0.08] p-3 text-xs">
                  <div className="flex items-center gap-2 text-[color:var(--mint-300)]">
                    <Check className="size-3.5" /> Funded
                    <a
                      href={fundResult.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[color:var(--gold-300)] hover:underline inline-flex items-center gap-1 ml-auto"
                    >
                      ArcScan tx <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <div className="mt-1 text-[color:var(--cream-400)]">
                    New balance: <span className="font-mono text-[color:var(--cream-200)]">{fundResult.newBalance}</span> USDC
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 p-4 text-xs text-[color:var(--cream-400)] leading-relaxed">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-500)] mb-1.5">
                What this is
              </div>
              A Circle Developer-Controlled Wallet on Arc testnet, scoped to your email under
              RailAED&apos;s wallet set. RailAED custodies the key for this hackathon demo;
              production would use Circle User-Controlled Wallets (PIN/passkey) so you own it.
              Send from this wallet on the Send page when signed in.
            </div>

            <button
              onClick={logout}
              className="mt-5 w-full pill-outline justify-center cursor-pointer"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </Modal>
        ) : null}
      </>
    );
  }

  return (
    <>
      <button onClick={() => setSignInOpen(true)} className="pill-outline cursor-pointer">
        <LogIn className="size-3.5" />
        <span>Sign in</span>
      </button>
      {signInOpen ? (
        <Modal onClose={() => setSignInOpen(false)}>
          <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-500)]">
            Sign in
          </div>
          <h2 className="mt-1 font-serif text-2xl font-medium text-[color:var(--cream-200)]">
            Get a <span className="italic text-gold-bright">RailAED wallet</span>
          </h2>
          <p className="mt-3 text-sm text-[color:var(--cream-400)] leading-relaxed">
            Type an email and we&apos;ll provision a Circle wallet for you on Arc testnet. Fund it
            with one tap from the testnet faucet, then send from your own balance.
          </p>
          <form onSubmit={submitSignIn} className="mt-5 space-y-3">
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
              {loading ? 'Provisioning…' : 'Continue'}
            </button>
          </form>
          <p className="mt-5 text-[11px] text-[color:var(--cream-500)] leading-relaxed">
            Demo-grade: no password, no Circle account check, no KYC. The wallet is yours within
            RailAED only; each Circle project mints its own wallets, so this won&apos;t match a
            wallet you have elsewhere. Production would use Circle User-Controlled Wallets
            (PIN/passkey) for a real cross-app identity.
          </p>
        </Modal>
      ) : null}
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[color:var(--surface)] border border-[color:var(--border-strong)] shadow-2xl p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
