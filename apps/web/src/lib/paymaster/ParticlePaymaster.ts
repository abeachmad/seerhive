import { IPaymaster } from './IPaymaster';
import { PaymasterResult, UserOperation, SponsorOptions } from './types';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

export class ParticlePaymaster implements IPaymaster {
  private apiUrl: string;
  private apiKey: string;
  private publicClient;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_PARTICLE_PAYMASTER_URL || '';
    this.apiKey = process.env.NEXT_PUBLIC_PARTICLE_API_KEY || '';
    this.publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });
  }

  async sponsorUserOperation(userOp: UserOperation, opts?: SponsorOptions): Promise<PaymasterResult> {
    if (!this.apiUrl || !this.apiKey) {
      return {
        sponsored: false,
        message: 'Particle not configured',
        provider: 'particle',
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          method: 'particle_aa_sponsorUserOperation',
          params: [{
            sender: userOp.sender,
            callData: userOp.callData,
            callGasLimit: userOp.callGasLimit || '0x30d40',
            verificationGasLimit: userOp.verificationGasLimit || '0x30d40',
            preVerificationGas: userOp.preVerificationGas || '0x30d40',
            maxFeePerGas: userOp.maxFeePerGas || '0x3b9aca00',
            maxPriorityFeePerGas: userOp.maxPriorityFeePerGas || '0x3b9aca00',
          }],
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        const errorMsg = result.error.message || '';
        if (errorMsg.includes('not willing') || errorMsg.includes('deposit') || errorMsg.includes('rate limit')) {
          return {
            sponsored: false,
            message: `Particle rejected: ${errorMsg}`,
            provider: 'particle',
          };
        }
      }

      if (result.result) {
        return {
          sponsored: true,
          hash: result.result.paymasterAndData || '0x',
          message: 'Sponsored by Particle',
          provider: 'particle',
        };
      }

      return {
        sponsored: false,
        message: 'Particle rejected',
        provider: 'particle',
      };
    } catch (error) {
      return {
        sponsored: false,
        message: 'Particle unavailable',
        provider: 'particle',
      };
    }
  }

  isAvailable(): boolean {
    return !!this.apiUrl && !!this.apiKey;
  }

  async estimateGasSavings(userOp: UserOperation): Promise<string> {
    try {
      const gasPrice = await this.publicClient.getGasPrice();
      const estimatedGas = 200000n;
      const gasCost = gasPrice * estimatedGas;
      const bnbCost = Number(gasCost) / 1e18;
      return `~${bnbCost.toFixed(6)} BNB`;
    } catch {
      return '~0.001 BNB';
    }
  }

  getProviderName(): string {
    return 'Particle';
  }
}