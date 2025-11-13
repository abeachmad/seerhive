import { IPaymaster } from './IPaymaster';
import { PaymasterResult, UserOperation, SponsorOptions } from './types';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

export class PimlicoPaymaster implements IPaymaster {
  private apiUrl: string;
  private publicClient;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_PIMLICO_URL || '';
    this.publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });
  }

  async sponsorUserOperation(userOp: UserOperation, opts?: SponsorOptions): Promise<PaymasterResult> {
    if (!this.apiUrl) {
      return {
        sponsored: false,
        message: 'Pimlico not configured',
        provider: 'pimlico',
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_sponsorUserOperation',
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
        const errorCode = result.error.code;
        if (errorCode === 402 || errorCode === 429 || errorCode === -32500) {
          return {
            sponsored: false,
            message: `Pimlico rejected: ${result.error.message}`,
            provider: 'pimlico',
          };
        }
      }

      if (result.result) {
        return {
          sponsored: true,
          hash: result.result.paymasterAndData || '0x',
          message: 'Sponsored by Pimlico',
          provider: 'pimlico',
        };
      }

      return {
        sponsored: false,
        message: 'Pimlico rejected',
        provider: 'pimlico',
      };
    } catch (error) {
      return {
        sponsored: false,
        message: 'Pimlico unavailable',
        provider: 'pimlico',
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
    return 'Pimlico';
  }
}