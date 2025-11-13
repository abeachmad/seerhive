import { expect } from 'chai';
import { ethers } from 'hardhat';
import { PredictionMarket } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('PredictionMarket', function () {
  let market: PredictionMarket;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
    market = await PredictionMarket.deploy();
  });

  it('Should create a market', async function () {
    const tx = await market.createMarket('Test question?', 86400);
    await tx.wait();
    
    const marketData = await market.markets(0);
    expect(marketData.question).to.equal('Test question?');
    expect(marketData.resolved).to.equal(false);
  });

  it('Should allow buying shares', async function () {
    await market.createMarket('Test question?', 86400);
    
    await market.connect(user1).buyShares(0, true, { value: ethers.parseEther('1') });
    
    const shares = await market.yesShares(0, user1.address);
    expect(shares).to.equal(ethers.parseEther('1'));
  });

  it('Should resolve market', async function () {
    await market.createMarket('Test question?', 1);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await market.resolveMarket(0, true);
    
    const marketData = await market.markets(0);
    expect(marketData.resolved).to.equal(true);
    expect(marketData.outcome).to.equal(true);
  });
});