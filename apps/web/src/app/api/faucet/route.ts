import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';

const fundedAccounts = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { smartAccountAddress } = await req.json();

    if (!smartAccountAddress || !isAddress(smartAccountAddress)) {
      return NextResponse.json(
        { error: 'Invalid smart account address' },
        { status: 400 }
      );
    }

    if (fundedAccounts.has(smartAccountAddress.toLowerCase())) {
      return NextResponse.json({
        success: true,
        message: 'Already funded',
        txHash: null,
      });
    }

    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Deployer key not configured' },
        { status: 500 }
      );
    }

    const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);
    const client = createWalletClient({
      account,
      chain: bscTestnet,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    const txHash = await client.sendTransaction({
      to: smartAccountAddress as `0x${string}`,
      value: parseEther('0.02'),
    });

    fundedAccounts.add(smartAccountAddress.toLowerCase());

    console.log(`[Faucet] Funded ${smartAccountAddress}: ${txHash}`);

    return NextResponse.json({
      success: true,
      txHash,
      amount: '0.02 BNB',
    });
  } catch (error: any) {
    console.error('[Faucet] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Faucet failed' },
      { status: 500 }
    );
  }
}
