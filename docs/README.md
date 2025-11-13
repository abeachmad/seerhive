# SeerHive - Social Prediction Markets

AI-assisted prediction markets on BNB Chain with copy trading and governance features.

## Features

- 🎯 Prediction Markets with AI-assisted oracle
- 📊 Real-time analytics and charts
- 👥 Copy Trading - Follow top predictors
- 🗳️ Decentralized Governance
- 🔗 BNB Testnet Integration
- 🎨 Modern UI with Tailwind & shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Charts**: Recharts
- **State**: Zustand
- **Web3**: wagmi, viem, Web3Modal
- **Smart Contracts**: Hardhat, Solidity, OpenZeppelin
- **Monorepo**: Turborepo, pnpm

## Setup (WSL Ubuntu 24.04)

### Prerequisites

- Node.js >= 20
- pnpm >= 8
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/abeachmad/seerhive.git
cd seerhive

# Install dependencies
pnpm install

# Copy environment file
cp apps/web/.env.example apps/web/.env.local

# Edit .env.local and add your WalletConnect Project ID
# Get one at: https://cloud.walletconnect.com
```

### Development

```bash
# Start development server (web app on port 3000)
pnpm dev

# Start local Hardhat node (port 8545)
pnpm chain

# Run tests
pnpm test

# Build all packages
pnpm build

# Lint
pnpm lint
```

### Deploy to BNB Testnet

```bash
# Add PRIVATE_KEY to .env file
echo "PRIVATE_KEY=your_private_key_here" >> .env

# Deploy contracts
pnpm deploy:testnet
```

## Project Structure

```
seerhive/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   ├── app/      # App router pages
│       │   ├── components/
│       │   ├── lib/
│       │   └── mocks/    # Demo fixtures
├── contracts/            # Hardhat contracts
│   ├── contracts/
│   ├── scripts/
│   └── test/
├── packages/
│   ├── config/          # Shared configs
│   └── ui/              # Shared components
└── docs/
```

## Demo Mode

By default, the app runs in DEMO mode with mock data. To disable:

```bash
# In apps/web/.env.local
NEXT_PUBLIC_DEMO=0
```

## Available Pages

- `/` - Homepage
- `/dashboard` - Analytics dashboard with charts
- `/markets` - Prediction markets
- `/events` - Event listings
- `/copytrading` - Follow top traders
- `/governance` - DAO proposals

## Smart Contracts

### PredictionMarket.sol

Main contract for creating and managing prediction markets.

**Functions:**
- `createMarket(question, duration)` - Create new market
- `buyShares(marketId, isYes)` - Buy YES/NO shares
- `resolveMarket(marketId, outcome)` - Resolve market (owner only)
- `claimPayout(marketId)` - Claim winnings

## API Endpoints

### POST /api/oracle/resolve

Mock AI oracle for market resolution.

**Request:**
```json
{
  "marketId": "1",
  "evidenceUrl": "https://..."
}
```

**Response:**
```json
{
  "marketId": "1",
  "outcome": "YES",
  "confidence": "0.87",
  "resolvedAt": "2024-01-15T10:30:00Z"
}
```

## License

MIT