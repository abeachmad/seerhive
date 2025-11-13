import { createPublicClient, http, encodeFunctionData, createWalletClient, custom } from 'viem';
import { bscTestnet } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from './contracts';

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PAYMASTER_URL || '';

interface GaslessTransaction {
  to: string;
  data: string;
  value?: bigint;
}

export class GaslessService {
  private publicClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });
  }

  async createMarketGasless(question: string, duration: number) {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'createMarket',
      args: [question, BigInt(duration)],
    });

    return this.sponsorTransaction({
      to: PREDICTION_MARKET_ADDRESS,
      data,
    });
  }

  async buySharesGasless(marketId: string, isYes: boolean, amount: bigint) {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyShares',
      args: [BigInt(marketId), isYes],
    });

    return this.sponsorTransaction({
      to: PREDICTION_MARKET_ADDRESS,
      data,
      value: amount,
    });
  }

  private async sponsorTransaction(tx: GaslessTransaction) {
    if (!PIMLICO_API_KEY) {
      return {
        sponsored: false,
        message: 'Pimlico API key not configured',
      };
    }

    try {
      // Call Pimlico paymaster to sponsor gas
      const response = await fetch(PIMLICO_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_sponsorUserOperation',
          params: [{
            sender: tx.to,
            callData: tx.data,
            callGasLimit: '0x30d40',
            verificationGasLimit: '0x30d40',
            preVerificationGas: '0x30d40',
            maxFeePerGas: '0x3b9aca00',
            maxPriorityFeePerGas: '0x3b9aca00',
          }],
        }),
      });

      const result = await response.json();
      
      if (result.result) {
        return {
          sponsored: true,
          hash: result.result.paymasterAndData || '0x',
          message: 'Transaction sponsored by Pimlico',
        };
      }

      return {
        sponsored: false,
        message: 'Paymaster rejected transaction',
      };
    } catch (error) {
      console.error('Pimlico error:', error);
      return {
        sponsored: false,
        message: 'Paymaster unavailable',
      };
    }
  }

  isGaslessAvailable(): boolean {
    return !!PIMLICO_API_KEY;
  }

  async estimateGasSavings(tx: GaslessTransaction): Promise<string> {
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
}

export const gaslessService = new GaslessService();