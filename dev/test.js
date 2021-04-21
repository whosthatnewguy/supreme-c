// import blockchain constructor from blockchain.js
const Blockchain = require('./blockchain');

// testing blockchain instance
const CREAMCoin = new Blockchain();
console.log(CREAMCoin); // test file  by running - node dev/test.js

// testing block & trxn creation
CREAMCoin.createNewBlock(789457, 'OGNFDS-422345GFS', '43637BGDFGH')
CREAMCoin.createNewTransaction(100,'ALEX345543vfF','JENABCDEFG')
CREAMCoin.createNewTransaction(4500,'ALEX345543vfF','JENABCDEFG')

// testing minting of new coin and storage of pending trxn
CREAMCoin.createNewBlock(567890, 'AKM45365347', 'WPL53463GER')
CREAMCoin.createNewTransaction(700,'ROBarhsdhF','JENABCDEFG')
CREAMCoin.createNewTransaction(6700,'TTARGBarhsdhF','JENABCDEFG')
CREAMCoin.createNewBlock(560, 'AKMwg65347', '998y7ar463GER')

// CREAMCoin.createNewBlock(1234,'SFGBNSFGMBJSFGBG','SGBSHBSHBSDFB');
// console.log(CREAMCoin);
// console.log(CREAMCoin.chain[1])
// console.log(CREAMCoin.pendingTransactions[0])

const previousBlockHash = '87765DA6C-CF0668238C1D27C35692E11';
const currentBlockData = [
    {
        amount: 101,
        sender: 'BWETRNT45tXZGFBHNAYSXNR',
        recipient: 'NBSADFBNDS3456hjhG7'

    },
    {
        amount: 2345,
        sender: 'NBSADFBSNSDFHBDHGNXFHNSFGVXZDV',
        recipient: 'VSDFNSGDNYDNBVSFDO78vbdfT',
    },
    {
        amount: 765,
        sender: 'VSDFNSGDN5BFGBHNGJNDFGHBDBD',
        recipient: 'SDFBSGDBB34DBDFGBSSBJ647',
    }
]
// console.log(CREAMCoin.proofOfWork(previousBlockHash, currentBlockData))
// console.log(CREAMCoin.hashBlock(previousBlockHash, currentBlockData, 53108))

// console.log(currentBlockData);