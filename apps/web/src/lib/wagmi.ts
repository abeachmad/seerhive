import { createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [bscTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://bsc-testnet.publicnode.com'),
  },
});