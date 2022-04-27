const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');

const nodeAddress = uuid.v1().split('-').join('');

const burbcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function(req, res) {
    res.send(burbcoin);
});

app.post('/transaction', function(req, res) {
    const blockIndex = burbcoin.createNewTransaction(req.body.from, req.body.to, req.body.value, req.body.data);
    res.json({ message: `Transaction will be added in block ${blockIndex}.` });
});

app.get('/mine', function(req, res) {
    const lastBlock = burbcoin.getLastBlock();
    const prevBlockHash = lastBlock['blockHash'];

    const currentBlockData = {
        index: lastBlock['index'] + 1,
        transactions: burbcoin.pendingTransactions,
        difficulty: burbcoin.difficulty,
        prevBlockHash,
        nodeAddress
    }

    const nonce = burbcoin.proofOfWork(prevBlockHash, currentBlockData);
    const blockHash = burbcoin.hashBlock(prevBlockHash, currentBlockData, nonce);
    const blockDataHash = burbcoin.hashBlockData(currentBlockData);

    burbcoin.createNewTransaction("00", nodeAddress, 100);
    const newBlock = burbcoin.createNewBlock(nonce, prevBlockHash, blockHash, nodeAddress, blockDataHash);


    res.json({ message: "New block mined successfully.", block: newBlock});
});

app.listen(3000, function() {
    console.log("Listening on port 3000");
});