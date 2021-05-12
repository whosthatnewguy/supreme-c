// to create our API, we need to install Express.js via CLI as a dependency
// npm i express --save

// install nodemon package to automatically restart server upon save
// npm i nodemon --save
// then "npm start" to use it

// then install body-parser for string intrpolation `word word ${expression} word`

// to assign node addresses, we need to install the uuid library
// npm i uuid --save

// importing requests-promise library to make requests to nodes
const rp = require('request-promise')


// making port a variable to create multiple nodes
const port = process.argv[2];

// import uuid library and create random address
const { v1: uuidv1 } = require('uuid');
const nodeAddress = uuidv1().split('-').join('');

// import blockchain data structure for blkchn api
const Blockchain = require('./blockchain');
// make instance of blockchain
const supremeCoin = new Blockchain();

// to use Express...
const express = require('express')
const app = express()
// import body-parser
const bodyParser = require('body-parser');
const requestPromise = require('request-promise');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// endpoint to fetch blkchn
app.get('/blockchain', (req,res) => {
    // sending blkchn info to anyone who requests
    res.send(supremeCoin);
});

// endpoint to create transactions on blkchn
app.post('/transaction', (req, res) => {
    // reciving txn data from txn broadcast endpoint
    const newTransaction = req.body;
    // add transaction to whichever node called it
    const blockIndex = supremeCoin.addTransactionToPendingTransactions(newTransaction);

    // add in final response
    res.json({ note: `Transaction will be added in block ${blockIndex}.`})
});

// endpoint to broadcast transactions to blockchain
app.post('/transaction/broadcast', (req, res) => {
    // getting transaction data sent on the request.body.
    const newTransaction = supremeCoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);

    // add to pending txns on blokchn
    supremeCoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];

    // broadcast txn to entire blkchn network
    supremeCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromises.push(rp(requestOptions));
    })
    // run all the batched requests
    Promise.all(requestPromises)
    .then(data => {
        res.json({ note: 'Transaction created and broadcast successfully'})
    })
})

// endpoint to mine blocks
app.get('/mine', (req, res) => {
    // creating parameters for newBlock method
    const lastBlock = supremeCoin.getLastBlock();

    // creating parameters for nonce and hash
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: supremeCoin.pendingTransactions,
        index: lastBlock['index'] + 1
    }
    const nonce = supremeCoin.proofOfWork(previousBlockHash, currentBlockData);

    // creating hash parameter
    const blockHash = supremeCoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = supremeCoin.createNewBlock(nonce,previousBlockHash, blockHash);

    // broadcast new block to entire network by hitting other endpoint
    const requestPromises = [];
    supremeCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };
        // make the request for each node
        requestPromises.push(rp(requestOptions));
    })

    Promise.all(requestPromises)
    .then(data => {
        // broadcast mining reward data
        const requestOptions = {
            uri: supremeCoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: { amount: 12.5, sender: "00", recipient: nodeAddress },
            json: true
        }

        return rp(requestOptions);
    })

    res.json({
        note: "New block mined successfully",
        block: newBlock
    })

    // sending reward for succesful mine
    // any "00" address is mining reward
    // supremeCoin.createNewTransaction(12.5,"00", nodeAddress);
})


app.post('/receive-new-block', (req, res) => {
    // endpoint expects new block request object
    const newBlock = req.body.newBlock;

    // get last block to compare hashes to ensure new block is legit
    const lastBlock = supremeCoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;

    // check if newblock index is one above last block
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if (correctHash && correctIndex) {
        supremeCoin.chain.push(newBlock);
        supremeCoin.pendingTransactions = [];
        
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        })
    } else {
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        });
    }
})


// using my pc as server
app.listen(port, () => {
    console.log(`listening on port ${port}...`)
})
// then in CLI, node dev/api (crtl c to exit)

/**
 * ENDPOINTS FOR NODES BEGIN HERE
 */

// endpoint to register a new node and broadcast to network
app.post('/register-and-broadcast-node', (req, res) => {
    
    // register node 
    const newNodeUrl = req.body.newNodeUrl;

    // registering new node to blockchain and current node if doesnt already exist
    if (supremeCoin.networkNodes.indexOf(newNodeUrl) == -1) {
        supremeCoin.networkNodes.push(newNodeUrl);
    }

    // broadcast new node to network
    // need request-promise library for this "npm install request-promise --save"

    // building API call / put returned promises in array
    const regNodesPromises = [];
    supremeCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        }
        // request promises library is rp
        regNodesPromises.push(rp(requestOptions));
    })
    // running all promises / updating olds nodes in network with new node info
    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [...supremeCoin.networkNodes, supremeCoin.currentNodeUrl]},
            json: true
        }

        return rp(bulkRegisterOptions);
        
    })
    // sending confirmation after the nodes have been updated with new info
    .then (data => {
        res.json({ note: 'New Node registered with network successfully'});
    })

});

// register node with the network
app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = supremeCoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = supremeCoin.currentNodeUrl !== newNodeUrl;

    if (nodeNotAlreadyPresent && notCurrentNode) {
        supremeCoin.networkNodes.push(newNodeUrl);
    }

    res.json({ note: 'New node registered successfully'})
});

// endpoint to register multiple nodes at once
app.post('/register-nodes-bulk', (req, res) => {

    const allNetworkNodes = req.body.allNetworkNodes;

    // loop thru every node in array and register with new node
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = supremeCoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = supremeCoin.currentNodeUrl !== networkNodeUrl;

        if(nodeNotAlreadyPresent && notCurrentNode) {
            supremeCoin.networkNodes.push(networkNodeUrl);
        }
    });
    res.json({ note: 'Bulk registration successful.' });
})

// concensus endpoint to get each nodes' copy of the 
// blockchain and compare them to the copy of the blockchain thats hosted on the current node
app.get('/consensus', function(req, res) {
    const requestPromises = [];

    supremeCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        }
        requestPromises.push(rp(requestOptions));
    })
    Promise.all(requestPromises)
    .then(blockchains => {
        const currentChainLength = supremeCoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(blockchain => {
            if(supremeCoin.chain.length > maxChainLength){
                maxChainLength = supremeCoin.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            }
        })

        if(!newLongestChain || (newLongestChain && !supremeCoin.chainIsValid(newLongestChain))) {
            res.json({
                note: 'Current chain has not been replaced.',
                chain: supremeCoin.chain
            })
        } else {
            supremeCoin.chain = newLongestChain;
            supremeCoin.pendingTransactions = newPendingTransactions;
            res.json({
                note: 'This chain has been replaced.',
                chain: supremeCoin.chain
            })
        }
    })
})

// block explorer endpoint 
// return block based on blockhash
app.get('/block/:blockHash', function(req, res) {
    const blockHash = req.params.blockHash;
    const correctBlock = supremeCoin.getBlock(blockHash);

    res.json({
        block: correctBlock
    })
})

// get transaction correcsponding to an id
app.get('/transaction/:transactionId', function(req, res) {
    const transactionId = req.params.transactionId;
    const transactionData = supremeCoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    })
})

// get all transactions from an address
app.get('/address/:address', function(req, res) {
    const address = req.params.address;
    const addressData = supremeCoin.getAddressData(address);
    res.json({
        addressData: addressData
    })
})

// endpoint to send frontend html/css file
app.get('/block-explorer', function(req, res) {
    // sending back html file as response
    res.sendFile('./block-explorer/index.html', { root: __dirname });
});