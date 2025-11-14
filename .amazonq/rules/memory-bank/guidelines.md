# SeerHive - Development Guidelines

## Code Quality Standards

### TypeScript Configuration
- **Strict mode enabled**: All TypeScript files use strict type checking
- **Explicit types**: Function parameters and return types are explicitly typed
- **No implicit any**: Avoid using `any` type; use proper type definitions
- **Type imports**: Use `import type` for type-only imports to optimize bundle size
  ```typescript
  import type { BaseContract, BigNumberish, BytesLike } from "ethers";
  ```

### File Organization
- **Client components**: Mark with `'use client'` directive at the top of file
- **Server components**: Default for Next.js App Router (no directive needed)
- **API routes**: Use Next.js App Router convention in `app/api/` directory
- **Type definitions**: Generated types in `typechain-types/` (auto-generated, do not edit)

### Naming Conventions
- **Components**: PascalCase (e.g., `TradeDialog`, `MarketCard`)
- **Functions**: camelCase (e.g., `handleTrade`, `buySharesGasless`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `PREDICTION_MARKET_ADDRESS`, `PREDICTION_MARKET_ABI`)
- **Private parameters**: Prefix with underscore (e.g., `_marketId`, `_isYes`, `_outcome`)
- **Boolean variables**: Prefix with `is`, `has`, `should` (e.g., `isDemo`, `useGasless`, `hasGaslessAvailable`)
- **State variables**: Descriptive names (e.g., `loading`, `amount`, `side`)

### Code Formatting
- **Indentation**: 2 spaces (consistent across all files)
- **Semicolons**: Required at end of statements
- **Quotes**: Single quotes for strings (except JSX attributes use double quotes)
- **Trailing commas**: Used in multi-line objects and arrays
- **Line length**: Keep reasonable (no strict limit, but break long lines logically)

## Structural Conventions

### React Component Structure
Standard component organization pattern:
```typescript
'use client'; // If client component

// 1. External imports
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

// 2. Internal imports
import { useStore } from '@/lib/store';
import { PREDICTION_MARKET_ADDRESS } from '@/lib/contracts';

// 3. Type definitions
interface ComponentProps {
  market: any;
  onClose: () => void;
}

// 4. Component definition
export function Component({ market, onClose }: ComponentProps) {
  // 4a. State declarations
  const [state, setState] = useState('');
  
  // 4b. Hooks
  const { address } = useAccount();
  
  // 4c. Derived values
  const demo = isDemo();
  
  // 4d. Event handlers
  const handleAction = async () => {
    // Implementation
  };
  
  // 4e. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 4f. Render
  return (
    // JSX
  );
}
```

### API Route Structure
Standard API route pattern:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate input
    const { userOp, entryPoint, chainId } = await req.json();
    
    if (!userOp || !entryPoint || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 2. Business logic with timing
    const t0 = Date.now();
    
    // 3. Try-catch with fallback pattern
    try {
      const result = await primaryService.execute();
      return NextResponse.json({
        ...result,
        provider: 'primary',
        latency_ms: Date.now() - t0,
      });
    } catch (primaryError) {
      // Fallback logic
      try {
        const result = await fallbackService.execute();
        return NextResponse.json({
          ...result,
          provider: 'fallback',
          latency_ms: Date.now() - t0,
          fallback: true,
        });
      } catch (fallbackError) {
        return NextResponse.json(
          { error: 'All services failed' },
          { status: 502 }
        );
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
```

### Smart Contract Test Structure
Standard Hardhat test pattern:
```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ContractType } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('ContractName', function () {
  // 1. Declare contract and signer variables
  let contract: ContractType;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  // 2. Setup before each test
  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('ContractName');
    contract = await Factory.deploy();
  });

  // 3. Test cases with descriptive names
  it('Should perform expected action', async function () {
    const tx = await contract.method(args);
    await tx.wait();
    
    const result = await contract.getter();
    expect(result).to.equal(expectedValue);
  });
});
```

## Semantic Patterns

### Error Handling Pattern
**Frequency: 5/5 files**

Consistent error handling with logging and user feedback:
```typescript
try {
  const result = await operation();
  console.log('Operation success:', result);
} catch (error) {
  console.error('Operation failed:', error);
  setLoading(false);
  return; // Early return on error
}
```

### Async/Await Pattern
**Frequency: 4/5 files**

Always use async/await for asynchronous operations, never raw promises:
```typescript
const handleAction = async () => {
  setLoading(true);
  try {
    const result = await asyncOperation();
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### Conditional Rendering Pattern
**Frequency: 4/5 files**

Use ternary operators for inline conditional rendering:
```typescript
<span className={useGasless ? 'text-green-400' : 'text-slate-300'}>
  {useGasless && gaslessAvailable ? 'FREE ⚡' : '~0.001 BNB'}
</span>
```

### State Update Pattern
**Frequency: 4/5 files**

Batch related state updates and use functional updates when depending on previous state:
```typescript
// Batch updates
setLoading(true);
const result = await operation();
setLoading(false);

// Functional update
updateMarket(market.id, {
  totalVolume: newVolume,
  yesPrice: calculateNewPrice(),
  sparkline: [...market.sparkline, newValue].slice(-10),
});
```

### Environment Variable Access Pattern
**Frequency: 4/5 files**

Server-side environment variables without `NEXT_PUBLIC_` prefix:
```typescript
// Server-side only (API routes, config files)
process.env.PARTICLE_PAYMASTER_URL
process.env.PRIVATE_KEY

// Client-side accessible
process.env.NEXT_PUBLIC_CHAIN_ID
process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
```

## Internal API Usage

### wagmi Hooks Pattern
**Frequency: 3/5 files**

Standard wagmi hook usage for blockchain interactions:
```typescript
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const { address } = useAccount();
const { writeContract, data: hash } = useWriteContract();
const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

// Write to contract
writeContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: CONTRACT_ABI,
  functionName: 'functionName',
  args: [arg1, arg2],
  value: parseEther(amount),
});
```

### viem Utilities Pattern
**Frequency: 3/5 files**

Use viem for Ethereum value parsing and formatting:
```typescript
import { parseEther } from 'viem';

// Convert string to wei
const weiValue = parseEther(amount);

// Use BigInt for large numbers
const marketId = BigInt(market.id);
```

### Zustand Store Pattern
**Frequency: 3/5 files**

Access global state through Zustand store:
```typescript
import { useStore } from '@/lib/store';

const { addTrade, updateMarket, updateUserReputation } = useStore();

// Update store
addTrade(tradeData);
updateMarket(marketId, updates);
```

### TypeChain Contract Types
**Frequency: 3/5 files**

Use generated TypeChain types for type-safe contract interactions:
```typescript
import { PredictionMarket } from '../typechain-types';

// Typed contract instance
let market: PredictionMarket;

// Typed method calls with IntelliSense
await market.createMarket('Question?', 86400);
const shares = await market.yesShares(0, user.address);
```

### Next.js API Response Pattern
**Frequency: 2/5 files**

Standard NextResponse usage with proper status codes:
```typescript
import { NextRequest, NextResponse } from 'next/server';

// Success response
return NextResponse.json({
  data: result,
  provider: 'service-name',
  latency_ms: latency,
});

// Error response with status
return NextResponse.json(
  { error: 'Error message', details: errorDetails },
  { status: 400 } // or 500, 502, etc.
);
```

## Code Idioms

### Demo Mode Check
**Frequency: 3/5 files**

Consistent demo mode detection:
```typescript
import { isDemo } from '@/lib/demoFlags';

const demo = isDemo();

if (!demo && address) {
  // On-chain logic
} else {
  // Demo logic
}
```

### Loading State Management
**Frequency: 4/5 files**

Standard loading state pattern:
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await operation();
  } finally {
    setLoading(false);
  }
};

// Disable button during loading
<Button disabled={loading || isConfirming}>
  {loading ? 'Processing...' : 'Submit'}
</Button>
```

### Gasless Transaction Pattern
**Frequency: 2/5 files**

Conditional gasless vs regular transaction:
```typescript
if (useGasless && gaslessAvailable) {
  const result = await gaslessService.buySharesGasless(
    marketId,
    isYes,
    parseEther(amount)
  );
  console.log('Gasless sponsored:', result.provider, result.latency_ms + 'ms');
} else {
  writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'buyShares',
    args: [marketId, isYes],
    value: parseEther(amount),
  });
}
```

### Fallback Service Pattern
**Frequency: 2/5 files**

Primary service with automatic fallback:
```typescript
try {
  const result = await primaryService.execute();
  return { ...result, provider: 'primary' };
} catch (primaryError) {
  console.warn('Primary failed, trying fallback', primaryError.message);
  try {
    const result = await fallbackService.execute();
    return { ...result, provider: 'fallback', fallback: true };
  } catch (fallbackError) {
    throw new Error('All services failed');
  }
}
```

### Tailwind Conditional Classes
**Frequency: 4/5 files**

Template literal for dynamic Tailwind classes:
```typescript
className={`base-classes ${
  condition
    ? 'conditional-true-classes'
    : 'conditional-false-classes'
}`}

// Example
className={`p-4 rounded-lg border-2 transition-all ${
  side === 'yes'
    ? 'border-green-500 bg-green-500/20'
    : 'border-slate-700 bg-slate-900/50'
}`}
```

## Annotations and Comments

### Auto-generated File Headers
**Frequency: 1/5 files (TypeChain)**

TypeChain generated files include warning headers:
```typescript
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
```

### Console Logging Pattern
**Frequency: 4/5 files**

Structured logging with context:
```typescript
// Success logs
console.log('[sponsor] Particle success', { latency, chainId });
console.log('Gasless sponsored:', result.provider, result.latency_ms + 'ms');

// Warning logs
console.warn('[sponsor] Particle failed, trying Pimlico', error.message);

// Error logs
console.error('[sponsor] Both providers failed', {
  particle: particleError.message,
  pimlico: pimlicoError.message,
});
console.error('Trade failed:', error);
```

### Inline Comments
**Frequency: 3/5 files**

Minimal inline comments, only for complex logic:
```typescript
// Demo or after on-chain success
await new Promise(resolve => setTimeout(resolve, 1000));

// Update market prices
const priceChange = parseFloat(amount) / (newVolume || 1) * 0.1;

// Fallback to Pimlico
try {
  const pimlico = new PimlicoPaymaster(process.env.PIMLICO_URL!);
```

### Section Comments
**Frequency: 2/5 files**

Numbered section comments in structured code:
```typescript
// 1. Parse and validate input
const { userOp, entryPoint, chainId } = await req.json();

// 2. Business logic with timing
const t0 = Date.now();

// 3. Try-catch with fallback pattern
try {
  // Implementation
}
```

## Best Practices

### Security
- **Server-side secrets**: Never expose paymaster keys or private keys to client
- **Input validation**: Always validate API inputs before processing
- **Type safety**: Use TypeScript strict mode to catch errors at compile time
- **Reentrancy protection**: Smart contracts use OpenZeppelin's ReentrancyGuard

### Performance
- **Lazy loading**: Use dynamic imports for heavy components
- **Memoization**: Cache expensive computations
- **Batch updates**: Group related state updates together
- **Optimistic UI**: Update UI immediately, sync with blockchain later

### Testing
- **Unit tests**: Test individual functions and components
- **Integration tests**: Test contract interactions end-to-end
- **Hardhat tests**: Use beforeEach for clean test state
- **Expect assertions**: Use chai expect for readable test assertions

### Accessibility
- **Semantic HTML**: Use proper HTML elements (button, label, input)
- **ARIA labels**: Add aria-label for icon-only buttons
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Focus states**: Maintain visible focus indicators

### Code Organization
- **Single responsibility**: Each function/component does one thing well
- **DRY principle**: Extract repeated logic into utilities
- **Path aliases**: Use `@/` for absolute imports from src directory
- **Barrel exports**: Use index.ts for cleaner imports from directories
