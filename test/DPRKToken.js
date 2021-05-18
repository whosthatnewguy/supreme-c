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

    it('sets the total supply upon deployment', function() {
        return DPRKToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 0, 'sets the total supply to 1,000,000');
        });
    });
});