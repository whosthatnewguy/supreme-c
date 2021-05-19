var DPRKToken = artifacts.require("./DPRKToken.sol");

// contract('DPRKToken', (accounts) => {
//     it('sets the total supply upon deployment', () => {
//         return DPRKToken.deployed().then((instance) => {
//             tokenInstance = instance;
//             return tokenInstance.totalSupply();
//         }).then((totalSupply) => {
//             assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
//         });
//     })
// });

contract('DPRKToken', function(accounts) {

    it('initializes the contract with the correct value', function() {
        return DPRKToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, 'DPRK Token', 'has correct name');
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'DPRK', 'has correct symbol')
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'DPRK Token v1.0', 'has correct standard')
        })
    })

    it('allocates initial supply upon deployment', function() {
        return DPRKToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 100000, 'allocate total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 100000, "allocates initial supply to admin")
        });
    });

    it('transfers token ownership', function() {
        return DPRKToken.deployed().then(function(instance) {
            tokenInstance = instance;
             // Test 'require' statement
             return tokenInstance.transfer.call(accounts[1], 999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 2500, { from: accounts[0] }); 
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 2500, { from: accounts[0] });      
        }).then(function(receipt) {
            // event information
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer','should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 2500, 'logs the transfer amount');
            // get results/receipt of transfer
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 2500, 'adds the amount to receiving account');
            // inspect sender account
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 2500, 'deducts from sending account')
        })
    })





});