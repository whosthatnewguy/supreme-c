// allows us to use solidity smart contract in js runtime enviroment
const DPRKToken = artifacts.require("./DPRKToken.sol");
const DPRKTokenSale = artifacts.require("./DPRKTokenSale.sol");

module.exports = function (deployer) {
  // callback because we need to return the deployed token
  // before we can get its address
  deployer.deploy(DPRKToken, 1000000).then(function() {
    // Token price is 0.001 Ether
    let tokenPrice = 1000000000000000;
    return deployer.deploy(DPRKTokenSale, DPRKToken.address, tokenPrice);
  });

};


