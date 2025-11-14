const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.getContractAt("PredictionMarket", "0x1F679D174A9fBe4158EABcD24d4A63D6Bcf8f700");
  const market = await contract.markets(0);
  console.log("Market 0:");
  console.log("  Question:", market.question);
  console.log("  EndTime:", new Date(Number(market.endTime) * 1000).toISOString());
  console.log("  Resolved:", market.resolved);
  console.log("  Current time:", new Date().toISOString());
  console.log("  Is active:", !market.resolved && Date.now() < Number(market.endTime) * 1000);
}

main().catch(console.error);
