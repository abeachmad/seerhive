'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAccount } from '@particle-network/connectkit';
import { ExternalLink, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';

export function TransactionHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const { trades } = useStore();
  const { address } = useAccount();

  // Filter trades for current user
  console.log('📋 HISTORY: All trades:', trades);
  console.log('📋 HISTORY: Current address:', address);
  const userTrades = trades.filter(trade => trade.user === address);
  console.log('📋 HISTORY: User trades:', userTrades);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40"
      >
        <Clock className="w-4 h-4 mr-2" />
        History ({userTrades.length}/{trades.length})
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-slate-900/95 border border-slate-700 rounded-lg p-4 text-sm text-white max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-slate-100">Transaction History</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">
          ×
        </button>
      </div>
      
      {userTrades.length === 0 ? (
        <p className="text-slate-400">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {userTrades.slice().reverse().map((trade) => (
            <div key={trade.id} className="bg-slate-800/50 rounded p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {trade.side === 'yes' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={trade.side === 'yes' ? 'text-green-400' : 'text-red-400'}>
                    {trade.side.toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-300">{trade.amount} tBUSD</span>
              </div>
              
              <div className="text-xs text-slate-400 mb-2">
                Bought {trade.amount} tBUSD worth of {trade.side.toUpperCase()} shares
              </div>
              <div className="text-xs text-slate-500">
                Market #{trade.marketId} • {new Date(trade.timestamp).toLocaleString()}
              </div>
              
              {trade.txHash && (
                <button
                  onClick={() => window.open(`https://testnet.bsctrace.com/tx/${trade.txHash}`, '_blank')}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Transaction
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}