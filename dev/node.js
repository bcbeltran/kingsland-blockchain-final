const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');
const port = process.argv[2];
const rp = require('request-promise');
const request = require('request');
const selfUrl = process.argv[3];

const nodeAddress = uuid.v1().split('-').join('');

const burbcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function(req, res) {
    res.send(burbcoin);
});

app.post('/transaction', function(req, res) {
    const newTransaction = req.body;
    const blockIndex = burbcoin.addTransactionToPending(newTransaction);
    res.json({ message: `Transaction will be added in block ${blockIndex}`});
});

app.post('/transaction/broadcast', function(req,res) {
    const newTransaction = burbcoin.createNewTransaction(req.body.from, req.body.to, req.body.value, req.body.data);
    burbcoin.addTransactionToPending(newTransaction);

    const requestPromises = [];
    burbcoin.peers.forEach(node => {
        const requestOptions = {
            uri: node + '/transaction',
            method:'POST',
            body: newTransaction,
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            res.json({ message: "Transaction created and broadcast successfully."});
        });
});

app.get('/mine', function(req, res) {
    const lastBlock = burbcoin.getLastBlock();
    let prevBlockHash = lastBlock["blockHash"];

    const currentBlockData = {
		index: lastBlock["index"] + 1,
		transactions: burbcoin.pendingTransactions,
		difficulty: burbcoin.difficulty,
		prevBlockHash,
		selfUrl,
	};

    const nonce = burbcoin.proofOfWork(prevBlockHash, currentBlockData);
    const blockHash = burbcoin.hashBlock(prevBlockHash, currentBlockData, nonce);
    const blockDataHash = burbcoin.hashBlockData(currentBlockData);

    const newBlock = burbcoin.createNewBlock(nonce, prevBlockHash, blockHash, selfUrl, blockDataHash);
    
    const requestPromises = [];
    burbcoin.peers.forEach(node => {
        const requestOptions = {
            uri: node + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };
        
        requestPromises.push(rp(requestOptions));
    });
    
    Promise.all(requestPromises)
        .then(data => {
            const requestOptions = {
                uri: burbcoin.selfUrl + '/transaction/broadcast',
                method: 'POST',
                body: {
                    from: "coinbase",
                    to: burbcoin.selfUrl,
                    value: 100,
                    data: "Mining reward"
                },
                json: true
            };

            return rp(requestOptions);
        })
        .then(data => {

            res.json({ message: "New block mined and broadcast successfully.", block: newBlock});
        })
        .catch(err => {
            console.log("Error: ", err);
        });

});

app.post('/receive-new-block', function(req,res) {
    const newBlock = req.body.newBlock;
    const lastBlock = burbcoin.getLastBlock();

    if (
		lastBlock["blockHash"] == newBlock.prevBlockHash &&
		lastBlock["index"] + 1 == newBlock.index
	) {
		burbcoin.chain.push(newBlock);
		burbcoin.pendingTransactions = [];
		res.json({
			message: "New block received and accepted.",
			newBlock: newBlock,
		});
	} else {
		res.json({ message: "New block rejected.", newBlock: newBlock });
	}
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