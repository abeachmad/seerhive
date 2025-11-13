# SeerHive - Social Prediction Markets

AI-assisted prediction markets on BNB Chain with copy trading and governance.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/abeachmad/seerhive.git
cd seerhive
pnpm install

# Start everything (frontend + hardhat)
./startseerhive.sh
```

Then open http://localhost:3000/dashboard

## 📋 Available Scripts

```bash
./startseerhive.sh    # Start frontend + hardhat node
./test-api.sh         # Test oracle API endpoint
./scripts/smoke-gasless.sh  # Test gasless routing

pnpm dev              # Start frontend only
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint code
pnpm chain            # Start hardhat node only
pnpm deploy:testnet   # Deploy to BNB Testnet
```

## ⚡ Gasless Transactions

SeerHive supports gasless transactions via **Particle Network** (primary) with automatic fallback to **Pimlico**.

### Architecture

- **Server-side sponsorship**: All paymaster keys secured on backend (Next.js API routes)
- **Particle → Pimlico fallback**: Automatic failover if primary provider rejects
- **Zero frontend keys**: No credentials exposed to browser

### How It Works

1. Frontend calls `/api/aa/sponsor` with UserOperation
2. Backend tries Particle paymaster first
3. On failure (rate limit/rejection), automatically falls back to Pimlico
4. Returns sponsored transaction data to frontend

### Test Gasless

```bash
# Test sponsor API endpoint
./scripts/test-sponsor.sh

# Full gasless flow
./scripts/smoke-gasless.sh
```

## 🧪 Testing

**Frontend (DEMO mode):**
- Visit http://localhost:3000/dashboard
- Check tabs: Events, Markets, Agents, Analytics
- Verify charts render correctly

**API:**
```bash
./test-api.sh
```

**Smart Contracts:**
```bash
cd contracts
pnpm test
```

## 📚 Documentation

- [Full Setup Guide](docs/README.md)
- [Build Submission](docs/BUILD_SUBMISSION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Build Log](LOG_SEERHIVE.md)

## 🔧 Environment

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_DEMO=1                    # 1=demo, 0=on-chain
NEXT_PUBLIC_WC_PROJECT_ID=            # WalletConnect ID
PRIVATE_KEY=                          # For deployment

# Particle Paymaster (primary, server-side)
PARTICLE_PAYMASTER_URL=https://paymaster.particle.network/chain/97
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key

# Pimlico Paymaster (fallback, server-side)
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=YOUR_KEY
```

## 🌐 Pages

- `/` - Homepage
- `/dashboard` - Analytics dashboard
- `/markets` - Prediction markets
- `/events` - Event listings
- `/copytrading` - Follow traders
- `/governance` - DAO proposals

## 🏗️ Tech Stack

- Next.js 14, TypeScript, Tailwind CSS
- Recharts, Zustand, wagmi, viem
- Hardhat, Solidity, OpenZeppelin
- Turborepo, pnpm
- Pimlico/Particle Paymaster (ERC-4337)

## 📄 License

MIT

---

Built for BNB Chain • Inspired by Verisight & ZeroToll