const { ethers } = require('ethers');

// Your smart account address
const SMART_ACCOUNT = '0xc30cBFed9503122d021ac500EF9D3C9534B8a984';
const EOA_ADDRESS = '0xdF354416b6F5eDBC20afF4D680e75CB5212da3a0';

// BNB Testnet
const RPC_URL = 'https://bsc-testnet.publicnode.com';

// ERC-20 ABI
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

// tBUSD token address from your app
const TBUSD_ADDRESS = '0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814';

async function checkBalances() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(TBUSD_ADDRESS, ERC20_ABI, provider);
  
  console.log('🔍 Checking tBUSD balances...\n');
  
  try {
    // Check EOA balance
    const eoaBalance = await contract.balanceOf(EOA_ADDRESS);
    const decimals = await contract.decimals();
    const symbol = await contract.symbol();
    const eoaFormatted = ethers.formatUnits(eoaBalance, decimals);
    
    console.log(`EOA (${EOA_ADDRESS}):`);
    console.log(`${symbol}: ${eoaFormatted} ${symbol}\n`);
    
    // Check Smart Account balance
    const smartBalance = await contract.balanceOf(SMART_ACCOUNT);
    const smartFormatted = ethers.formatUnits(smartBalance, decimals);
    
    console.log(`Smart Account (${SMART_ACCOUNT}):`);
    console.log(`${symbol}: ${smartFormatted} ${symbol}\n`);
    
    if (parseFloat(eoaFormatted) === 0 && parseFloat(smartFormatted) === 0) {
      console.log('❌ No tBUSD found in either wallet');
      console.log('💡 Get testnet tBUSD from: https://testnet.bnbchain.org/faucet-smart');
    } else if (parseFloat(eoaFormatted) > 0 && parseFloat(smartFormatted) === 0) {
      console.log('💡 tBUSD is in EOA but not Smart Account');
      console.log('   Need to transfer from EOA to Smart Account for gasless transactions');
    } else if (parseFloat(smartFormatted) > 0) {
      console.log('✅ tBUSD found in Smart Account - should work for gasless transactions');
    }
    
  } catch (error) {
    console.error('Error checking balances:', error.message);
  }
}

checkBalances();