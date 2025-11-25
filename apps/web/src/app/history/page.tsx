'use client';
import { useStore } from '@/lib/store';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HistoryPage() {
  const { trades } = useStore();
  const [contractMarkets, setContractMarkets] = useState<any[]>([]);
  
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const { createPublicClient, http } = await import('viem');
        const { bscTestnet } = await import('viem/chains');
        const { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } = await import('@/lib/contracts');
        
        const publicClient = createPublicClient({
          chain: bscTestnet,
          transport: http('https://bsc-testnet.publicnode.com'),
        });
        
        const marketCount = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'marketCount',
        });
        
        const markets: any[] = [];
        for (let i = 0; i < Number(marketCount); i++) {
          const marketData = await publicClient.readContract({
            address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'markets',
            args: [BigInt(i)],
          }) as unknown as any[];
          markets.push({ id: i.toString(), question: marketData[0] });
        }
        setContractMarkets(markets);
      } catch (error) {
        console.error('Failed to load markets:', error);
      }
    };
    loadMarkets();
  }, []);
  
  const getMarketQuestion = (marketId: string) => {
    const market = contractMarkets.find(m => m.id === marketId);
    return market ? market.question : 'Loading...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Transactions</h1>
        
        {trades.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-slate-700">
            <p className="text-slate-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.slice().reverse().map((trade) => (
              <div key={trade.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {trade.side === 'yes' ? (
                      <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className={`font-medium text-sm flex-shrink-0 ${trade.side === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.side.toUpperCase()}
                    </span>
                    <span className="text-slate-300 font-medium text-sm flex-shrink-0">{trade.amount} tBUSD</span>
                    <span className="text-slate-400 text-sm flex-shrink-0">
                      <span className="text-slate-300 font-mono">{trade.user.slice(0, 6)}...{trade.user.slice(-4)}</span>
                    </span>
                    <span className="text-slate-400 text-sm truncate">
                      {getMarketQuestion(trade.marketId)} <span className="text-slate-500">(#{trade.marketId})</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm flex-shrink-0">
                    <span className="text-slate-400">{new Date(trade.timestamp).toLocaleString()}</span>
                    {trade.txHash && (
                      <button
                        onClick={() => window.open(`https://testnet.bsctrace.com/tx/${trade.txHash}`, '_blank')}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Tx</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
