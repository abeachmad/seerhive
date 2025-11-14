'use client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useStore } from '@/lib/store';
import { useAccount, useWallets } from '@particle-network/connectkit';
import { useSmartAccount } from '@particle-network/connectkit';
import { parseEther, encodeFunctionData } from 'viem';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { isDemo } from '@/lib/demoFlags';
import { X, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface TradeDialogProps {
  market: any;
  onClose: () => void;
}

export function TradeDialog({ market, onClose }: TradeDialogProps) {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [useGasless, setUseGasless] = useState(false);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const { addTrade, updateMarket, updateUserReputation } = useStore();
  const { address } = useAccount();
  const smartAccount = useSmartAccount();
  const [primaryWallet] = useWallets();
  const demo = isDemo();

  const gaslessAvailable = !!smartAccount;

  useEffect(() => {
    if (smartAccount) {
      smartAccount.getAddress().then(setSmartAccountAddress).catch(console.error);
    }
  }, [smartAccount]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);

    if (!demo && address) {
      try {
        if (useGasless && gaslessAvailable && smartAccount) {
          const tx = {
            to: PREDICTION_MARKET_ADDRESS,
            value: parseEther(amount).toString(),
            data: encodeFunctionData({
              abi: PREDICTION_MARKET_ABI,
              functionName: 'buyShares',
              args: [BigInt(market.id), side === 'yes'],
            }),
          };

          const feeQuotes = await smartAccount.getFeeQuotes(tx);
          const gaslessQuote = feeQuotes?.verifyingPaymasterGasless;
          
          if (!gaslessQuote) {
            throw new Error('Gasless transaction not available');
          }

          const hash = await smartAccount.sendUserOperation({
            userOp: gaslessQuote.userOp,
            userOpHash: gaslessQuote.userOpHash,
          });
          
          console.log('Gasless tx:', hash);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          // Regular transaction with gas via wallet client
          const walletClient = primaryWallet.getWalletClient();
          const txHash = await walletClient.sendTransaction({
            to: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            value: parseEther(amount),
            data: encodeFunctionData({
              abi: PREDICTION_MARKET_ABI,
              functionName: 'buyShares',
              args: [BigInt(market.id), side === 'yes'],
            }),
            chain: { id: 97 },
            account: address as `0x${string}`,
          });
          console.log('Regular tx:', txHash);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.error('Trade failed:', error);
        alert(`Transaction failed: ${error.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
    } else {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const trade = {
      id: Date.now().toString(),
      marketId: market.id,
      amount: parseFloat(amount),
      side,
      timestamp: new Date().toISOString(),
      user: address || 'demo-user',
      prediction: side === 'yes' ? market.yesPrice : market.noPrice,
    };

    addTrade(trade);
    
    if (address) {
      updateUserReputation(address, trade);
    }

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
      sparkline: [...market.sparkline, { value: side === 'yes' ? market.yesPrice + priceChange : market.yesPrice - priceChange }].slice(-10),
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
            Amount ({demo ? 'USD' : 'BNB'})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={demo ? "100" : "0.1"}
            min="0.01"
            step="0.01"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
          />
        </div>

        {gaslessAvailable && !demo && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useGasless}
                onChange={(e) => setUseGasless(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-300">
                <Zap className="w-4 h-4 inline text-yellow-400 mr-1" />
                Use Gasless Transaction
              </span>
            </label>
            {useGasless && smartAccountAddress && (
              <div className="mt-2 ml-6 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs">
                <p className="text-green-400 font-medium">⚡ Gasless - Sponsored by Particle Paymaster</p>
              </div>
            )}
          </div>
        )}

        {amount && parseFloat(amount) > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-3 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">You pay</span>
              <span className="text-slate-100 font-medium">{amount} {demo ? 'USD' : 'BNB'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Potential return</span>
              <span className="text-green-400 font-medium">
                {(parseFloat(amount) / (side === 'yes' ? market.yesPrice : market.noPrice)).toFixed(2)} {demo ? 'USD' : 'BNB'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gas fee</span>
              <span className={useGasless && gaslessAvailable ? 'text-green-400' : 'text-slate-300'}>
                {useGasless && gaslessAvailable ? 'FREE ⚡' : '~0.001 BNB'}
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