import { ethers } from 'hardhat';

async function main() {
  const BUSD_ADDRESS = '0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814';
  
  console.log('Deploying BUSDFaucet...');
  
  const BUSDFaucet = await ethers.getContractFactory('BUSDFaucet');
  const faucet = await BUSDFaucet.deploy(BUSD_ADDRESS);
  await faucet.waitForDeployment();
  
  const address = await faucet.getAddress();
  console.log('✅ BUSDFaucet deployed to:', address);
  console.log('\n📝 Next steps:');
  console.log('1. Send BUSD to faucet:', address);
  console.log('2. Add to .env.local: NEXT_PUBLIC_FAUCET_ADDRESS=' + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
