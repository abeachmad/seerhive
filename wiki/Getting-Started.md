# Getting Started

Get SeerHive running locally in under 10 minutes.

## Prerequisites

- Node.js 20.x or higher
- pnpm 10.x or higher
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/abeachmad/seerhive.git
cd seerhive
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```bash
# Demo Mode (no wallet required)
NEXT_PUBLIC_DEMO=1

# Or On-Chain Mode
NEXT_PUBLIC_DEMO=0
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Mode vs On-Chain Mode

### Demo Mode (Recommended for First Run)

```bash
NEXT_PUBLIC_DEMO=1
```

- No wallet connection required
- Mock data for all features
- Test UI/UX without blockchain

### On-Chain Mode

```bash
NEXT_PUBLIC_DEMO=0
```

- Real wallet connection (MetaMask, Particle)
- Live contract interactions on BNB Testnet
- Requires testnet tokens

## Get Testnet Tokens

### BNB (Native Token)
[BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)

### tBUSD (Recommended)
Visit [/faucet](http://localhost:3000/faucet) - Get 30 tBUSD every 24 hours

### Other Tokens
- tUSDT, tUSDC, tDAI, tBTC: [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)

## Test Gasless Transactions

### 1. Enable Gasless Mode

In the UI, toggle "Use Gasless Transaction"

### 2. Create Market or Trade

```bash
# Test paymaster API
./scripts/test-sponsor.sh

# Full gasless flow
./scripts/smoke-gasless.sh
```

### 3. Verify Transaction

Check console for: `Gasless sponsored: particle`

Verify on [BSCScan](https://testnet.bscscan.com) - user pays 0 gas

## Test AI Resolution

```bash
./scripts/test-ai-resolve.sh
```

Expected output:
```json
{
  "outcome": "NO",
  "confidence": 95,
  "reasoning": "...",
  "latency_ms": 1772
}
```

## Project Structure

```
seerhive/
├── apps/web/          # Next.js frontend
├── contracts/         # Smart contracts
├── scripts/           # Test scripts
└── docs/              # Documentation
```

## Available Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Lint code

# Contracts
cd contracts
pnpm test             # Test contracts
pnpm deploy:testnet   # Deploy to BNB Testnet
```

## Next Steps

- [Architecture](Architecture) - Understand system design
- [Configuration](Configuration) - Advanced environment setup
- [API Reference](API-Reference) - Explore API endpoints
- [Testing](Testing) - Run comprehensive tests

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### pnpm Not Found

```bash
npm install -g pnpm
```

### Contract Not Deployed

Verify contract address in `.env.local` matches:
```
0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127
```

### Gasless Transaction Failed

Check paymaster configuration in [Configuration](Configuration)
