'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { useAccount, useSmartAccount } from '@particle-network/connectkit';

interface ShareBalance {
  marketId: string;
  yesShares: string;
  noShares: string;
}

export function SharesBalance() {
  const { address } = useAccount();
  const smartAccount = useSmartAccount();
  const [shares, setShares] = useState<ShareBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http('https://bsc-testnet.publicnode.com'),
  });

  const fetchShares = async () => {
    const smartAccountAddress = smartAccount ? await smartAccount.getAddress() : null;
    const checkAddress = smartAccountAddress || address;
    if (!checkAddress) return;
    
    console.log('🔍 SHARES: Checking address:', checkAddress);
    setLoading(true);
    try {
      const shareBalances: ShareBalance[] = [];
      
      // Get total market count first
      const marketCount = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'marketCount',
      });
      
      console.log('📊 SHARES: Total markets in contract:', marketCount.toString());
      
      // Check shares for all existing markets
      for (let marketId = 0; marketId < Number(marketCount); marketId++) {
        try {
          const [yesShares, noShares] = await Promise.all([
            publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
              abi: PREDICTION_MARKET_ABI,
              functionName: 'yesShares',
              args: [BigInt(marketId), checkAddress as `0x${string}`],
            }),
            publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
              abi: PREDICTION_MARKET_ABI,
              functionName: 'noShares',
              args: [BigInt(marketId), checkAddress as `0x${string}`],
            }),
          ]);

          const yesAmount = yesShares.toString();
          const noAmount = noShares.toString();

          if (yesAmount !== '0' || noAmount !== '0') {
            shareBalances.push({
              marketId: marketId.toString(),
              yesShares: yesAmount,
              noShares: noAmount,
            });
          }
        } catch (error) {
          console.log(`Market ${marketId} not found or error:`, error);
        }
      }
      
      setShares(shareBalances);
      console.log('📊 SHARES: User share balances:', shareBalances);
    } catch (error) {
      console.error('Failed to fetch shares:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchShares();
    }
  }, [address, mounted]);

  if (!mounted) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Your Shares</h3>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Your Shares</h3>
        <p className="text-slate-400">Connect wallet to view shares</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Your Shares</h3>
        <button
          onClick={fetchShares}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {loading ? (
        <p className="text-slate-400">Loading shares...</p>
      ) : shares.length === 0 ? (
        <p className="text-slate-400">No shares found</p>
      ) : (
        <div className="space-y-2">
          {shares.map((share) => (
            <div key={share.marketId} className="bg-slate-700 rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Market #{share.marketId}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-400">YES Shares:</span>
                  <div className="text-white font-mono">
                    {(parseInt(share.yesShares) / 1e18).toFixed(4)}
                  </div>
                </div>
                <div>
                  <span className="text-red-400">NO Shares:</span>
                  <div className="text-white font-mono">
                    {(parseInt(share.noShares) / 1e18).toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-3 text-xs text-slate-500">
        💡 Shares are stored in the contract, not as wallet tokens
      </div>
    </div>
  );
}