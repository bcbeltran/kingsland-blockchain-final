const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {Blockchain, Node} = require('./blockchain');
const uuid = require('uuid');
const port = process.argv[2];
const rp = require('request-promise');
const request = require('request');
const selfUrl = process.argv[3];


const currentNode = new Node();
const burbcoin = new Blockchain();
const nodeAddress = currentNode.nodeId;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', function(req, res) {
    res.send(burbcoin);
});

app.get('/node-info', function(req, res) {
    res.send(currentNode.getNodeInfo(burbcoin, burbcoin.chain.length));
});

app.get('/consensus', function(req, res) {
    const requestPromises = [];
    currentNode.peers.forEach(node => {
        const requestOptions = {
            uri: node + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(blockchains => {
            const currentChainLength = burbcoin.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;

            blockchains.forEach(blockchain => {
                if(blockchain.chain.length > maxChainLength) {
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                }
            });

            if(!newLongestChain || (newLongestChain && !burbcoin.chainIsValid(newLongestChain))) {
                res.json({ message: "Current chain has not been replaced.", chain: burbcoin.chain });
            } else {
                burbcoin.chain = newLongestChain;
                burbcoin.pendingTransactions = newPendingTransactions;
                res.json({ message: "Chain repalced with new longer chain.", chain: burbcoin.chain });
            }
        });
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
    currentNode.peers.forEach(node => {
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
		nodeAddress
	};

    const nonce = burbcoin.proofOfWork(prevBlockHash, currentBlockData);
    const blockHash = burbcoin.hashBlock(prevBlockHash, currentBlockData, nonce);
    const blockDataHash = burbcoin.hashBlockData(currentBlockData);

    const newBlock = burbcoin.createNewBlock(nonce, prevBlockHash, blockHash, nodeAddress, blockDataHash);
    
    const requestPromises = [];
    currentNode.peers.forEach(node => {
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
                uri: currentNode.selfUrl + '/transaction/broadcast',
                method: 'POST',
                body: {
                    from: "coinbase",
                    to: currentNode.nodeId,
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

    if(currentNode.peers.indexOf(newNodeUrl) == -1) {
        currentNode.peers.push(newNodeUrl);
    }

    const registerNodesPromises = [];
    currentNode.peers.forEach(node => {
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
                body: { allNetworkNodes: [...currentNode.peers, currentNode.selfUrl]},
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
    if(currentNode.peers.indexOf(newNodeUrl) == -1 && currentNode.selfUrl != newNodeUrl) {
        currentNode.peers.push(newNodeUrl);
    }
    res.json({ message: "New node registered successfully."});
});

app.post('/register-existing-nodes', function(req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(node => {
        if (currentNode.peers.indexOf(node) == -1 && currentNode.selfUrl != node) {
            currentNode.peers.push(node);
        }
    });
    res.json({ message: "All nodes up to date." });
});

// BLOCK EXPLORER

app.get('/block/:blockHash', function(req, res) {
    const blockHash = req.params.blockHash;
    const currentBlock = burbcoin.getBlock(blockHash);
    res.json({
        block: currentBlock
    });
});

app.get('/transaction/:transactionId', function(req, res) {
    const transactionId = req.params.transactionId;
    const currentTransaction = burbcoin.getTransaction(transactionId);
    res.json({
        transaction: currentTransaction.transaction,
        block: currentTransaction.block
    });
});

app.get('/address/:address', function(req, res) {
    const address = req.params.address;
    const currentInfo = burbcoin.getAddressInfo(address);
    res.json({
        addressInfo: currentInfo
    });
});

app.get('/block-explorer', function(req, res) {
    res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(port, function() {
    console.log(`Listening on port ${port}...`);
});