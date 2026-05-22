import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env';

export interface ClaimPayload {
  /** UUID for the transfer record (referenced in state). */
  id: string;
  /** Circle wallet id holding the funds (the recipient's wallet). */
  recipientWalletId: string;
  /** EVM address of the recipient wallet. */
  recipientAddress: string;
  /** Human USDC amount, e.g. "12.50". */
  amountUsdc: string;
  /** Recipient phone in E.164 (used for display only). */
  recipientPhone: string;
  /** Sender display name. */
  senderName: string;
  /** ISO timestamp string. */
  createdAt: string;
  /** Expiry timestamp (ms since epoch). */
  expiresAt: number;
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

function sign(body: string): string {
  return b64urlEncode(createHmac('sha256', env.claimSecret).update(body).digest());
}

export function encodeClaimToken(payload: ClaimPayload): string {
  const body = b64urlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
  return `${body}.${sign(body)}`;
}

export function decodeClaimToken(token: string): ClaimPayload {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Malformed claim token');
  const [body, sig] = parts;
  const expected = sign(body);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Invalid claim token signature');
  }
  const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as ClaimPayload;
  if (Date.now() > payload.expiresAt) {
    throw new Error('Claim token expired');
  }
  return payload;
}

/** Default claim validity: 7 days from now (in ms-since-epoch). */
export const DEFAULT_CLAIM_TTL_MS = 7 * 24 * 60 * 60 * 1000;
