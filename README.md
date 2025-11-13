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

pnpm dev              # Start frontend only
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint code
pnpm chain            # Start hardhat node only
pnpm deploy:testnet   # Deploy to BNB Testnet
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

Copy `.env.example` to `.env` and configure:

```bash
NEXT_PUBLIC_DEMO=1                    # 1=demo, 0=on-chain
NEXT_PUBLIC_WC_PROJECT_ID=            # WalletConnect ID
PRIVATE_KEY=                          # For deployment
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

## 📄 License

MIT

---

Built for BNB Chain • Inspired by Verisight & ZeroToll