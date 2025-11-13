import { encodeFunctionData } from 'viem';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from './contracts';
import { MultiProviderRouter } from './paymaster/MultiProviderRouter';
import { SponsorOptions, PaymasterResult } from './paymaster/types';

export type { PaymasterProvider, RoutingMode } from './paymaster/types';

interface GaslessTransaction {
  to: string;
  data: string;
  value?: bigint;
}

export class GaslessService {
  private router: MultiProviderRouter;

  constructor() {
    this.router = new MultiProviderRouter();
  }

  async createMarketGasless(question: string, duration: number, opts?: SponsorOptions): Promise<PaymasterResult> {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'createMarket',
      args: [question, BigInt(duration)],
    });

    return this.router.sponsorUserOperation({
      sender: PREDICTION_MARKET_ADDRESS,
      callData: data,
    }, opts);
  }

  async buySharesGasless(marketId: string, isYes: boolean, amount: bigint, opts?: SponsorOptions): Promise<PaymasterResult> {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyShares',
      args: [BigInt(marketId), isYes],
    });

    return this.router.sponsorUserOperation({
      sender: PREDICTION_MARKET_ADDRESS,
      callData: data,
      value: amount,
    }, opts);
  }

  async sendGaslessTx(
    contract: string,
    method: string,
    args: readonly unknown[],
    opts?: SponsorOptions
  ): Promise<PaymasterResult> {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: method as any,
      args: args as any,
    });

    return this.router.sponsorUserOperation({
      sender: contract,
      callData: data,
    }, opts);
  }

  isGaslessAvailable(): boolean {
    return this.router.isAvailable();
  }

  async estimateGasSavings(tx: GaslessTransaction): Promise<string> {
    return this.router.estimateGasSavings({
      sender: tx.to,
      callData: tx.data,
      value: tx.value,
    });
  }

  getProviderName(): string {
    return this.router.getProviderName();
  }
}

export const gaslessService = new GaslessService();
export const sendGaslessTx = gaslessService.sendGaslessTx.bind(gaslessService);