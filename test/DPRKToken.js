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
             return tokenInstance.transfer.call(accounts[1], 9999999999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] }); 
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });      
        }).then(function(receipt) {
            // event information
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer','should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            // get results/receipt of transfer
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'adds the amount to receiving account');
            // inspect sender account
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'deducts from sending account');
        });
    });

    it('approves tokens for delegated transfer', function() {
        return DPRKToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            assert.equal(success, true, 'it returns true');
            // defaults to account[0], but explicitly stating it anyway
            return tokenInstance.approve(accounts[1], 100, { from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval','should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized for');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized for');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, 'stores allowance for delegated transfer');
        });
    });

    it('handles delegated token transfer', function() {
        return DPRKToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            // transfer tokens
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then(function(receipt) {
            // approve spendingAccount to spend 10 tokens from fromAccount
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
            // try to transfer more than sender balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            // try transfering too much
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount }).then(function(success) {
                assert.equal(success, true)
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'deducts amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
    }).then(function(balance) {
        assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
        return tokenInstance.allowance(fromAccount, spendingAccount);
    }).then(function(allowance) {
        assert.equal(allowance.toNumber(), 0, 'deducts the amount from allowance');
    });
});
    
});
});
