# Deployment

Guide to deploying SeerHive to production.

## Overview

SeerHive consists of two main components:
1. **Smart Contracts** - Deployed to BNB Chain
2. **Frontend Application** - Deployed to Vercel

## Prerequisites

- Node.js 20.x or higher
- pnpm 10.x or higher
- BNB for gas fees (testnet or mainnet)
- Vercel account (for frontend)
- API keys (Particle, Pimlico, Groq, Tavily)

## Smart Contract Deployment

### 1. Prepare Environment

```bash
cd contracts
cp .env.example .env
```

Edit `contracts/.env`:

```bash
PRIVATE_KEY=your_deployer_private_key
BSC_TESTNET_RPC=https://bsc-testnet.publicnode.com
BSCSCAN_API_KEY=your_bscscan_api_key
```

### 2. Compile Contracts

```bash
pnpm build
```

Verify compilation:
```bash
ls artifacts/contracts/PredictionMarket.sol/
# Should see PredictionMarket.json
```

### 3. Deploy to BNB Testnet

```bash
pnpm deploy:testnet
```

**Expected Output**:
```
Deploying PredictionMarket...
PredictionMarket deployed to: 0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127
```

**Save the contract address** - you'll need it for frontend configuration.

### 4. Verify Contract

```bash
npx hardhat verify --network bscTestnet 0xYourContractAddress
```

**Expected Output**:
```
Successfully verified contract PredictionMarket on BSCScan
https://testnet.bscscan.com/address/0x...#code
```

### 5. Deploy to BNB Mainnet

**⚠️ Only after thorough testing and audit**

Update `contracts/.env`:
```bash
PRIVATE_KEY=your_mainnet_deployer_key
BSC_MAINNET_RPC=https://bsc-dataseed.binance.org
```

Update `hardhat.config.ts`:
```typescript
networks: {
  bscMainnet: {
    url: process.env.BSC_MAINNET_RPC,
    accounts: [process.env.PRIVATE_KEY!],
    chainId: 56
  }
}
```

Deploy:
```bash
npx hardhat run scripts/deploy.ts --network bscMainnet
```

## Frontend Deployment

### 1. Prepare Environment

```bash
cd apps/web
cp .env.example .env.production
```

Edit `apps/web/.env.production`:

```bash
# Mode
NEXT_PUBLIC_DEMO=0

# Network (Testnet)
NEXT_PUBLIC_CHAIN=bscTestnet
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_RPC_URL=https://bsc-testnet.publicnode.com

# Or Mainnet
# NEXT_PUBLIC_CHAIN=bsc
# NEXT_PUBLIC_CHAIN_ID=56
# NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org

# Contract (use your deployed address)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_ENTRY_POINT=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789

# Particle Network
NEXT_PUBLIC_PARTICLE_PROJECT_ID=your_project_id
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=your_client_key
NEXT_PUBLIC_PARTICLE_APP_ID=your_app_id

# Paymasters (Server-side)
PARTICLE_PAYMASTER_URL=https://paymaster.particle.network/chain/97
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=YOUR_KEY

# AI (Server-side)
GROQ_API_KEY=gsk_your_groq_key
TAVILY_API_KEY=tvly-your_tavily_key

# Faucet (Server-side)
DEPLOYER_PRIVATE_KEY=your_deployer_key
FAUCET_PRIVATE_KEY=your_faucet_key
```

### 2. Build Application

```bash
cd ../..  # Back to root
pnpm build
```

Verify build:
```bash
ls apps/web/.next/
# Should see build artifacts
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI

Install Vercel CLI:
```bash
npm i -g vercel
```

Deploy:
```bash
cd apps/web
vercel
```

Follow prompts:
- Link to existing project or create new
- Set environment variables
- Deploy

#### Option B: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm build --filter=web`
   - Output Directory: `.next`
6. Add environment variables (from `.env.production`)
7. Deploy

### 4. Configure Environment Variables

In Vercel dashboard:

**Settings → Environment Variables**

Add all variables from `.env.production`:

| Key | Value | Environment |
|-----|-------|-------------|
| NEXT_PUBLIC_DEMO | 0 | Production |
| NEXT_PUBLIC_CHAIN_ID | 97 | Production |
| NEXT_PUBLIC_CONTRACT_ADDRESS | 0x... | Production |
| GROQ_API_KEY | gsk_... | Production |
| TAVILY_API_KEY | tvly-... | Production |
| ... | ... | ... |

**⚠️ Important**: Server-side variables (without `NEXT_PUBLIC_`) are encrypted.

### 5. Configure Custom Domain

In Vercel dashboard:

**Settings → Domains**

Add your domain:
- `seerhive.com`
- `www.seerhive.com`

Update DNS records:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 6. Verify Deployment

Visit your deployed URL:
```
https://seerhive.vercel.app
```

Test:
- ✅ Homepage loads
- ✅ Markets page works
- ✅ Wallet connection works
- ✅ Gasless transactions work
- ✅ AI resolution works

## Post-Deployment

### 1. Fund Paymaster Accounts

Ensure paymasters have sufficient funds:

**Particle Network**:
- Check balance in [dashboard.particle.network](https://dashboard.particle.network)
- Top up if needed

**Pimlico**:
- Check balance in [dashboard.pimlico.io](https://dashboard.pimlico.io)
- Top up if needed

### 2. Monitor Application

Set up monitoring:

**Vercel Analytics**:
- Enable in Vercel dashboard
- Track page views, performance

**Error Tracking** (Sentry):
```bash
pnpm add @sentry/nextjs
```

Configure `sentry.config.js`:
```javascript
Sentry.init({
  dsn: 'your_sentry_dsn',
  environment: 'production'
});
```

**Uptime Monitoring**:
- Use [UptimeRobot](https://uptimerobot.com)
- Monitor `/api/health` endpoint

### 3. Set Up Alerts

Configure alerts for:
- Paymaster balance low
- API rate limits exceeded
- Contract errors
- High error rates

### 4. Enable Rate Limiting

Add rate limiting middleware:

`apps/web/src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const max = 100; // 100 requests per minute

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const requests = rateLimit.get(ip).filter((time: number) => now - time < windowMs);
  
  if (requests.length >= max) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  requests.push(now);
  rateLimit.set(ip, requests);

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

## Rollback Procedure

If deployment fails:

### Vercel Rollback

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Contract Rollback

**⚠️ Contracts are immutable - cannot rollback**

Options:
1. Deploy new contract with fixes
2. Update frontend to use old contract
3. Use proxy pattern (future)

## Maintenance

### Update Dependencies

```bash
pnpm update
pnpm audit
pnpm audit fix
```

### Update Contracts

1. Make changes to contracts
2. Test thoroughly
3. Deploy new contract
4. Update frontend contract address
5. Redeploy frontend

### Update Frontend

```bash
git pull
pnpm install
pnpm build
vercel --prod
```

## Security Checklist

### Before Mainnet Deployment

- [ ] Smart contract audit completed
- [ ] All tests passing
- [ ] Security review done
- [ ] Rate limiting enabled
- [ ] Error tracking configured
- [ ] Monitoring set up
- [ ] Backup plan ready
- [ ] Team trained on incident response

### Environment Security

- [ ] Private keys stored securely (not in code)
- [ ] API keys rotated regularly
- [ ] Server-side variables not exposed
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting active

## Cost Estimates

### Monthly Costs (Testnet)

| Service | Cost |
|---------|------|
| Vercel (Hobby) | $0 |
| Particle Paymaster | ~$100 |
| Pimlico Paymaster | ~$50 |
| Groq API | $0 (free tier) |
| Tavily API | $0 (free tier) |
| **Total** | **~$150** |

### Monthly Costs (Mainnet)

| Service | Cost |
|---------|------|
| Vercel (Pro) | $20 |
| Particle Paymaster | ~$500 |
| Pimlico Paymaster | ~$300 |
| Groq API | ~$50 |
| Tavily API | ~$50 |
| Monitoring | ~$30 |
| **Total** | **~$950** |

## Scaling Considerations

### Horizontal Scaling

Vercel automatically scales:
- Serverless functions
- Edge network
- CDN caching

### Database (Future)

When adding database:
- Use Vercel Postgres
- Or external (Supabase, PlanetScale)
- Enable connection pooling

### Caching

Implement caching:
- Redis for API responses
- CDN for static assets
- Browser caching headers

## Troubleshooting

### Deployment Fails

**Check**:
1. Build logs in Vercel
2. Environment variables set
3. Dependencies installed
4. Node version correct

### Contract Not Found

**Check**:
1. Contract address correct
2. Network matches (testnet vs mainnet)
3. Contract verified on BSCScan

### Gasless Transactions Failing

**Check**:
1. Paymaster accounts funded
2. API keys valid
3. Rate limits not exceeded

### AI Resolution Failing

**Check**:
1. Groq API key valid
2. Tavily API key valid
3. Rate limits not exceeded

## Next Steps

- [Configuration](Configuration) - Environment setup
- [Testing](Testing) - Testing guide
- [API Reference](API-Reference) - API documentation
