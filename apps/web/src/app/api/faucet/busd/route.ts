import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseEther } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const BUSD_ADDRESS = '0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814';
const FAUCET_AMOUNT = '100';
const RATE_LIMIT_HOURS = 24;

const requestLog = new Map<string, number>();

const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const now = Date.now();
    const lastRequest = requestLog.get(address.toLowerCase());
    if (lastRequest && now - lastRequest < RATE_LIMIT_HOURS * 60 * 60 * 1000) {
      const hoursLeft = Math.ceil((RATE_LIMIT_HOURS * 60 * 60 * 1000 - (now - lastRequest)) / (60 * 60 * 1000));
      return NextResponse.json({ error: `Wait ${hoursLeft}h before next request` }, { status: 429 });
    }

    if (!process.env.FAUCET_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Faucet not configured' }, { status: 503 });
    }

    const account = privateKeyToAccount(process.env.FAUCET_PRIVATE_KEY as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: bscTestnet,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://bsc-testnet.publicnode.com'),
    });

    const hash = await client.writeContract({
      address: BUSD_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [address as `0x${string}`, parseEther(FAUCET_AMOUNT)],
    });

    requestLog.set(address.toLowerCase(), now);

    return NextResponse.json({
      success: true,
      txHash: hash,
      amount: FAUCET_AMOUNT,
      explorerUrl: `https://testnet.bscscan.com/tx/${hash}`,
    });
  } catch (error: any) {
    console.error('[faucet] Failed:', error);
    return NextResponse.json({ error: error.message || 'Faucet request failed' }, { status: 500 });
  }
}
