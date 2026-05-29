import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createWallet } from '@/lib/circle';
import { getUserByEmail, setUser } from '@/lib/state';
import { writeSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().email().max(120),
});

/**
 * POST /api/user/login { email }
 *
 * Hackathon-grade "sign in with email" - no password, no magic link.
 *
 * - First time an email is seen, we provision a fresh Circle Developer-Controlled
 *   Wallet under RailAED's wallet set with refId="railaed:user:<email>".
 * - Subsequent logins look the wallet back up by email.
 * - The session is an HMAC-signed cookie (7 days).
 *
 * The wallet's private key is custodied by RailAED for the demo. Production would
 * use Circle User-Controlled Wallets (PIN/passkey) so the user owns the key.
 */
export async function POST(request: NextRequest) {
  try {
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
      await setUser(user).catch(() => { /* read-only fs; cookie is the durable record */ });
    }

    await writeSession({
      email: user.email,
      walletId: user.walletId,
      address: user.address,
      createdAt: user.createdAt,
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'login failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
