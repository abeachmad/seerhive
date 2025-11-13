'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SparklineMini } from '@/components/charts/SparklineMini';
import { WalletButton } from '@/components/WalletButton';
import { isDemo } from '@/lib/demoFlags';
import marketsData from '@/mocks/fixtures/markets.json';
import { useAccount } from 'wagmi';

export default function Markets() {
  const { isConnected } = useAccount();
  const demo = isDemo();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Prediction Markets</h1>
          <div className="flex gap-4">
            {demo && <Badge variant="default">DEMO MODE</Badge>}
            <WalletButton />
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          {demo && <Button>Create Demo Market</Button>}
          {isConnected && !demo && <Button>Create On-chain Market</Button>}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {marketsData.map((market) => (
            <Card key={market.id}>
              <CardHeader>
                <CardTitle>{market.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Yes Price</p>
                        <p className="text-2xl font-bold text-green-600">{(market.yesPrice * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">No Price</p>
                        <p className="text-2xl font-bold text-red-600">{(market.noPrice * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Volume: ${(market.totalVolume / 1000).toFixed(0)}K</span>
                      <span>Ends: {market.endDate}</span>
                      <Badge>{market.status}</Badge>
                    </div>
                  </div>
                  <div className="w-48 h-16 ml-8">
                    <SparklineMini data={market.sparkline} />
                  </div>
                  <div className="ml-8">
                    <Button>Trade</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}