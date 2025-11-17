const hre = require("hardhat");

async function main() {
  const contractAddress = "0x27CF1D1d3E7270886E6e715dBd2CdECdc277a719";
  const market = await hre.ethers.getContractAt("PredictionMarket", contractAddress);
  
  const question = "Will BTC reach $100k in 2025?";
  const duration = 30 * 24 * 60 * 60; // 30 days
  
  const tx = await market.createMarket(question, duration);
  await tx.wait();
  
  const marketCount = await market.marketCount();
  console.log("Market created! ID:", (marketCount - 1n).toString());
}

main().catch(console.error);
