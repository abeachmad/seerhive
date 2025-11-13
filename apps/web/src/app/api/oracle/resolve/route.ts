import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, evidenceUrl } = body;

    // Mock AI-assisted oracle resolution
    const mockOutcome = Math.random() > 0.5 ? 'YES' : 'NO';
    const mockConfidence = 0.75 + Math.random() * 0.2;

    return NextResponse.json({
      marketId,
      outcome: mockOutcome,
      confidence: mockConfidence.toFixed(2),
      resolvedAt: new Date().toISOString(),
      evidenceUrl: evidenceUrl || null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}