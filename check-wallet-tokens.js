const { ethers } = require('ethers');

// BNB Testnet configuration
const RPC_URL = 'https://bsc-testnet.publicnode.com';
const WALLET_ADDRESS = '0x8a3a1be86ff36a536c412706f0a8f25f9672449b';

// ERC-20 ABI for balanceOf function
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// Common BNB Testnet token addresses
const TOKENS = {
  'USDT': '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  'USDC': '0x64544969ed7EBf5f083679233325356EbE738930',
  'BUSD': '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
  'WBNB': '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  'CAKE': '0xFa60D973F7642B748046464e165A65B7323b0DEE',
  'DAI': '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867'
};

async function checkWalletTokens() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  console.log(`Checking tokens for wallet: ${WALLET_ADDRESS}`);
  console.log('BNB Testnet Chain ID: 97\n');
  
  // Check BNB balance
  try {
    const bnbBalance = await provider.getBalance(WALLET_ADDRESS);
    const bnbFormatted = ethers.formatEther(bnbBalance);
    console.log(`BNB: ${bnbFormatted} BNB`);
  } catch (error) {
    console.log('BNB: Error fetching balance');
  }
  
  // Check token balances
  for (const [symbol, address] of Object.entries(TOKENS)) {
    try {
      const contract = new ethers.Contract(address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(WALLET_ADDRESS);
      const decimals = await contract.decimals();
      const formatted = ethers.formatUnits(balance, decimals);
      
      if (parseFloat(formatted) > 0) {
        console.log(`${symbol}: ${formatted} ${symbol}`);
      }
    } catch (error) {
      // Skip tokens that error (might not exist or have issues)
    }
  }
}

checkWalletTokens().catch(console.error);