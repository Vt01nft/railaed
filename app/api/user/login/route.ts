import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createWallet } from '@/lib/circle';
import { getUserByEmail, setUser } from '@/lib/state';
import { encodeSession, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().email().max(120),
});

/**
 * POST /api/user/login  { email }
 *
 * Demo-grade "sign in with email" — there's no password or magic link in
 * this hackathon. We look up the email; if it's known we re-use its wallet,
 * otherwise we provision a fresh Circle wallet for it. The session cookie
 * is HMAC-signed and lasts 7 days.
 *
 * In production this would be a Circle Modular Wallet w/ passkey or
 * social-login flow; the wallet's still developer-controlled for this
 * testnet demo and gets funded by the platform treasury.
 */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  let user = await getUserByEmail(email);
  if (!user) {
    const wallet = await createWallet(`railaed:user:${email}`);
    user = {
      email,
      walletId: wallet.id,
      address: wallet.address,
      createdAt: new Date().toISOString(),
    };
    await setUser(user);
  }

  const token = encodeSession({
    email: user.email,
    walletId: user.walletId,
    address: user.address,
    createdAt: user.createdAt,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: '/',
  });

  return NextResponse.json({
    ok: true,
    user: {
      email: user.email,
      walletId: user.walletId,
      address: user.address,
      createdAt: user.createdAt,
    },
  });
}
