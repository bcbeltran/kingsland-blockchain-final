const sha256 = require('sha256');
const uuid = require('uuid');

const nodeAddress = uuid.v1().split('-').join('');
const selfUrl = process.argv[3];

function Node() {
    this.about = "KingslandFinalProject/v1";
    this.nodeId = nodeAddress;
    this.selfUrl = selfUrl;
    this.peers = [];
}

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 5;
    this.maxSupply = 1000000000 ** 8;
    this.createNewBlock(0, "0", "0", nodeAddress, "0");
}

Node.prototype.getNodeInfo = function(blockchain, blockCount) {
    
    const currentNode = {
        about: this.about,
        nodeId: this.nodeId,
        selfUrl: this.selfUrl,
        chain: blockchain,
        peers: this.peers,
        blocksCount: blockCount,
        //confirmedTransactions: 
        
    };

    return currentNode;


};

Blockchain.prototype.createNewBlock = function(nonce, prevBlockHash, blockHash, minedBy, blockDataHash) {
    const newBlock = {
        index: this.chain.length + 1,
        transactions: this.pendingTransactions,
        difficulty: this.difficulty,
        prevBlockHash: prevBlockHash,
        minedBy: minedBy,
        blockDataHash: blockDataHash,
        nonce: nonce,
        dateCreated: new Date().toISOString(),
        timestamp: Date.now(),
        blockHash: blockHash
    };
    
    this.pendingTransactions = [];
    if(this.chain.length == 0) {
        const genesisBlock = this.createNewTransaction("coinbase", nodeAddress, 100, "Genesis block");
        this.addTransactionToPending(genesisBlock);
    }
    
    this.chain.push(newBlock);
    
    return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;

    for (var i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];
        // console.log("this is the current block: ", currentBlock);
        // console.log('this is the prevblock: ', prevBlock);
        const hashedBlock = this.hashBlock(
			prevBlock["blockHash"],
			{
				index: currentBlock['index'],
				transactions: currentBlock['transactions'],
				difficulty: currentBlock['difficulty'],
				prevBlockHash: prevBlock['blockHash'],
                nodeAddress: currentBlock['minedBy']
			},
			currentBlock["nonce"]
		);

        if(currentBlock['prevBlockHash'] != prevBlock['blockHash']) {
            console.log('failed at hash')
            validChain = false;
        }
        
        if(hashedBlock.substring(0, 5) != "00000") {
            console.log('failed at substring')
            validChain = false;
        }
    }

    const genesisBlock = blockchain[0];
    const genesisNonce = genesisBlock.nonce === 0;
    const genesisPrevBlockHash = genesisBlock.prevBlockHash === "0";
    const genesisHash = genesisBlock.blockHash === "0";
    const genesisTransactions = genesisBlock.transactions.length === 0;

    if(!genesisNonce || !genesisPrevBlockHash || !genesisHash || !genesisTransactions) {
        console.log('failed at genesis block')
        validChain = false;
    }

    return validChain;
};

Blockchain.prototype.createNewTransaction = function(from, to, value, data) {
    let txFee = 0;
    if(from !== "coinbase") {
        txFee = 10;
    }
    const newTransaction = {
        from: from,
        to: to,
        value: value,
        fee: txFee,
        dateCreated: new Date().toISOString(),
        data: data,
        transactionId: uuid.v1().split('-').join(''),
        // senderPubKey: ,
        // transactionDataHash: ,
        // senderSignature: , 
    };

    return newTransaction;

};

Blockchain.prototype.addTransactionToPending = function(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    
    if(this.chain.length === 0){
        return "Genesis block created";
    } else {

        return this.getLastBlock()['index'] + 1;
    }
};

Blockchain.prototype.hashBlockData = function(currentBlockData) {
    const dataString = JSON.stringify(currentBlockData);
    const hash = sha256(dataString);
    return hash;
};

Blockchain.prototype.hashBlock = function(prevBlockHash, currentBlockData, nonce) {
    
    const dataString = prevBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    
    const hash = sha256(dataString);
    return hash;
};

Blockchain.prototype.proofOfWork = function(prevBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);
    while(hash.substring(0, this.difficulty) !== '00000') {
        nonce++;
        hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);
    }

    return nonce;
};

Blockchain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if (block.blockHash === blockHash) {
            correctBlock = block;
        }
    });
    return correctBlock;

};

Blockchain.prototype.getTransaction = function(transactionId) {
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.transactionId == transactionId) {
                correctTransaction = transaction;
                correctBlock = block;
            }
        });
    });
    return { transaction: correctTransaction, block: correctBlock };
};

Blockchain.prototype.getAddressInfo = function(address) {
    const addressTransactions = [];
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.from == address || transaction.to == address) {
                addressTransactions.push(transaction);
            }
        });
    });

    let balance = 0;
    addressTransactions.forEach(transaction => {
        if(transaction.to == address) {
            balance += transaction.value;
        } else if (transaction.from == address) {
            balance -= transaction.value;
        }
    });

    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    };
};

module.exports = {Blockchain, Node};