# SeerHive - DoraHacks Build Submission

## Project Overview

SeerHive is a decentralized social prediction market platform on BNB Chain that combines AI-assisted oracles with copy trading features. Users can create and trade on prediction markets, follow successful predictors, and participate in platform governance.

## Problem Solved

Traditional prediction markets suffer from slow resolution times and lack social features. SeerHive addresses this by providing AI-assisted fast resolution and enabling users to follow top performers, creating a more engaging and efficient prediction market experience.

## Key Features

- **AI-Assisted Oracle**: Automated market resolution with confidence scoring
- **Copy Trading**: Follow and replicate strategies of top performers  
- **Social Prediction**: Community-driven market creation and participation
- **Governance**: Decentralized decision-making for platform parameters
- **Real-time Analytics**: Comprehensive dashboards with interactive charts

## Technical Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Charts**: Recharts for data visualization
- **State Management**: Zustand
- **Web3**: wagmi, viem, WalletConnect
- **Smart Contracts**: Hardhat, Solidity 0.8.20, OpenZeppelin
- **Monorepo**: Turborepo with pnpm workspaces

## BNB Chain Integration

Deployed on BNB Testnet (Chapel) with:
- Chain ID: 97
- RPC: https://bsc-testnet.publicnode.com
- Optimized gas usage
- Web3Modal wallet connectivity
- Smart contracts using OpenZeppelin standards

## How to Run

### Prerequisites
- Node.js >= 20
- pnpm >= 8

### Installation
```bash
git clone https://github.com/abeachmad/seerhive.git
cd seerhive
pnpm install
```

### Development
```bash
# Start web app (port 3000)
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build
```

### Deploy to BNB Testnet
```bash
# Add private key to .env
echo "PRIVATE_KEY=your_key" >> .env

# Deploy contracts
pnpm deploy:testnet
```

## Demo Mode

By default, runs in DEMO mode with mock data. Set `NEXT_PUBLIC_DEMO=0` in `.env.local` to connect to blockchain.

## Demo Link

- Repository: https://github.com/abeachmad/seerhive
- Live Demo: TBD (deploy to Vercel)

## Team

Solo developer: @abeachmad

## Acknowledgments

Inspired by:
- **Verisight** - UI patterns, demo flags, and chart implementations
- **ZeroToll** - Routing and aggregator architecture concepts

## Changelog - Wave 1

### v0.0.0 - Initial MVP Release

**Added:**
- Turborepo monorepo structure with pnpm workspaces
- Next.js 14 web application with App Router
- Prediction markets UI with sparklines and delta chips
- Copy trading interface for following top predictors
- Governance voting system with proposal management
- Dashboard with analytics charts using Recharts
- Demo mode with comprehensive mock fixtures
- BNB Testnet integration with wagmi/viem
- WalletConnect support for wallet connectivity
- PredictionMarket.sol smart contract with:
  - Market creation functionality
  - Share buying mechanism
  - Owner-controlled market resolution
  - Payout claiming for winners
- Unit tests for smart contracts (create, buy, resolve flows)
- Mock AI oracle API endpoint for automated resolution
- Comprehensive documentation (README, setup guide)
- GitHub Actions CI workflow for automated testing
- ESLint and Prettier configuration
- TypeScript throughout the stack

**Technical Highlights:**
- Implemented forceMount + hidden pattern for Recharts tab rendering
- Created reusable chart wrappers (SparklineMini, SimpleLineChart, SimpleBarChart, SimplePieChart)
- Configured BNB Testnet with proper chain parameters
- Set up deployment scripts for testnet deployment
- Established clean git workflow with logical commits

**Future Roadmap:**
- Integrate real AI oracle service
- Add more market types (scalar, categorical)
- Implement reputation system for traders
- Add liquidity pools for market making
- Deploy to mainnet
- Mobile app development