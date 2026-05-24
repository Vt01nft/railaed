import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { env } from './env';

/** Session cookie payload — tiny so it fits comfortably in 4KB. */
export interface SessionPayload {
  email: string;
  walletId: string;
  address: string;
  createdAt: string;
}

export const SESSION_COOKIE = 'railaed_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s + pad, 'base64');
}

function hmac(input: string): Buffer {
  return createHmac('sha256', env.claimSecret).update(input).digest();
}

export function encodeSession(p: SessionPayload): string {
  const body = b64urlEncode(Buffer.from(JSON.stringify(p), 'utf8'));
  const sig = b64urlEncode(hmac(body));
  return `${body}.${sig}`;
}

export function decodeSession(token: string): SessionPayload {
  const [body, sig] = token.split('.');
  if (!body || !sig) throw new Error('malformed session');
  const expected = b64urlEncode(hmac(body));
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('invalid session signature');
  }
  return JSON.parse(b64urlDecode(body).toString('utf8')) as SessionPayload;
}

/** Read the current request's session, or null if unsigned/missing. */
export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return decodeSession(token);
  } catch {
    return null;
  }
}

export async function writeSession(p: SessionPayload): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(p), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
