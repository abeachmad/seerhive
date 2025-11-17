'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SparklineMini } from '@/components/charts/SparklineMini';
import { SimpleLineChart } from '@/components/charts/SimpleLineChart';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { SimplePieChart } from '@/components/charts/SimplePieChart';
import eventsData from '@/mocks/fixtures/events.json';
import strategiesData from '@/mocks/fixtures/strategies.json';
import analyticsData from '@/mocks/fixtures/analytics_charts.json';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { PREDICTION_MARKET_ADDRESS } from '@/lib/contracts';
import { isDemo } from '@/lib/demoFlags';
import { TrendingUp, Users, Target, Zap, ArrowUp, ArrowDown } from 'lucide-react';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const [contractMarkets, setContractMarkets] = useState<any[]>([]);
  const { markets: userMarkets } = useStore();
  const demo = isDemo();
  
  // Load markets from contract or demo data
  useEffect(() => {
    if (demo) {
      setContractMarkets([
        {
          id: '0',
          question: 'Will BTC reach $100k in 2025?',
          totalVolume: 125000,
          yesPrice: 0.65,
          endDate: '2024-12-31',
          sparkline: [{ value: 0.45 }, { value: 0.52 }, { value: 0.58 }, { value: 0.62 }, { value: 0.65 }]
        }
      ]);
      return;
    }
    
    const loadMarkets = async () => {
      try {
        const response = await fetch('https://bsc-testnet.publicnode.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: PREDICTION_MARKET_ADDRESS,
              data: '0x2c78c2c6' // marketCount()
            }, 'latest'],
            id: 1
          })
        });
        const result = await response.json();
        const marketCount = parseInt(result.result, 16);
        
        const markets = [];
        for (let i = 0; i < marketCount; i++) {
          markets.push({
            id: i.toString(),
            question: `Market ${i}`,
            totalVolume: Math.floor(Math.random() * 100000),
            yesPrice: 0.5 + (Math.random() - 0.5) * 0.4,
            endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            sparkline: [{ value: 0.5 }]
          });
        }
        setContractMarkets(markets);
      } catch (error) {
        console.error('Failed to load markets:', error);
        setContractMarkets([]);
      }
    };
    
    loadMarkets();
  }, [demo]);
  
  const allMarkets = [...contractMarkets, ...userMarkets];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-slate-400">Real-time analytics and market insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-400">Total Volume</CardTitle>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">$450K</div>
              <Badge variant="success" className="mt-2">
                <ArrowUp className="w-3 h-3 mr-1" />
                +12.5%
              </Badge>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-400">Active Markets</CardTitle>
                <Target className="w-5 h-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">127</div>
              <Badge variant="success" className="mt-2">
                <ArrowUp className="w-3 h-3 mr-1" />
                +8
              </Badge>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-400">Total Users</CardTitle>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">1,850</div>
              <Badge variant="success" className="mt-2">
                <ArrowUp className="w-3 h-3 mr-1" />
                +15.2%
              </Badge>
            </CardContent>
          </Card>

          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-400">Oracle Accuracy</CardTitle>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">94.2%</div>
              <Badge variant="success" className="mt-2">
                <ArrowUp className="w-3 h-3 mr-1" />
                +2.1%
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="agents">Top Traders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="events" forceMount hidden={activeTab !== 'events'}>
            <Card>
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventsData.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-green-500/30 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-100">{event.title}</h3>
                        <p className="text-sm text-slate-400">{event.category} • {event.participants} participants</p>
                      </div>
                      <div className="w-32 h-12 mx-4">
                        <SparklineMini data={event.sparkline} color={event.change24h > 0 ? '#10b981' : '#ef4444'} />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-100">${(event.volume / 1000).toFixed(0)}K</div>
                        <Badge variant={event.change24h > 0 ? 'success' : 'danger'}>
                          {event.change24h > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                          {Math.abs(event.change24h)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markets" forceMount hidden={activeTab !== 'markets'}>
            <Card>
              <CardHeader>
                <CardTitle>Active Markets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allMarkets.map((market) => (
                    <div key={market.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-green-500/30 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-100">{market.question}</h3>
                        <p className="text-sm text-slate-400">Ends: {market.endDate}</p>
                      </div>
                      <div className="w-32 h-12 mx-4">
                        <SparklineMini data={market.sparkline} color="#3b82f6" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-100">${(market.totalVolume / 1000).toFixed(0)}K</div>
                        <div className="text-sm text-green-400">Yes: {(market.yesPrice * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" forceMount hidden={activeTab !== 'agents'}>
            <Card>
              <CardHeader>
                <CardTitle>Top Traders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategiesData.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-green-500/30 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-100">{strategy.name}</h3>
                        <p className="text-sm text-slate-400">{strategy.trader} • {strategy.followers} followers</p>
                      </div>
                      <div className="w-32 h-12 mx-4">
                        <SparklineMini data={strategy.sparkline} color="#10b981" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">+{strategy.roi}%</div>
                        <div className="text-sm text-slate-400">Win: {strategy.winRate}%</div>
                      </div>
                      <Button size="sm" className="ml-4">Follow</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" forceMount hidden={activeTab !== 'analytics'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Volume Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleLineChart data={analyticsData.volumeOverTime} dataKey="volume" xKey="name" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Markets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart data={analyticsData.marketsByCategory} dataKey="value" nameKey="name" />
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart data={analyticsData.userGrowth} dataKey="users" xKey="name" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}