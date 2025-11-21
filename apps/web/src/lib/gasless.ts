import { createWalletClient, createPublicClient, http, encodeFunctionData } from 'viem';
import { bscTestnet } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from './contracts';

const ENTRY_POINT = process.env.NEXT_PUBLIC_ENTRY_POINT || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '97');

export class GaslessService {
  private publicClient;
  private account: any;

  constructor(account: any) {
    this.account = account;
    this.publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });
  }

  async buySharesGasless(marketId: bigint, isYes: boolean, token: string, amount: bigint) {
    const callData = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'buyShares',
      args: [marketId, isYes, token as `0x${string}`, amount],
    });

    const userOp = {
      sender: this.account.address as `0x${string}`,
      nonce: '0x0' as `0x${string}`,
      initCode: '0x' as `0x${string}`,
      callData: callData as `0x${string}`,
      callGasLimit: '0x30d40' as `0x${string}`,
      verificationGasLimit: '0x186a0' as `0x${string}`,
      preVerificationGas: '0xc350' as `0x${string}`,
      maxFeePerGas: '0x59682f00' as `0x${string}`,
      maxPriorityFeePerGas: '0x59682f00' as `0x${string}`,
      paymasterAndData: '0x' as `0x${string}`,
      signature: '0x' as `0x${string}`,
    };

    const response = await fetch('/api/aa/sponsor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userOp, entryPoint: ENTRY_POINT, chainId: CHAIN_ID }),
    });

    if (!response.ok) {
      throw new Error(`Sponsor API failed: ${response.status}`);
    }

    const sponsored = await response.json();
    console.log('Gasless sponsored:', sponsored.provider, sponsored.latency_ms + 'ms');

    return sponsored;
  }

  async createMarketGasless(question: string, duration: number) {
    const callData = encodeFunctionData({
      abi: PREDICTION_MARKET_ABI,
      functionName: 'createMarket',
      args: [question, BigInt(duration)],
    });

    const userOp = {
      sender: this.account.address as `0x${string}`,
      nonce: '0x0' as `0x${string}`,
      initCode: '0x' as `0x${string}`,
      callData: callData as `0x${string}`,
      callGasLimit: '0x30d40' as `0x${string}`,
      verificationGasLimit: '0x186a0' as `0x${string}`,
      preVerificationGas: '0xc350' as `0x${string}`,
      maxFeePerGas: '0x59682f00' as `0x${string}`,
      maxPriorityFeePerGas: '0x59682f00' as `0x${string}`,
      paymasterAndData: '0x' as `0x${string}`,
      signature: '0x' as `0x${string}`,
    };

    const response = await fetch('/api/aa/sponsor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userOp, entryPoint: ENTRY_POINT, chainId: CHAIN_ID }),
    });

    if (!response.ok) {
      throw new Error(`Sponsor API failed: ${response.status}`);
    }

    const sponsored = await response.json();
    console.log('Gasless sponsored:', sponsored.provider, sponsored.latency_ms + 'ms');

    return sponsored;
  }
}
