import { NextRequest, NextResponse } from 'next/server';

interface AIResolution {
  outcome: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}

export async function POST(req: NextRequest) {
  try {
    const { marketId, question, resolutionDate } = await req.json();

    if (!question || !resolutionDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const t0 = Date.now();

    // Fetch real-world context
    const context = await fetchMarketContext(question, resolutionDate);

    // Get AI resolution
    const resolution = await getAIResolution(question, resolutionDate, context);

    return NextResponse.json({
      marketId,
      ...resolution,
      latency_ms: Date.now() - t0,
    });
  } catch (error: any) {
    console.error('[ai-resolve] Error:', error);
    return NextResponse.json(
      { error: error.message || 'AI resolution failed' },
      { status: 500 }
    );
  }
}

async function fetchMarketContext(question: string, date: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  
  if (!tavilyKey) {
    console.warn('[ai-resolve] No Tavily API key, skipping web search');
    return `Question asked about events up to ${date}`;
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: `${question} as of ${date}`,
        search_depth: 'basic',
        max_results: 3,
        include_answer: true,
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Combine answer + top results
    const context = [
      data.answer || '',
      ...data.results.map((r: any) => r.content).slice(0, 2)
    ].filter(Boolean).join('\n\n');
    
    console.log('[ai-resolve] Fetched web context via Tavily');
    return context || `Question asked about events up to ${date}`;
  } catch (error: any) {
    console.warn('[ai-resolve] Tavily failed:', error.message);
    return `Question asked about events up to ${date}`;
  }
}

async function getAIResolution(
  question: string,
  resolutionDate: string,
  context: string
): Promise<AIResolution> {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    throw new Error('GROQ_API_KEY not configured. Get free key at https://console.groq.com');
  }

  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a prediction market resolver. Respond ONLY with valid JSON: {"outcome": "YES"|"NO"|"INVALID", "confidence": 0-100, "reasoning": "brief explanation"}. Use INVALID only if the question is truly ambiguous or has no clear criteria. If you have any information about the event, make a determination.'
            },
            {
              role: 'user',
              content: `Question: ${question}\nResolution Date: ${resolutionDate}\nContext: ${context}\n\nBased on the context above, determine if this event happened. YES=happened, NO=did not happen, INVALID=only if truly ambiguous.`
            }
          ],
          temperature: 0.1,
          max_tokens: 200,
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${model} error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      
      const jsonMatch = text.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const result = JSON.parse(jsonMatch[0]);

      if (!['YES', 'NO', 'INVALID'].includes(result.outcome)) {
        throw new Error('Invalid AI response format');
      }

      console.log(`[ai-resolve] Used ${model}`);

      return {
        outcome: result.outcome,
        confidence: Math.min(100, Math.max(0, result.confidence || 50)),
        reasoning: result.reasoning || 'No reasoning provided',
      };
    } catch (error: any) {
      console.warn(`[ai-resolve] ${model} failed:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}
