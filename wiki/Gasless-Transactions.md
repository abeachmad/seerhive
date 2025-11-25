# Gasless Transactions (ERC-4337)

SeerHive implements Account Abstraction (ERC-4337) to provide zero gas fee transactions for users.

## Overview

Users can trade on prediction markets without paying gas fees. The platform sponsors transactions through paymasters.

### Key Benefits

- ✅ **Zero Gas Fees** - Users don't pay transaction costs
- ✅ **Better UX** - No need to hold BNB for gas
- ✅ **Dual Paymaster** - Automatic failover for reliability
- ✅ **Multi-Token Support** - Works with all ERC20 tokens

## Architecture

```
User Action → Frontend → /api/aa/sponsor → Paymaster → Bundler → Chain
                              ↓
                    Try Particle First
                              ↓
                    Fallback to Pimlico
```

### Components

1. **EntryPoint**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
2. **Particle Paymaster**: Primary sponsor
3. **Pimlico Paymaster**: Fallback sponsor
4. **Bundler**: Submits UserOperations to chain

## How It Works

### 1. User Initiates Transaction

```typescript
// User clicks "Buy Shares"
await gaslessService.buySharesGasless({
  marketId: 1,
  side: 'yes',
  token: SUPPORTED_TOKENS.tBUSD,
  amount: '10'
});
```

### 2. Frontend Constructs UserOperation

```typescript
const callData = encodeFunctionData({
  abi: PREDICTION_MARKET_ABI,
  functionName: 'buyShares',
  args: [BigInt(marketId), isYes, tokenAddress, amount]
});

const userOp = {
  sender: smartAccountAddress,
  nonce: await getNonce(),
  initCode: '0x',
  callData,
  callGasLimit: '0x0',
  verificationGasLimit: '0x0',
  preVerificationGas: '0x0',
  maxFeePerGas: '0x0',
  maxPriorityFeePerGas: '0x0',
  paymasterAndData: '0x',
  signature: '0x'
};
```

### 3. Request Sponsorship

```typescript
const response = await fetch('/api/aa/sponsor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userOp,
    entryPoint: ENTRY_POINT_ADDRESS,
    chainId: 97
  })
});

const { paymasterAndData, callGasLimit, verificationGasLimit } = await response.json();
```

### 4. Backend Tries Paymasters

```typescript
// Try Particle first
try {
  const result = await particlePaymaster.sponsor(userOp);
  return { ...result, provider: 'particle' };
} catch (error) {
  console.warn('Particle failed, trying Pimlico...');
  
  // Fallback to Pimlico
  const result = await pimlicoPaymaster.sponsor(userOp);
  return { ...result, provider: 'pimlico', fallback: true };
}
```

### 5. Submit Sponsored Transaction

```typescript
const sponsoredUserOp = {
  ...userOp,
  paymasterAndData,
  callGasLimit,
  verificationGasLimit,
  preVerificationGas
};

const txHash = await bundler.sendUserOperation(sponsoredUserOp);
```

## Paymaster Configuration

### Particle Network (Primary)

**Endpoint**: `https://paymaster.particle.network/chain/97`

**Environment Variables**:
```bash
PARTICLE_PAYMASTER_URL=https://paymaster.particle.network/chain/97
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key
```

**Request Format**:
```typescript
{
  method: 'pm_sponsorUserOperation',
  params: [userOp, entryPoint, { chainId: 97 }]
}
```

**Headers**:
```typescript
{
  'Content-Type': 'application/json',
  'x-project-id': PARTICLE_PROJECT_ID,
  'x-client-key': PARTICLE_CLIENT_KEY
}
```

### Pimlico (Fallback)

**Endpoint**: `https://api.pimlico.io/v2/97/rpc?apikey=YOUR_KEY`

**Environment Variables**:
```bash
PIMLICO_URL=https://api.pimlico.io/v2/97/rpc?apikey=YOUR_KEY
```

**Request Format**:
```typescript
{
  method: 'pm_sponsorUserOperation',
  params: [userOp, { entryPoint }]
}
```

## API Endpoint

### POST /api/aa/sponsor

Sponsors UserOperations with automatic paymaster fallback.

**Request**:
```json
{
  "userOp": {
    "sender": "0x...",
    "nonce": "0x0",
    "initCode": "0x",
    "callData": "0x...",
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
}
```

**Response (Success)**:
```json
{
  "paymasterAndData": "0x...",
  "preVerificationGas": "0xc350",
  "verificationGasLimit": "0x186a0",
  "callGasLimit": "0x30d40",
  "provider": "particle",
  "latency_ms": 234
}
```

**Response (Fallback)**:
```json
{
  "paymasterAndData": "0x...",
  "preVerificationGas": "0xc350",
  "verificationGasLimit": "0x186a0",
  "callGasLimit": "0x30d40",
  "provider": "pimlico",
  "fallback": true,
  "latency_ms": 456
}
```

**Response (Error)**:
```json
{
  "error": "Both paymasters failed",
  "details": {
    "particle": "Rate limit exceeded",
    "pimlico": "Insufficient balance"
  }
}
```

## Testing

### Test Paymaster API

```bash
./scripts/test-sponsor.sh
```

Expected output:
```json
{
  "paymasterAndData": "0x...",
  "provider": "particle",
  "latency_ms": 234
}
```

### Full Gasless Flow

```bash
./scripts/smoke-gasless.sh
```

This tests:
1. UserOperation construction
2. Paymaster sponsorship
3. Transaction submission
4. On-chain verification

### Manual Testing

1. Start dev server: `pnpm dev`
2. Connect wallet (MetaMask on BNB Testnet)
3. Go to `/markets`
4. Toggle "Use Gasless Transaction"
5. Create market or buy shares
6. Check console: `Gasless sponsored: particle`
7. Verify on BSCScan: User paid 0 gas

## Supported Operations

### ✅ Gasless (ERC20 Tokens)

- Buy shares with tBUSD, tUSDT, tUSDC, tDAI, tBTC
- Create markets
- Propose resolutions
- Challenge resolutions
- Claim winnings

### ⚠️ Requires Gas (BNB)

- Buy shares with native BNB (~$0.001 gas)
- Initial smart account deployment

## Limitations

### Rate Limits

**Particle Network**:
- Free tier: Limited requests per day
- May reject during high usage

**Pimlico**:
- Free tier: 10,000 UserOps/month
- Rate limit: 100 req/min

### Token Support

- ✅ All ERC20 tokens fully gasless
- ⚠️ Native BNB requires small gas fee

### Network Support

Currently only BNB Testnet (Chain ID: 97)

Future: BNB Mainnet, opBNB, Ethereum L2s

## Troubleshooting

### "Both paymasters failed"

**Causes**:
- Rate limit exceeded
- Invalid UserOperation
- Network issues

**Solutions**:
1. Wait and retry
2. Check paymaster API keys
3. Verify UserOperation format

### "Insufficient balance"

**Cause**: Paymaster account low on funds

**Solution**: Contact team to refill paymaster

### "Invalid signature"

**Cause**: UserOperation not properly signed

**Solution**: Ensure smart account is initialized

## Security Considerations

### Server-Side Only

All paymaster keys stored server-side:

```bash
# ❌ Never expose in client
NEXT_PUBLIC_PARTICLE_KEY=xxx

# ✅ Server-side only
PARTICLE_PROJECT_ID=xxx
PARTICLE_CLIENT_KEY=xxx
```

### Rate Limiting

API route implements rate limiting:
- Per IP: 100 requests/hour
- Per user: 50 requests/hour

### Validation

All UserOperations validated before sponsorship:
- Valid sender address
- Reasonable gas limits
- Proper callData format

## Cost Analysis

### Traditional Transaction

```
User pays: ~$0.10 per trade
Platform pays: $0
```

### Gasless Transaction

```
User pays: $0
Platform pays: ~$0.10 per trade
```

### Monthly Cost Estimate

```
1000 trades/month × $0.10 = $100/month
```

## Monitoring

### Metrics Tracked

- Paymaster provider usage (particle vs pimlico)
- Sponsorship latency
- Failure rates
- Fallback frequency

### Logs

```typescript
console.log('✅ Gasless sponsored:', provider);
console.warn('⚠️ Particle failed, using Pimlico');
console.error('❌ Both paymasters failed');
```

## Future Improvements

- [ ] Multi-chain support (opBNB, Ethereum L2s)
- [ ] Session keys for batch operations
- [ ] Gas estimation optimization
- [ ] Custom bundler for lower latency
- [ ] Paymaster balance monitoring
- [ ] User-specific rate limits

## Next Steps

- [API Reference](API-Reference) - Full API documentation
- [Testing](Testing) - Comprehensive testing guide
- [Configuration](Configuration) - Environment setup
