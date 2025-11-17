'use client';
import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface TransactionNotificationProps {
  txHash: string;
  onClose: () => void;
}

export function TransactionNotification({ txHash, onClose }: TransactionNotificationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      onClose();
    }, 15000); // Auto close after 15 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 left-4 bg-green-900/90 border border-green-700 rounded-lg p-4 text-sm text-white max-w-md z-50 animate-in slide-in-from-left-2">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-green-400">✅ Transaction Successful</h3>
        <button onClick={onClose} className="text-green-400 hover:text-green-200">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-green-300">Your transaction has been confirmed on the blockchain.</p>
        <div>
          <span className="text-slate-400">Hash:</span>
          <div className="text-green-300 font-mono text-xs break-all mt-1">
            {txHash}
          </div>
        </div>
        <button
          onClick={() => window.open(`https://testnet.bsctrace.com/tx/${txHash}`, '_blank')}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-3 py-2 rounded text-sm transition-colors w-full justify-center"
        >
          <ExternalLink className="w-4 h-4" />
          View on Explorer
        </button>
      </div>
    </div>
  );
}