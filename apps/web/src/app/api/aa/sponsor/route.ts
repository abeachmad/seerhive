import { NextRequest, NextResponse } from 'next/server';
import { ParticlePaymaster } from '@/lib/paymaster/server/ParticlePaymaster';
import { PimlicoPaymaster } from '@/lib/paymaster/server/PimlicoPaymaster';

export async function POST(req: NextRequest) {
  try {
    const { userOp, entryPoint, chainId } = await req.json();

    if (!userOp || !entryPoint || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const t0 = Date.now();

    // Try Particle first
    try {
      const particle = new ParticlePaymaster(
        process.env.PARTICLE_PAYMASTER_URL!,
        process.env.PARTICLE_PROJECT_ID!,
        process.env.PARTICLE_CLIENT_KEY!
      );

      const result = await particle.sponsor(userOp, entryPoint, chainId);
      const latency = Date.now() - t0;

      console.log('[sponsor] Particle success', { latency, chainId });

      return NextResponse.json({
        ...result,
        provider: 'particle',
        latency_ms: latency,
      });
    } catch (particleError: any) {
      console.warn('[sponsor] Particle failed, trying Pimlico', particleError.message);

      // Fallback to Pimlico
      try {
        const pimlico = new PimlicoPaymaster(process.env.PIMLICO_URL!);
        const result = await pimlico.sponsor(userOp, entryPoint, chainId);
        const latency = Date.now() - t0;

        console.log('[sponsor] Pimlico success (fallback)', { latency, chainId });

        return NextResponse.json({
          ...result,
          provider: 'pimlico',
          latency_ms: latency,
          fallback: true,
        });
      } catch (pimlicoError: any) {
        console.error('[sponsor] Both providers failed', {
          particle: particleError.message,
          pimlico: pimlicoError.message,
        });

        return NextResponse.json(
          {
            error: 'All paymasters failed',
            details: {
              particle: particleError.message,
              pimlico: pimlicoError.message,
            },
          },
          { status: 502 }
        );
      }
    }
  } catch (error: any) {
    console.error('[sponsor] Request error', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
