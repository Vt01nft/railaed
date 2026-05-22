import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { quoteRailAed, honestyScore } from '@/lib/fx';
import { CORRIDORS, type CorridorCode } from '@/lib/corridors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  senderAed: z.number().positive().max(1_000_000),
  corridor: z.enum(Object.keys(CORRIDORS) as [CorridorCode, ...CorridorCode[]]),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body', issues: parsed.error.issues }, { status: 400 });
  }
  const { senderAed, corridor } = parsed.data;
  const [quote, score] = await Promise.all([
    quoteRailAed(senderAed, corridor),
    honestyScore(senderAed),
  ]);
  return NextResponse.json({
    quote,
    honestyScore: score,
    corridor: CORRIDORS[corridor],
    quotedAt: new Date().toISOString(),
  });
}
