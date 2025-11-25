# FAQ

Frequently asked questions about SeerHive.

## General Questions

### What is SeerHive?

SeerHive is a decentralized prediction market platform on BNB Chain where users can bet on real-world events with AI-powered resolution and zero gas fees.

### How does it work?

1. Create or browse prediction markets
2. Buy YES or NO shares based on your prediction
3. AI automatically resolves markets using real-time web data
4. Winners claim proportional payouts from the pool

### Is it free to use?

Yes! SeerHive uses ERC-4337 account abstraction to sponsor gas fees for users. You only need tokens to trade (BNB, tBUSD, etc.).

### What makes SeerHive different?

- **AI Resolution**: Markets resolve in seconds vs 24-48h manual process
- **Zero Gas Fees**: Trade without paying transaction costs
- **Real-time Data**: Web scraping provides current event information
- **BNB Chain Native**: Lower costs and faster finality

## Getting Started

### How do I start using SeerHive?

1. Visit the platform
2. Connect wallet (MetaMask, Particle Network)
3. Get testnet tokens from faucet
4. Start trading on markets

### Do I need a crypto wallet?

For on-chain mode, yes. But you can:
- Use MetaMask (traditional wallet)
- Use Particle Network (social login with Google/Twitter)
- Try demo mode (no wallet required)

### Where do I get testnet tokens?

- **BNB**: [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- **tBUSD**: [SeerHive Faucet](/faucet) - 30 tBUSD every 24h
- **Other tokens**: [BNB Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)

### What is demo mode?

Demo mode lets you test all features without wallet connection or blockchain interactions. Perfect for learning the platform.

Enable: `NEXT_PUBLIC_DEMO=1`

## Trading

### What tokens can I trade with?

**BNB Testnet**:
- BNB (native token)
- tBUSD (testnet BUSD)
- tUSDT (testnet USDT)
- tUSDC (testnet USDC)
- tDAI (testnet DAI)
- tBTC (testnet BTC)

### How do gasless transactions work?

SeerHive sponsors your transactions using ERC-4337 account abstraction. The platform pays gas fees so you don't have to.

**Note**: Gasless works for all ERC20 tokens. BNB requires small gas fee (~$0.001).

### How are payouts calculated?

```
Your Payout = (Your Winning Shares / Total Winning Shares) × Total Pool
```

**Example**:
- You own 100 YES shares
- Total YES shares: 1000
- Total pool: 2000 tokens
- Your payout: (100/1000) × 2000 = 200 tokens

### Can I sell my shares before resolution?

Not yet. Currently, you can only claim winnings after market resolves. Secondary market trading is planned for future.

## AI Resolution

### How does AI resolution work?

1. Market expires
2. User triggers AI resolution
3. Tavily AI searches web for real-time context
4. Groq Llama 3.3 70B analyzes and determines outcome
5. AI proposes resolution on-chain
6. 24-hour challenge window begins

### Is AI resolution accurate?

AI provides confidence scores (0-100) with reasoning. For objective questions with verifiable data, accuracy is very high (95%+).

### What if AI is wrong?

Anyone can challenge the resolution within 24 hours by posting a dispute bond. DAO votes on disputes.

### What types of questions work best?

**Good**:
- "Will Bitcoin reach $100k by Dec 31, 2025?" (verifiable price data)
- "Will Trump win 2024 election?" (official results)
- "Will Ethereum ETF be approved in Q1 2025?" (regulatory announcement)

**Bad**:
- "Will AI become sentient?" (subjective, no clear criteria)
- "Will world peace be achieved?" (ambiguous definition)

### How much does AI resolution cost?

~$0.01 per resolution (Tavily search + Groq inference). Much cheaper than manual resolution ($10-50).

## Gasless Transactions

### Why do I need gas for BNB but not ERC20 tokens?

ERC-4337 paymasters can sponsor ERC20 token approvals and transfers. Native BNB transfers require gas from sender's account.

### What if gasless transaction fails?

The platform automatically falls back from Particle to Pimlico paymaster. If both fail, you'll see an error message.

### Can I use my own gas instead?

Yes, toggle off "Use Gasless Transaction" in the UI to pay gas yourself.

### How many gasless transactions can I make?

No hard limit per user, but platform has rate limits:
- 50 gasless transactions per user per hour
- 100 per IP per hour

## Technical Questions

### What blockchain is SeerHive on?

**Testnet**: BNB Testnet (Chain ID: 97)
**Mainnet**: BNB Mainnet (Chain ID: 56) - Coming Soon

### What is the contract address?

**PredictionMarket**: `0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127`

View on [BSCScan](https://testnet.bscscan.com/address/0xc6Dd26D3eE0F58fAb15Dc87bEe3A66896B6D4127)

### Is the contract audited?

Not yet. Audit planned before mainnet deployment. Use testnet at your own risk.

### Can I run my own instance?

Yes! SeerHive is open source. See [Getting Started](Getting-Started) guide.

### What APIs does SeerHive use?

- **Groq**: LLM for AI reasoning
- **Tavily**: Web search for real-time data
- **Particle Network**: Paymaster for gasless transactions
- **Pimlico**: Backup paymaster

## Troubleshooting

### "Transaction failed" error

**Possible causes**:
1. Insufficient balance
2. Market expired or resolved
3. Network congestion
4. Paymaster rate limit

**Solutions**:
1. Check token balance
2. Verify market status
3. Wait and retry
4. Try without gasless mode

### "Wallet connection failed"

**Solutions**:
1. Ensure wallet is on BNB Testnet (Chain ID: 97)
2. Refresh page and reconnect
3. Try different wallet (MetaMask, Particle)
4. Clear browser cache

### "Contract not found"

**Solutions**:
1. Verify you're on BNB Testnet
2. Check contract address in config
3. Ensure RPC URL is correct

### "Gasless transaction rejected"

**Possible causes**:
1. Paymaster rate limit exceeded
2. Paymaster out of funds
3. Invalid UserOperation

**Solutions**:
1. Wait 1 hour and retry
2. Contact team to refill paymaster
3. Try without gasless mode

### "AI resolution failed"

**Possible causes**:
1. API rate limit exceeded
2. Invalid API keys
3. Network timeout

**Solutions**:
1. Wait and retry
2. Check API key configuration
3. Contact support

## Security & Privacy

### Is my wallet safe?

Yes. SeerHive never asks for private keys. Wallet connection uses standard Web3 protocols (wagmi, Particle Network).

### What data does SeerHive collect?

- Wallet addresses (public)
- Transaction history (on-chain)
- Market interactions (on-chain)

No personal information collected unless you use social login (Particle Network).

### Can I remain anonymous?

Yes. Use MetaMask with anonymous wallet. No KYC required.

### What if I lose my private key?

If using MetaMask: You lose access to funds (standard crypto wallet risk)

If using Particle Network: Social recovery available through your login method

## Roadmap & Features

### When is mainnet launch?

Planned for Q2 2026 after:
- Smart contract audit
- Beta testing completion
- Feature polish

### What features are coming?

**Q1 2026**:
- UMA Optimistic Oracle integration
- Challenge/dispute UI
- Copy trading
- Reputation system

**Q2 2026**:
- Mobile PWA
- Advanced AI (multiple data sources)
- DAO governance
- Liquidity pools

### Can I contribute?

Yes! SeerHive is open source. See [Contributing](Contributing) guide.

### How can I provide feedback?

- GitHub Issues: [github.com/abeachmad/seerhive/issues](https://github.com/abeachmad/seerhive/issues)
- Discord: [Coming Soon]
- Twitter: [Coming Soon]

## Economics

### How does SeerHive make money?

**Current**: Platform is free (subsidized)

**Future**:
- Trading fees (1-2%)
- Premium features
- API access fees

### What are the costs?

**For Users**: $0 (gasless transactions)

**For Platform**:
- Paymaster: ~$0.10 per transaction
- AI Resolution: ~$0.01 per market
- Infrastructure: ~$150/month (testnet)

### Is there a token?

Not yet. Token planned for:
- Governance voting
- Staking for dispute resolution
- Fee discounts

## Support

### How do I get help?

1. Check this FAQ
2. Read [Documentation](Home)
3. Open GitHub Issue
4. Contact team (Discord/Twitter coming soon)

### How do I report a bug?

Open issue on GitHub: [github.com/abeachmad/seerhive/issues](https://github.com/abeachmad/seerhive/issues)

Include:
- Description of bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### How do I request a feature?

Open feature request on GitHub with:
- Use case description
- Why it's valuable
- Proposed implementation (optional)

## Legal

### Is prediction market legal?

Depends on jurisdiction. SeerHive is:
- Decentralized (no central authority)
- Testnet only (no real money)
- Educational/experimental

**Consult local laws before using with real funds.**

### What is the license?

MIT License - see [LICENSE](https://github.com/abeachmad/seerhive/blob/main/LICENSE)

### Terms of Service?

Coming soon for mainnet launch.

## Next Steps

- [Getting Started](Getting-Started) - Start using SeerHive
- [Architecture](Architecture) - Understand the system
- [API Reference](API-Reference) - Explore APIs
