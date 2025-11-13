'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { useStore } from '@/lib/store';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeDialogProps {
  market: any;
  onClose: () => void;
}

export function TradeDialog({ market, onClose }: TradeDialogProps) {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { addTrade, updateMarket } = useStore();

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const trade = {
      id: Date.now().toString(),
      marketId: market.id,
      amount: parseFloat(amount),
      side,
      timestamp: new Date().toISOString(),
    };

    addTrade(trade);

    // Update market prices
    const newVolume = market.totalVolume + parseFloat(amount);
    const priceChange = parseFloat(amount) / (newVolume || 1) * 0.1;
    
    updateMarket(market.id, {
      totalVolume: newVolume,
      yesPrice: side === 'yes' 
        ? Math.min(0.99, market.yesPrice + priceChange)
        : Math.max(0.01, market.yesPrice - priceChange),
      noPrice: side === 'no'
        ? Math.min(0.99, market.noPrice + priceChange)
        : Math.max(0.01, market.noPrice - priceChange),
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-100">Trade</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-2">Market</p>
          <p className="text-slate-100 font-medium">{market.question}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setSide('yes')}
            className={`p-4 rounded-lg border-2 transition-all ${
              side === 'yes'
                ? 'border-green-500 bg-green-500/20'
                : 'border-slate-700 bg-slate-900/50'
            }`}
          >
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-slate-400">YES</div>
            <div className="text-xl font-bold text-green-400">
              {(market.yesPrice * 100).toFixed(0)}%
            </div>
          </button>

          <button
            onClick={() => setSide('no')}
            className={`p-4 rounded-lg border-2 transition-all ${
              side === 'no'
                ? 'border-red-500 bg-red-500/20'
                : 'border-slate-700 bg-slate-900/50'
            }`}
          >
            <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-sm text-slate-400">NO</div>
            <div className="text-xl font-bold text-red-400">
              {(market.noPrice * 100).toFixed(0)}%
            </div>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            min="1"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
          />
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-3 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">You pay</span>
              <span className="text-slate-100 font-medium">${amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Potential return</span>
              <span className="text-green-400 font-medium">
                ${(parseFloat(amount) / (side === 'yes' ? market.yesPrice : market.noPrice)).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={handleTrade} 
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="flex-1"
          >
            {loading ? 'Processing...' : `Buy ${side.toUpperCase()}`}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}