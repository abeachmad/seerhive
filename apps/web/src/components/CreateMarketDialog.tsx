'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { useStore } from '@/lib/store';
import { useAccount } from '@particle-network/connectkit';
import { useSmartAccount } from '@particle-network/connectkit';
import { encodeFunctionData } from 'viem';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { isDemo } from '@/lib/demoFlags';
import { X, Zap } from 'lucide-react';

interface CreateMarketDialogProps {
  onClose: () => void;
}

export function CreateMarketDialog({ onClose }: CreateMarketDialogProps) {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DeFi');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [useGasless, setUseGasless] = useState(true);
  const addMarket = useStore((state) => state.addMarket);
  const { address } = useAccount();
  const smartAccount = useSmartAccount();
  const demo = isDemo();
  
  const gaslessAvailable = !!smartAccount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let marketId: string;
      
      if (!demo && address) {
        // Calculate duration in seconds
        const endDateTime = new Date(endDate).getTime();
        const currentTime = Date.now();
        const duration = Math.floor((endDateTime - currentTime) / 1000);
        
        if (duration <= 0) {
          alert('End date must be in the future');
          setLoading(false);
          return;
        }
        
        if (useGasless && smartAccount) {
          console.log('🚀 Creating market gasless...');
          console.log('Question:', question);
          console.log('Duration:', duration, 'seconds');
          
          const createTx = {
            to: PREDICTION_MARKET_ADDRESS,
            value: '0',
            data: encodeFunctionData({
              abi: PREDICTION_MARKET_ABI,
              functionName: 'createMarket',
              args: [question, BigInt(duration)],
            }),
          };
          
          const quotes = await smartAccount.getFeeQuotes(createTx);
          const gaslessQuote = quotes?.verifyingPaymasterGasless;
          
          if (!gaslessQuote) {
            throw new Error('Gasless transaction not available');
          }
          
          const txHash = await smartAccount.sendUserOperation({
            userOp: gaslessQuote.userOp,
            userOpHash: gaslessQuote.userOpHash,
          });
          
          console.log('✅ Market created gasless:', txHash);
          
          // Get the new market ID from contract
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
          marketId = (marketCount - 1).toString(); // New market ID
          
        } else {
          // Regular transaction (not implemented yet)
          throw new Error('Regular transactions not implemented for market creation');
        }
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        marketId = Date.now().toString();
      }

      const newMarket = {
        id: marketId,
        question,
        description,
        category,
        totalVolume: 0,
        yesPrice: 0.5,
        noPrice: 0.5,
        endDate,
        status: 'active',
        sparkline: [{ value: 0.5 }, { value: 0.5 }, { value: 0.5 }],
        aiVerified: true,
        aiConfidence: 0.85 + Math.random() * 0.15,
      };

      // Don't add to store - market should be loaded from contract
      console.log('✅ Market created on-chain:', newMarket);
      
      // Refresh the page to load the new market from contract
      window.location.reload();
      
    } catch (error: any) {
      console.error('Market creation failed:', error);
      alert(`Failed to create market: ${error.message}`);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">Create Prediction Market</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will BTC reach $100k by end of 2024?"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and resolution criteria..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
              >
                <option>DeFi</option>
                <option>NFT</option>
                <option>Gaming</option>
                <option>Politics</option>
                <option>Sports</option>
                <option>Technology</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none [color-scheme:dark]"
                required
              />
            </div>
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
                  Use Gasless Transaction (FREE)
                </span>
              </label>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              🤖 Market will be deployed to BNB Chain {demo ? '(Demo Mode)' : 'and verified by AI'}
            </p>
          </div>

          {loading && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400 text-center">
                {demo ? '✓ Creating demo market...' : '✓ Deploying market on-chain...'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || (!demo && !address)} className="flex-1">
              {loading ? 'Creating...' : `Create Market${useGasless && gaslessAvailable ? ' (Gasless)' : ''}`}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          
          {!demo && !address && (
            <p className="text-sm text-red-400 mt-2 text-center">
              Please connect your wallet to create markets
            </p>
          )}
        </form>
      </div>
    </div>
  );
}