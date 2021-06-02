pragma solidity ^0.5.16;

import "./DPRKToken.sol";

// declare contract
contract DPRKTokenSale {
    // state variable - data written to disk, not stored in memmory
    address admin;
    DPRKToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    event Sell(address _buyer, uint256 _amount);

    constructor(DPRKToken _tokenContract, uint256 _tokenPrice) public {
        // assign an admin (must not expose identity)
        // msg.sender is address of the person who deployed contract
        admin = msg.sender;
         // token contract
        tokenContract = _tokenContract;
        // set token price (eth)
        tokenPrice = _tokenPrice;
    }

    // Safe multiply function with ds-math library
    // internal means can be called externally, pure means not creating transactions or reading/writing data
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buy tokens - public bc will be called via api / payable declaration solidity specific
    function buyTokens(uint256 _numberOfTokens) public payable {

        // Require that value is equal to tokens w/ safe math
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Track # of tokens sold
        tokensSold += _numberOfTokens;

        // Emit/trigger sale event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // Ending token sale
    function endSale() public {
        // Require only admin can do this
        require(msg.sender == admin);
        // Transfer remaining tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // Destroy contract
        suicide(admin);
    }
}