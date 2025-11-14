# SeerHive - Project Structure

## Repository Organization
SeerHive is a Turborepo monorepo with three main workspaces: web frontend, smart contracts, and shared packages.

```
seerhive/
├── apps/web/              # Next.js frontend application
├── contracts/             # Hardhat smart contracts
├── packages/              # Shared packages (config, ui)
├── scripts/               # Testing and deployment scripts
└── docs/                  # Documentation and build logs
```

## Core Components

### Frontend Application (`apps/web/`)
Next.js 14 application with App Router architecture.

```
apps/web/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/aa/sponsor/       # Paymaster API endpoint
│   │   ├── dashboard/            # Analytics dashboard
│   │   ├── markets/              # Market browsing and trading
│   │   ├── events/               # Event listings
│   │   ├── copytrading/          # Copy trading interface
│   │   ├── governance/           # DAO governance
│   │   └── page.tsx              # Homepage
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── TradeDialog.tsx       # Trading modal
│   │   ├── MarketCard.tsx        # Market display
│   │   └── ...
│   ├── lib/                      # Utilities and services
│   │   ├── gasless.ts            # Gasless transaction service
│   │   ├── contracts.ts          # Contract ABI and config
│   │   ├── paymaster/            # Paymaster adapters
│   │   │   ├── particle.ts       # Particle Network integration
│   │   │   └── pimlico.ts        # Pimlico integration
│   │   └── utils.ts              # Helper functions
│   ├── mocks/                    # Demo mode mock data
│   └── store/                    # Zustand state management
├── .env.example                  # Environment template
└── .env.local                    # Local configuration
```

### Smart Contracts (`contracts/`)
Hardhat project with Solidity contracts and TypeChain types.

```
contracts/
├── contracts/
│   └── PredictionMarket.sol      # Main prediction market contract
├── scripts/
│   └── deploy.ts                 # Deployment script
├── test/
│   └── PredictionMarket.test.ts  # Contract tests
├── typechain-types/              # Generated TypeScript types
│   ├── contracts/
│   │   └── PredictionMarket.ts   # Contract type definitions
│   └── factories/                # Contract factories
└── hardhat.config.ts             # Hardhat configuration
```

### Shared Packages (`packages/`)
Reusable configuration and UI components.

```
packages/
├── config/                       # Shared TypeScript configs
└── ui/                           # Shared UI components
```

### Scripts (`scripts/`)
Testing and validation scripts.

```
scripts/
├── test-sponsor.sh               # Test paymaster API
└── smoke-gasless.sh              # End-to-end gasless flow test
```

## Architectural Patterns

### Account Abstraction Flow
```
User Action → Frontend (wagmi) → /api/aa/sponsor → Particle/Pimlico → Bundler → BNB Chain
```

1. User initiates gasless transaction (buy shares, create market)
2. Frontend constructs UserOperation with wagmi/viem
3. POST to `/api/aa/sponsor` with UserOp data
4. Backend tries Particle paymaster, falls back to Pimlico on failure
5. Returns `paymasterAndData` + gas limits to frontend
6. Frontend submits sponsored UserOp to bundler
7. Transaction executes on-chain with zero user gas cost

### State Management
- **Zustand**: Global state for wallet connection, markets, user data
- **React Query**: Server state caching for blockchain data
- **wagmi hooks**: Ethereum interactions and contract calls

### Component Architecture
- **Atomic Design**: UI components in `components/ui/` (buttons, dialogs, cards)
- **Feature Components**: Page-specific components (TradeDialog, MarketCard)
- **Layout Components**: Shared layouts and navigation
- **Server Components**: Default for static content and data fetching
- **Client Components**: Interactive elements with 'use client' directive

### API Routes
- **RESTful endpoints**: `/api/aa/sponsor` for paymaster sponsorship
- **Server-side only**: Paymaster keys never exposed to client
- **Error handling**: Automatic fallback on provider failures
- **Type safety**: Zod validation for request/response schemas

### Smart Contract Architecture
- **Single contract deployment**: PredictionMarket.sol handles all markets
- **Market struct**: Each market stored with metadata, outcomes, shares
- **AMM pricing**: Automated market maker for share pricing
- **Optimistic resolution**: 24-hour challenge window before finalization
- **OpenZeppelin**: ReentrancyGuard, Ownable for security

## Data Flow

### Market Creation
1. User fills market creation form
2. Frontend validates input (title, outcomes, resolution date)
3. Calls `gaslessService.createMarketGasless()` or direct contract call
4. If gasless: UserOp → sponsor API → paymaster → bundler
5. Contract emits `MarketCreated` event
6. Frontend updates UI with new market

### Trading Flow
1. User selects outcome and share amount
2. Frontend calculates cost via contract `calculateCost()`
3. User confirms trade in TradeDialog
4. Calls `gaslessService.buySharesGasless()` or direct contract call
5. If gasless: UserOp → sponsor API → paymaster → bundler
6. Contract updates shares and liquidity
7. Frontend refreshes market data

### Resolution Flow
1. Market reaches resolution date
2. AI oracle or manual resolver determines outcome
3. 24-hour challenge window begins
4. If no disputes, market finalizes
5. Winners can claim payouts
6. Contract distributes funds proportionally

## Configuration Management

### Environment Variables
- **Public vars** (`NEXT_PUBLIC_*`): Exposed to browser (chain ID, contract address)
- **Server vars**: Paymaster keys, private keys (server-side only)
- **Demo mode**: `NEXT_PUBLIC_DEMO=1` for wallet-free testing

### Build Configuration
- **Turborepo**: Parallel builds and caching across workspaces
- **TypeScript**: Strict mode with path aliases
- **ESLint**: Next.js recommended config
- **Prettier**: Code formatting standards

## Deployment Structure
- **Frontend**: Vercel/Next.js deployment
- **Contracts**: BNB Testnet via Hardhat
- **Paymaster**: Particle Network + Pimlico cloud services
- **Bundler**: ERC-4337 bundler infrastructure
