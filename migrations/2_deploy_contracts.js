const DPRKToken = artifacts.require("./DPRKToken.sol");

module.exports = function (deployer) {
  deployer.deploy(DPRKToken);
};
