import { createPublicClient, http, encodeFunctionData } from 'viem';
import { bscTestnet } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from './contracts';

// Paymaster service (mock for now - in production use Pimlico/Biconomy)
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || '';

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

  // Create gasless transaction for market creation
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

  // Create gasless transaction for buying shares
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

  // Sponsor transaction via paymaster
  private async sponsorTransaction(tx: GaslessTransaction) {
    // In DEMO mode, simulate gasless
    if (!PAYMASTER_URL) {
      return {
        sponsored: true,
        hash: '0x' + Math.random().toString(16).slice(2),
        message: 'Gasless transaction simulated (DEMO mode)',
      };
    }

    // In production, call actual paymaster service
    try {
      const response = await fetch(PAYMASTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: tx,
          chainId: bscTestnet.id,
        }),
      });

      const result = await response.json();
      return {
        sponsored: true,
        hash: result.hash,
        message: 'Transaction sponsored by paymaster',
      };
    } catch (error) {
      console.error('Paymaster error:', error);
      return {
        sponsored: false,
        message: 'Paymaster unavailable, user must pay gas',
      };
    }
  }

  // Check if gasless is available
  isGaslessAvailable(): boolean {
    return !!PAYMASTER_URL || process.env.NEXT_PUBLIC_DEMO === '1';
  }

  // Estimate gas savings
  async estimateGasSavings(tx: GaslessTransaction): Promise<string> {
    try {
      const gasPrice = await this.publicClient.getGasPrice();
      const estimatedGas = 200000n; // Rough estimate
      const gasCost = gasPrice * estimatedGas;
      
      // Convert to BNB
      const bnbCost = Number(gasCost) / 1e18;
      return `~${bnbCost.toFixed(6)} BNB`;
    } catch {
      return '~0.001 BNB';
    }
  }
}

export const gaslessService = new GaslessService();