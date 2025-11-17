// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PredictionMarket is Ownable {
    struct Market {
        string question;
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 endTime;
        bool resolved;
        bool outcome;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public yesShares;
    mapping(uint256 => mapping(address => uint256)) public noShares;
    mapping(uint256 => mapping(address => bool)) public claimed;
    
    uint256 public marketCount;

    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
    event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event PayoutClaimed(uint256 indexed marketId, address indexed claimer, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createMarket(string memory _question, uint256 _duration) external returns (uint256) {
        uint256 marketId = marketCount++;
        markets[marketId] = Market({
            question: _question,
            totalYesShares: 0,
            totalNoShares: 0,
            endTime: block.timestamp + _duration,
            resolved: false,
            outcome: false
        });
        
        emit MarketCreated(marketId, _question, block.timestamp + _duration);
        return marketId;
    }

    function buyShares(uint256 _marketId, bool _isYes, address _token, uint256 _amount) external {
        Market storage market = markets[_marketId];
        require(block.timestamp < market.endTime, "Market ended");
        require(!market.resolved, "Market resolved");
        require(_amount > 0, "Amount must be > 0");

        IERC20 token = IERC20(_token);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        if (_isYes) {
            yesShares[_marketId][msg.sender] += _amount;
            market.totalYesShares += _amount;
        } else {
            noShares[_marketId][msg.sender] += _amount;
            market.totalNoShares += _amount;
        }

        emit SharesPurchased(_marketId, msg.sender, _isYes, _amount);
    }

    function resolveMarket(uint256 _marketId, bool _outcome) external onlyOwner {
        Market storage market = markets[_marketId];
        require(block.timestamp >= market.endTime, "Market not ended");
        require(!market.resolved, "Already resolved");

        market.resolved = true;
        market.outcome = _outcome;

        emit MarketResolved(_marketId, _outcome);
    }

    function claimPayout(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.resolved, "Not resolved");
        require(!claimed[_marketId][msg.sender], "Already claimed");

        uint256 userShares = market.outcome ? yesShares[_marketId][msg.sender] : noShares[_marketId][msg.sender];
        require(userShares > 0, "No shares");

        uint256 totalWinningShares = market.outcome ? market.totalYesShares : market.totalNoShares;
        uint256 totalPool = market.totalYesShares + market.totalNoShares;
        uint256 payout = (userShares * totalPool) / totalWinningShares;

        claimed[_marketId][msg.sender] = true;
        // Note: Payout in same token as majority of deposits (simplified)
        payable(msg.sender).transfer(payout);

        emit PayoutClaimed(_marketId, msg.sender, payout);
    }
}