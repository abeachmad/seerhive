// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BUSDFaucet {
    IERC20 public busd;
    uint256 public constant FAUCET_AMOUNT = 30 * 10**18; // 30 BUSD
    uint256 public constant COOLDOWN = 24 hours;
    
    mapping(address => uint256) public lastClaim;
    
    event Claimed(address indexed user, uint256 amount);
    
    constructor(address _busd) {
        busd = IERC20(_busd);
    }
    
    function claim() external {
        require(block.timestamp >= lastClaim[msg.sender] + COOLDOWN, "Wait 24h");
        require(busd.balanceOf(address(this)) >= FAUCET_AMOUNT, "Faucet empty");
        
        lastClaim[msg.sender] = block.timestamp;
        require(busd.transfer(msg.sender, FAUCET_AMOUNT), "Transfer failed");
        
        emit Claimed(msg.sender, FAUCET_AMOUNT);
    }
    
    function canClaim(address user) external view returns (bool) {
        return block.timestamp >= lastClaim[user] + COOLDOWN;
    }
    
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (block.timestamp >= lastClaim[user] + COOLDOWN) return 0;
        return (lastClaim[user] + COOLDOWN) - block.timestamp;
    }
}
