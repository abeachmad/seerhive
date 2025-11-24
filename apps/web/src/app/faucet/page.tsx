'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BUSD_ADDRESS = '0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814';

export default function Faucet() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const claimBUSD = async () => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setMessage('❌ Invalid wallet address');
      return;
    }

    setLoading(true);
    setMessage('⏳ Sending 30 BUSD...');

    try {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Successfully sent 30 BUSD to ${address.slice(0, 6)}...${address.slice(-4)}`);
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
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">BUSD Faucet</h1>
          <p className="text-slate-400">Get 30 tBUSD for testing on BNB Testnet</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Test BUSD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <Button
              onClick={claimBUSD}
              disabled={loading || !address}
              className="w-full"
              size="lg"
            >
              {loading ? 'Claiming...' : '💰 Get 30 tBUSD'}
            </Button>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') ? 'bg-green-500/10 border border-green-500/30' :
                message.includes('⏳') ? 'bg-blue-500/10 border border-blue-500/30' :
                'bg-red-500/10 border border-red-500/30'
              }`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="bg-slate-800 rounded-lg p-4 space-y-2 text-sm text-slate-400">
              <p>
                📋 <strong>Token:</strong> tBUSD (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(BUSD_ADDRESS);
                    setMessage('✅ Address copied!');
                    setTimeout(() => setMessage(''), 2000);
                  }}
                  className="text-green-400 hover:text-green-300 underline cursor-pointer"
                >
                  {BUSD_ADDRESS}
                </button>
                )
              </p>
              <p>⏰ <strong>Limit:</strong> 30 BUSD per address every 24 hours</p>
              <p>🔗 <strong>Network:</strong> BNB Testnet (Chain ID: 97)</p>
              <p>💡 <strong>Free:</strong> No wallet connection or gas fees required</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
