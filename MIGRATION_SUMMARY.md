# Migration from ConnectKit to Separate Auth/Wallet Concerns

## Summary

Successfully migrated from `@particle-network/connectkit` to separate concerns:
- **Social Login**: `@particle-network/authkit` (ready for integration)
- **Wallet Connectors**: `wagmi` with MetaMask and WalletConnect
- **AA/Gasless**: Existing server-side `/api/aa/sponsor` (unchanged)

## Changes Made

### 1. Package Changes
```bash
# Removed
- @particle-network/connectkit

# Added
+ @particle-network/authkit
+ @particle-network/aa
```

### 2. New Files Created

#### `/src/components/ParticleAuthProvider.tsx`
- Placeholder for Particle Auth initialization
- Currently simplified to avoid SSR issues
- Ready for social login integration when needed

#### `/src/components/WalletModal.tsx`
- Modal for wagmi connector selection
- Displays available connectors (MetaMask, WalletConnect)
- Triggered by custom event from WalletButton

#### `/src/components/ui/dialog.tsx`
- Radix UI dialog component
- Used by WalletModal

### 3. Modified Files

#### `/src/lib/wagmi.ts`
- Added MetaMask connector with explicit target
- Added WalletConnect connector (conditional on project ID)
- Removed generic injected() connector

#### `/src/app/providers.tsx`
- Replaced `ParticleConnectKit` with `ParticleAuthProvider`
- Added `WalletModal` component

#### `/src/components/WalletButton.tsx`
- Simplified to use only wagmi connectors
- Removed Particle Auth hooks (for now)
- Triggers WalletModal via custom event

### 4. Deleted Files
- `/src/components/ConnectKit.tsx` (old ConnectKit wrapper)

## Current State

### ✅ Working
- Wallet connection via MetaMask (injected)
- Wallet connection via WalletConnect
- Existing gasless transaction flow via `/api/aa/sponsor`
- Build completes successfully

### ⚠️ Not Yet Implemented
- Social login UI (Particle Auth integration)
- Combined social + wallet button

## Next Steps (If Social Login Needed)

1. **Initialize Particle Auth in WalletButton**:
```typescript
import { AuthCoreContextProvider } from '@particle-network/authkit';
import { bscTestnet } from '@particle-network/authkit/chains';

// Wrap component with AuthCoreContextProvider
// Use useConnect() hook for social login
```

2. **Update WalletButton** to show both options:
   - Social Login (Email, Google, Twitter, etc.)
   - Wallet Connect (MetaMask, WalletConnect)

3. **Handle dual connection state**:
   - Check both Particle Auth and wagmi connection status
   - Display appropriate user info (name from social or address from wallet)

## Benefits

### Pro
- ✅ Build is stable (no React 19 peer dependency issues)
- ✅ No worker/service worker conflicts
- ✅ Easier to debug (separate concerns)
- ✅ Existing gasless infrastructure unchanged
- ✅ Can add social login incrementally

### Con
- ⚠️ Social and wallet login are separate (not unified in one button)
- ⚠️ Requires custom UI to combine both flows

## Testing

```bash
# Build test
pnpm build

# Dev server
pnpm dev

# Test wallet connection
# 1. Open http://localhost:3000
# 2. Click "Connect Wallet"
# 3. Select MetaMask or WalletConnect
# 4. Approve connection

# Test gasless transaction
# 1. Connect wallet
# 2. Go to /markets
# 3. Try to create market or trade
# 4. Check console for "Gasless sponsored: particle" or "pimlico"
```

## Environment Variables

No changes required. Existing variables still work:
```bash
NEXT_PUBLIC_PARTICLE_PROJECT_ID=...
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=...
NEXT_PUBLIC_PARTICLE_APP_ID=...
NEXT_PUBLIC_WC_PROJECT_ID=...

# Server-side (unchanged)
PARTICLE_PAYMASTER_URL=...
PIMLICO_URL=...
```

## Notes

- MetaMask SDK warning about `@react-native-async-storage` is expected and doesn't affect functionality
- Particle Auth can be added later without breaking existing wallet connections
- Server-side AA/paymaster logic remains unchanged
