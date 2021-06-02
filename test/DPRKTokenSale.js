const _deploy_contracts = require("../migrations/2_deploy_contracts");

// import the token
const DPRKTokenSale = artifacts.require('./DPRKTokenSale.sol');
const DPRKToken = artifacts.require('./DPRKToken.sol');

// gives us access to accounts
contract('DPRKTokenSale', function(accounts) {
    let tokenInstance;
    let tokenSaleInstance;
    let admin = accounts[0];
    let buyer = accounts[1];
    let tokenPrice = 1000000000000000; // in wei
    let numberOfTokens;
    // tokens to provision to someone
    let tokensAvailable = 750000;

    it('initializes the contract with the correct values', function() {
        // return a deployed instance of contract
        return  DPRKTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            // see if it has address and works
            return tokenSaleInstance.address
        }).then(function(address) {
            // 0x0 is 0 in hexadecimal notation - mean cannot equal 0
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    it('facilitates token buying', function() {
        return DPRKToken.deployed().then(function(instance) {
            // Grab token instance first
            tokenInstance = instance;
            return DPRKTokenSale.deployed();
        }).then(function(instance) {

            // Then grab token sale instance
            tokenSaleInstance = instance;
            // provision/set aside 75% of all tokens to the token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
        }).then(function(receipt) {
            numberOfTokens = 10;
            // multiply number of tokens by price to get value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice})
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            // Check # of tokens sold
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            // Try to buy tokens different from ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei')
            return tokenSaleInstance.buyTokens(80000, { from: buyer, value: 1 })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available')
        });
    });

    it('ends token sale', function() {
        return DPRKToken.deployed().then(function(instance) {
            // Get token instance
            tokenSaleInstance = instance;
            return DPRKTokenSale.deployed();
        }).then(function(instance) {
            // Get token sale instance
            tokenSaleInstance = instance;
            // Try to end sale from illegitimate account
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
            // End sale as proper admin
            return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 999990, 'return unsold tokens to admin');
            // Check if token price was reset after calling self destruct
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price.toNumber(), 0, 'token price was reset')
        });
    });
});