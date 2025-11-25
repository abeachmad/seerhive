# Smart Contracts

SeerHive's smart contracts handle market creation, trading, and resolution on BNB Chain.

## Deployed Contracts

### PredictionMarket.sol

**Address**: `0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127`

**Network**: BNB Testnet (Chain ID: 97)

**Explorer**: [View on BSCScan](https://testnet.bscscan.com/address/0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127)

## Contract Overview

### Key Features

- Multi-token support (BNB + ERC20 tokens)
- Share-based trading system
- Optimistic resolution with 24h challenge window
- Dispute mechanism with bond requirements
- Owner-controlled finalization

### State Variables

```solidity
uint256 public marketCount;
mapping(uint256 => Market) public markets;
mapping(uint256 => mapping(address => mapping(bool => uint256))) public userShares;
mapping(uint256 => Resolution) public resolutions;
```

## Core Functions

### 1. Create Market

```solidity
function createMarket(
    string memory _question,
    uint256 _duration
) external returns (uint256)
```

**Parameters**:
- `_question`: Market question (e.g., "Will BNB reach $1000?")
- `_duration`: Time until market expires (in seconds)

**Returns**: Market ID

**Example**:
```typescript
const tx = await contract.createMarket(
  "Will Bitcoin reach $100k in 2025?",
  86400 * 365 // 1 year
);
```

### 2. Buy Shares

```solidity
function buyShares(
    uint256 _marketId,
    bool _isYes,
    address _token,
    uint256 _amount
) public payable nonReentrant
```

**Parameters**:
- `_marketId`: Market ID
- `_isYes`: true for YES, false for NO
- `_token`: Token address (0x0 for BNB)
- `_amount`: Amount to spend

**Requirements**:
- Market must be active (not expired, not resolved)
- For ERC20: User must approve contract first
- For BNB: msg.value must equal _amount

**Example**:
```typescript
// Buy YES shares with tBUSD
const amount = parseUnits("10", 18);
await contract.buyShares(marketId, true, tBUSD_ADDRESS, amount);

// Buy NO shares with BNB
await contract.buyShares(marketId, false, ethers.ZeroAddress, amount, {
  value: amount
});
```

### 3. Propose Resolution

```solidity
function proposeResolution(
    uint256 _marketId,
    bool _outcome
) external
```

**Parameters**:
- `_marketId`: Market ID
- `_outcome`: true for YES, false for NO

**Requirements**:
- Market must be expired
- Market must not be resolved
- No existing resolution proposal

**Starts**: 24-hour challenge window

**Example**:
```typescript
await contract.proposeResolution(marketId, true); // Propose YES
```

### 4. Challenge Resolution

```solidity
function challengeResolution(
    uint256 _marketId
) external payable
```

**Parameters**:
- `_marketId`: Market ID

**Requirements**:
- Resolution must be proposed
- Within 24-hour challenge window
- Must send dispute bond (0.01 BNB)

**Example**:
```typescript
await contract.challengeResolution(marketId, {
  value: parseEther("0.01")
});
```

### 5. Finalize Market

```solidity
function finalizeMarket(
    uint256 _marketId,
    bool _outcome
) external onlyOwner
```

**Parameters**:
- `_marketId`: Market ID
- `_outcome`: Final outcome (true = YES, false = NO)

**Requirements**:
- Only owner can call
- Market must be expired
- Called after challenge window or dispute resolution

**Example**:
```typescript
await contract.finalizeMarket(marketId, true); // Finalize as YES
```

### 6. Claim Winnings

```solidity
function claimWinnings(
    uint256 _marketId
) external nonReentrant
```

**Parameters**:
- `_marketId`: Market ID

**Requirements**:
- Market must be finalized
- User must have winning shares
- User hasn't claimed yet

**Payout Calculation**:
```
userPayout = (userShares / totalWinningShares) * totalPool
```

**Example**:
```typescript
await contract.claimWinnings(marketId);
```

## Data Structures

### Market Struct

```solidity
struct Market {
    string question;
    uint256 totalYesShares;
    uint256 totalNoShares;
    uint256 endTime;
    bool resolved;
    bool outcome;
    mapping(address => uint256) tokenPools;
}
```

### Resolution Struct

```solidity
struct Resolution {
    bool proposed;
    bool outcome;
    uint256 proposalTime;
    bool challenged;
    address challenger;
}
```

## Events

```solidity
event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isYes, uint256 amount);
event ResolutionProposed(uint256 indexed marketId, bool outcome, uint256 proposalTime);
event ResolutionChallenged(uint256 indexed marketId, address challenger);
event MarketFinalized(uint256 indexed marketId, bool outcome);
event WinningsClaimed(uint256 indexed marketId, address indexed claimer, uint256 amount);
```

## Token Support

### Supported Tokens (BNB Testnet)

| Token | Address | Decimals |
|-------|---------|----------|
| BNB | `0x0000000000000000000000000000000000000000` | 18 |
| tBUSD | `0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814` | 18 |
| tUSDT | `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd` | 18 |
| tUSDC | `0x64544969ed7EBf5f083679233325356EbE738930` | 18 |
| tDAI | `0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867` | 18 |
| tBTC | `0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8` | 18 |

### ERC20 Approval

Before buying shares with ERC20 tokens:

```typescript
// 1. Approve contract to spend tokens
const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
await erc20.approve(PREDICTION_MARKET_ADDRESS, amount);

// 2. Buy shares
await contract.buyShares(marketId, isYes, tokenAddress, amount);
```

## Security Features

### ReentrancyGuard

All state-changing functions use `nonReentrant` modifier:
- `buyShares()`
- `claimWinnings()`

### Access Control

Owner-only functions:
- `finalizeMarket()` - Prevents unauthorized resolution

### Time Locks

- 24-hour challenge window after resolution proposal
- Markets can't be resolved before expiry

### Validation

- Market existence checks
- Balance verification before transfers
- Duplicate claim prevention

## Gas Optimization

### Storage Patterns

- Packed structs for efficient storage
- Mappings instead of arrays for user data
- Minimal storage writes

### Function Optimization

- Early returns on validation failures
- Batch operations where possible
- Efficient loop patterns

## Testing

### Run Tests

```bash
cd contracts
pnpm test
```

### Test Coverage

- Market creation
- Share purchases (BNB + ERC20)
- Resolution proposal
- Challenge mechanism
- Finalization
- Winnings claims
- Edge cases and reverts

### Example Test

```typescript
it("Should allow buying YES shares", async function () {
  const marketId = 0;
  const amount = parseEther("1");
  
  await market.buyShares(marketId, true, ethers.ZeroAddress, amount, {
    value: amount
  });
  
  const shares = await market.userShares(marketId, user1.address, true);
  expect(shares).to.equal(amount);
});
```

## Deployment

### Deploy to BNB Testnet

```bash
cd contracts
cp .env.example .env
# Add PRIVATE_KEY and BSC_TESTNET_RPC
pnpm deploy:testnet
```

### Verify Contract

```bash
npx hardhat verify --network bscTestnet 0xYourContractAddress
```

## Upgradeability

Current contract is **not upgradeable** for security and simplicity.

Future versions may implement:
- Proxy pattern (UUPS or Transparent)
- Multi-signature governance
- Timelock for critical operations

## Known Limitations

1. **Single Pool**: All tokens in one pool (no per-token pools)
2. **No Partial Claims**: Must claim all winnings at once
3. **Fixed Challenge Period**: 24 hours (not configurable per market)
4. **Owner Dependency**: Finalization requires owner action

## Roadmap

- [ ] Multi-token pool management
- [ ] Partial claim support
- [ ] Configurable challenge periods
- [ ] DAO-based finalization
- [ ] Market factory pattern
- [ ] Liquidity pools (AMM-style)

## Next Steps

- [Gasless Transactions](Gasless-Transactions) - ERC-4337 integration
- [API Reference](API-Reference) - Contract interaction via API
- [Testing](Testing) - Comprehensive testing guide
