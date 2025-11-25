# Testing

Comprehensive testing guide for SeerHive.

## Testing Strategy

SeerHive uses multiple testing approaches:

1. **Smart Contract Tests** - Hardhat + Chai
2. **API Tests** - Shell scripts + curl
3. **Integration Tests** - End-to-end flows
4. **Manual Testing** - UI/UX validation

## Smart Contract Testing

### Setup

```bash
cd contracts
pnpm install
```

### Run Tests

```bash
pnpm test
```

### Test Structure

Location: `contracts/test/PredictionMarket.test.ts`

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('PredictionMarket', function () {
  let market: PredictionMarket;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
    market = await PredictionMarket.deploy();
  });

  it('Should create a market', async function () {
    const tx = await market.createMarket('Test question?', 86400);
    await tx.wait();
    
    const marketData = await market.markets(0);
    expect(marketData.question).to.equal('Test question?');
  });
});
```

### Test Coverage

Run with coverage:

```bash
pnpm test:coverage
```

**Current Coverage**:
- Market creation: ✅
- Share purchases (BNB): ✅
- Share purchases (ERC20): ✅
- Resolution proposal: ✅
- Challenge mechanism: ✅
- Finalization: ✅
- Winnings claims: ✅

### Key Test Cases

#### 1. Market Creation

```typescript
it('Should create a market', async function () {
  const tx = await market.createMarket('Will BNB reach $1000?', 86400);
  await tx.wait();
  
  const marketData = await market.markets(0);
  expect(marketData.question).to.equal('Will BNB reach $1000?');
  expect(marketData.resolved).to.equal(false);
});
```

#### 2. Buy Shares (BNB)

```typescript
it('Should allow buying YES shares with BNB', async function () {
  await market.createMarket('Test?', 86400);
  const amount = parseEther('1');
  
  await market.buyShares(0, true, ethers.ZeroAddress, amount, {
    value: amount
  });
  
  const shares = await market.userShares(0, user1.address, true);
  expect(shares).to.equal(amount);
});
```

#### 3. Buy Shares (ERC20)

```typescript
it('Should allow buying shares with ERC20', async function () {
  const MockERC20 = await ethers.getContractFactory('MockERC20');
  const token = await MockERC20.deploy('Test', 'TST');
  
  await token.mint(user1.address, parseEther('100'));
  await token.connect(user1).approve(market.address, parseEther('10'));
  
  await market.connect(user1).buyShares(0, true, token.address, parseEther('10'));
  
  const shares = await market.userShares(0, user1.address, true);
  expect(shares).to.equal(parseEther('10'));
});
```

#### 4. Resolution & Challenge

```typescript
it('Should allow proposing and challenging resolution', async function () {
  await market.createMarket('Test?', 1); // 1 second duration
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Propose resolution
  await market.proposeResolution(0, true);
  
  // Challenge
  await market.connect(user1).challengeResolution(0, {
    value: parseEther('0.01')
  });
  
  const resolution = await market.resolutions(0);
  expect(resolution.challenged).to.equal(true);
});
```

#### 5. Claim Winnings

```typescript
it('Should allow claiming winnings', async function () {
  await market.createMarket('Test?', 1);
  await market.buyShares(0, true, ethers.ZeroAddress, parseEther('1'), {
    value: parseEther('1')
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await market.finalizeMarket(0, true);
  
  const balanceBefore = await ethers.provider.getBalance(user1.address);
  await market.connect(user1).claimWinnings(0);
  const balanceAfter = await ethers.provider.getBalance(user1.address);
  
  expect(balanceAfter).to.be.gt(balanceBefore);
});
```

## API Testing

### Paymaster API Test

Test gasless transaction sponsorship:

```bash
./scripts/test-sponsor.sh
```

**Script**:
```bash
#!/bin/bash

curl -X POST http://localhost:3000/api/aa/sponsor \
  -H "Content-Type: application/json" \
  -d '{
    "userOp": {
      "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "nonce": "0x0",
      "initCode": "0x",
      "callData": "0x",
      "callGasLimit": "0x0",
      "verificationGasLimit": "0x0",
      "preVerificationGas": "0x0",
      "maxFeePerGas": "0x0",
      "maxPriorityFeePerGas": "0x0",
      "paymasterAndData": "0x",
      "signature": "0x"
    },
    "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    "chainId": 97
  }'
```

**Expected Output**:
```json
{
  "paymasterAndData": "0x...",
  "provider": "particle",
  "latency_ms": 234
}
```

### AI Resolution Test

Test AI-powered market resolution:

```bash
./scripts/test-ai-resolve.sh
```

**Script**:
```bash
#!/bin/bash

curl -X POST http://localhost:3000/api/ai/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": 999,
    "question": "Did Bitcoin reach $100,000 in 2024?",
    "resolutionDate": "2024-12-31"
  }'
```

**Expected Output**:
```json
{
  "marketId": 999,
  "outcome": "NO",
  "confidence": 100,
  "reasoning": "Historical data shows Bitcoin did not reach $100,000 in 2024.",
  "latency_ms": 1772
}
```

### Faucet Test

Test tBUSD faucet:

```bash
curl -X POST http://localhost:3000/api/faucet/busd \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

**Expected Output**:
```json
{
  "success": true,
  "txHash": "0x...",
  "amount": "30000000000000000000",
  "token": "tBUSD"
}
```

## Integration Testing

### Gasless Transaction Flow

Test complete gasless transaction:

```bash
./scripts/smoke-gasless.sh
```

**Flow**:
1. Construct UserOperation
2. Request sponsorship from `/api/aa/sponsor`
3. Submit to bundler
4. Verify on-chain

**Expected Output**:
```
✅ UserOperation constructed
✅ Sponsorship received: particle
✅ Transaction submitted: 0x...
✅ Transaction confirmed
✅ User paid 0 gas
```

### Market Creation Flow

**Manual Test**:
1. Start dev server: `pnpm dev`
2. Connect wallet (MetaMask)
3. Go to `/markets`
4. Click "Create Market"
5. Fill form:
   - Question: "Will BNB reach $1000 by 2025?"
   - Duration: 365 days
6. Toggle "Use Gasless Transaction"
7. Submit
8. Verify on BSCScan

### Trading Flow

**Manual Test**:
1. Go to `/markets`
2. Select a market
3. Click "Trade"
4. Select token (tBUSD)
5. Enter amount (10)
6. Choose side (YES)
7. Toggle "Use Gasless Transaction"
8. Submit
9. Verify shares in portfolio

### Resolution Flow

**Manual Test**:
1. Create market with 1-minute duration
2. Wait for expiry
3. Click "Resolve with AI"
4. Review AI decision
5. Submit resolution proposal
6. Wait 24 hours (or test challenge)
7. Finalize market
8. Claim winnings

## Demo Mode Testing

Test all features without wallet:

```bash
# Set demo mode
echo "NEXT_PUBLIC_DEMO=1" > apps/web/.env.local

# Start server
pnpm dev

# Visit http://localhost:3000
```

**Test Cases**:
- ✅ Browse markets
- ✅ View analytics
- ✅ Create market (mock)
- ✅ Trade shares (mock)
- ✅ View portfolio
- ✅ Check transaction history

## Performance Testing

### API Latency

Measure API response times:

```bash
# Paymaster API
time curl -X POST http://localhost:3000/api/aa/sponsor -d '{...}'

# AI Resolution API
time curl -X POST http://localhost:3000/api/ai/resolve -d '{...}'
```

**Targets**:
- Paymaster: < 500ms
- AI Resolution: < 3000ms

### Load Testing

Use `ab` (Apache Bench):

```bash
# Test paymaster endpoint
ab -n 100 -c 10 -p payload.json -T application/json \
  http://localhost:3000/api/aa/sponsor
```

**Targets**:
- 100 requests/second
- < 1% error rate

## Test Data

### Mock Markets

Location: `apps/web/src/mocks/fixtures/`

**markets.json**:
```json
[
  {
    "id": 1,
    "question": "Will BNB reach $1000 by end of 2025?",
    "totalYesShares": "1000000000000000000000",
    "totalNoShares": "500000000000000000000",
    "endTime": 1735689600,
    "resolved": false
  }
]
```

### Test Tokens

**BNB Testnet Faucet**: [testnet.bnbchain.org/faucet-smart](https://testnet.bnbchain.org/faucet-smart)

**tBUSD Faucet**: [localhost:3000/faucet](http://localhost:3000/faucet)

### Test Accounts

Create test accounts:

```bash
# Generate new wallet
npx hardhat run scripts/generate-wallet.ts

# Fund with testnet tokens
# Use faucets above
```

## Continuous Integration

### GitHub Actions

Location: `.github/workflows/ci.yml`

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

### Pre-commit Hooks

Install Husky:

```bash
pnpm add -D husky
npx husky install
```

Add pre-commit hook:

```bash
#!/bin/sh
pnpm lint
pnpm test
```

## Debugging

### Contract Debugging

Use Hardhat console:

```bash
cd contracts
npx hardhat console --network bscTestnet
```

```javascript
const market = await ethers.getContractAt('PredictionMarket', '0x...');
const data = await market.markets(0);
console.log(data);
```

### Frontend Debugging

Enable debug logs:

```bash
DEBUG=* pnpm dev
```

Check console for:
- `✅` Success indicators
- `⚠️` Warnings
- `❌` Errors

### Network Debugging

Monitor transactions:

```bash
# Watch for new blocks
npx hardhat run scripts/watch-blocks.ts --network bscTestnet

# Monitor specific address
npx hardhat run scripts/watch-address.ts --network bscTestnet
```

## Test Checklist

### Before Deployment

- [ ] All contract tests pass
- [ ] API tests pass
- [ ] Gasless flow works
- [ ] AI resolution works
- [ ] Demo mode works
- [ ] Manual testing complete
- [ ] No console errors
- [ ] Performance targets met

### After Deployment

- [ ] Contract verified on BSCScan
- [ ] Faucet working
- [ ] Paymaster funded
- [ ] AI APIs configured
- [ ] Monitoring enabled
- [ ] Error tracking setup

## Troubleshooting

### Tests Failing

**Check**:
1. Node version (20.x required)
2. Dependencies installed (`pnpm install`)
3. Environment variables set
4. Network connection

### Gasless Tests Failing

**Check**:
1. Paymaster API keys valid
2. Paymaster accounts funded
3. EntryPoint address correct
4. Network is BNB Testnet

### AI Tests Failing

**Check**:
1. Groq API key valid
2. Tavily API key valid
3. Rate limits not exceeded
4. Network connection

## Next Steps

- [Deployment](Deployment) - Deploy to production
- [Configuration](Configuration) - Environment setup
- [API Reference](API-Reference) - API documentation
