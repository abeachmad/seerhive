# Quick Start - Post Migration

## What Changed?

Migrated from ConnectKit to separate concerns:
- **Wallet Login**: wagmi (MetaMask, WalletConnect) ✅ Working
- **Social Login**: Particle Auth (ready to add) ⏳ Optional
- **Gasless AA**: Server-side (unchanged) ✅ Working

## Run the App

```bash
# Install dependencies (if needed)
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Test Wallet Connection

1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. Select MetaMask or WalletConnect
4. Approve connection in wallet
5. Address should appear in button

## Test Gasless Transaction

1. Connect wallet (see above)
2. Navigate to /markets
3. Click "Create Market" or trade on existing market
4. Enable "Use Gasless Transaction" toggle
5. Submit transaction
6. Check console for: `Gasless sponsored: particle` or `pimlico`
7. Verify on BSCScan that gas was paid by paymaster

## File Structure

```
apps/web/src/
├── components/
│   ├── ParticleAuthProvider.tsx  # Placeholder for social login
│   ├── WalletButton.tsx          # Wallet connection button
│   ├── WalletModal.tsx           # Connector selection modal
│   └── ui/
│       └── dialog.tsx            # Dialog component
├── lib/
│   ├── wagmi.ts                  # Wagmi config (MetaMask, WalletConnect)
│   └── gasless.ts                # Gasless service (unchanged)
└── app/
    ├── providers.tsx             # App providers
    └── api/aa/sponsor/           # Paymaster API (unchanged)
```

## Adding Social Login (Optional)

If you want to add social login later:

1. Update `ParticleAuthProvider.tsx` with AuthCoreContextProvider
2. Update `WalletButton.tsx` to use `useConnect()` from authkit
3. Add social login options to button dropdown

See `MIGRATION_SUMMARY.md` for detailed steps.

## Troubleshooting

### Build fails
```bash
# Clean and rebuild
rm -rf .next
pnpm build
```

### Wallet won't connect
- Check MetaMask is installed
- Check you're on BNB Testnet (Chain ID: 97)
- Check WalletConnect project ID in .env.local

### Gasless not working
- Check server-side env vars (PARTICLE_PAYMASTER_URL, PIMLICO_URL)
- Check `/api/aa/sponsor` endpoint is responding
- Check console for error messages

## Key Benefits

✅ Stable build (no React 19 conflicts)
✅ No worker/service worker issues  
✅ Easier to debug (separate concerns)
✅ Existing gasless flow unchanged
✅ Can add social login incrementally
