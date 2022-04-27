const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');
const port = process.argv[2];
const rp = require('request-promise');

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

app.post('/transaction/broadcast', function(req,res) {
    
})

app.get('/mine', function(req, res) {
    const lastBlock = burbcoin.getLastBlock();
    const prevBlockHash = lastBlock['blockHash'];

    const currentBlockData = {
        index: lastBlock['index'] + 1,
        transactions: burbcoin.pendingTransactions,
        difficulty: burbcoin.difficulty,
        prevBlockHash,
        nodeAddress
    };

    const nonce = burbcoin.proofOfWork(prevBlockHash, currentBlockData);
    const blockHash = burbcoin.hashBlock(prevBlockHash, currentBlockData, nonce);
    const blockDataHash = burbcoin.hashBlockData(currentBlockData);

    burbcoin.createNewTransaction("00", nodeAddress, 100);
    const newBlock = burbcoin.createNewBlock(nonce, prevBlockHash, blockHash, nodeAddress, blockDataHash);


    res.json({ message: "New block mined successfully.", block: newBlock});
});

app.post('/register-broadcast-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;

    if(burbcoin.peers.indexOf(newNodeUrl) == -1) {
        burbcoin.peers.push(newNodeUrl);
    }

    const registerNodesPromises = [];
    burbcoin.peers.forEach(node => {
        const requestOptions = {
            uri: node + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        registerNodesPromises.push(rp(requestOptions));
    });

    Promise.all(registerNodesPromises)
        .then(data => {
            const existingRegisterOptions = {
                uri: newNodeUrl + '/register-existing-nodes',
                method: 'POST',
                body: { allNetworkNodes: [...burbcoin.peers, burbcoin.selfUrl]},
                json: true
            };
            return rp(existingRegisterOptions);
        })
        .then(data => {
            res.json({ message: "New node registered with network successfully."});
        });
});

app.post('/register-node', function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if(burbcoin.peers.indexOf(newNodeUrl) == -1 && burbcoin.selfUrl != newNodeUrl) {
        burbcoin.peers.push(newNodeUrl);
    }
    res.json({ message: "New node registered successfully."});
});

app.post('/register-existing-nodes', function(req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(node => {
        if (burbcoin.peers.indexOf(node) == -1 && burbcoin.selfUrl != node) {
            burbcoin.peers.push(node);
        }
    });
    res.json({ message: "All nodes up to date." });
});

app.listen(port, function() {
    console.log(`Listening on port ${port}...`);
});