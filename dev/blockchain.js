//import sha256 library
const sha256 = require('sha256');

// creating a node instance in blockchain data struc
const currentNodeUrl = process.argv[3];

// import uuid library to create random transaction ids 
const { v1: uuidv1 } = require('uuid');



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
        transactionId: uuidv1().split('-').join('')
    };

    return newTransaction;
}

Blockchain.prototype.addTransactionToPendingTransactions = function (transactionObj) {
    // we then push the above transaction to the chain
    this.pendingTransactions.push(transactionObj);
    
    // returns index block where we will find the new transaction
    return this.getLastBlock()['index'] + 1;
};

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

// prove whether a block is valid w/ concensus
Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;

    // genesis block verification
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;

    if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
        validChain = false;
    }


    for (var i = 1; i < blockchain.length; i++){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];

        const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index']}, currentBlock['nonce']);

        if (blockHash.substring(0,4) !== '1234') {
            validChain = false;
        }

        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) {
            validChain = false;
        }

        console.log('previousBlockHash =>', prevBlock['hash']);
        console.log('currentBlockHash =>', currentBlock['hash']);
    };
    return validChain;
}

// returning block info based on a hash
Blockchain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if (block.hash === blockHash) {
            correctBlock = block;
        }
    })
    return correctBlock;
}

// return transaction data for a block hash
Blockchain.prototype.getTransaction = function(transactionId) {
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.transactionId === transactionId) {
                correctTransaction = transaction;
                correctBlock = block;
            }
        })

    })
    return {
        transaction: correctTransaction,
        block: correctBlock
    }
};

// return/fetch transaction data for a specific address
Blockchain.prototype.getAddressData = function(address) {
    const addressTransactions = [];
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.sender === address || transaction.recipient === address) {
                addressTransactions.push(transaction);
            }
        })
    })

    // getting balance
    let balance = 0;
    addressTransactions.forEach(transaction => {
        if (transaction.recipient === address) {
            balance += transaction.amount;
        } else if (transaction.sender === address) {
            balance -= transaction.amount;
        }
    })
    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    }
}

// export the blockchain constructor for testing
module.exports = Blockchain;
