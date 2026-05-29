import 'server-only';

/**
 * Lazy env access.
 *
 * Critical: this module is imported transitively by every route handler and
 * server lib. Next.js 16 evaluates the module graph during `next build`
 * (page-data collection) - even routes marked `dynamic = 'force-dynamic'` -
 * so throwing here breaks production builds whenever any var is missing at
 * build time (which is normal on Vercel before env-var injection is wired).
 *
 * Solution: read process.env on every access (cheap), and throw a clear
 * error only at the moment the value is *used* in a handler. Build proceeds
 * with empty strings; runtime gets the descriptive failure.
 */

/**
 * Build-phase placeholders for vars that are read at module-load time
 * (e.g. viem's `createPublicClient({ transport: http(rpcUrl) })`). These
 * values are never used at runtime - production reads from real env vars.
 */
const BUILD_DEFAULTS: Record<string, string> = {
  ARC_RPC_URL: 'https://rpc.testnet.arc.network',
  ARC_USDC_ADDRESS: '0x0000000000000000000000000000000000000000',
  ARC_JOB_ESCROW_ADDRESS: '0x0000000000000000000000000000000000000000',
  ARC_DEPLOYER_ADDRESS: '0x0000000000000000000000000000000000000000',
  ARC_DEPLOYER_PRIVATE_KEY:
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  RAILAED_CLAIM_SECRET: 'build-time-placeholder-never-used',
};

function read(key: string, opts: { lower?: boolean } = {}): string {
  const v = process.env[key];
  if (v === undefined || v === '') {
    if (isBuildPhase()) return BUILD_DEFAULTS[key] ?? '';
    throw new Error(
      `Missing required env var: ${key}. ` +
        `Set it in .env.local locally, or in the Vercel dashboard for production.`
    );
  }
  return opts.lower ? v.toLowerCase() : v;
}

function isBuildPhase(): boolean {
  // Next.js sets this during `next build`.
  const phase = process.env.NEXT_PHASE;
  return phase === 'phase-production-build' || phase === 'phase-production-build-info';
}

export const env = {
  circle: {
    get apiKey()             { return read('CIRCLE_API_KEY'); },
    get entitySecret()       { return read('CIRCLE_ENTITY_SECRET'); },
    get walletSetId()        { return read('CIRCLE_WALLET_SET_ID'); },
    get ownerWalletId()      { return read('CIRCLE_OWNER_WALLET_ID'); },
    get ownerWalletAddress() { return read('CIRCLE_OWNER_WALLET_ADDRESS', { lower: true }); },
    get agentWalletId()      { return read('CIRCLE_AGENT_WALLET_ID'); },
    get agentWalletAddress() { return read('CIRCLE_AGENT_WALLET_ADDRESS', { lower: true }); },
  },
  arc: {
    get rpcUrl()             { return read('ARC_RPC_URL'); },
    get usdcAddress()        { return read('ARC_USDC_ADDRESS', { lower: true }) as `0x${string}`; },
    get jobEscrowAddress()   { return read('ARC_JOB_ESCROW_ADDRESS', { lower: true }) as `0x${string}`; },
    get deployerPrivateKey() { return read('ARC_DEPLOYER_PRIVATE_KEY') as `0x${string}`; },
    get deployerAddress()    { return read('ARC_DEPLOYER_ADDRESS', { lower: true }) as `0x${string}`; },
  },
  get claimSecret() { return read('RAILAED_CLAIM_SECRET'); },
} as const;

export const publicEnv = {
  chainId: Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? 5042002),
  chainName: process.env.NEXT_PUBLIC_ARC_CHAIN_NAME ?? 'Arc Testnet',
  explorerUrl: process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? 'https://testnet.arcscan.app',
  usdcAddress: (process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ?? '').toLowerCase(),
  jobEscrowAddress: (process.env.NEXT_PUBLIC_ARC_JOB_ESCROW_ADDRESS ?? '').toLowerCase(),
} as const;
