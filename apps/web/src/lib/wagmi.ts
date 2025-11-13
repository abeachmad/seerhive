import { createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [bscTestnet],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo',
    }),
    injected(),
  ],
  transports: {
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://bsc-testnet.publicnode.com'),
  },
});