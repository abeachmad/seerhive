'use client';

import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import { aa } from '@particle-network/connectkit/aa';
import { bscTestnet } from '@particle-network/connectkit/chains';
import React from 'react';

const projectId = process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!;
const clientKey = process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!;
const appId = process.env.NEXT_PUBLIC_PARTICLE_APP_ID!;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId || !clientKey || !appId) {
  throw new Error('Missing Particle credentials. Check .env.local');
}

const config = createConfig({
  projectId,
  clientKey,
  appId,
  appearance: {
    recommendedWallets: [
      { walletId: 'metaMask', label: 'Recommended' },
      { walletId: 'coinbaseWallet', label: 'Popular' },
    ],
    language: 'en-US',
    mode: 'dark',
  },
  walletConnectors: [
    evmWalletConnectors({
      metadata: {
        name: 'SeerHive',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
        description: 'AI-assisted prediction markets on BNB Chain',
        url: typeof window !== 'undefined' ? window.location.origin : '',
      },
      walletConnectProjectId: walletConnectProjectId as string,
    }),
    authWalletConnectors({
      authTypes: ['email', 'google', 'twitter', 'github', 'apple'],
      fiatCoin: 'USD',
      promptSettingConfig: {
        promptMasterPasswordSettingWhenLogin: 1,
        promptPaymentPasswordSettingWhenSign: 1,
      },
    }),
  ],
  plugins: [
    wallet({
      visible: true,
      entryPosition: EntryPosition.BR,
    }),
    aa({
      name: 'SIMPLE',
      version: '2.0.0',
    }),
  ],
  chains: [bscTestnet],
});

export const ParticleConnectKit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
