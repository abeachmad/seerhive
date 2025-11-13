'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SparklineMini } from '@/components/charts/SparklineMini';
import { SimpleLineChart } from '@/components/charts/SimpleLineChart';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { SimplePieChart } from '@/components/charts/SimplePieChart';
import { isDemo } from '@/lib/demoFlags';
import eventsData from '@/mocks/fixtures/events.json';
import marketsData from '@/mocks/fixtures/markets.json';
import strategiesData from '@/mocks/fixtures/strategies.json';
import analyticsData from '@/mocks/fixtures/analytics_charts.json';
import { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const demo = isDemo();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {demo && <Badge variant="default">DEMO MODE</Badge>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$450K</div>
              <Badge variant="success" className="mt-2">+12.5%</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <Badge variant="success" className="mt-2">+8</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,850</div>
              <Badge variant="success" className="mt-2">+15.2%</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Oracle Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <Badge variant="success" className="mt-2">+2.1%</Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
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
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.category} • {event.participants} participants</p>
                      </div>
                      <div className="w-32 h-12 mx-4">
                        <SparklineMini data={event.sparkline} color={event.change24h > 0 ? '#10b981' : '#ef4444'} />
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${(event.volume / 1000).toFixed(0)}K</div>
                        <Badge variant={event.change24h > 0 ? 'success' : 'danger'}>
                          {event.change24h > 0 ? '+' : ''}{event.change24h}%
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
                    <div key={market.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{market.question}</h3>
                        <p className="text-sm text-muted-foreground">Ends: {market.endDate}</p>
                      </div>
                      <div className="w-32 h-12 mx-4">
                        <SparklineMini data={market.sparkline} />
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${(market.totalVolume / 1000).toFixed(0)}K</div>
                        <div className="text-sm text-muted-foreground">Yes: {(market.yesPrice * 100).toFixed(0)}%</div>
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
                    <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{strategy.name}</h3>
                        <p className="text-sm text-muted-foreground">{strategy.trader} • {strategy.followers} followers</p>
                      </div>
                      <div className="w-32 h-12 mx-4">
                        <SparklineMini data={strategy.sparkline} color="#10b981" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{strategy.roi}%</div>
                        <div className="text-sm text-muted-foreground">Win: {strategy.winRate}%</div>
                      </div>
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

              <Card>
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