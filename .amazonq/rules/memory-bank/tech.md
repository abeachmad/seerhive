# SeerHive - Technology Stack

## Programming Languages
- **TypeScript 5.2.2**: Primary language for frontend and contract types
- **Solidity 0.8.x**: Smart contract development
- **JavaScript**: Build scripts and configuration
- **Bash**: Testing and deployment scripts

## Frontend Stack

### Core Framework
- **Next.js 14.2.5**: React framework with App Router
- **React 18.3.1**: UI library
- **React DOM 18.3.1**: React rendering

### Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **PostCSS 8.4.33**: CSS processing
- **Autoprefixer 10.4.17**: CSS vendor prefixing
- **class-variance-authority 0.7.0**: Component variant management
- **tailwind-merge 2.2.0**: Tailwind class merging utility
- **clsx 2.1.0**: Conditional class names

### UI Components
- **shadcn/ui**: Component library built on Radix UI
- **@radix-ui/react-tabs 1.0.4**: Tab components
- **@radix-ui/react-dialog 1.0.5**: Modal dialogs
- **@radix-ui/react-slot 1.0.2**: Slot composition
- **@radix-ui/react-progress 1.0.3**: Progress bars
- **lucide-react 0.309.0**: Icon library

### Web3 Integration
- **wagmi 2.5.7**: React hooks for Ethereum
- **viem 2.7.13**: TypeScript Ethereum library
- **@web3modal/wagmi 4.1.7**: Wallet connection modal
- **permissionless 0.1.20**: ERC-4337 account abstraction utilities

### State Management
- **Zustand 4.4.7**: Lightweight state management
- **@tanstack/react-query 5.17.19**: Server state management

### Data Visualization
- **Recharts 2.10.3**: Chart library for analytics dashboard

### Utilities
- **Zod 3.22.4**: Schema validation
- **next-themes 0.2.1**: Theme management

## Smart Contract Stack

### Development Framework
- **Hardhat 2.19.4**: Ethereum development environment
- **@nomicfoundation/hardhat-toolbox 4.0.0**: Hardhat plugin bundle

### Contract Libraries
- **@openzeppelin/contracts 5.0.1**: Secure contract standards
  - ReentrancyGuard: Prevent reentrancy attacks
  - Ownable: Access control
  - SafeMath: Safe arithmetic operations

### Type Generation
- **TypeChain 8.3.2**: TypeScript bindings for contracts
- **@typechain/hardhat 9.1.0**: Hardhat TypeChain integration

### Testing & Deployment
- **Hardhat Test**: Built-in testing framework
- **dotenv 16.3.1**: Environment variable management

## Monorepo Infrastructure

### Build System
- **Turborepo 1.10.16**: High-performance build system
- **pnpm 10.20.0**: Fast, disk-efficient package manager
- **pnpm workspaces**: Monorepo workspace management

### Code Quality
- **ESLint 8.51.0**: JavaScript/TypeScript linting
- **eslint-config-next 14.2.5**: Next.js ESLint configuration
- **Prettier 3.0.3**: Code formatting
- **.editorconfig**: Editor configuration standardization

## Blockchain Infrastructure

### Network
- **BNB Chain Testnet**: Chain ID 97
- **RPC**: https://bsc-testnet.publicnode.com
- **Block Explorer**: https://testnet.bscscan.com

### Account Abstraction (ERC-4337)
- **EntryPoint v0.6.0**: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
- **Particle Network**: Primary paymaster provider
- **Pimlico**: Fallback paymaster provider
- **Bundler**: ERC-4337 transaction bundler

### Wallet Support
- **MetaMask**: Browser extension wallet
- **WalletConnect**: Multi-wallet connection protocol
- **Web3Modal**: Unified wallet connection interface

## Development Tools

### Version Control
- **Git**: Source control
- **GitHub**: Repository hosting
- **GitHub Actions**: CI/CD automation (`.github/workflows/ci.yml`)

### IDE Configuration
- **VS Code**: Recommended editor
- **seerhive.code-workspace**: Workspace configuration
- **.editorconfig**: Cross-editor settings

### Environment Management
- **.env.example**: Environment template
- **.env.local**: Local development config
- **.env**: Root environment variables

## Build Commands

### Root Level (Turborepo)
```bash
pnpm dev              # Start all workspaces in dev mode
pnpm build            # Build all workspaces
pnpm lint             # Lint all workspaces
pnpm test             # Test all workspaces
pnpm chain            # Start local Hardhat node
pnpm deploy:testnet   # Deploy contracts to BNB Testnet
```

### Frontend (`apps/web/`)
```bash
pnpm dev              # Start Next.js dev server (localhost:3000)
pnpm build            # Build production bundle
pnpm start            # Start production server
pnpm lint             # Lint frontend code
pnpm test             # Run frontend tests (placeholder)
```

### Contracts (`contracts/`)
```bash
pnpm build            # Compile Solidity contracts
pnpm test             # Run Hardhat tests
pnpm lint             # Lint contracts (placeholder)
pnpm deploy:testnet   # Deploy to BNB Testnet
```

### Testing Scripts
```bash
./scripts/test-sponsor.sh    # Test paymaster API endpoint
./scripts/smoke-gasless.sh   # End-to-end gasless transaction test
./test-api.sh                # API integration tests
```

## Configuration Files

### TypeScript
- `tsconfig.json`: Root TypeScript config
- `apps/web/tsconfig.json`: Frontend TypeScript config
- `contracts/tsconfig.json`: Contracts TypeScript config
- `packages/config/tsconfig.json`: Shared TypeScript config

### Build Tools
- `turbo.json`: Turborepo pipeline configuration
- `pnpm-workspace.yaml`: pnpm workspace definition
- `next.config.js`: Next.js configuration
- `hardhat.config.ts`: Hardhat network and plugin config

### Styling
- `tailwind.config.ts`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS plugins
- `.prettierrc`: Prettier formatting rules

### Linting
- `.eslintrc.js`: Root ESLint config
- `apps/web/.eslintrc.json`: Frontend ESLint config
- `eslint.config.mjs`: Modern ESLint flat config

## Deployment Configuration

### Frontend Environment
```bash
NEXT_PUBLIC_DEMO=0                                    # Demo mode toggle
NEXT_PUBLIC_CHAIN=bscTestnet                          # Network name
NEXT_PUBLIC_CHAIN_ID=97                               # Chain ID
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127
NEXT_PUBLIC_ENTRY_POINT=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

### Server-Side Paymaster (Never exposed to client)
```bash
PARTICLE_PAYMASTER_URL=https://paymaster.particle.network/chain/97
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=YOUR_API_KEY
```

### Contract Deployment
```bash
PRIVATE_KEY=your_deployer_private_key
BSC_TESTNET_RPC=https://bsc-testnet.publicnode.com
```

## Dependencies Summary

### Production Dependencies (Frontend)
- 25 total dependencies
- Key: Next.js, React, wagmi, viem, Tailwind, Radix UI, Recharts, Zustand

### Development Dependencies (Frontend)
- 6 total dependencies
- Key: TypeScript, ESLint, type definitions

### Production Dependencies (Contracts)
- 2 total dependencies
- Key: OpenZeppelin contracts, dotenv

### Development Dependencies (Contracts)
- 4 total dependencies
- Key: Hardhat, TypeChain, Hardhat toolbox

### Root Development Dependencies
- 5 total dependencies
- Key: Turborepo, TypeScript, Prettier, ESLint

## Version Requirements
- **Node.js**: 20.x (specified in @types/node)
- **pnpm**: 10.20.0 (enforced by packageManager field)
- **TypeScript**: 5.2.2 (consistent across workspaces)
