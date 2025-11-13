import { IPaymaster } from './IPaymaster';
import { PimlicoPaymaster } from './PimlicoPaymaster';
import { ParticlePaymaster } from './ParticlePaymaster';
import { PaymasterResult, UserOperation, SponsorOptions, RoutingMode, PaymasterProvider, Telemetry } from './types';
import { keccak256, toBytes } from 'viem';

declare global {
  interface Window {
    __seerhive?: {
      telemetry: Telemetry[];
    };
  }
}

export class MultiProviderRouter implements IPaymaster {
  private pimlico: PimlicoPaymaster;
  private particle: ParticlePaymaster;
  private routingMode: RoutingMode;

  constructor() {
    this.pimlico = new PimlicoPaymaster();
    this.particle = new ParticlePaymaster();
    this.routingMode = (process.env.NEXT_PUBLIC_PAYMASTER_ROUTING || 'auto') as RoutingMode;
    
    if (typeof window !== 'undefined') {
      window.__seerhive = window.__seerhive || { telemetry: [] };
    }
  }

  async sponsorUserOperation(userOp: UserOperation, opts?: SponsorOptions): Promise<PaymasterResult> {
    const startTime = Date.now();
    let provider: PaymasterProvider;
    let failoverHit = false;

    // Determine provider
    if (opts?.providerHint) {
      provider = opts.providerHint;
    } else {
      provider = this.selectProvider(userOp.sender);
    }

    // Try primary provider
    const simulateStart = Date.now();
    let result = await this.tryProvider(provider, userOp);
    const simulateMs = Date.now() - simulateStart;

    // Fallback logic for 'auto' mode
    if (!result.sponsored && this.routingMode === 'auto') {
      failoverHit = true;
      const fallbackProvider: PaymasterProvider = provider === 'pimlico' ? 'particle' : 'pimlico';
      console.log(`[Gasless] Failover: ${provider} → ${fallbackProvider}`);
      result = await this.tryProvider(fallbackProvider, userOp);
    }

    const sponsorMs = Date.now() - startTime;

    // Telemetry
    this.logTelemetry({
      provider_used: result.provider,
      route_mode: this.routingMode,
      simulate_ms: simulateMs,
      sponsor_ms: sponsorMs,
      failover_hit: failoverHit,
      chainId: 97,
    });

    return result;
  }

  private selectProvider(sender: string): PaymasterProvider {
    switch (this.routingMode) {
      case 'pimlico':
        return 'pimlico';
      case 'particle':
        return 'particle';
      case 'abtest':
        const hash = keccak256(toBytes(sender));
        const mod = parseInt(hash.slice(-1), 16) % 2;
        return mod === 0 ? 'pimlico' : 'particle';
      case 'auto':
      default:
        return this.pimlico.isAvailable() ? 'pimlico' : 'particle';
    }
  }

  private async tryProvider(provider: PaymasterProvider, userOp: UserOperation): Promise<PaymasterResult> {
    const paymaster = provider === 'pimlico' ? this.pimlico : this.particle;
    
    if (!paymaster.isAvailable()) {
      return {
        sponsored: false,
        message: `${provider} not available`,
        provider,
      };
    }

    return paymaster.sponsorUserOperation(userOp);
  }

  private logTelemetry(data: Telemetry) {
    console.log('[Gasless Telemetry]', data);
    if (typeof window !== 'undefined' && window.__seerhive) {
      window.__seerhive.telemetry.push(data);
    }
  }

  isAvailable(): boolean {
    return this.pimlico.isAvailable() || this.particle.isAvailable();
  }

  async estimateGasSavings(userOp: UserOperation): Promise<string> {
    const provider = this.selectProvider(userOp.sender);
    const paymaster = provider === 'pimlico' ? this.pimlico : this.particle;
    return paymaster.estimateGasSavings(userOp);
  }

  getProviderName(): string {
    if (this.routingMode === 'auto') {
      return 'Auto (Pimlico→Particle)';
    }
    return this.routingMode.charAt(0).toUpperCase() + this.routingMode.slice(1);
  }
}