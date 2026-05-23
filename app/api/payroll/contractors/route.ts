import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getContractors, setContractors } from '@/lib/state';
import { isCorridorCode } from '@/lib/corridors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ContractorRow = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(80),
  country: z.string().refine(isCorridorCode, { message: 'unknown country code' }),
  walletId: z.string().optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  monthlyUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
});

// Seeded with small testnet-friendly amounts spread across the new corridor mix.
// The UI shows these as monthly salaries; in production you'd pull from your HR
// system. Top up the owner wallet via POST /api/seed/fund any time.
const SEED_CONTRACTORS = [
  { name: 'Priya Nair',     country: 'IN' as const, monthlyUsdc: '0.5' },
  { name: 'Maria Garcia',   country: 'ES' as const, monthlyUsdc: '0.4' },
  { name: 'Chinedu Okeke',  country: 'NG' as const, monthlyUsdc: '0.3' },
];

export async function GET() {
  const rows = await getContractors();
  if (rows.length === 0) {
    const seeded = SEED_CONTRACTORS.map((r) => ({ id: randomUUID(), ...r }));
    await setContractors(seeded);
    return NextResponse.json({ contractors: seeded });
  }
  return NextResponse.json({ contractors: rows });
}

export async function PUT(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = z.array(ContractorRow).safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body', issues: parsed.error.issues }, { status: 400 });
  }
  const rows = parsed.data.map((r) => ({ id: r.id ?? randomUUID(), ...r }));
  await setContractors(rows);
  return NextResponse.json({ contractors: rows });
}
