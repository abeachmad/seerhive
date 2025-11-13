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
import marketsData from '@/mocks/fixtures/markets.json';
import strategiesData from '@/mocks/fixtures/strategies.json';
import analyticsData from '@/mocks/fixtures/analytics_charts.json';
import { TrendingUp, Users, Target, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('events');

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
                  {marketsData.map((market) => (
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