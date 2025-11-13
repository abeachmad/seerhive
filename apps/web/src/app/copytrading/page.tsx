'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SparklineMini } from '@/components/charts/SparklineMini';
import { useStore } from '@/lib/store';
import { ReputationSystem } from '@/lib/reputation';
import strategiesData from '@/mocks/fixtures/strategies.json';
import { Trophy, TrendingUp, Target, Users } from 'lucide-react';
import { useState } from 'react';

export default function CopyTrading() {
  const { userReputations } = useStore();
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const traders = Object.values(userReputations).map(rep => {
    const brierScore = ReputationSystem.calculateBrierScore(rep.predictions);
    const accuracy = ReputationSystem.calculateAccuracy(rep.predictions);
    const pnl = ReputationSystem.calculatePnL(rep.predictions);
    const reputationScore = ReputationSystem.calculateReputationScore(
      brierScore,
      accuracy,
      rep.totalVolume,
      0.8
    );
    const gaming = ReputationSystem.detectGaming(rep.predictions);

    return {
      address: rep.address,
      brierScore,
      accuracy,
      pnl,
      reputationScore,
      totalVolume: rep.totalVolume,
      totalTrades: rep.totalTrades,
      elo: rep.elo,
      isSuspicious: gaming.isSuspicious,
      suspiciousReasons: gaming.reasons,
    };
  }).sort((a, b) => b.reputationScore - a.reputationScore);

  const handleFollow = (address: string) => {
    setFollowing(prev => {
      const newSet = new Set(prev);
      if (newSet.has(address)) {
        newSet.delete(address);
      } else {
        newSet.add(address);
      }
      return newSet;
    });
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Copy Trading</h1>
          <p className="text-slate-400">Follow top predictors with proven track records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">Top Trader</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold text-slate-100">
                  {traders[0]?.address.slice(0, 8) || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">Avg Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {traders.length > 0 
                  ? (traders.reduce((acc, t) => acc + t.accuracy, 0) / traders.length).toFixed(1)
                  : '0'}%
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">Total Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {traders.length + strategiesData.length}
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">You Follow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {following.size}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-4">🏆 Leaderboard</h2>
            <div className="space-y-4">
              {traders.map((trader, index) => (
                <Card key={trader.address} className="hover:border-green-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-slate-600">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-100">
                              {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
                            </h3>
                            <Badge variant="success">
                              Score: {trader.reputationScore}
                            </Badge>
                            {trader.isSuspicious && (
                              <Badge variant="danger">⚠️ Suspicious</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Accuracy</p>
                              <p className="font-bold text-green-400">{trader.accuracy.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Brier Score</p>
                              <p className="font-bold text-blue-400">{trader.brierScore.toFixed(3)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">ELO</p>
                              <p className="font-bold text-purple-400">{trader.elo.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">P&L</p>
                              <p className={`font-bold ${trader.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trader.pnl >= 0 ? '+' : ''}{trader.pnl.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm text-slate-400">Volume</p>
                          <p className="font-bold text-slate-100">${trader.totalVolume.toFixed(0)}</p>
                        </div>
                        <Button 
                          onClick={() => handleFollow(trader.address)}
                          variant={following.has(trader.address) ? 'outline' : 'default'}
                          size="sm"
                        >
                          {following.has(trader.address) ? 'Following' : 'Follow'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {strategiesData.map((strategy, index) => (
                <Card key={strategy.id} className="hover:border-green-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-slate-600">
                          #{traders.length + index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-100 mb-2">{strategy.name}</h3>
                          <p className="text-sm text-slate-400 mb-2">{strategy.trader} • {strategy.followers} followers</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">ROI</p>
                              <p className="font-bold text-green-400">+{strategy.roi}%</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Win Rate</p>
                              <p className="font-bold text-blue-400">{strategy.winRate}%</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Trades</p>
                              <p className="font-bold text-purple-400">{strategy.trades}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Volume</p>
                              <p className="font-bold text-slate-100">${(strategy.totalVolume / 1000).toFixed(0)}K</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-12">
                          <SparklineMini data={strategy.sparkline} color="#10b981" />
                        </div>
                        <Button size="sm">Follow</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}