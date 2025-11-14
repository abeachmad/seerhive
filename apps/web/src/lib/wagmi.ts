import { createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

export const config = createConfig({
  chains: [bscTestnet],
  connectors: [
    injected({ target: 'metaMask' }),
    ...(walletConnectProjectId
      ? [
          walletConnect({
            projectId: walletConnectProjectId,
            metadata: {
              name: 'SeerHive',
              description: 'AI-assisted prediction markets on BNB Chain',
              url: typeof window !== 'undefined' ? window.location.origin : 'https://seerhive.app',
              icons: ['https://seerhive.app/favicon.ico'],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://bsc-testnet.publicnode.com'),
  },
});