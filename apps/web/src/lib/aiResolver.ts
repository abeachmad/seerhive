interface AIResolutionResult {
  marketId: number;
  outcome: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
  latency_ms: number;
}

export class AIResolver {
  async resolveMarket(
    marketId: number,
    question: string,
    resolutionDate: string
  ): Promise<AIResolutionResult> {
    const response = await fetch('/api/ai/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        marketId,
        question,
        resolutionDate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI resolution failed');
    }

    return response.json();
  }
}

export const aiResolver = new AIResolver();
