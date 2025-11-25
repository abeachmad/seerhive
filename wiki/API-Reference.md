# API Reference

Complete reference for SeerHive's API endpoints.

## Base URL

**Development**: `http://localhost:3000`
**Production**: `https://seerhive.vercel.app` (Coming Soon)

## Authentication

Currently no authentication required for public endpoints.

Future: API keys for rate limiting and premium features.

## Endpoints

### Account Abstraction

#### POST /api/aa/sponsor

Sponsors UserOperations for gasless transactions.

**Request**:
```json
{
  "userOp": {
    "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
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

**Status Codes**:
- `200` - Success
- `400` - Invalid request
- `500` - Server error

---

#### POST /api/aa/sponsor-metamask

Sponsors UserOperations for MetaMask smart accounts.

**Request**: Same as `/api/aa/sponsor`

**Response**: Same as `/api/aa/sponsor`

---

### AI Resolution

#### POST /api/ai/resolve

Resolves a prediction market using AI analysis.

**Request**:
```json
{
  "marketId": 1,
  "question": "Did Bitcoin reach $100,000 in 2024?",
  "resolutionDate": "2024-12-31"
}
```

**Response (Success)**:
```json
{
  "marketId": 1,
  "outcome": "NO",
  "confidence": 100,
  "reasoning": "According to multiple sources, Bitcoin's price on December 31, 2024 was approximately $95,000, which did not reach the $100,000 threshold.",
  "sources": [
    "https://coinmarketcap.com/...",
    "https://coingecko.com/..."
  ],
  "latency_ms": 1772
}
```

**Response (Invalid)**:
```json
{
  "marketId": 1,
  "outcome": "INVALID",
  "confidence": 0,
  "reasoning": "Question is ambiguous or lacks verifiable data",
  "latency_ms": 1234
}
```

**Response (Error)**:
```json
{
  "error": "Failed to resolve market",
  "details": "GROQ_API_KEY not configured"
}
```

**Status Codes**:
- `200` - Success
- `400` - Missing required fields
- `500` - Server error

**Outcome Values**:
- `YES` - Market question is true
- `NO` - Market question is false
- `INVALID` - Question is unresolvable

**Confidence Range**: 0-100
- 90-100: Very high confidence
- 70-89: High confidence
- 50-69: Moderate confidence
- 0-49: Low confidence

---

### Faucet

#### POST /api/faucet

Distributes testnet tokens to users.

**Request**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "txHash": "0x...",
  "amount": "1000000000000000000",
  "token": "BNB"
}
```

**Response (Error)**:
```json
{
  "error": "Rate limit exceeded. Try again in 24 hours."
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid address
- `429` - Rate limit exceeded
- `500` - Server error

**Rate Limits**:
- 1 request per address per 24 hours
- 10 requests per IP per hour

---

#### POST /api/faucet/busd

Distributes tBUSD tokens to users.

**Request**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "txHash": "0x...",
  "amount": "30000000000000000000",
  "token": "tBUSD"
}
```

**Response (Error)**:
```json
{
  "error": "Already claimed in last 24 hours"
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid address
- `429` - Rate limit exceeded
- `500` - Server error

**Amount**: 30 tBUSD per request

**Rate Limits**:
- 1 request per address per 24 hours

---

### Oracle Resolution

#### POST /api/oracle/resolve

Oracle endpoint for market resolution (future UMA integration).

**Request**:
```json
{
  "marketId": 1,
  "outcome": true
}
```

**Response**:
```json
{
  "success": true,
  "marketId": 1,
  "outcome": true
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request
- `500` - Server error

---

## Rate Limits

### Global Limits

- 100 requests per IP per hour
- 1000 requests per IP per day

### Endpoint-Specific Limits

| Endpoint | Limit |
|----------|-------|
| `/api/aa/sponsor` | 50 per user per hour |
| `/api/ai/resolve` | 10 per user per hour |
| `/api/faucet` | 1 per address per 24h |
| `/api/faucet/busd` | 1 per address per 24h |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Error Codes

### 400 Bad Request

Invalid request parameters.

**Example**:
```json
{
  "error": "Missing required field: question"
}
```

### 401 Unauthorized

Authentication required (future).

### 429 Too Many Requests

Rate limit exceeded.

**Example**:
```json
{
  "error": "Rate limit exceeded. Try again in 3600 seconds."
}
```

### 500 Internal Server Error

Server-side error.

**Example**:
```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

---

## Response Format

All API responses follow this structure:

**Success**:
```json
{
  "data": { ... },
  "latency_ms": 234
}
```

**Error**:
```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

---

## CORS

CORS enabled for all origins in development.

Production: Restricted to `seerhive.vercel.app`

---

## Webhooks (Future)

Subscribe to events:
- Market created
- Market resolved
- Trade executed
- Challenge submitted

**Example**:
```json
{
  "event": "market.resolved",
  "data": {
    "marketId": 1,
    "outcome": true,
    "timestamp": 1640995200
  }
}
```

---

## SDK (Future)

TypeScript SDK for easier integration:

```typescript
import { SeerHiveClient } from '@seerhive/sdk';

const client = new SeerHiveClient({
  apiKey: 'your_api_key'
});

// Resolve market
const result = await client.ai.resolve({
  marketId: 1,
  question: 'Did Bitcoin reach $100k?',
  resolutionDate: '2024-12-31'
});

// Sponsor transaction
const sponsored = await client.aa.sponsor(userOp);
```

---

## Testing

### Test Endpoints

```bash
# Test paymaster
./scripts/test-sponsor.sh

# Test AI resolution
./scripts/test-ai-resolve.sh

# Test faucet
curl -X POST http://localhost:3000/api/faucet/busd \
  -H "Content-Type: application/json" \
  -d '{"address": "0x..."}'
```

### Postman Collection

Import collection: [Coming Soon]

---

## Next Steps

- [Gasless Transactions](Gasless-Transactions) - ERC-4337 details
- [AI Resolution](AI-Resolution) - AI system details
- [Testing](Testing) - Testing guide
