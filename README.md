# SeerHive - Social Prediction Markets

AI-assisted prediction markets on BNB Chain with gasless transactions, copy trading, and governance.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/abeachmad/seerhive.git
cd seerhive
pnpm install

# Configure environment
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your keys

# Start development
pnpm dev
```

Then open http://localhost:3000

## 📋 Available Scripts

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint code

# Testing
./scripts/test-sponsor.sh   # Test paymaster API
./scripts/smoke-gasless.sh  # Test gasless flow

# Contracts
cd contracts
pnpm test             # Test smart contracts
pnpm deploy:testnet   # Deploy to BNB Testnet
```

## ⚡ Gasless Transactions (ERC-4337)

SeerHive implements Account Abstraction with **Particle Network** as primary paymaster and **Pimlico** as fallback.

### Architecture

```
Frontend (wagmi/viem)
  ↓ POST /api/aa/sponsor
Next.js API Route
  ↓ Try Particle first
Particle Paymaster ✅
  ↓ On failure (rate limit/rejection)
Pimlico Paymaster (fallback) ✅
```

### Key Features

- **Server-side only**: All paymaster keys secured in Next.js API routes
- **Automatic fallback**: Particle → Pimlico on rejection/rate-limit
- **Zero frontend exposure**: No credentials in browser/client code
- **Configurable**: EntryPoint and ChainID via environment variables

### How It Works

1. Frontend calls `gaslessService.buySharesGasless()` or `createMarketGasless()`
2. Service constructs UserOperation and sends to `/api/aa/sponsor`
3. Backend tries Particle paymaster with auth headers
4. On failure, automatically falls back to Pimlico
5. Returns `paymasterAndData` + gas limits to frontend
6. Frontend submits sponsored transaction to bundler

### Testing

```bash
# Test paymaster API endpoint
./scripts/test-sponsor.sh

# Full gasless transaction flow
./scripts/smoke-gasless.sh
```

## 🧪 Testing

**Demo Mode (No Wallet Required):**
```bash
# Set NEXT_PUBLIC_DEMO=1 in .env.local
pnpm dev
# Visit http://localhost:3000
# All features work with mock data
```

**On-Chain Mode (BNB Testnet):**
```bash
# Set NEXT_PUBLIC_DEMO=0 in .env.local
# Configure paymaster keys
pnpm dev
# Connect wallet and test gasless transactions
```

**Smart Contracts:**
```bash
cd contracts
pnpm test
pnpm deploy:testnet
```

## 📁 Project Structure

```
seerhive/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/            # Pages and API routes
│       │   │   └── api/aa/sponsor/  # Paymaster API
│       │   ├── components/     # React components
│       │   ├── lib/            # Utilities
│       │   │   ├── gasless.ts  # Gasless service
│       │   │   ├── contracts.ts # Contract ABI
│       │   │   └── paymaster/  # Paymaster adapters
│       │   └── mocks/          # Demo data
│       └── .env.local          # Environment config
├── contracts/                  # Smart contracts
│   ├── contracts/
│   │   └── PredictionMarket.sol
│   ├── scripts/deploy.ts
│   └── test/
├── scripts/                    # Test scripts
│   ├── test-sponsor.sh
│   └── smoke-gasless.sh
└── docs/                       # Documentation
```

## 📚 Documentation

- [Build Submission](docs/BUILD_SUBMISSION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Build Log](LOG_SEERHIVE.md)

## 🔧 Environment Configuration

Copy `apps/web/.env.example` to `apps/web/.env.local` and configure:

### Required Variables

```bash
# Mode
NEXT_PUBLIC_DEMO=0                    # 0=on-chain, 1=demo mode

# Network (BNB Testnet)
NEXT_PUBLIC_CHAIN=bscTestnet
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com

# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_ENTRY_POINT=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789

# WalletConnect (optional)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

### Paymaster Configuration (Server-side Only)

```bash
# Particle Network (Primary)
PARTICLE_PAYMASTER_URL=https://paymaster.particle.network/chain/97
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key

# Pimlico (Fallback)
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=YOUR_API_KEY
```

### Deployment (contracts/.env)

```bash
PRIVATE_KEY=your_deployer_private_key
BSC_TESTNET_RPC=https://bsc-testnet.publicnode.com
```

**Security Notes:**
- Never commit `.env.local` or `.env` files
- Paymaster keys are server-side only (no `NEXT_PUBLIC_` prefix)
- Use separate keys for testnet and mainnet

## 🌐 Features & Pages

- **`/`** - Homepage with hero and features
- **`/dashboard`** - Analytics dashboard (volume, markets, agents)
- **`/markets`** - Browse and trade prediction markets
- **`/events`** - Upcoming events and markets
- **`/copytrading`** - Follow top traders
- **`/governance`** - DAO proposals and voting

### Key Features

- ✅ Gasless transactions (ERC-4337)
- ✅ AI-powered market resolution
- ✅ Copy trading system
- ✅ Reputation scoring (Brier, ELO, Accuracy)
- ✅ Optimistic resolution with 24h challenge window
- ✅ Demo mode (no wallet required)
- ✅ Dark theme with glassmorphism UI

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- wagmi + viem (Ethereum interactions)
- Zustand (State management)
- Recharts (Analytics)

**Smart Contracts:**
- Solidity 0.8.x
- Hardhat
- OpenZeppelin
- Deployed on BNB Testnet (Chain ID: 97)

**Account Abstraction (ERC-4337):**
- Particle Network Paymaster (Primary)
- Pimlico Paymaster (Fallback)
- EntryPoint v0.6.0

**Infrastructure:**
- Turborepo (Monorepo)
- pnpm (Package manager)
- GitHub Actions (CI/CD)

## 📄 License

MIT

---

Built for BNB Chain • Inspired by Verisight & ZeroToll