'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useStore } from '@/lib/store';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ResolutionPanelProps {
  market: any;
}

export function ResolutionPanel({ market }: ResolutionPanelProps) {
  const [loading, setLoading] = useState(false);
  const { proposeResolution, challengeResolution } = useStore();

  const handleProposeResolution = async (outcome: boolean) => {
    setLoading(true);
    
    // Call AI oracle
    const response = await fetch('/api/oracle/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marketId: market.id,
        question: market.question,
      }),
    });
    
    const data = await response.json();
    
    proposeResolution(market.id, outcome, 'AI Oracle');
    setLoading(false);
  };

  const handleChallenge = () => {
    if (confirm('Challenge this resolution? This will require a dispute bond.')) {
      challengeResolution(market.id);
    }
  };

  const proposal = market.resolutionProposal;
  const now = new Date();
  const deadline = proposal ? new Date(proposal.challengeDeadline) : null;
  const timeLeft = deadline ? Math.max(0, deadline.getTime() - now.getTime()) : 0;
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  if (market.status === 'resolved') {
    return (
      <Card className="border-green-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Market Resolved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Outcome: <span className="font-bold text-green-400">
              {market.outcome ? 'YES' : 'NO'}
            </span>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (proposal) {
    return (
      <Card className={proposal.challenged ? 'border-red-500/50' : 'border-yellow-500/50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Optimistic Resolution Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">Proposed Outcome</p>
            <Badge variant={proposal.outcome ? 'success' : 'danger'} className="text-lg">
              {proposal.outcome ? 'YES' : 'NO'}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm text-slate-400 mb-2">Proposed by</p>
            <p className="text-slate-300">{proposal.proposer}</p>
          </div>
          
          {!proposal.challenged ? (
            <>
              <div>
                <p className="text-sm text-slate-400 mb-2">Time to Challenge</p>
                <p className="text-slate-300 font-bold">{hoursLeft}h remaining</p>
              </div>
              
              <Button 
                variant="danger" 
                onClick={handleChallenge}
                className="w-full"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Challenge Resolution
              </Button>
            </>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-semibold">⚠️ Resolution Challenged</p>
              <p className="text-sm text-slate-400 mt-2">
                This resolution is under dispute. Human verification in progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // No proposal yet - show propose buttons
  const isPastEndDate = new Date(market.endDate) < now;
  
  if (!isPastEndDate) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-slate-400 text-center">
            Market ends on {market.endDate}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propose Resolution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          Market has ended. AI oracle will verify and propose resolution.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="success"
            onClick={() => handleProposeResolution(true)}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Resolve YES'}
          </Button>
          
          <Button 
            variant="danger"
            onClick={() => handleProposeResolution(false)}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Resolve NO'}
          </Button>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-sm text-blue-400">
            🤖 AI will check news sources and social media before proposing resolution
          </p>
        </div>
      </CardContent>
    </Card>
  );
}