'use client';
import { useAccount } from '@particle-network/connectkit';
import { useSmartAccount } from '@particle-network/connectkit';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function WalletDebug() {
  const { address, isConnected } = useAccount();
  const smartAccount = useSmartAccount();
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (smartAccount) {
      smartAccount.getAddress().then(setSmartAccountAddress).catch(console.error);
    }
  }, [smartAccount]);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-700 rounded-lg text-sm text-white max-w-md">
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
          <h3 className="font-bold text-red-400">🔍 Wallet Debug</h3>
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {!isMinimized && (
          <div className="px-4 pb-4">
            <p>❌ No wallet connected</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white max-w-md">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <h3 className="font-bold text-green-400">🔍 Wallet Debug</h3>
        {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      {!isMinimized && (
        <div className="px-4 pb-4 space-y-2">
        <div>
          <span className="text-slate-400">Connected:</span>
          <span className="text-green-400 ml-2">✅ {isConnected ? 'Yes' : 'No'}</span>
        </div>
        <div>
          <span className="text-slate-400">EOA Address:</span>
          <div className="text-blue-300 font-mono text-xs break-all mt-1">
            {address || 'Not available'}
          </div>
        </div>
          <div>
            <span className="text-slate-400">Smart Account:</span>
            <div className="text-purple-300 font-mono text-xs break-all mt-1">
              {smartAccountAddress || 'Not available'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}