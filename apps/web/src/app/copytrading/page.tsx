'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SparklineMini } from '@/components/charts/SparklineMini';
import strategiesData from '@/mocks/fixtures/strategies.json';

export default function CopyTrading() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Copy Trading</h1>

        <div className="grid grid-cols-1 gap-6">
          {strategiesData.map((strategy) => (
            <Card key={strategy.id}>
              <CardHeader>
                <CardTitle>{strategy.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">{strategy.trader}</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-xl font-bold text-green-600">+{strategy.roi}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="text-xl font-bold">{strategy.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trades</p>
                        <p className="text-xl font-bold">{strategy.trades}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Followers</p>
                        <p className="text-xl font-bold">{strategy.followers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-48 h-16 mx-8">
                    <SparklineMini data={strategy.sparkline} color="#10b981" />
                  </div>
                  <div>
                    <Button>Follow</Button>
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