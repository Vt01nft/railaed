import 'server-only';

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

export const env = {
  circle: {
    apiKey: required('CIRCLE_API_KEY'),
    entitySecret: required('CIRCLE_ENTITY_SECRET'),
    walletSetId: required('CIRCLE_WALLET_SET_ID'),
    ownerWalletId: required('CIRCLE_OWNER_WALLET_ID'),
    ownerWalletAddress: required('CIRCLE_OWNER_WALLET_ADDRESS').toLowerCase(),
    agentWalletId: required('CIRCLE_AGENT_WALLET_ID'),
    agentWalletAddress: required('CIRCLE_AGENT_WALLET_ADDRESS').toLowerCase(),
  },
  arc: {
    rpcUrl: required('ARC_RPC_URL'),
    usdcAddress: required('ARC_USDC_ADDRESS').toLowerCase() as `0x${string}`,
    jobEscrowAddress: required('ARC_JOB_ESCROW_ADDRESS').toLowerCase() as `0x${string}`,
    deployerPrivateKey: required('ARC_DEPLOYER_PRIVATE_KEY') as `0x${string}`,
    deployerAddress: required('ARC_DEPLOYER_ADDRESS').toLowerCase() as `0x${string}`,
  },
  claimSecret: required('RAILAED_CLAIM_SECRET'),
} as const;

export const publicEnv = {
  chainId: Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? 5042002),
  chainName: process.env.NEXT_PUBLIC_ARC_CHAIN_NAME ?? 'Arc Testnet',
  explorerUrl: process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? 'https://testnet.arcscan.app',
  usdcAddress: (process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ?? '').toLowerCase(),
  jobEscrowAddress: (process.env.NEXT_PUBLIC_ARC_JOB_ESCROW_ADDRESS ?? '').toLowerCase(),
} as const;
