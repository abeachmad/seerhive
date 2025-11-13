import { encodeFunctionData } from 'viem';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from './contracts';
import { PaymasterFactory } from './paymaster/PaymasterFactory';

interface GaslessTransaction {
  to: string;
  data: string;
  value?: bigint;
}

export class GaslessService {
  private paymaster;

  constructor() {
    this.paymaster = PaymasterFactory.getPaymaster();
  }

  async createMarketGasless(question: string, duration: number) {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'createMarket',
      args: [question, BigInt(duration)],
    });

    return this.paymaster.sponsorUserOperation({
      sender: PREDICTION_MARKET_ADDRESS,
      callData: data,
    });
  }

  async buySharesGasless(marketId: string, isYes: boolean, amount: bigint) {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyShares',
      args: [BigInt(marketId), isYes],
    });

    return this.paymaster.sponsorUserOperation({
      sender: PREDICTION_MARKET_ADDRESS,
      callData: data,
      value: amount,
    });
  }

  isGaslessAvailable(): boolean {
    return this.paymaster.isAvailable();
  }

  async estimateGasSavings(tx: GaslessTransaction): Promise<string> {
    return this.paymaster.estimateGasSavings({
      sender: tx.to,
      callData: tx.data,
      value: tx.value,
    });
  }

  getProviderName(): string {
    return this.paymaster.getProviderName();
  }
}

export const gaslessService = new GaslessService();