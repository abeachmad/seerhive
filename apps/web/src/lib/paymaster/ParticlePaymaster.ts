import { IPaymaster, PaymasterResult, UserOperation } from './IPaymaster';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

export class ParticlePaymaster implements IPaymaster {
  private apiUrl: string;
  private publicClient;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_PARTICLE_PAYMASTER_URL || '';
    this.publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });
  }

  async sponsorUserOperation(userOp: UserOperation): Promise<PaymasterResult> {
    if (!this.apiUrl) {
      return {
        sponsored: false,
        message: 'Particle API not configured',
        provider: 'particle',
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PARTICLE_API_KEY || ''}`,
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
    return !!this.apiUrl;
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