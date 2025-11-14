'use client';

import { useConnect as useWagmiConnect } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

export function WalletModal() {
  const [open, setOpen] = useState(false);
  const { connectors, connect } = useWagmiConnect();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-wallet-modal', handleOpen);
    return () => window.removeEventListener('open-wallet-modal', handleOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              onClick={() => {
                connect({ connector });
                setOpen(false);
              }}
              className="w-full justify-start"
              variant="outline"
            >
              {connector.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
