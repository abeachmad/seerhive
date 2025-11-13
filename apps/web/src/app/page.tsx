import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">SeerHive</h1>
          <p className="text-xl text-muted-foreground">AI-Assisted Social Prediction Markets on BNB Chain</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Trade on future outcomes with transparent, decentralized markets
              </p>
              <Link href="/markets">
                <Button>Explore Markets</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Copy Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Follow top predictors and replicate their strategies
              </p>
              <Link href="/copytrading">
                <Button>View Traders</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Vote on platform proposals and shape the future
              </p>
              <Link href="/governance">
                <Button>Participate</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="outline" className="mr-4">Dashboard</Button>
          </Link>
          <Link href="/events">
            <Button variant="outline">Events</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}