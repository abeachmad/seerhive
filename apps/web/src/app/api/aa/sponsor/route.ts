import { NextRequest, NextResponse } from 'next/server';
import { ParticlePaymaster } from '@/lib/paymaster/particle';
import { PimlicoPaymaster } from '@/lib/paymaster/pimlico';

export async function POST(req: NextRequest) {
  try {
    const { userOp, entryPoint, chainId } = await req.json();
    
    if (!userOp || !entryPoint || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: userOp, entryPoint, chainId' },
        { status: 400 }
      );
    }

    const t0 = Date.now();

    try {
      const particle = new ParticlePaymaster(
        process.env.PARTICLE_PAYMASTER_URL!,
        process.env.PARTICLE_PROJECT_ID!,
        process.env.PARTICLE_CLIENT_KEY!
      );
      
      const result = await particle.sponsorUserOperation(userOp, entryPoint);
      
      return NextResponse.json({
        ...result,
        provider: 'particle',
        latency_ms: Date.now() - t0,
      });
    } catch (particleError: any) {
      console.warn('[sponsor] Particle failed, trying Pimlico:', particleError.message);
      
      try {
        const pimlico = new PimlicoPaymaster(process.env.PIMLICO_URL!);
        const result = await pimlico.sponsorUserOperation(userOp, entryPoint);
        
        return NextResponse.json({
          ...result,
          provider: 'pimlico',
          latency_ms: Date.now() - t0,
          fallback: true,
        });
      } catch (pimlicoError: any) {
        console.error('[sponsor] Both providers failed:', {
          particle: particleError.message,
          pimlico: pimlicoError.message,
        });
        
        return NextResponse.json(
          { error: 'All paymaster providers failed', details: pimlicoError.message },
          { status: 502 }
        );
      }
    }
  } catch (error: any) {
    console.error('[sponsor] Request error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
