/**
 * Default contractors used when the local state cache is empty.
 *
 * Lives in its own module so both /api/payroll/contractors (which reads
 * + persists) and /api/payroll/run (which falls back to it when stateless
 * Vercel functions land on a fresh container) can share the same source.
 */

import { randomUUID } from 'node:crypto';

export interface SeedContractor {
  id: string;
  name: string;
  country: string;
  monthlyUsdc: string;
}

const TEMPLATE: ReadonlyArray<{ name: string; country: string; monthlyUsdc: string }> = [
  { name: 'Priya Nair',    country: 'IN', monthlyUsdc: '0.5' },
  { name: 'Maria Garcia',  country: 'ES', monthlyUsdc: '0.4' },
  { name: 'Chinedu Okeke', country: 'NG', monthlyUsdc: '0.3' },
];

export function buildSeedContractors(): SeedContractor[] {
  return TEMPLATE.map((r) => ({ id: randomUUID(), ...r }));
}
