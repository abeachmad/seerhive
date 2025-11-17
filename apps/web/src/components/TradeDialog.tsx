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
    if (!smartAccount) return;
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setQuoteLoading(true);
    try {
      const token = SUPPORTED_TOKENS[selectedToken];
      const tokenAmount = parseUnits(amount, token.decimals);
      
      // All markets are now deployed to contract
      
      console.log('=== GASLESS TRANSACTION DEBUG ===');
      console.log('Connected Wallet (EOA):', address);
      console.log('Smart Account Address:', smartAccountAddress);
      console.log('Token:', token.symbol, token.address);
      console.log('Amount:', tokenAmount.toString());
      
      // Check if we need to transfer from EOA to smart account
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
      
      console.log('Smart Account Balance:', smartBalance.toString());
      console.log('Required Amount:', tokenAmount.toString());
      console.log('Has Sufficient Balance:', smartBalance >= tokenAmount);
      
      if (smartBalance < tokenAmount && address) {
        console.log('💸 Transferring tokens from EOA to smart account...');
        const walletClient = primaryWallet.getWalletClient();
        const transferHash = await walletClient.sendTransaction({
          to: token.address as `0x${string}`,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [smartAccountAddress as `0x${string}`, tokenAmount],
          }),
          chain: bscTestnet,
          account: address as `0x${string}`,
        });
        console.log('✅ Transfer tx:', transferHash);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Step 1: Approve token (gasless)
      console.log('🔐 Approving', token.symbol, 'gasless...');
      console.log('Smart Account:', smartAccountAddress);
      console.log('Token Address:', token.address);
      console.log('Amount:', tokenAmount.toString());
      console.log('Contract Address:', PREDICTION_MARKET_ADDRESS);
      const approveTx = {
        to: token.address,
        value: '0',
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [PREDICTION_MARKET_ADDRESS as `0x${string}`, tokenAmount],
        }),
      };
      
      console.log('💰 Getting approve fee quotes...');
      const approveQuotes = await smartAccount.getFeeQuotes(approveTx);
      console.log('💰 Approve quotes received:', approveQuotes);
      const approveGasless = approveQuotes?.verifyingPaymasterGasless;
      console.log('💰 Approve gasless quote:', approveGasless);
      if (!approveGasless) throw new Error('Approve gasless not available');
      
      console.log('🚀 Sending approve transaction...');
      const approveHash = await smartAccount.sendUserOperation({
        userOp: approveGasless.userOp,
        userOpHash: approveGasless.userOpHash,
      });
      console.log('✅ Approve gasless sent:', approveHash);
      console.log('⏳ Waiting for approve confirmation...');
      
      // Wait for approve transaction to be confirmed
      let confirmed = false;
      for (let i = 0; i < 30; i++) { // Wait up to 30 seconds
        try {
          const response = await fetch('https://bsc-testnet.publicnode.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: token.address,
                data: `0xdd62ed3e000000000000000000000000${smartAccountAddress.slice(2)}000000000000000000000000${PREDICTION_MARKET_ADDRESS.slice(2)}`
              }, 'latest'],
              id: 1
            })
          });
          const result = await response.json();
          const allowance = BigInt(result.result || '0x0');
          
          if (allowance >= tokenAmount) {
            console.log('✅ Approve confirmed, allowance:', allowance.toString());
            confirmed = true;
            break;
          }
        } catch (error) {
          console.log('Checking allowance...', i);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (!confirmed) {
        throw new Error('Approve transaction not confirmed within 30 seconds');
      }
      
      // Step 2: Buy shares (gasless) - Wait longer to avoid nonce conflicts
      console.log('💰 Buying shares gasless...');
      console.log('⏳ Waiting extra time to avoid nonce conflicts...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 more seconds
      
      const buyTx = {
        to: PREDICTION_MARKET_ADDRESS,
        value: '0',
        data: encodeFunctionData({
          abi: PREDICTION_MARKET_ABI,
          functionName: 'buyShares',
          args: [BigInt(market.id), side === 'yes', token.address, tokenAmount],
        }),
      };
      
      console.log('💰 Getting buy fee quotes...');
      const buyQuotes = await smartAccount.getFeeQuotes(buyTx);
      console.log('💰 Buy quotes received:', buyQuotes);
      const buyGasless = buyQuotes?.verifyingPaymasterGasless;
      console.log('💰 Buy gasless quote:', buyGasless);
      if (!buyGasless) throw new Error('Buy gasless not available');
      
      console.log('🔄 Sending gasless transaction...');
      console.log('UserOp nonce:', buyGasless.userOp.nonce);
      console.log('UserOpHash:', buyGasless.userOpHash);
      
      const userOpResult = await smartAccount.sendUserOperation({
        userOp: buyGasless.userOp,
        userOpHash: buyGasless.userOpHash,
      });
      
      console.log('✅ UserOp sent, result:', userOpResult);
      
      // Use the actual transaction hash from the result
      const txHash = userOpResult;
      console.log('💾 Setting txHash:', txHash);
      setFeeQuote({ txHash });
      console.log('💾 FeeQuote set:', { txHash });
      
      // Create and add trade immediately after gasless transaction
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
      
      console.log('📝 Adding gasless trade:', trade);
      addTrade(trade);
      
      // Show notification
      console.log('🔔 Showing tx notification:', txHash);
      setShowTxNotification(txHash);
      
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
      
      // Close dialog after successful transaction
      setTimeout(() => {
        onClose();
      }, 5000); // Give user more time to see notification
    } catch (error: any) {
      console.error('Gasless failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
        full: JSON.stringify(error, null, 2)
      });
      
      const token = SUPPORTED_TOKENS[selectedToken];
      let errorMessage = 'Unknown error';
      if (error.message?.includes('transfer amount exceeds balance')) {
        errorMessage = `Insufficient ${token.symbol} balance. You need ${amount} ${token.symbol} but don't have enough tokens.`;
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Transaction failed - check token balance and allowance';
      } else if (error.message?.includes('Market ended')) {
        errorMessage = 'Market has ended or does not exist';
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Transaction failed - check console for details';
      }
      
      alert(`Failed: ${errorMessage}`);
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