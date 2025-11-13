import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying PredictionMarket...');

  const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
  const market = await PredictionMarket.deploy();

  await market.waitForDeployment();

  const address = await market.getAddress();
  console.log('PredictionMarket deployed to:', address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});