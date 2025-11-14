import { encodeFunctionData } from 'viem';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from './contracts';

export type PaymasterProvider = 'particle' | 'pimlico';

interface SponsorResult {
  paymasterAndData: string;
  preVerificationGas: string;
  verificationGasLimit: string;
  callGasLimit: string;
  provider?: string;
  latency_ms?: number;
  fallback?: boolean;
}

const ENTRY_POINT = process.env.NEXT_PUBLIC_ENTRY_POINT || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 97);

async function sponsorViaAPI(userOp: any, entryPoint: string, chainId: number): Promise<SponsorResult> {
  const res = await fetch('/api/aa/sponsor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userOp, entryPoint, chainId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sponsor failed');
  }

  return res.json();
}

export class GaslessService {
  async createMarketGasless(question: string, duration: number, entryPoint: string = ENTRY_POINT): Promise<SponsorResult> {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'createMarket',
      args: [question, BigInt(duration)],
    });

    const userOp = {
      sender: PREDICTION_MARKET_ADDRESS,
      callData: data,
    };

    return sponsorViaAPI(userOp, entryPoint, CHAIN_ID);
  }

  async buySharesGasless(marketId: string, isYes: boolean, amount: bigint, sender: string, entryPoint: string = ENTRY_POINT): Promise<SponsorResult> {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyShares',
      args: [BigInt(marketId), isYes],
    });

    const userOp = {
      sender,
      nonce: '0x0',
      initCode: '0x',
      callData: data,
      callGasLimit: '0x0',
      verificationGasLimit: '0x0',
      preVerificationGas: '0x0',
      maxFeePerGas: '0x0',
      maxPriorityFeePerGas: '0x0',
      paymasterAndData: '0x',
      signature: '0x',
    };

    return sponsorViaAPI(userOp, entryPoint, CHAIN_ID);
  }

  async sendGaslessTx(
    contract: string,
    method: string,
    args: readonly unknown[],
    entryPoint: string = ENTRY_POINT
  ): Promise<SponsorResult> {
    const data = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: method as any,
      args: args as any,
    });

    const userOp = {
      sender: contract,
      callData: data,
    };

    return sponsorViaAPI(userOp, entryPoint, CHAIN_ID);
  }

  isGaslessAvailable(): boolean {
    return true;
  }

  getProviderName(): string {
    return 'particle';
  }
}

export const gaslessService = new GaslessService();
export const sendGaslessTx = gaslessService.sendGaslessTx.bind(gaslessService);