'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SparklineMini } from '@/components/charts/SparklineMini';
import { CreateMarketDialog } from '@/components/CreateMarketDialog';
import { TradeDialog } from '@/components/TradeDialog';
import { ResolutionPanel } from '@/components/ResolutionPanel';
import { SharesBalance } from '@/components/SharesBalance';
import { isDemo } from '@/lib/demoFlags';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import type { Market } from '@/types/market';

export default function Markets() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedForResolution, setSelectedForResolution] = useState<Market | null>(null);
  const [contractMarkets, setContractMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const { markets: userMarkets } = useStore();
  const demo = isDemo();

  // Load markets from contract
  useEffect(() => {
    if (demo) {
      // Demo markets
      setContractMarkets([
        {
          id: '0',
          question: 'Will BTC reach $100k in 2025?',
          totalVolume: 125000,
          yesPrice: 0.65,
          noPrice: 0.35,
          endDate: '2024-12-31',
          status: 'active',
          aiVerified: true,
          aiConfidence: 0.92,
          sparkline: [
            { value: 0.45 },
            { value: 0.52 },
            { value: 0.58 },
            { value: 0.62 },
            { value: 0.65 }
          ]
        }
      ]);
      setLoading(false);
      return;
    }

    const loadContractMarkets = async () => {
      try {
        const { createPublicClient, http } = await import('viem');
        const { bscTestnet } = await import('viem/chains');
        
        const publicClient = createPublicClient({
          chain: bscTestnet,
          transport: http('https://bsc-testnet.publicnode.com'),
        });
        
        // Get market count
        const marketCount = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'marketCount',
        });
        
        console.log('Contract market count:', marketCount.toString());
        
        const markets: Market[] = [];
        
        // Load each market
        for (let i = 0; i < Number(marketCount); i++) {
          try {
            const marketData = await publicClient.readContract({
              address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
              abi: PREDICTION_MARKET_ABI,
              functionName: 'markets',
              args: [BigInt(i)],
            }) as unknown as any[];
            
            const [question, totalYesShares, totalNoShares, endTime, resolved, outcome] = marketData;
            
            const totalShares = Number(totalYesShares) + Number(totalNoShares);
            const yesPrice = totalShares > 0 ? Number(totalYesShares) / totalShares : 0.5;
            const noPrice = 1 - yesPrice;
            
            const market: Market = {
              id: i.toString(),
              question: question || `Market ${i}`,
              totalVolume: totalShares / 1e18,
              yesPrice,
              noPrice,
              endDate: new Date(Number(endTime) * 1000).toISOString().split('T')[0],
              status: resolved ? 'resolved' : 'active',
              aiVerified: true,
              aiConfidence: 0.9,
              sparkline: [{ value: yesPrice }]
            };
            markets.push(market);
            console.log(`Loaded market ${i}:`, market);
          } catch (error) {
            console.error(`Failed to load market ${i}:`, error);
          }
        }
        
        setContractMarkets(markets);
      } catch (error) {
        console.error('Failed to load contract markets:', error);
        setContractMarkets([]);
      } finally {
        setLoading(false);
      }
    };

    loadContractMarkets();
  }, [demo]);

  // Only show contract markets - user markets need to be deployed first
  const allMarkets: Market[] = contractMarkets;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Prediction Markets</h1>
            <p className="text-slate-400">AI-verified markets with optimistic resolution</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            Create Market
          </Button>
        </div>

        <SharesBalance />
        
        <div className="grid grid-cols-1 gap-6">
          {allMarkets.map((market) => (
            <Card key={market.id} className="hover:border-green-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{market.question}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      {market.aiVerified && (
                        <Badge variant="success">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Verified {market.aiConfidence ? `(${(market.aiConfidence * 100).toFixed(0)}%)` : ''}
                        </Badge>
                      )}
                      {market.resolutionProposal && (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3 mr-1" />
                          Resolution Pending
                        </Badge>
                      )}
                      <Badge>{market.status}</Badge>
                      {market.category && <Badge variant="default">{market.category}</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">YES Price</p>
                      <p className="text-3xl font-bold text-green-400">
                        {(market.yesPrice * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">NO Price</p>
                      <p className="text-3xl font-bold text-red-400">
                        {(market.noPrice * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-48 h-16 mx-8">
                    <SparklineMini data={market.sparkline} color="#10b981" />
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div>
                      <div className="text-sm text-slate-400">Volume</div>
                      <div className="font-bold text-slate-100">
                        ${(market.totalVolume / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <Button 
                      onClick={() => setSelectedMarket(market)} 
                      size="sm"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trade
                    </Button>
                    {market.status !== 'resolved' && (
                      <Button 
                        onClick={() => setSelectedForResolution(market)} 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm text-slate-400">
                  <span>Ends: {market.endDate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-400">Loading markets...</p>
            </CardContent>
          </Card>
        )}
        
        {!loading && allMarkets.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-slate-400 mb-4">No markets yet. Create the first one!</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Market
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showCreateDialog && (
        <CreateMarketDialog onClose={() => setShowCreateDialog(false)} />
      )}

      {selectedMarket && (
        <TradeDialog 
          market={selectedMarket} 
          onClose={() => setSelectedMarket(null)} 
        />
      )}

      {selectedForResolution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <ResolutionPanel market={selectedForResolution} />
            <Button 
              onClick={() => setSelectedForResolution(null)}
              variant="outline"
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}