//import sha256 library
const sha256 = require('sha256');

// creating a node instance in blockchain data struc
const currentNodeUrl = process.argv[3];




// constructor function
function Blockchain () {
    // where we store blocks
    this.chain = [];
    // where new txns will be held before place into block
    this.pendingTransactions = [];

    //
    this.currentNodeUrl = currentNodeUrl;

    // making blockchain to store port of every node in blkchn
    this.networkNodes = [];

    // creating genesis block
    this.createNewBlock(100,'0','0');
    
} 

// method to create new blocks
Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    // create new block object
    const newBlock = {
        // index to describe which block this is on our chain
        index: this.chain.length + 1,
        // timestamp so we know when it was created
        timestamp: Date.now(),
        // adding the immutable list of previous txns
        transactions: this.pendingTransactions,
        // nonce used to verify block via proofOfWork method
        nonce: nonce,
        // all new transactions will be passed into hashing function
        hash: hash,
        // hashes data from previous block
        previousBlockHash: previousBlockHash,
    };

    // replacing old txns with new txns 
    this.pendingTransactions = [];
    // push this new block onto the chain
    this.chain.push(newBlock);
    return newBlock;
}

// method to fetch the last block on chain
Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1];
}

// method for new txns
Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const newTransaction = {
        // how much to send
        amount: amount,
        sender: sender,
        recipient: recipient,
    }

    // we then push this transaction to the chain
    this.pendingTransactions.push(newTransaction);
    // returns index block where we will find the new transaction
    return this.getLastBlock()['index'] + 1;
}

// 256sha function to hash the data in blocks
// install and save sha256 library as dependencie via CLI with "npm i sha256 --save"
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    // turn all data into single string
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify( currentBlockData );
    
    // hash the data
    const hash = sha256(dataAsString);
    return hash;

}

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substring(0, 4) !== '8925') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);  
        console.log(nonce);
        console.log(hash); 
    }
    return nonce;
}

// export the blockchain constructor for testing
module.exports = Blockchain;