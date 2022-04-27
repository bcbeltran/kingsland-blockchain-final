const sha256 = require('sha256');
const uuid = require('uuid');

const nodeAddress = uuid.v1().split('-').join('');

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 5;
    this.createNewTransaction("00", nodeAddress, 1000000000, "genesis block");
    this.createNewBlock(0, "0", "0", nodeAddress, "0");
}

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
    this.chain.push(newBlock);

    return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(from, to, value, data) {
    let txFee = 0;
    if(from !== "00") {
        txFee = 10;
    }
    const newTransaction = {
        from: from,
        to: to,
        value: value,
        fee: txFee,
        dateCreated: new Date().toISOString(),
        data: data,
        // senderPubKey: ,
        // transactionDataHash: ,
        // senderSignature: , 
    };

    this.pendingTransactions.push(newTransaction);

    if(this.chain.length === 0){
        return;
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

module.exports = Blockchain;