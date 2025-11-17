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
      // Get market count
      const marketCount = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'marketCount',
      });
      
      console.log('📊 CONTRACT: Total markets:', marketCount.toString());
      
      // Check all markets data
      const marketsData: any[] = [];
      const allUserShares: any[] = [];
      
      for (let i = 0; i < Number(marketCount); i++) {
        try {
          const [market, yesShares, noShares] = await Promise.all([
            publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
              abi: PREDICTION_MARKET_ABI,
              functionName: 'markets',
              args: [BigInt(i)],
            }),
            publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
              abi: PREDICTION_MARKET_ABI,
              functionName: 'yesShares',
              args: [BigInt(i), checkAddress as `0x${string}`],
            }),
            publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
              abi: PREDICTION_MARKET_ABI,
              functionName: 'noShares',
              args: [BigInt(i), checkAddress as `0x${string}`],
            }),
          ]);
          
          marketsData.push({ id: i, data: market });
          allUserShares.push({ id: i, yesShares, noShares });
        } catch (error) {
          console.log(`Market ${i} error:`, error);
        }
      }

      setMarketData({ marketCount, markets: marketsData });
      setUserShares(allUserShares);
      
      console.log('🔍 CONTRACT DEBUG:');
      console.log('Total markets in contract:', marketCount.toString());
      marketsData.forEach((m, i) => {
        console.log(`Market ${i} data:`, m.data);
        console.log(`User Market ${i} YES shares:`, allUserShares[i]?.yesShares.toString());
        console.log(`User Market ${i} NO shares:`, allUserShares[i]?.noShares.toString());
      });
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
            <span className="text-slate-400">Total Markets in Contract:</span>
            <div className="text-blue-400 font-mono font-bold">{marketData.marketCount?.toString() || 'Unknown'}</div>
          </div>
          
          {marketData.markets?.map((market: any, index: number) => (
            <div key={index} className="border-t border-slate-700 pt-3">
              <div className="mb-2">
                <span className="text-slate-400">Market {index} Question:</span>
                <div className="text-white font-mono">{market.data[0]}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <span className="text-slate-400">Total YES Shares:</span>
                  <div className="text-green-400 font-mono">
                    {(parseInt(market.data[1].toString()) / 1e18).toFixed(4)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Total NO Shares:</span>
                  <div className="text-red-400 font-mono">
                    {(parseInt(market.data[2].toString()) / 1e18).toFixed(4)}
                  </div>
                </div>
              </div>
              
              {userShares && userShares[index] && (
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-400 mb-1">Your Shares:</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-400">YES:</span>
                      <div className="text-white font-mono">
                        {(parseInt(userShares[index].yesShares.toString()) / 1e18).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-red-400">NO:</span>
                      <div className="text-white font-mono">
                        {(parseInt(userShares[index].noShares.toString()) / 1e18).toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}