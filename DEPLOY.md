# Deployment Guide

## Prerequisites

1. **BNB Testnet tBNB** - Get from faucet: https://testnet.bnbchain.org/faucet-smart
2. **Private Key** - Export from MetaMask
3. **Vercel Account** (optional for frontend)

## Step 1: Deploy Smart Contract to BNB Testnet

```bash
cd /home/abeachmad/seerhive

# Create .env file
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
RPC_URL_BSC_TESTNET=https://bsc-testnet.publicnode.com
EOF

# Deploy contract
pnpm deploy:testnet
```

Expected output:
```
Deploying PredictionMarket...
PredictionMarket deployed to: 0x...
```

## Step 2: Update Frontend Config

Copy the deployed contract address and update:

```bash
# Update apps/web/.env.local
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_DEMO=0
NEXT_PUBLIC_CHAIN=bscTestnet
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
EOF
```

## Step 3: Test Locally

```bash
# Start dev server
pnpm dev

# Open http://localhost:3000
# Connect wallet (MetaMask on BNB Testnet)
# Create market and trade
```

## Step 4: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

Or use Vercel GitHub integration:
1. Push to GitHub
2. Import project on vercel.com
3. Set environment variables
4. Deploy

## Environment Variables for Vercel

```
NEXT_PUBLIC_DEMO=0
NEXT_PUBLIC_CHAIN=bscTestnet
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
```

## Verify Contract on BSCScan

```bash
cd contracts
npx hardhat verify --network bscTestnet YOUR_CONTRACT_ADDRESS
```

## Testing Checklist

- [ ] Contract deployed successfully
- [ ] Frontend connects to BNB Testnet
- [ ] Can create market on-chain
- [ ] Can buy YES/NO shares
- [ ] Can propose resolution
- [ ] Can challenge resolution
- [ ] Reputation tracking works

## Troubleshooting

**"Insufficient funds"**
- Get tBNB from faucet: https://testnet.bnbchain.org/faucet-smart

**"Network mismatch"**
- Switch MetaMask to BNB Testnet (Chain ID: 97)

**"Contract not deployed"**
- Check PRIVATE_KEY has tBNB balance
- Verify RPC_URL is correct

## Production Deployment (Mainnet)

⚠️ **DO NOT deploy to mainnet without:**
1. Full security audit
2. Comprehensive testing
3. Bug bounty program
4. Insurance fund
5. Governance mechanism

For mainnet:
- Change network to `bsc` in hardhat.config.ts
- Update RPC to mainnet
- Use production-grade oracle
- Implement proper governance