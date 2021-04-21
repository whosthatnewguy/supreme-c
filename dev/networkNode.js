// to create our API, we need to install Express.js via CLI as a dependency
// npm i express --save

// install nodemon package to automatically restart server upon save
// npm i nodemon --save
// then "npm start" to use it

// then install body-parser for string intrpolation `word word ${expression} word`

// to assign node addresses, we need to install the uuid library
// npm i uuid --save

// importing requests library to make requests to nodes
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));






// endpoint to fetch blkchn
app.get('/blockchain', (req,res) => {
    // sending blkchn info to anyone who requests
    res.send(supremeCoin);
});

// endpoint to create transactions on blkchn
app.post('/transaction', (req, res) => {
    // recieve external request to make a transaction
    const blockIndex = supremeCoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient)

    // responding with note after recieving api call
    res.json({ note: `Transaction will be added in block ${blockIndex}.`});

});

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

    const newBlock = supremeCoin.createNewBlock();

    res.json({
        note: "New block mined successfully",
        block: newBlock
    })

    // sending reward for succesful mine
    // any "00" address is mining reward
    supremeCoin.createNewTransaction(12.5,"00", nodeAddress);
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
    
    // register node and broadcast to network
    const newNodeUrl = req.body.newNodeUrl;

    // registering new node to blockchain if doesnt exist already
    if (supremeCoin.networkNodes.indexOf(newNodeUrl) == -1) {
        supremeCoin.networkNodes.push(newNodeUrl);
    }

    // broadcast new node to network
    // need request-promise library for this "npm install request-promise --save"
    supremeCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            
        }
    })


});

// register nodes with this endpoint
app.post('/register-node', (req, res) => {

})

// endpoint to register multiple nodes at once
app.post('/register-nodes-bulk', (req, res) => {

})