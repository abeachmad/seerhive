'use client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useStore } from '@/lib/store';
import { useAccount, useWallets } from '@particle-network/connectkit';
import { useSmartAccount } from '@particle-network/connectkit';
import { parseEther, parseUnits, encodeFunctionData } from 'viem';
import { bscTestnet } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from '@/lib/contracts';
import { SUPPORTED_TOKENS, ERC20_ABI } from '@/lib/tokens';
import { isDemo } from '@/lib/demoFlags';
import { GaslessService } from '@/lib/gasless';
import { X, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { TransactionNotification } from './TransactionNotification';

interface TradeDialogProps {
  market: any;
  onClose: () => void;
}

export function TradeDialog({ market, onClose }: TradeDialogProps) {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [useGasless, setUseGasless] = useState(false);
  const [selectedToken, setSelectedToken] = useState<keyof typeof SUPPORTED_TOKENS>('tBUSD');
  
  // Reset quote when switching modes and refresh balance
  useEffect(() => {
    setFeeQuote(null);
  }, [useGasless]);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [feeQuote, setFeeQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [showTxNotification, setShowTxNotification] = useState<string | null>(null);
  const { addTrade, updateMarket, updateUserReputation } = useStore();
  const { address, isConnected } = useAccount();
  const smartAccount = useSmartAccount();
  const [primaryWallet] = useWallets();
  const demo = isDemo();
  
  // Debug wallet connection
  useEffect(() => {
    console.log('=== WALLET CONNECTION DEBUG ===');
    console.log('Is Connected:', isConnected);
    console.log('EOA Address:', address);
    console.log('Smart Account Available:', !!smartAccount);
    console.log('Primary Wallet Available:', !!primaryWallet);
    console.log('Demo Mode:', demo);
    console.log('=== END WALLET DEBUG ===');
  }, [address, isConnected, smartAccount, primaryWallet, demo]);

  const gaslessAvailable = !!smartAccount;

  useEffect(() => {
    if (smartAccount) {
      smartAccount.getAddress().then(setSmartAccountAddress).catch(console.error);
    }
  }, [smartAccount]);

  // Check token balance (both EOA and smart account)
  useEffect(() => {
    if (demo) {
      setTokenBalance('1000.0000'); // Demo balance
      return;
    }
    
    if (!smartAccountAddress || !smartAccount) {
      console.log('⏳ Waiting for smart account...');
      setTokenBalance('0');
      return;
    }
    
    const checkBalance = async () => {
      try {
        const token = SUPPORTED_TOKENS[selectedToken];
        console.log('=== BALANCE CHECK DEBUG ===');
        console.log('EOA Address:', address);
        console.log('Smart Account Address:', smartAccountAddress);
        console.log('Token Contract:', token.address, token.symbol);
        console.log('Smart Account Available:', !!smartAccount);
        
        // Direct RPC call to check balance
        const response = await fetch('https://bsc-testnet.publicnode.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: token.address,
              data: `0x70a08231000000000000000000000000${smartAccountAddress.slice(2)}`
            }, 'latest'],
            id: 1
          })
        });
        const result = await response.json();
        const smartBalance = BigInt(result.result || '0x0');
        
        console.log('Smart Account Raw Balance:', smartBalance.toString());
        
        const formatted = (Number(smartBalance) / Math.pow(10, token.decimals)).toFixed(4);
        console.log('Smart Account Formatted Balance:', formatted, token.symbol);
        console.log('=== END DEBUG ===');
        
        setTokenBalance(formatted);
      } catch (error: any) {
        console.error('❌ Balance check failed:', error);
        console.error('Error details:', error.message);
        setTokenBalance('0');
      }
    };
    
    checkBalance();
  }, [smartAccountAddress, selectedToken, demo, smartAccount]);

  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setQuoteLoading(true);
    try {
      const token = SUPPORTED_TOKENS[selectedToken];
      const tokenAmount = parseUnits(amount, token.decimals);
      
      console.log('=== GASLESS TRANSACTION ===');
      console.log('Wallet:', address);
      console.log('Has Particle Smart Account:', !!smartAccount);
      
      let txHash: string;
      
      if (smartAccount) {
        // Particle wallet - use Particle SDK (SIMPLE account auto-deploys)
        console.log('✅ Using Particle SDK (Particle Wallet)');
        
        // Approve token
        const approveTx = {
          to: token.address,
          value: '0x0',
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [PREDICTION_MARKET_ADDRESS as `0x${string}`, tokenAmount],
          }),
        };
        
        const approveQuotes = await smartAccount.getFeeQuotes(approveTx);
        const approveGasless = approveQuotes?.verifyingPaymasterGasless;
        
        if (approveGasless) {
          const approveHash = await smartAccount.sendUserOperation({
            userOp: approveGasless.userOp,
            userOpHash: approveGasless.userOpHash,
          });
          console.log('✅ Approve:', approveHash);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Buy shares
        const buyTx = {
          to: PREDICTION_MARKET_ADDRESS,
          value: '0',
          data: encodeFunctionData({
            abi: PREDICTION_MARKET_ABI,
            functionName: 'buyShares',
            args: [BigInt(market.id), side === 'yes', token.address, tokenAmount],
          }),
        };
        
        const buyQuotes = await smartAccount.getFeeQuotes(buyTx);
        const buyGasless = buyQuotes?.verifyingPaymasterGasless;
        
        if (!buyGasless) {
          throw new Error('Particle gasless not available');
        }
        
        txHash = await smartAccount.sendUserOperation({
          userOp: buyGasless.userOp,
          userOpHash: buyGasless.userOpHash,
        });
        console.log('✅ Buy (Particle SDK):', txHash);
      } else {
        // MetaMask or other wallet - use gasless service (Particle → Pimlico fallback)
        console.log('✅ Using Gasless Service (MetaMask/Other)');
        
        const gaslessService = new GaslessService({ address });
        const result = await gaslessService.buySharesGasless(
          BigInt(market.id),
          side === 'yes',
          token.address,
          tokenAmount
        );
        console.log('✅ Sponsored by:', result.provider);
        txHash = 'pending';
      }
      
      setFeeQuote({ txHash });
      setShowTxNotification(txHash);
      
      // Add trade
      const trade = {
        id: Date.now().toString(),
        marketId: market.id,
        amount: parseFloat(amount),
        side,
        timestamp: new Date().toISOString(),
        user: address,
        prediction: side === 'yes' ? market.yesPrice : market.noPrice,
        txHash,
      };
      
      addTrade(trade);
      
      // Update market
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
      
      setTimeout(() => onClose(), 3000);
    } catch (error: any) {
      console.error('Gasless failed:', error);
      alert(`Failed: ${error.message || 'Unknown error'}`);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);

    if (!demo && address) {
      try {
        if (useGasless && feeQuote) {
          // Already sent in handleGetQuote
          console.log('Gasless tx confirmed:', feeQuote.txHash);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          // Regular transaction with gas via wallet client
          const walletClient = primaryWallet.getWalletClient();
          const token = SUPPORTED_TOKENS[selectedToken];
          const tokenAmount = parseUnits(amount, token.decimals);
          const txHash = await walletClient.sendTransaction({
            to: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            value: 0n,
            data: encodeFunctionData({
              abi: PREDICTION_MARKET_ABI,
              functionName: 'buyShares',
              args: [BigInt(market.id), side === 'yes', token.address, tokenAmount],
            }),
            chain: bscTestnet,
            account: address as `0x${string}`,
          });
          console.log('Regular tx:', txHash);
          setFeeQuote({ txHash });
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

    const txHash = feeQuote?.txHash;
    
    const trade = {
      id: Date.now().toString(),
      marketId: market.id,
      amount: parseFloat(amount),
      side,
      timestamp: new Date().toISOString(),
      user: address || 'demo-user',
      prediction: side === 'yes' ? market.yesPrice : market.noPrice,
      txHash,
    };
    
    // Show transaction notification if we have a hash
    console.log('🔔 Checking for tx notification, txHash:', txHash);
    if (txHash) {
      console.log('🔔 Setting tx notification:', txHash);
      setShowTxNotification(txHash);
    } else {
      console.log('❌ No txHash found, notification not shown');
    }
    
    console.log('=== TRADE RECORD DEBUG ===');
    console.log('Trade object:', trade);
    console.log('Trade User Address:', trade.user);
    console.log('Connected Wallet:', address);
    console.log('Smart Account:', smartAccountAddress);
    console.log('TxHash from feeQuote:', feeQuote?.txHash);
    console.log('UseGasless:', useGasless);
    console.log('FeeQuote object:', feeQuote);
    console.log('=== END DEBUG ===');

    addTrade(trade);
    console.log('✅ Trade added to store');
    
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

        {!demo && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Payment Token
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value as keyof typeof SUPPORTED_TOKENS)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
            >
              {Object.entries(SUPPORTED_TOKENS).map(([key, token]) => (
                <option key={key} value={key}>{token.symbol}</option>
              ))}
            </select>
            {smartAccountAddress && (
              <div className="mt-2 text-sm text-slate-400">
                Balance: {tokenBalance} {SUPPORTED_TOKENS[selectedToken].symbol}
                {parseFloat(tokenBalance) === 0 && (
                  <div className="mt-1 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400">
                    ⚠️ No {SUPPORTED_TOKENS[selectedToken].symbol} tokens. Get testnet tokens from a faucet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount ({demo ? 'USD' : SUPPORTED_TOKENS[selectedToken]?.symbol || 'Token'})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={demo ? "100" : "10"}
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
                <p className="text-green-400 font-medium">⚡ Gas Fee: FREE (Sponsored by Paymaster)</p>
                <p className="text-blue-300 mt-1">Payment: {amount || '10'} {SUPPORTED_TOKENS[selectedToken].symbol}</p>
                {feeQuote && (
                  <p className="text-green-300 mt-1">✓ Transaction sent!</p>
                )}
              </div>
            )}
          </div>
        )}

        {amount && parseFloat(amount) > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-3 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">You pay</span>
              <span className="text-slate-100 font-medium">{amount} {demo ? 'USD' : SUPPORTED_TOKENS[selectedToken]?.symbol || 'Token'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Potential return</span>
              <span className="text-green-400 font-medium">
                {(parseFloat(amount) / (side === 'yes' ? market.yesPrice : market.noPrice)).toFixed(2)} {demo ? 'USD' : SUPPORTED_TOKENS[selectedToken]?.symbol || 'Token'}
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
          {useGasless && gaslessAvailable ? (
            <Button 
              onClick={handleGetQuote} 
              disabled={quoteLoading || !amount || parseFloat(amount) <= 0 || (!demo && parseFloat(tokenBalance) < parseFloat(amount || '0'))}
              className="flex-1"
            >
              {quoteLoading ? 'Sending Gasless...' : `Buy ${side.toUpperCase()} (Gasless)`}
            </Button>
          ) : (
            <Button 
              onClick={handleTrade} 
              disabled={loading || !amount || parseFloat(amount) <= 0 || (!demo && parseFloat(tokenBalance) < parseFloat(amount || '0'))}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Buy ${side.toUpperCase()}`}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>


      </div>
      
      {showTxNotification && (
        <TransactionNotification
          txHash={showTxNotification}
          onClose={() => setShowTxNotification(null)}
        />
      )}
    </div>
  );
}