'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useStore } from '@/lib/store';
import { aiResolver } from '@/lib/aiResolver';
import { AlertTriangle, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface ResolutionPanelProps {
  market: any;
}

export function ResolutionPanel({ market }: ResolutionPanelProps) {
  const [loading, setLoading] = useState(false);
  const { proposeResolution, challengeResolution } = useStore();

  const handleAIResolve = async () => {
    setLoading(true);
    try {
      const result = await aiResolver.resolveMarket(
        market.id,
        market.question,
        market.endDate
      );
      
      console.log('[ai-resolve] Result:', result);
      
      if (result.outcome === 'INVALID') {
        alert(`AI cannot resolve: ${result.reasoning}`);
        setLoading(false);
        return;
      }
      
      const outcome = result.outcome === 'YES';
      proposeResolution(
        market.id,
        outcome,
        `AI Oracle (${result.confidence}% confidence): ${result.reasoning}`
      );
    } catch (error: any) {
      console.error('[ai-resolve] Error:', error);
      alert(`AI resolution failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
          Market has ended. Use AI to automatically resolve based on real-world data.
        </p>
        
        <Button 
          onClick={handleAIResolve}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? 'AI Analyzing...' : 'Resolve with AI'}
        </Button>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <p className="text-sm text-purple-400">
            ✨ AI will search news sources and analyze context to determine the outcome
          </p>
        </div>
      </CardContent>
    </Card>
  );
}