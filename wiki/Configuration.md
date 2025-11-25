# Configuration

Complete guide to configuring SeerHive for development and production.

## Environment Variables

### Frontend Configuration

Location: `apps/web/.env.local`

```bash
# ============================================
# MODE
# ============================================
NEXT_PUBLIC_DEMO=0                    # 0=on-chain, 1=demo mode

# ============================================
# NETWORK (BNB Testnet)
# ============================================
NEXT_PUBLIC_CHAIN=bscTestnet
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com

# ============================================
# SMART CONTRACTS
# ============================================
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127
NEXT_PUBLIC_ENTRY_POINT=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789

# ============================================
# WALLETCONNECT (Optional)
# ============================================
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# ============================================
# PARTICLE NETWORK (Client-side)
# ============================================
NEXT_PUBLIC_PARTICLE_PROJECT_ID=your_project_id
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=your_client_key
NEXT_PUBLIC_PARTICLE_APP_ID=your_app_id

# ============================================
# PAYMASTER ROUTING
# ============================================
NEXT_PUBLIC_PAYMASTER_ROUTING=auto    # auto|pimlico|particle|abtest

# ============================================
# PARTICLE PAYMASTER (Server-side)
# ============================================
PARTICLE_PAYMASTER_URL=https://paymaster.particle.network/chain/97
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key

# ============================================
# PIMLICO PAYMASTER (Server-side)
# ============================================
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=YOUR_API_KEY
NEXT_PUBLIC_PIMLICO_API_KEY=your_api_key

# ============================================
# AI RESOLUTION (Server-side)
# ============================================
GROQ_API_KEY=gsk_your_groq_key_here
TAVILY_API_KEY=tvly-your_tavily_key_here

# ============================================
# FAUCET (Server-side)
# ============================================
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
FAUCET_PRIVATE_KEY=your_faucet_private_key
```

### Contract Configuration

Location: `contracts/.env`

```bash
# ============================================
# DEPLOYMENT
# ============================================
PRIVATE_KEY=your_deployer_private_key
BSC_TESTNET_RPC=https://bsc-testnet.publicnode.com

# ============================================
# VERIFICATION (Optional)
# ============================================
BSCSCAN_API_KEY=your_bscscan_api_key
```

## Configuration Sections

### 1. Mode Configuration

#### Demo Mode

Test all features without wallet connection:

```bash
NEXT_PUBLIC_DEMO=1
```

**Features**:
- Mock data for markets, trades, analytics
- No wallet connection required
- No blockchain interactions
- Perfect for UI/UX testing

#### On-Chain Mode

Real blockchain interactions:

```bash
NEXT_PUBLIC_DEMO=0
```

**Features**:
- Real wallet connection (MetaMask, Particle)
- Live contract interactions
- Gasless transactions
- Requires testnet tokens

### 2. Network Configuration

#### BNB Testnet (Default)

```bash
NEXT_PUBLIC_CHAIN=bscTestnet
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com
```

#### BNB Mainnet (Future)

```bash
NEXT_PUBLIC_CHAIN=bsc
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org
```

### 3. Smart Contract Configuration

#### Deployed Contracts

```bash
# PredictionMarket contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127

# ERC-4337 EntryPoint
NEXT_PUBLIC_ENTRY_POINT=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```

#### Custom Deployment

If you deploy your own contracts:

```bash
cd contracts
pnpm deploy:testnet
# Copy new contract address to .env.local
```

### 4. Wallet Configuration

#### WalletConnect

Get project ID: [cloud.walletconnect.com](https://cloud.walletconnect.com)

```bash
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id
```

#### Particle Network

Get credentials: [dashboard.particle.network](https://dashboard.particle.network)

**Client-side** (social login):
```bash
NEXT_PUBLIC_PARTICLE_PROJECT_ID=your_project_id
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=your_client_key
NEXT_PUBLIC_PARTICLE_APP_ID=your_app_id
```

**Server-side** (paymaster):
```bash
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key
```

### 5. Paymaster Configuration

#### Routing Strategy

```bash
NEXT_PUBLIC_PAYMASTER_ROUTING=auto
```

**Options**:
- `auto` - Try Particle first, fallback to Pimlico (recommended)
- `particle` - Only use Particle
- `pimlico` - Only use Pimlico
- `abtest` - A/B test between providers

#### Particle Paymaster

Get credentials: [dashboard.particle.network](https://dashboard.particle.network)

```bash
PARTICLE_PAYMASTER_URL=https://paymaster.particle.network/chain/97
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key
```

#### Pimlico Paymaster

Get API key: [dashboard.pimlico.io](https://dashboard.pimlico.io)

```bash
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=YOUR_API_KEY
NEXT_PUBLIC_PIMLICO_API_KEY=your_api_key
```

### 6. AI Configuration

#### Groq (LLM)

Get free API key: [console.groq.com](https://console.groq.com)

```bash
GROQ_API_KEY=gsk_your_groq_key_here
```

**Rate Limits**:
- Free tier: 30 requests/minute
- Models: Llama 3.3 70B, Llama 3.1 8B

#### Tavily (Web Search)

Get free API key: [tavily.com](https://tavily.com)

```bash
TAVILY_API_KEY=tvly-your_tavily_key_here
```

**Rate Limits**:
- Free tier: 1000 searches/month

### 7. Faucet Configuration

#### Auto-Fund Smart Accounts

```bash
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
```

Used to automatically fund new smart accounts with testnet tokens.

#### tBUSD Faucet

```bash
FAUCET_PRIVATE_KEY=your_faucet_private_key
```

Private key for tBUSD faucet contract.

## Security Best Practices

### Client-Side vs Server-Side

#### ✅ Client-Side (NEXT_PUBLIC_ prefix)

Safe to expose in browser:
```bash
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PARTICLE_PROJECT_ID=xxx
```

#### ❌ Server-Side (No prefix)

Never expose in browser:
```bash
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly-...
PARTICLE_CLIENT_KEY=xxx
DEPLOYER_PRIVATE_KEY=0x...
```

### Private Key Management

**Never commit private keys to Git**:

```bash
# .gitignore
.env
.env.local
.env.production
```

**Use separate keys for testnet and mainnet**:
```bash
# Testnet
PRIVATE_KEY=0x...testnet_key...

# Mainnet
PRIVATE_KEY=0x...mainnet_key...
```

### API Key Rotation

Rotate keys regularly:
- Groq: Every 90 days
- Tavily: Every 90 days
- Particle: Every 180 days
- Pimlico: Every 180 days

## Configuration Files

### TypeScript Config

`apps/web/tsconfig.json`:
```json
{
  "extends": "@repo/config/tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Next.js Config

`apps/web/next.config.js`:
```javascript
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@repo/config"],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
};
```

### Tailwind Config

`apps/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        slate: { /* ... */ }
      }
    }
  },
  plugins: []
};

export default config;
```

### Hardhat Config

`contracts/hardhat.config.ts`:
```typescript
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 97
    }
  }
};

export default config;
```

## Troubleshooting

### "Missing environment variable"

**Cause**: Required variable not set

**Solution**: Copy from `.env.example` and fill in values

### "Invalid API key"

**Cause**: Incorrect or expired API key

**Solution**: Generate new key from provider dashboard

### "Network mismatch"

**Cause**: Wallet on different network than configured

**Solution**: Switch wallet to BNB Testnet (Chain ID: 97)

### "Contract not found"

**Cause**: Wrong contract address or network

**Solution**: Verify contract address matches deployed contract

## Environment Templates

### Minimal (Demo Mode)

```bash
NEXT_PUBLIC_DEMO=1
```

### Development (On-Chain)

```bash
NEXT_PUBLIC_DEMO=0
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com
```

### Full (All Features)

```bash
# Mode
NEXT_PUBLIC_DEMO=0

# Network
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127

# Paymasters
PARTICLE_PROJECT_ID=xxx
PARTICLE_CLIENT_KEY=xxx
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=xxx

# AI
GROQ_API_KEY=gsk_xxx
TAVILY_API_KEY=tvly-xxx
```

## Next Steps

- [Getting Started](Getting-Started) - Setup guide
- [Testing](Testing) - Test configuration
- [Deployment](Deployment) - Production deployment
