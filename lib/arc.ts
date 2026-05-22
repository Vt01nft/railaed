import 'server-only';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseUnits,
  type Address,
  type Hash,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from './env';
import { USDC_DECIMALS } from './usdc';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [env.arc.rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
});

export const arcClient = createPublicClient({
  chain: arcTestnet,
  transport: http(env.arc.rpcUrl),
});

export const USDC_ABI_MIN = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

export async function getUsdcBalance(address: Address): Promise<bigint> {
  return arcClient.readContract({
    address: env.arc.usdcAddress,
    abi: USDC_ABI_MIN,
    functionName: 'balanceOf',
    args: [address],
  });
}

export async function getUsdcDecimals(): Promise<number> {
  return arcClient.readContract({
    address: env.arc.usdcAddress,
    abi: USDC_ABI_MIN,
    functionName: 'decimals',
  });
}

export function explorerTxUrl(hash: string): string {
  return `https://testnet.arcscan.app/tx/${hash}`;
}

export function explorerAddrUrl(addr: string): string {
  return `https://testnet.arcscan.app/address/${addr}`;
}

const USDC_TRANSFER_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

/**
 * Transfer USDC from the deployer EOA (we hold the private key) to any address.
 * Used to seed Circle-controlled wallets from a previously-funded EOA.
 */
export async function transferUsdcFromDeployer(to: Address, amountHuman: string): Promise<Hash> {
  const account = privateKeyToAccount(env.arc.deployerPrivateKey);
  const wallet = createWalletClient({ account, chain: arcTestnet, transport: http(env.arc.rpcUrl) });
  const value = parseUnits(amountHuman, USDC_DECIMALS);
  return wallet.writeContract({
    address: env.arc.usdcAddress,
    abi: USDC_TRANSFER_ABI,
    functionName: 'transfer',
    args: [to, value],
  });
}
