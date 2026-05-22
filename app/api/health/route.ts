import { NextResponse } from 'next/server';
import { circle } from '@/lib/circle';
import { arcClient, getUsdcBalance, getUsdcDecimals } from '@/lib/arc';
import { env } from '@/lib/env';
import { usdcToHuman } from '@/lib/usdc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Self-check endpoint: confirms we can talk to both the Arc RPC and Circle's API,
 * and reports the owner wallet's current USDC balance + nonce. Hit /api/health
 * before running a demo.
 */
export async function GET() {
  const checks: Record<string, unknown> = {};

  // Arc RPC: chain id + latest block.
  try {
    const [chainId, block] = await Promise.all([
      arcClient.getChainId(),
      arcClient.getBlockNumber(),
    ]);
    checks.arc = { ok: true, chainId, latestBlock: block.toString() };
  } catch (err: unknown) {
    checks.arc = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // USDC contract decimals (verify our assumption matches Arc's USDC).
  let usdcDecimals = 18;
  try {
    usdcDecimals = await getUsdcDecimals();
    checks.usdc = { ok: true, decimals: usdcDecimals };
  } catch (err: unknown) {
    checks.usdc = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // Owner wallet USDC balance (on-chain).
  try {
    const bal = await getUsdcBalance(env.circle.ownerWalletAddress as `0x${string}`);
    checks.ownerUsdc = {
      ok: true,
      raw: bal.toString(),
      human: usdcToHuman(bal, usdcDecimals),
    };
  } catch (err: unknown) {
    checks.ownerUsdc = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // Deployer EOA balance (also relevant — sometimes the JobEscrow holder).
  try {
    const bal = await getUsdcBalance(env.arc.deployerAddress as `0x${string}`);
    checks.deployerUsdc = {
      ok: true,
      raw: bal.toString(),
      human: usdcToHuman(bal, usdcDecimals),
    };
  } catch (err: unknown) {
    checks.deployerUsdc = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // Circle API: list our wallet set.
  try {
    const res = await circle().getWalletSet({ id: env.circle.walletSetId });
    checks.circle = {
      ok: true,
      walletSetId: res.data?.walletSet?.id ?? null,
      walletSetCreated: res.data?.walletSet?.createDate ?? null,
    };
  } catch (err: unknown) {
    checks.circle = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json({
    service: 'railaed',
    timestamp: new Date().toISOString(),
    chain: 'arc-testnet',
    ownerAddress: env.circle.ownerWalletAddress,
    agentAddress: env.circle.agentWalletAddress,
    usdcAddress: env.arc.usdcAddress,
    jobEscrowAddress: env.arc.jobEscrowAddress,
    checks,
  });
}
