import { NextRequest, NextResponse } from 'next/server';

// Simulate AI checking news and social media
async function checkNewsAndSocial(question: string) {
  // Simulate API calls to news sources and Twitter
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const sources = [
    { name: 'CoinDesk', sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
    { name: 'Twitter Trends', sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
    { name: 'Bloomberg', sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
  ];
  
  const positiveCount = sources.filter(s => s.sentiment === 'positive').length;
  const confidence = (positiveCount / sources.length) * 0.3 + 0.7; // 70-100% confidence
  
  return {
    outcome: positiveCount >= 2 ? 'YES' : 'NO',
    confidence,
    sources,
    analysis: `Based on ${sources.length} sources: ${positiveCount} positive, ${sources.length - positiveCount} negative`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, question, evidenceUrl } = body;

    // AI verification process
    const aiResult = await checkNewsAndSocial(question || 'market');

    return NextResponse.json({
      marketId,
      outcome: aiResult.outcome,
      confidence: aiResult.confidence.toFixed(2),
      resolvedAt: new Date().toISOString(),
      evidenceUrl: evidenceUrl || null,
      aiAnalysis: {
        sources: aiResult.sources,
        summary: aiResult.analysis,
        verified: true,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}