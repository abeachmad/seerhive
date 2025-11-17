'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { useAccount, useSmartAccount } from '@particle-network/connectkit';

export function ContractDebug() {
  const { address } = useAccount();
  const smartAccount = useSmartAccount();
  const [marketData, setMarketData] = useState<any>(null);
  const [userShares, setUserShares] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http('https://bsc-testnet.publicnode.com'),
  });

  const checkContract = async () => {
    const smartAccountAddress = smartAccount ? await smartAccount.getAddress() : null;
    const checkAddress = smartAccountAddress || address;
    if (!checkAddress) return;
    
    console.log('🔍 CONTRACT: Checking address:', checkAddress);
    try {
      // Check market 0 data
      const market = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'markets',
        args: [BigInt(0)],
      });

      // Check user shares for market 0
      const [yesShares, noShares] = await Promise.all([
        publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'yesShares',
          args: [BigInt(0), checkAddress],
        }),
        publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'noShares',
          args: [BigInt(0), checkAddress],
        }),
      ]);

      setMarketData(market);
      setUserShares({ yesShares, noShares });
      
      console.log('🔍 CONTRACT DEBUG:');
      console.log('Market 0 data:', market);
      console.log('User YES shares:', yesShares.toString());
      console.log('User NO shares:', noShares.toString());
    } catch (error) {
      console.error('Contract read error:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkContract();
    }
  }, [address, mounted]);

  if (!mounted || !address) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Contract Debug</h3>
        <button
          onClick={checkContract}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Refresh
        </button>
      </div>
      
      {marketData && (
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-slate-400">Market 0 Question:</span>
            <div className="text-white font-mono">{marketData[0]}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400">Total YES Shares:</span>
              <div className="text-green-400 font-mono">
                {(parseInt(marketData[1].toString()) / 1e18).toFixed(4)}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Total NO Shares:</span>
              <div className="text-red-400 font-mono">
                {(parseInt(marketData[2].toString()) / 1e18).toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {userShares && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <div className="text-slate-400 mb-2">Your Shares in Market 0:</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-400">YES:</span>
              <div className="text-white font-mono">
                {(parseInt(userShares.yesShares.toString()) / 1e18).toFixed(4)}
              </div>
            </div>
            <div>
              <span className="text-red-400">NO:</span>
              <div className="text-white font-mono">
                {(parseInt(userShares.noShares.toString()) / 1e18).toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}