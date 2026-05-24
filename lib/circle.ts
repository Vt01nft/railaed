import 'server-only';
import {
  initiateDeveloperControlledWalletsClient,
  type CircleDeveloperControlledWalletsClient,
} from '@circle-fin/developer-controlled-wallets';
import { env } from './env';

// Circle's Blockchain enum value for Arc testnet.
export const ARC_TESTNET_BLOCKCHAIN = 'ARC-TESTNET' as const;

function shortName(refId: string): string {
  // Keep wallet names short + alphanumeric — some Circle deployments reject
  // colons or long strings in the name field.
  return refId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
}

let _client: CircleDeveloperControlledWalletsClient | null = null;

export function circle(): CircleDeveloperControlledWalletsClient {
  if (_client) return _client;
  _client = initiateDeveloperControlledWalletsClient({
    apiKey: env.circle.apiKey,
    entitySecret: env.circle.entitySecret,
  });
  return _client;
}

export interface CreatedWallet {
  id: string;
  address: string;
  blockchain: string;
  refId?: string;
}

/**
 * Create a single wallet on Arc testnet, scoped to our wallet set.
 * Arc currently supports EOA (the SDK default) — SCA returns "API parameter invalid".
 * Metadata "name" must be a simple human label; refId is fine for tracking.
 */
export async function createWallet(refId?: string): Promise<CreatedWallet> {
  const res = await circle().createWallets({
    walletSetId: env.circle.walletSetId,
    blockchains: [ARC_TESTNET_BLOCKCHAIN],
    count: 1,
    ...(refId ? { metadata: [{ refId, name: shortName(refId) }] } : {}),
  });
  const wallet = res.data?.wallets?.[0];
  if (!wallet?.id || !wallet?.address) {
    throw new Error('Circle createWallets returned no wallet');
  }
  return {
    id: wallet.id,
    address: wallet.address.toLowerCase(),
    blockchain: wallet.blockchain,
    refId: wallet.refId,
  };
}

/**
 * Initiate a USDC transfer from a developer-controlled wallet to any address.
 * Returns the Circle transaction id; the on-chain tx hash is populated as the tx mines.
 */
export async function transferUsdc(params: {
  fromWalletId: string;
  destinationAddress: string;
  amountUsdc: string; // human-readable, e.g. "12.50"
  refId?: string;
}): Promise<{ transactionId: string; state: string }> {
  try {
    // The SDK's CreateTransferTransactionInput types `blockchain` as `never`
    // when `walletId` is set, but Circle's API rejects the call on Arc
    // without `blockchain` ("API parameter invalid"). Cast through `unknown`
    // to bypass the (incorrect) type union.
    const input = {
      walletId: params.fromWalletId,
      tokenAddress: env.arc.usdcAddress,
      blockchain: ARC_TESTNET_BLOCKCHAIN,
      destinationAddress: params.destinationAddress,
      amount: [params.amountUsdc],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
      ...(params.refId ? { refId: params.refId } : {}),
    };
    const res = await circle().createTransaction(
      input as unknown as Parameters<ReturnType<typeof circle>['createTransaction']>[0]
    );
    const tx = res.data;
    if (!tx?.id) throw new Error('Circle createTransaction returned no id');
    return { transactionId: tx.id, state: tx.state ?? 'INITIATED' };
  } catch (err: unknown) {
    // Surface Circle's actual error message (default is just "API parameter invalid").
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    const detail = e?.response?.data?.message ?? e?.message ?? 'unknown';
    throw new Error(`Circle transfer failed: ${detail}`);
  }
}

export async function getTransaction(transactionId: string) {
  const res = await circle().getTransaction({ id: transactionId });
  return res.data?.transaction;
}

export interface OwnerTransaction {
  id: string;
  txHash: string | null;
  state: string;
  amount: string;
  destinationAddress: string;
  sourceAddress: string;
  refId?: string;
  createDate: string;
  updateDate: string;
  /** Best-effort label parsed from refId — "transfer" or "payroll" or null. */
  kind: 'transfer' | 'payroll' | 'other';
}

/**
 * Lists transactions owned by the platform's owner wallet, newest first.
 * Used by the History feature so we don't have to maintain a separate database;
 * Circle's API is the system of record.
 */
export async function listOwnerTransactions(limit = 25): Promise<OwnerTransaction[]> {
  return listWalletTransactions([env.circle.ownerWalletId], limit);
}

function classifyRefId(refId?: string): OwnerTransaction['kind'] {
  if (!refId) return 'other';
  if (refId.startsWith('railaed:payroll:')) return 'payroll';
  if (refId.startsWith('railaed:transfer:')) return 'transfer';
  if (refId.startsWith('railaed:faucet:')) return 'transfer';
  return 'other';
}

/**
 * Lists transactions for an arbitrary set of wallet ids (newest first, deduped).
 * Used to fold in the signed-in user's own wallet alongside the treasury feed.
 *
 * Circle's listTransactions does NOT echo `refId` (verified empirically — the
 * field is in the OpenAPI Transaction schema but the response omits it). To
 * get usable kind labels we backfill in parallel from `getTransaction`, which
 * does return refId. Bounded by the list page size, so worst case 25 extra
 * calls per refresh — fine at hackathon scale.
 */
export async function listWalletTransactions(
  walletIds: string[],
  limit = 25
): Promise<OwnerTransaction[]> {
  if (walletIds.length === 0) return [];
  const res = await circle().listTransactions({
    walletIds,
    pageSize: limit,
  });
  const rows = res.data?.transactions ?? [];
  const mapped = rows.map((t): OwnerTransaction => {
    const refId = t.refId ?? undefined;
    const amount = Array.isArray(t.amounts) ? (t.amounts[0] ?? '0') : '0';
    return {
      id: t.id,
      txHash: t.txHash ?? null,
      state: t.state ?? 'INITIATED',
      amount,
      destinationAddress: (t.destinationAddress ?? '').toLowerCase(),
      sourceAddress: (t.sourceAddress ?? '').toLowerCase(),
      refId,
      createDate: t.createDate ?? '',
      updateDate: t.updateDate ?? '',
      kind: classifyRefId(refId),
    };
  });

  // Backfill refId for rows where listTransactions omitted it.
  const missing = mapped.filter((m) => !m.refId);
  if (missing.length > 0) {
    const enriched = await Promise.all(
      missing.map((m) => getTransaction(m.id).catch(() => null))
    );
    const byId = new Map(
      enriched
        .filter((t): t is NonNullable<typeof t> => !!t)
        .map((t) => [t.id, t.refId ?? undefined])
    );
    for (const m of mapped) {
      if (m.refId) continue;
      const r = byId.get(m.id);
      if (!r) continue;
      m.refId = r;
      m.kind = classifyRefId(r);
    }
  }

  const seen = new Set<string>();
  const deduped: OwnerTransaction[] = [];
  for (const t of mapped) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    deduped.push(t);
  }
  deduped.sort((a, b) => (b.createDate || '').localeCompare(a.createDate || ''));
  return deduped.slice(0, limit);
}

/** Request testnet USDC from Circle's faucet for an Arc testnet address. */
export async function faucetUsdc(address: string): Promise<{ status: number }> {
  const res = await circle().requestTestnetTokens({
    address,
    blockchain: ARC_TESTNET_BLOCKCHAIN,
    usdc: true,
  });
  return { status: res.status };
}

/** Poll until a Circle transaction reaches a terminal state (or times out). */
export async function waitForTx(
  transactionId: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<{ state: string; txHash?: string }> {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 2_000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const tx = await getTransaction(transactionId);
    const state = tx?.state ?? 'INITIATED';
    if (state === 'COMPLETE' || state === 'CONFIRMED') {
      return { state, txHash: tx?.txHash };
    }
    if (state === 'FAILED' || state === 'CANCELLED' || state === 'DENIED') {
      throw new Error(`Circle transaction ${transactionId} ended in state ${state}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Circle transaction ${transactionId} did not settle within ${timeoutMs}ms`);
}
