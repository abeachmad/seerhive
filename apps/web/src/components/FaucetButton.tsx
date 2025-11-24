'use client';

import { useState } from 'react';

export function FaucetButton() {
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const claimBUSD = async () => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setMessage('❌ Invalid address');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/faucet/busd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Sent 100 tBUSD! TX: ${data.txHash}`);
        setAddress('');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-[300px]">
      <input
        type="text"
        placeholder="Paste your wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-yellow-500"
      />
      <button
        onClick={claimBUSD}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 disabled:opacity-50 text-sm font-medium transition-colors"
      >
        {loading ? 'Sending...' : '💰 Get 100 tBUSD'}
      </button>
      {message && (
        <p className="text-sm text-slate-400">{message}</p>
      )}
    </div>
  );
}
