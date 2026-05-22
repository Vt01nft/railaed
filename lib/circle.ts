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
