import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Vote, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-bold mb-6 gradient-text">
            SeerHive
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            AI-Assisted Social Prediction Markets on BNB Chain
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Launch App</Button>
            </Link>
            <Link href="/markets">
              <Button variant="outline" size="lg">Explore Markets</Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/markets">
            <Card className="hover:scale-105 transition-transform cursor-pointer">
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-green-400 mb-2" />
                <CardTitle>Prediction Markets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">
                  Trade on future outcomes with transparent, decentralized markets
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/copytrading">
            <Card className="hover:scale-105 transition-transform cursor-pointer">
              <CardHeader>
                <Users className="w-10 h-10 text-blue-400 mb-2" />
                <CardTitle>Copy Trading</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">
                  Follow top predictors and replicate their strategies
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/governance">
            <Card className="hover:scale-105 transition-transform cursor-pointer">
              <CardHeader>
                <Vote className="w-10 h-10 text-purple-400 mb-2" />
                <CardTitle>Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">
                  Vote on platform proposals and shape the future
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover:scale-105 transition-transform cursor-pointer">
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-orange-400 mb-2" />
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">
                  Real-time insights and comprehensive dashboards
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-100">Ready to Start?</h2>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button>View Dashboard</Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline">Browse Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}